/**
 * Proveedor de alimentos.
 *
 * Abstrae de dónde salen los alimentos para que la UI no sepa si vienen del
 * catálogo local, de la base de datos del usuario o de una API externa.
 *
 * Reglas de diseño:
 * - La app DEBE funcionar sin red y sin credenciales: `LocalFoodProvider` es
 *   siempre la base y el resto degrada hacia él.
 * - Todo lo que sale de aquí son ESTIMACIONES por 100 g. La fibra, el azúcar
 *   y el sodio son orientativos y pueden faltar; nunca se presentan como un
 *   análisis clínico.
 * - Caché en memoria con expiración: moverse por la pantalla no debe disparar
 *   una búsqueda por cada render.
 */

import {
  FOOD_CATALOG,
  FOOD_CATALOG_BY_BARCODE,
  FOOD_CATALOG_BY_ID,
} from '@/data/food-catalog';
import { logger } from '@/services/logger';
import type { Food, Nutrients } from '@/types/domain';
import { roundTo, safeNumber } from '@/utils/units';

/* ------------------------------------------------------------------ tipos */

export interface FoodSearchOptions {
  /** Página 0-indexada. */
  page?: number;
  /** Resultados por página. */
  pageSize?: number;
  /** Aborta la petición si el proveedor es remoto. */
  signal?: AbortSignal;
}

export interface FoodSearchResult {
  items: Food[];
  page: number;
  pageSize: number;
  /** Total de coincidencias conocidas por el proveedor. */
  total: number;
  hasMore: boolean;
  /** Proveedor que resolvió de verdad la búsqueda (útil al degradar). */
  providerId: string;
}

export interface FoodProvider {
  readonly id: string;
  searchFoods(query: string, options?: FoodSearchOptions): Promise<FoodSearchResult>;
  getFood(id: string): Promise<Food | null>;
  /** Nutrientes de `grams` de ese alimento, o null si no existe. */
  getNutrition(id: string, grams: number): Promise<Nutrients | null>;
  searchBarcode(barcode: string): Promise<Food | null>;
}

/* -------------------------------------------------------------- constantes */

export const DEFAULT_PAGE_SIZE = 25;

/** Vida de una entrada de caché. Un catálogo de alimentos no cambia cada minuto. */
export const CACHE_TTL_MS = 5 * 60_000;

/** Espera antes de buscar mientras se teclea. */
export const SEARCH_DEBOUNCE_MS = 300;

/** Nº mínimo de caracteres para que una búsqueda tenga sentido. */
export const MIN_QUERY_LENGTH = 2;

/* ---------------------------------------------------------------- utilidades */

/** Minúsculas y sin acentos, para que "platano" encuentre "Plátano". */
export function normalizeText(text: string): string {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/** Nutrientes de `grams` de un alimento, escalados desde los valores por 100 g. */
export function nutrientsForGrams(food: Food, grams: number): Nutrients {
  const factor = Math.max(0, safeNumber(grams)) / 100;
  const base = food.per100g;

  const scaled: Nutrients = {
    kcal: roundTo(safeNumber(base.kcal) * factor, 0),
    proteinG: roundTo(safeNumber(base.proteinG) * factor, 1),
    carbsG: roundTo(safeNumber(base.carbsG) * factor, 1),
    fatG: roundTo(safeNumber(base.fatG) * factor, 1),
  };

  // Los opcionales solo se propagan si el alimento los declara: inventar un 0
  // haría creer que el dato existe y vale cero.
  if (base.fiberG !== undefined) scaled.fiberG = roundTo(base.fiberG * factor, 1);
  if (base.sugarG !== undefined) scaled.sugarG = roundTo(base.sugarG * factor, 1);
  if (base.sodiumMg !== undefined) scaled.sodiumMg = roundTo(base.sodiumMg * factor, 0);

  return scaled;
}

/**
 * Puntúa cuánto encaja un alimento con la búsqueda.
 * Mayor es mejor; 0 significa que no encaja y se descarta.
 */
export function matchScore(food: Food, normalizedQuery: string): number {
  if (!normalizedQuery) return 0;
  const name = normalizeText(food.name);
  const brand = normalizeText(food.brand ?? '');
  const tags = (food.tags ?? []).map(normalizeText);

  if (name === normalizedQuery) return 100;
  if (name.startsWith(normalizedQuery)) return 80;
  if (name.includes(normalizedQuery)) return 60;
  if (brand.includes(normalizedQuery)) return 40;
  if (tags.some((tag) => tag.startsWith(normalizedQuery))) return 30;
  if (tags.some((tag) => tag.includes(normalizedQuery))) return 20;

  // Búsqueda por varias palabras: "pollo pechuga" debe encontrar "Pechuga de pollo".
  const words = normalizedQuery.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const haystack = [name, brand, ...tags].join(' ');
    if (words.every((word) => haystack.includes(word))) return 50;
  }

  return 0;
}

/**
 * Retrasa la ejecución hasta que pasan `waitMs` sin nuevas llamadas.
 * Devuelve la función con `cancel()` para limpiarla al desmontar.
 */
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  waitMs: number = SEARCH_DEBOUNCE_MS,
): ((...args: A) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: A): void => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, waitMs);
  };

  debounced.cancel = (): void => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  return debounced;
}

/* ------------------------------------------------------------------ caché */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Caché en memoria con expiración.
 *
 * Deliberadamente simple: se pierde al cerrar la app, que es lo correcto para
 * resultados de búsqueda. Lo que debe sobrevivir (registro del día, favoritos)
 * vive en el store, no aquí.
 */
export class MemoryCache<T> {
  private readonly entries = new Map<string, CacheEntry<T>>();

  constructor(
    private readonly ttlMs: number = CACHE_TTL_MS,
    private readonly maxEntries: number = 200,
  ) {}

  get(key: string, now: number = Date.now()): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= now) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T, now: number = Date.now()): void {
    // Política mínima: al llenarse se tira la entrada más antigua insertada.
    if (this.entries.size >= this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      if (oldest !== undefined) this.entries.delete(oldest);
    }
    this.entries.set(key, { value, expiresAt: now + this.ttlMs });
  }

  clear(): void {
    this.entries.clear();
  }

  get size(): number {
    return this.entries.size;
  }
}

/* ------------------------------------------------- alimentos manuales */

/**
 * Alimentos que ha creado el usuario a mano.
 *
 * Viven en un registro del módulo (no en el store) para que el proveedor
 * pueda resolverlos sin depender de React ni de Zustand, y para que el store
 * no tenga que duplicar el catálogo.
 */
const manualFoods = new Map<string, Food>();

/** Alta o actualización de un alimento manual. */
export function registerManualFood(food: Food): Food {
  const stored: Food = { ...food, source: 'manual' };
  manualFoods.set(stored.id, stored);
  return stored;
}

/** Carga inicial, por ejemplo al rehidratar el store. */
export function setManualFoods(foods: Food[]): void {
  manualFoods.clear();
  foods.forEach((food) => manualFoods.set(food.id, { ...food, source: 'manual' }));
}

export function getManualFoods(): Food[] {
  return [...manualFoods.values()];
}

export function removeManualFood(id: string): void {
  manualFoods.delete(id);
}

/** Genera un id estable para un alimento manual. */
export function manualFoodId(name: string, now: number = Date.now()): string {
  const slug = normalizeText(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `manual-${slug || 'alimento'}-${now.toString(36)}`;
}

/* ---------------------------------------------------- proveedor local */

/**
 * Proveedor por defecto: catálogo local + alimentos manuales del usuario.
 * No hace red, así que nunca falla por conexión.
 */
export class LocalFoodProvider implements FoodProvider {
  readonly id = 'local';

  private readonly cache = new MemoryCache<FoodSearchResult>();

  constructor(private readonly catalog: Food[] = FOOD_CATALOG) {}

  /** Catálogo efectivo: los manuales van delante para que ganen al buscar. */
  private allFoods(): Food[] {
    return [...getManualFoods(), ...this.catalog];
  }

  async searchFoods(query: string, options: FoodSearchOptions = {}): Promise<FoodSearchResult> {
    const page = Math.max(0, Math.trunc(options.page ?? 0));
    const pageSize = Math.max(1, Math.trunc(options.pageSize ?? DEFAULT_PAGE_SIZE));
    const normalized = normalizeText(query);

    const cacheKey = `${this.id}:${normalized}:${page}:${pageSize}:${manualFoods.size}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // Sin búsqueda se devuelve el catálogo en orden alfabético: así la pantalla
    // de añadir alimento nunca aparece vacía.
    const matches =
      normalized.length < MIN_QUERY_LENGTH
        ? [...this.allFoods()].sort((a, b) => a.name.localeCompare(b.name, 'es'))
        : this.allFoods()
            .map((food) => ({ food, score: matchScore(food, normalized) }))
            .filter((entry) => entry.score > 0)
            .sort(
              (a, b) => b.score - a.score || a.food.name.localeCompare(b.food.name, 'es'),
            )
            .map((entry) => entry.food);

    const start = page * pageSize;
    const items = matches.slice(start, start + pageSize);

    const result: FoodSearchResult = {
      items,
      page,
      pageSize,
      total: matches.length,
      hasMore: start + items.length < matches.length,
      providerId: this.id,
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  async getFood(id: string): Promise<Food | null> {
    return manualFoods.get(id) ?? FOOD_CATALOG_BY_ID.get(id) ?? null;
  }

  async getNutrition(id: string, grams: number): Promise<Nutrients | null> {
    const food = await this.getFood(id);
    return food ? nutrientsForGrams(food, grams) : null;
  }

  async searchBarcode(barcode: string): Promise<Food | null> {
    const clean = String(barcode ?? '').trim();
    if (!clean) return null;
    const manual = getManualFoods().find((food) => food.barcode === clean);
    return manual ?? FOOD_CATALOG_BY_BARCODE.get(clean) ?? null;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

/* ----------------------------------------------------- proveedor USDA */

export interface UsdaProviderOptions {
  /**
   * Clave de la API. SOLO para uso en servidor (Edge Function) y en tests.
   * NUNCA se lee del entorno del cliente: cualquier variable EXPO_PUBLIC_ se
   * empaqueta dentro del binario y deja de ser un secreto.
   */
  apiKey?: string;
  /**
   * URL de la Edge Function que hace de intermediaria con USDA. Es la vía
   * correcta desde la app: la clave se queda en el servidor.
   */
  proxyUrl?: string;
  baseUrl?: string;
  /** Proveedor al que degradar. Por defecto, el local. */
  fallback?: FoodProvider;
  /** Milisegundos antes de abandonar la petición y degradar. */
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

/** Forma mínima de la respuesta de USDA que realmente usamos. */
interface UsdaNutrient {
  nutrientNumber?: string;
  nutrientName?: string;
  value?: number;
}

interface UsdaFoodDto {
  fdcId?: number;
  description?: string;
  brandName?: string;
  brandOwner?: string;
  gtinUpc?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodNutrients?: UsdaNutrient[];
}

interface UsdaSearchDto {
  totalHits?: number;
  currentPage?: number;
  foods?: UsdaFoodDto[];
}

/** Números de nutriente de USDA que nos interesan. */
const USDA_NUTRIENT_NUMBERS = {
  kcal: '208',
  proteinG: '203',
  carbsG: '205',
  fatG: '204',
  fiberG: '291',
  sugarG: '269',
  sodiumMg: '307',
} as const;

function usdaValue(nutrients: UsdaNutrient[], number: string): number | undefined {
  const found = nutrients.find((n) => n.nutrientNumber === number);
  return typeof found?.value === 'number' ? found.value : undefined;
}

/** Traduce un alimento de USDA al contrato de dominio. */
export function mapUsdaFood(dto: UsdaFoodDto): Food | null {
  if (!dto.fdcId || !dto.description) return null;
  const nutrients = dto.foodNutrients ?? [];

  const per100g: Nutrients = {
    kcal: roundTo(usdaValue(nutrients, USDA_NUTRIENT_NUMBERS.kcal) ?? 0, 0),
    proteinG: roundTo(usdaValue(nutrients, USDA_NUTRIENT_NUMBERS.proteinG) ?? 0, 1),
    carbsG: roundTo(usdaValue(nutrients, USDA_NUTRIENT_NUMBERS.carbsG) ?? 0, 1),
    fatG: roundTo(usdaValue(nutrients, USDA_NUTRIENT_NUMBERS.fatG) ?? 0, 1),
  };

  const fiber = usdaValue(nutrients, USDA_NUTRIENT_NUMBERS.fiberG);
  const sugar = usdaValue(nutrients, USDA_NUTRIENT_NUMBERS.sugarG);
  const sodium = usdaValue(nutrients, USDA_NUTRIENT_NUMBERS.sodiumMg);
  if (fiber !== undefined) per100g.fiberG = roundTo(fiber, 1);
  if (sugar !== undefined) per100g.sugarG = roundTo(sugar, 1);
  if (sodium !== undefined) per100g.sodiumMg = roundTo(sodium, 0);

  const servingGrams =
    dto.servingSizeUnit?.toLowerCase() === 'g' && typeof dto.servingSize === 'number'
      ? Math.round(dto.servingSize)
      : 100;

  return {
    id: `usda-${dto.fdcId}`,
    name: dto.description,
    brand: dto.brandName ?? dto.brandOwner,
    servingLabel: dto.householdServingFullText ?? `${servingGrams} g`,
    servingGrams,
    per100g,
    source: 'usda',
    externalId: String(dto.fdcId),
    barcode: dto.gtinUpc,
    // USDA no publica alérgenos ni patrones dietéticos normalizados: dejarlos
    // vacíos sería afirmar que no hay, así que no se declaran y los filtros
    // aguas arriba tratan al alimento como "sin datos" (ver `matchesDiet`).
  };
}

/**
 * Proveedor contra la API de USDA FoodData Central.
 *
 * Degrada con elegancia: sin clave, sin red o con respuesta inválida usa el
 * proveedor local en lugar de dejar la pantalla rota.
 */
export class UsdaFoodProvider implements FoodProvider {
  readonly id = 'usda';

  private readonly apiKey?: string;
  private readonly proxyUrl?: string;
  private readonly baseUrl: string;
  private readonly fallback: FoodProvider;
  private readonly timeoutMs: number;
  private readonly fetchImpl?: typeof fetch;
  private readonly cache = new MemoryCache<FoodSearchResult>();
  private readonly foodCache = new MemoryCache<Food | null>();

  constructor(options: UsdaProviderOptions = {}) {
    // La app solo conoce la URL de la función intermediaria, nunca la clave.
    this.apiKey = options.apiKey;
    this.proxyUrl = options.proxyUrl ?? process.env.EXPO_PUBLIC_FOOD_PROXY_URL;
    this.baseUrl = options.baseUrl ?? 'https://api.nal.usda.gov/fdc/v1';
    this.fallback = options.fallback ?? new LocalFoodProvider();
    this.timeoutMs = options.timeoutMs ?? 8000;
    this.fetchImpl = options.fetchImpl;
  }

  /** true si hay intermediaria o clave de servidor; si no, todo va al local. */
  get isConfigured(): boolean {
    return Boolean(this.proxyUrl || this.apiKey);
  }

  private async request<T>(path: string, signal?: AbortSignal): Promise<T | null> {
    const doFetch = this.fetchImpl ?? (typeof fetch === 'function' ? fetch : undefined);
    if (!doFetch) return null;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    const onAbort = () => controller.abort();
    signal?.addEventListener('abort', onAbort);

    try {
      // Con intermediaria no viaja ninguna clave desde el dispositivo.
      const url = this.proxyUrl
        ? `${this.proxyUrl}${path}`
        : `${this.baseUrl}${path}${path.includes('?') ? '&' : '?'}api_key=${encodeURIComponent(this.apiKey ?? '')}`;
      const response = await doFetch(url, { signal: controller.signal });
      if (!response.ok) return null;
      return (await response.json()) as T;
    } catch {
      logger.warn('USDA no disponible, se usa el catálogo local', { path });
      return null;
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  }

  async searchFoods(query: string, options: FoodSearchOptions = {}): Promise<FoodSearchResult> {
    if (!this.isConfigured) return this.fallback.searchFoods(query, options);

    const page = Math.max(0, Math.trunc(options.page ?? 0));
    const pageSize = Math.max(1, Math.trunc(options.pageSize ?? DEFAULT_PAGE_SIZE));
    const normalized = normalizeText(query);
    if (normalized.length < MIN_QUERY_LENGTH) {
      return this.fallback.searchFoods(query, options);
    }

    const cacheKey = `${this.id}:${normalized}:${page}:${pageSize}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const dto = await this.request<UsdaSearchDto>(
      `/foods/search?query=${encodeURIComponent(normalized)}&pageSize=${pageSize}&pageNumber=${page + 1}`,
      options.signal,
    );

    // Sin respuesta utilizable se degrada al local en vez de propagar el error.
    if (!dto || !Array.isArray(dto.foods)) {
      return this.fallback.searchFoods(query, options);
    }

    const items = dto.foods
      .map(mapUsdaFood)
      .filter((food): food is Food => food !== null);

    const total = typeof dto.totalHits === 'number' ? dto.totalHits : items.length;
    const result: FoodSearchResult = {
      items,
      page,
      pageSize,
      total,
      hasMore: (page + 1) * pageSize < total && items.length > 0,
      providerId: this.id,
    };

    items.forEach((food) => this.foodCache.set(food.id, food));
    this.cache.set(cacheKey, result);
    return result;
  }

  async getFood(id: string): Promise<Food | null> {
    const cached = this.foodCache.get(id);
    if (cached !== undefined) return cached;

    if (!this.isConfigured || !id.startsWith('usda-')) {
      return this.fallback.getFood(id);
    }

    const dto = await this.request<UsdaFoodDto>(`/food/${encodeURIComponent(id.slice(5))}`);
    const food = dto ? mapUsdaFood(dto) : null;
    if (food) {
      this.foodCache.set(food.id, food);
      return food;
    }
    return this.fallback.getFood(id);
  }

  async getNutrition(id: string, grams: number): Promise<Nutrients | null> {
    const food = await this.getFood(id);
    return food ? nutrientsForGrams(food, grams) : null;
  }

  async searchBarcode(barcode: string): Promise<Food | null> {
    const clean = String(barcode ?? '').trim();
    if (!clean) return null;

    // El código local manda: si el usuario ya lo tiene, no se pide a la red.
    const local = await this.fallback.searchBarcode(clean);
    if (local || !this.isConfigured) return local;

    const dto = await this.request<UsdaSearchDto>(
      `/foods/search?query=${encodeURIComponent(clean)}&pageSize=1`,
    );
    const first = dto?.foods?.[0];
    const mapped = first ? mapUsdaFood(first) : null;
    return mapped && mapped.barcode === clean ? mapped : null;
  }

  clearCache(): void {
    this.cache.clear();
    this.foodCache.clear();
  }
}

/* ------------------------------------------------------------- singleton */

let provider: FoodProvider | null = null;

/**
 * Proveedor activo de la app.
 *
 * Se intenta USDA porque amplía muchísimo el catálogo, pero su constructor ya
 * degrada al local cuando no hay clave, así que la app funciona igual sin
 * configurar nada.
 */
export function getFoodProvider(): FoodProvider {
  if (!provider) {
    provider = new UsdaFoodProvider({ fallback: new LocalFoodProvider() });
  }
  return provider;
}

/** Permite inyectar un proveedor distinto (tests, modo demostración). */
export function setFoodProvider(next: FoodProvider | null): void {
  provider = next;
}
