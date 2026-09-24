/** Proveedor de alimentos: catálogo local, caché, degradación de USDA y escalado. */

import {
  FOOD_CATALOG,
  FOOD_CATALOG_BY_BARCODE,
  FOOD_CATALOG_SIZE,
} from '@/data/food-catalog';
import {
  LocalFoodProvider,
  MemoryCache,
  UsdaFoodProvider,
  debounce,
  mapUsdaFood,
  matchScore,
  normalizeText,
  nutrientsForGrams,
  registerManualFood,
  setManualFoods,
} from '@/services/food-provider';
import type { Food } from '@/types/domain';

function manualFood(overrides: Partial<Food> = {}): Food {
  return {
    id: 'manual-tarta-abuela',
    name: 'Tarta de la abuela',
    servingLabel: '1 porción',
    servingGrams: 120,
    per100g: { kcal: 350, proteinG: 5, carbsG: 45, fatG: 16 },
    source: 'manual',
    ...overrides,
  };
}

beforeEach(() => {
  setManualFoods([]);
});

// El proveedor avisa por consola cuando degrada al catálogo local; en los
// tests que provocan esa degradación a propósito es ruido.
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('catálogo', () => {
  it('tiene al menos 120 alimentos', () => {
    expect(FOOD_CATALOG_SIZE).toBeGreaterThanOrEqual(120);
  });

  it('no repite identificadores', () => {
    const ids = new Set(FOOD_CATALOG.map((food) => food.id));
    expect(ids.size).toBe(FOOD_CATALOG.length);
  });

  it('declara patrones dietéticos en todos los alimentos', () => {
    const sinPatrones = FOOD_CATALOG.filter((food) => !food.dietPatterns?.length);
    expect(sinPatrones).toEqual([]);
  });

  it('mantiene los macros coherentes con las kcal declaradas', () => {
    // Factores de Atwater con la fibra a 2 kcal/g (convención de etiquetado
    // europeo), porque la fibra ya va contada dentro de los carbohidratos.
    //
    // Excepciones conocidas y correctas: el cacao desgrasado y el limón tienen
    // en las tablas una energía bastante menor que la que da Atwater genérico
    // (factores específicos del cacao; ácidos orgánicos del cítrico que no
    // aportan las kcal que la fórmula les supone). Sus valores son los de la
    // tabla, no un error de transcripción.
    const excepciones = ['cacao-polvo', 'limon'];

    const incoherentes = FOOD_CATALOG.filter((food) => {
      if (excepciones.includes(food.id)) return false;
      const { kcal, proteinG, carbsG, fatG, fiberG } = food.per100g;
      const fibra = Math.min(fiberG ?? 0, carbsG);
      const estimadas = proteinG * 4 + (carbsG - fibra) * 4 + fibra * 2 + fatG * 9;
      // Por debajo de 20 kcal el error relativo se dispara con cualquier
      // redondeo, así que se compara en absoluto.
      if (kcal < 20) return estimadas > 60;
      return Math.abs(estimadas - kcal) / kcal > 0.25;
    });
    expect(incoherentes.map((f) => f.name)).toEqual([]);
  });

  it('marca los alimentos de origen animal fuera de la dieta vegana', () => {
    const carne = FOOD_CATALOG.filter((food) => food.tags?.includes('carne'));
    expect(carne.length).toBeGreaterThan(0);
    carne.forEach((food) => {
      expect(food.dietPatterns).not.toContain('vegan');
      expect(food.dietPatterns).not.toContain('vegetarian');
    });
  });

  it('declara lactosa en los lácteos', () => {
    const lacteos = FOOD_CATALOG.filter(
      (food) => food.tags?.includes('lacteo') && !food.tags?.includes('huevo'),
    );
    expect(lacteos.length).toBeGreaterThan(5);
    lacteos.forEach((food) => expect(food.allergens).toContain('lactose'));
  });
});

describe('normalizeText', () => {
  it('quita acentos y mayúsculas', () => {
    expect(normalizeText('  Plátano ')).toBe('platano');
  });
});

describe('nutrientsForGrams', () => {
  const pollo = FOOD_CATALOG.find((food) => food.id === 'pollo-pechuga') as Food;

  it('escala proporcionalmente', () => {
    const n = nutrientsForGrams(pollo, 200);
    expect(n.kcal).toBe(330);
    expect(n.proteinG).toBeCloseTo(62, 1);
  });

  it('devuelve ceros con gramos negativos en vez de números imposibles', () => {
    expect(nutrientsForGrams(pollo, -50).kcal).toBe(0);
  });

  it('no inventa opcionales que el alimento no declara', () => {
    expect(nutrientsForGrams(pollo, 100).fiberG).toBeUndefined();
  });
});

describe('matchScore', () => {
  const pollo = FOOD_CATALOG.find((food) => food.id === 'pollo-pechuga') as Food;

  it('puntúa más alto una coincidencia exacta que una por etiqueta', () => {
    expect(matchScore(pollo, 'pechuga de pollo')).toBeGreaterThan(matchScore(pollo, 'carne'));
  });

  it('encuentra por varias palabras en cualquier orden', () => {
    expect(matchScore(pollo, 'pollo pechuga')).toBeGreaterThan(0);
  });

  it('devuelve 0 cuando no hay nada que ver', () => {
    expect(matchScore(pollo, 'cemento')).toBe(0);
  });
});

describe('LocalFoodProvider', () => {
  it('busca sin acentos y prioriza la coincidencia en el nombre', async () => {
    const provider = new LocalFoodProvider();
    const result = await provider.searchFoods('platano');
    expect(result.items[0]?.name).toBe('Plátano');
    expect(result.providerId).toBe('local');
  });

  it('devuelve el catálogo entero cuando la búsqueda es demasiado corta', async () => {
    const provider = new LocalFoodProvider();
    const result = await provider.searchFoods('a');
    expect(result.total).toBe(FOOD_CATALOG_SIZE);
  });

  it('pagina y avisa de si quedan más resultados', async () => {
    const provider = new LocalFoodProvider();
    const first = await provider.searchFoods('', { page: 0, pageSize: 10 });
    const second = await provider.searchFoods('', { page: 1, pageSize: 10 });

    expect(first.items).toHaveLength(10);
    expect(first.hasMore).toBe(true);
    expect(second.items[0]?.id).not.toBe(first.items[0]?.id);
  });

  it('marca hasMore false en la última página', async () => {
    const provider = new LocalFoodProvider();
    const lastPage = Math.ceil(FOOD_CATALOG_SIZE / 50) - 1;
    const result = await provider.searchFoods('', { page: lastPage, pageSize: 50 });
    expect(result.hasMore).toBe(false);
  });

  it('encuentra los alimentos manuales del usuario', async () => {
    registerManualFood(manualFood());
    const provider = new LocalFoodProvider();
    const result = await provider.searchFoods('tarta');
    expect(result.items.map((f) => f.id)).toContain('manual-tarta-abuela');
  });

  it('fuerza source manual aunque venga marcado de otra forma', () => {
    const stored = registerManualFood(manualFood({ source: 'usda' }));
    expect(stored.source).toBe('manual');
  });

  it('resuelve un alimento por id y sus nutrientes', async () => {
    const provider = new LocalFoodProvider();
    const food = await provider.getFood('huevo-entero');
    expect(food?.name).toBe('Huevo entero');

    const nutrients = await provider.getNutrition('huevo-entero', 50);
    expect(nutrients?.kcal).toBe(72);
  });

  it('devuelve null para un id que no existe', async () => {
    const provider = new LocalFoodProvider();
    expect(await provider.getFood('no-existe')).toBeNull();
    expect(await provider.getNutrition('no-existe', 100)).toBeNull();
  });

  it('busca por código de barras y devuelve null si está vacío', async () => {
    const provider = new LocalFoodProvider();
    const [barcode] = [...FOOD_CATALOG_BY_BARCODE.keys()];
    expect((await provider.searchBarcode(barcode))?.barcode).toBe(barcode);
    expect(await provider.searchBarcode('   ')).toBeNull();
    expect(await provider.searchBarcode('000000000000')).toBeNull();
  });
});

describe('MemoryCache', () => {
  it('devuelve el valor antes de expirar y lo olvida después', () => {
    const cache = new MemoryCache<string>(1000);
    cache.set('k', 'v', 0);
    expect(cache.get('k', 500)).toBe('v');
    expect(cache.get('k', 1500)).toBeUndefined();
  });

  it('no crece más allá del máximo', () => {
    const cache = new MemoryCache<number>(1000, 3);
    ['a', 'b', 'c', 'd'].forEach((key, index) => cache.set(key, index));
    expect(cache.size).toBeLessThanOrEqual(3);
  });
});

describe('debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('ejecuta una sola vez con el último argumento', () => {
    const spy = jest.fn();
    const debounced = debounce(spy, 300);

    debounced('a');
    debounced('b');
    debounced('c');
    jest.advanceTimersByTime(300);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('c');
  });

  it('cancel evita la ejecución pendiente', () => {
    const spy = jest.fn();
    const debounced = debounce(spy, 300);
    debounced('a');
    debounced.cancel();
    jest.advanceTimersByTime(1000);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('mapUsdaFood', () => {
  it('traduce la respuesta al contrato de dominio', () => {
    const food = mapUsdaFood({
      fdcId: 123,
      description: 'Chicken breast',
      brandName: 'Marca',
      servingSize: 140,
      servingSizeUnit: 'g',
      foodNutrients: [
        { nutrientNumber: '208', value: 165 },
        { nutrientNumber: '203', value: 31 },
        { nutrientNumber: '204', value: 3.6 },
        { nutrientNumber: '205', value: 0 },
        { nutrientNumber: '307', value: 74 },
      ],
    });

    expect(food?.id).toBe('usda-123');
    expect(food?.per100g.kcal).toBe(165);
    expect(food?.per100g.sodiumMg).toBe(74);
    expect(food?.servingGrams).toBe(140);
    expect(food?.per100g.fiberG).toBeUndefined();
  });

  it('descarta respuestas sin id o sin nombre', () => {
    expect(mapUsdaFood({ description: 'sin id' })).toBeNull();
    expect(mapUsdaFood({ fdcId: 1 })).toBeNull();
  });
});

describe('UsdaFoodProvider', () => {
  it('sin clave configurada cae al proveedor local sin romperse', async () => {
    const provider = new UsdaFoodProvider({ apiKey: undefined });
    expect(provider.isConfigured).toBe(false);

    const result = await provider.searchFoods('platano');
    expect(result.providerId).toBe('local');
    expect(result.items[0]?.name).toBe('Plátano');
  });

  it('con clave pero sin red devuelve resultados locales', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new Error('sin red'));
    const provider = new UsdaFoodProvider({
      apiKey: 'clave',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const result = await provider.searchFoods('platano');
    expect(fetchImpl).toHaveBeenCalled();
    expect(result.providerId).toBe('local');
    expect(result.items.length).toBeGreaterThan(0);
  });

  it('degrada también cuando la respuesta no es válida', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({ ok: false, json: async () => ({}) });
    const provider = new UsdaFoodProvider({
      apiKey: 'clave',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const result = await provider.searchFoods('pollo');
    expect(result.providerId).toBe('local');
  });

  it('usa la respuesta remota cuando es válida', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        totalHits: 1,
        foods: [
          {
            fdcId: 999,
            description: 'Greek yogurt',
            foodNutrients: [
              { nutrientNumber: '208', value: 97 },
              { nutrientNumber: '203', value: 9 },
            ],
          },
        ],
      }),
    });
    const provider = new UsdaFoodProvider({
      apiKey: 'clave',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const result = await provider.searchFoods('yogurt');
    expect(result.providerId).toBe('usda');
    expect(result.items[0]?.id).toBe('usda-999');
  });

  it('el código de barras local tiene prioridad sobre la red', async () => {
    const fetchImpl = jest.fn();
    const provider = new UsdaFoodProvider({
      apiKey: 'clave',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    const [barcode] = [...FOOD_CATALOG_BY_BARCODE.keys()];
    const found = await provider.searchBarcode(barcode);

    expect(found?.barcode).toBe(barcode);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
