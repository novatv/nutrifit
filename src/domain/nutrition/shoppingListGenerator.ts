/**
 * Lista de la compra a partir de un plan semanal.
 *
 * Junta los ingredientes de todas las comidas de la semana, suma los que son
 * el mismo alimento y normaliza las unidades (g -> kg, ml -> L) para que la
 * lista se pueda leer en el supermercado sin hacer cuentas.
 */

import type { DayPlan, Food } from '@/types/domain';
import {
  normalizeMass,
  normalizeVolume,
  type MassUnit,
  type VolumeUnit,
} from '@/utils/units';

/* --------------------------------------------------------------- tipos */

export type ShoppingCategory =
  | 'fruits'
  | 'vegetables'
  | 'meat_fish'
  | 'plant_protein'
  | 'dairy'
  | 'grains'
  | 'pantry'
  | 'frozen'
  | 'other';

/** Orden en el que se recorre un supermercado normal. */
export const CATEGORY_ORDER: ShoppingCategory[] = [
  'fruits',
  'vegetables',
  'meat_fish',
  'plant_protein',
  'dairy',
  'grains',
  'pantry',
  'frozen',
  'other',
];

export interface ShoppingItem {
  foodId: string;
  name: string;
  /** Cantidad total ya normalizada. */
  quantity: number;
  unit: MassUnit | VolumeUnit;
  /** Gramos (o ml) crudos acumulados, por si hay que recalcular. */
  totalGrams: number;
  category: ShoppingCategory;
}

export interface ShoppingGroup {
  category: ShoppingCategory;
  /** Clave i18n del título de la categoría. */
  labelKey: string;
  items: ShoppingItem[];
}

export interface ShoppingList {
  groups: ShoppingGroup[];
  totalItems: number;
}

export interface ShoppingListOptions {
  /** Catálogo para clasificar por etiquetas en vez de por el nombre. */
  catalog?: Food[];
}

/* ------------------------------------------------------- clasificación */

/**
 * Palabras clave por categoría (español e inglés). Se comparan sobre el
 * nombre normalizado y sobre las etiquetas del catálogo si las hay.
 */
export const CATEGORY_KEYWORDS: Record<ShoppingCategory, string[]> = {
  fruits: [
    'fruit', 'fruta', 'manzana', 'platano', 'banana', 'naranja', 'fresa', 'arandano',
    'uva', 'pera', 'kiwi', 'mango', 'melon', 'sandia', 'limon', 'aguacate',
  ],
  vegetables: [
    'verdura', 'vegetal', 'vegetable', 'lechuga', 'tomate', 'cebolla', 'pimiento',
    'brocoli', 'espinaca', 'zanahoria', 'calabacin', 'pepino', 'champinon', 'ajo',
    'berenjena', 'col', 'esparrago', 'judia verde',
  ],
  meat_fish: [
    'carne', 'meat', 'pollo', 'pavo', 'ternera', 'cerdo', 'cordero', 'jamon',
    'pescado', 'fish', 'salmon', 'atun', 'merluza', 'bacalao', 'gamba', 'marisco',
    'sardina', 'anchoa',
  ],
  plant_protein: [
    'tofu', 'tempeh', 'seitan', 'legumbre', 'lenteja', 'garbanzo', 'alubia',
    'frijol', 'soja', 'edamame', 'proteina vegetal', 'guisante amarillo',
  ],
  dairy: [
    'lacteo', 'dairy', 'leche', 'milk', 'yogur', 'yogurt', 'queso', 'cheese',
    'kefir', 'requeson', 'skyr', 'mantequilla', 'nata', 'huevo', 'egg',
  ],
  grains: [
    'cereal', 'grain', 'arroz', 'rice', 'pasta', 'pan', 'bread', 'avena', 'oat',
    'quinoa', 'cuscus', 'couscous', 'trigo', 'maiz', 'tortilla de trigo', 'harina',
  ],
  pantry: [
    'aceite', 'oil', 'sal', 'salt', 'especia', 'spice', 'vinagre', 'azucar',
    'miel', 'salsa', 'conserva', 'fruto seco', 'nuez', 'almendra', 'cacahuete',
    'semilla', 'caldo', 'levadura', 'cacao', 'despensa', 'pantry',
  ],
  frozen: ['congelado', 'frozen', 'ultracongelado', 'helado'],
  other: [],
};

/** Alimentos que se miden en volumen aunque el plan los guarde en gramos. */
export const LIQUID_KEYWORDS = [
  'leche', 'milk', 'bebida', 'drink', 'zumo', 'juice', 'agua', 'water',
  'caldo', 'aceite', 'oil', 'vinagre', 'nata',
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

function matchesAny(haystack: string[], keywords: string[]): boolean {
  return keywords.some((k) => haystack.some((h) => h.includes(k)));
}

/** Clasifica un alimento por sus etiquetas (si las hay) y por su nombre. */
export function categorizeFood(name: string, tags: string[] = []): ShoppingCategory {
  const haystack = [normalize(name), ...tags.map(normalize)];

  // 'frozen' se comprueba primero: un guisante congelado va al congelador.
  for (const category of ['frozen', ...CATEGORY_ORDER] as ShoppingCategory[]) {
    if (category === 'other') continue;
    if (matchesAny(haystack, CATEGORY_KEYWORDS[category])) return category;
  }
  return 'other';
}

/** true si el ingrediente se compra por volumen. */
export function isLiquid(name: string, tags: string[] = []): boolean {
  const haystack = [normalize(name), ...tags.map(normalize)];
  return matchesAny(haystack, LIQUID_KEYWORDS);
}

/* ------------------------------------------------------------- generador */

/**
 * Genera la lista de la compra de un plan semanal.
 *
 * Los ingredientes iguales (mismo foodId, o mismo nombre si no hay id) se
 * suman en una sola línea.
 */
export function generateShoppingList(
  week: DayPlan[],
  options: ShoppingListOptions = {},
): ShoppingList {
  const catalog = new Map((options.catalog ?? []).map((f) => [f.id, f]));
  const accumulator = new Map<string, ShoppingItem>();

  for (const day of week ?? []) {
    for (const meal of day.meals ?? []) {
      for (const item of meal.items ?? []) {
        const grams = Math.max(0, Number.isFinite(item.grams) ? item.grams : 0);
        if (grams <= 0) continue;

        const key = item.foodId || normalize(item.name);
        const existing = accumulator.get(key);

        if (existing) {
          existing.totalGrams += grams;
          continue;
        }

        const tags = catalog.get(item.foodId)?.tags ?? [];
        accumulator.set(key, {
          foodId: item.foodId,
          name: item.name,
          quantity: 0,
          unit: 'g',
          totalGrams: grams,
          category: categorizeFood(item.name, tags),
        });
      }
    }
  }

  // Normalización de unidades una vez sumado todo.
  for (const item of accumulator.values()) {
    const tags = catalog.get(item.foodId)?.tags ?? [];
    const normalized = isLiquid(item.name, tags)
      ? normalizeVolume(item.totalGrams)
      : normalizeMass(item.totalGrams);
    item.quantity = normalized.value;
    item.unit = normalized.unit;
  }

  const groups: ShoppingGroup[] = CATEGORY_ORDER.map((category) => ({
    category,
    labelKey: `shopping.category.${category}`,
    items: [...accumulator.values()]
      .filter((i) => i.category === category)
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((group) => group.items.length > 0);

  return { groups, totalItems: accumulator.size };
}
