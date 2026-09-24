/** Store del registro diario: altas, ediciones, totales y atajos. */

import { FOOD_CATALOG_BY_ID } from '@/data/food-catalog';
import { getManualFoods, setManualFoods } from '@/services/food-provider';
import {
  MAX_RECENT_FOODS,
  buildLoggedItem,
  previousDateKey,
  selectDayHasItems,
  selectDayTotals,
  selectIsFavorite,
  selectMealItems,
  selectMealTotals,
  selectSavedMealsForType,
  selectTotalsByMeal,
  sumNutrients,
  toDateKey,
  useLogStore,
} from '@/stores/log-store';
import type { Food } from '@/types/domain';

const HOY = '2026-09-24';
const AYER = '2026-09-23';

const pollo = FOOD_CATALOG_BY_ID.get('pollo-pechuga') as Food;
const arroz = FOOD_CATALOG_BY_ID.get('arroz-blanco-cocido') as Food;
const aceite = FOOD_CATALOG_BY_ID.get('aceite-oliva') as Food;

const state = () => useLogStore.getState();

beforeEach(() => {
  state().reset();
  setManualFoods([]);
});

describe('claves de fecha', () => {
  it('formatea en horario local con ceros a la izquierda', () => {
    expect(toDateKey(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });

  it('calcula el día anterior cruzando el cambio de mes', () => {
    expect(previousDateKey('2026-03-01')).toBe('2026-02-28');
    expect(previousDateKey(HOY)).toBe(AYER);
  });
});

describe('sumNutrients', () => {
  it('devuelve ceros con una lista vacía', () => {
    expect(sumNutrients([])).toEqual({
      kcal: 0,
      proteinG: 0,
      carbsG: 0,
      fatG: 0,
      fiberG: 0,
      sugarG: 0,
      sodiumMg: 0,
    });
  });

  it('suma y redondea sin arrastrar decimales absurdos', () => {
    const total = sumNutrients([
      { nutrients: { kcal: 100.4, proteinG: 10.11, carbsG: 0, fatG: 1.05 } },
      { nutrients: { kcal: 50.2, proteinG: 5.24, carbsG: 3.3, fatG: 0.9 } },
    ]);
    expect(total.kcal).toBe(151);
    expect(total.proteinG).toBe(15.4);
  });
});

describe('buildLoggedItem', () => {
  it('guarda los valores por 100 g para poder recalcular sin red', () => {
    const item = buildLoggedItem(pollo, 150);
    expect(item.per100g.kcal).toBe(pollo.per100g.kcal);
    expect(item.grams).toBe(150);
    expect(item.nutrients.kcal).toBe(248);
  });

  it('nunca registra gramos negativos', () => {
    expect(buildLoggedItem(pollo, -10).grams).toBe(0);
  });
});

describe('añadir, editar y eliminar', () => {
  it('añade un alimento a la comida indicada', () => {
    state().addItem(HOY, 'lunch', pollo, 150);

    const items = selectMealItems(state(), HOY, 'lunch');
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Pechuga de pollo');
    expect(selectMealItems(state(), HOY, 'dinner')).toEqual([]);
  });

  it('permite el mismo alimento dos veces y las distingue por id', () => {
    const a = state().addItem(HOY, 'lunch', pollo, 100);
    const b = state().addItem(HOY, 'lunch', pollo, 200);

    expect(a.id).not.toBe(b.id);
    state().removeItem(HOY, 'lunch', a.id);

    const items = selectMealItems(state(), HOY, 'lunch');
    expect(items).toHaveLength(1);
    expect(items[0].grams).toBe(200);
  });

  it('recalcula los nutrientes al editar los gramos', () => {
    const item = state().addItem(HOY, 'lunch', pollo, 100);
    expect(item.nutrients.kcal).toBe(165);

    state().updateItemGrams(HOY, 'lunch', item.id, 200);
    const updated = selectMealItems(state(), HOY, 'lunch')[0];

    expect(updated.grams).toBe(200);
    expect(updated.nutrients.kcal).toBe(330);
  });

  it('ignora gramos inválidos al editar', () => {
    const item = state().addItem(HOY, 'lunch', pollo, 100);
    state().updateItemGrams(HOY, 'lunch', item.id, Number.NaN);
    expect(selectMealItems(state(), HOY, 'lunch')[0].grams).toBe(0);
  });

  it('vacía una comida entera sin tocar las demás', () => {
    state().addItem(HOY, 'lunch', pollo, 150);
    state().addItem(HOY, 'dinner', arroz, 200);

    state().clearMeal(HOY, 'lunch');

    expect(selectMealItems(state(), HOY, 'lunch')).toEqual([]);
    expect(selectMealItems(state(), HOY, 'dinner')).toHaveLength(1);
  });

  it('eliminar un item que no existe no rompe nada', () => {
    state().addItem(HOY, 'lunch', pollo, 150);
    state().removeItem(HOY, 'lunch', 'item-inventado');
    expect(selectMealItems(state(), HOY, 'lunch')).toHaveLength(1);
  });
});

describe('totales', () => {
  it('suma todas las comidas del día', () => {
    state().addItem(HOY, 'breakfast', arroz, 100); // 130 kcal
    state().addItem(HOY, 'lunch', pollo, 100); // 165 kcal
    state().addItem(HOY, 'dinner', aceite, 10); // 88 kcal

    const totals = selectDayTotals(state(), HOY);
    expect(totals.kcal).toBe(383);
    expect(totals.proteinG).toBeCloseTo(33.7, 1);
  });

  it('separa los totales por comida', () => {
    state().addItem(HOY, 'breakfast', arroz, 100);
    state().addItem(HOY, 'lunch', pollo, 100);

    const byMeal = selectTotalsByMeal(state(), HOY);
    expect(byMeal.breakfast.kcal).toBe(130);
    expect(byMeal.lunch.kcal).toBe(165);
    expect(byMeal.snack.kcal).toBe(0);
  });

  it('un día sin registros da ceros, no undefined', () => {
    expect(selectDayTotals(state(), '2026-01-01').kcal).toBe(0);
    expect(selectMealTotals(state(), '2026-01-01', 'lunch').kcal).toBe(0);
    expect(selectDayHasItems(state(), '2026-01-01')).toBe(false);
  });

  it('los totales se recalculan tras editar, no se quedan pegados', () => {
    const item = state().addItem(HOY, 'lunch', pollo, 100);
    state().updateItemGrams(HOY, 'lunch', item.id, 50);
    expect(selectDayTotals(state(), HOY).kcal).toBe(83);
  });
});

describe('recientes y favoritos', () => {
  it('pone el último alimento usado en cabeza y no lo duplica', () => {
    state().addItem(HOY, 'lunch', pollo, 150);
    state().addItem(HOY, 'dinner', arroz, 200);
    state().addItem(HOY, 'snack', pollo, 50);

    expect(state().recentFoodIds.slice(0, 2)).toEqual(['pollo-pechuga', 'arroz-blanco-cocido']);
    expect(state().recentFoodIds.filter((id) => id === 'pollo-pechuga')).toHaveLength(1);
  });

  it('limita la lista de recientes', () => {
    for (let i = 0; i < MAX_RECENT_FOODS + 10; i += 1) {
      state().addItem(HOY, 'snack', { ...pollo, id: `food-${i}` }, 10);
    }
    expect(state().recentFoodIds).toHaveLength(MAX_RECENT_FOODS);
  });

  it('marca y desmarca favoritos', () => {
    state().toggleFavorite('pollo-pechuga');
    expect(selectIsFavorite(state(), 'pollo-pechuga')).toBe(true);

    state().toggleFavorite('pollo-pechuga');
    expect(selectIsFavorite(state(), 'pollo-pechuga')).toBe(false);
  });
});

describe('alimentos manuales', () => {
  it('los registra también en el proveedor para que se puedan buscar', () => {
    const creado = state().addManualFood({
      id: 'manual-bizcocho',
      name: 'Bizcocho de la abuela',
      servingLabel: '1 porción',
      servingGrams: 80,
      per100g: { kcal: 380, proteinG: 6, carbsG: 50, fatG: 17 },
      source: 'manual',
    });

    expect(creado.source).toBe('manual');
    expect(state().manualFoods['manual-bizcocho']).toBeDefined();
    expect(getManualFoods().map((f) => f.id)).toContain('manual-bizcocho');
  });
});

describe('repetir comida de ayer', () => {
  it('copia las líneas del día anterior y devuelve cuántas trajo', () => {
    state().addItem(AYER, 'breakfast', arroz, 100);
    state().addItem(AYER, 'breakfast', pollo, 80);

    const copiadas = state().repeatYesterday(HOY, 'breakfast');

    expect(copiadas).toBe(2);
    expect(selectMealItems(state(), HOY, 'breakfast')).toHaveLength(2);
    // Los originales siguen intactos.
    expect(selectMealItems(state(), AYER, 'breakfast')).toHaveLength(2);
  });

  it('genera ids nuevos para que borrar la copia no borre el original', () => {
    const original = state().addItem(AYER, 'breakfast', arroz, 100);
    state().repeatYesterday(HOY, 'breakfast');

    const copia = selectMealItems(state(), HOY, 'breakfast')[0];
    expect(copia.id).not.toBe(original.id);
  });

  it('devuelve 0 si ayer no hay nada', () => {
    expect(state().repeatYesterday(HOY, 'dinner')).toBe(0);
    expect(selectMealItems(state(), HOY, 'dinner')).toEqual([]);
  });
});

describe('copiar comida', () => {
  it('copia de una comida a otra el mismo día', () => {
    state().addItem(HOY, 'lunch', pollo, 150);

    const copiadas = state().copyMeal(HOY, 'lunch', 'dinner');

    expect(copiadas).toBe(1);
    expect(selectMealItems(state(), HOY, 'dinner')[0].grams).toBe(150);
    expect(selectMealItems(state(), HOY, 'lunch')).toHaveLength(1);
  });

  it('copia a otra fecha cuando se indica', () => {
    state().addItem(AYER, 'lunch', pollo, 150);
    state().copyMeal(AYER, 'lunch', 'lunch', HOY);
    expect(selectMealItems(state(), HOY, 'lunch')).toHaveLength(1);
  });

  it('devuelve 0 si el origen está vacío', () => {
    expect(state().copyMeal(HOY, 'lunch', 'dinner')).toBe(0);
  });
});

describe('guardar como comida', () => {
  it('guarda la comida actual y la deja reutilizable', () => {
    state().addItem(HOY, 'lunch', pollo, 150);
    state().addItem(HOY, 'lunch', arroz, 200);

    const saved = state().saveAsMeal(HOY, 'lunch', 'Pollo con arroz');

    expect(saved?.items).toHaveLength(2);
    expect(selectSavedMealsForType(state(), 'lunch')).toHaveLength(1);
    expect(selectSavedMealsForType(state(), 'dinner')).toHaveLength(0);
  });

  it('no guarda una comida vacía', () => {
    expect(state().saveAsMeal(HOY, 'lunch', 'Nada')).toBeNull();
    expect(state().savedMeals).toHaveLength(0);
  });

  it('aplica una comida guardada en otro día', () => {
    state().addItem(AYER, 'dinner', pollo, 150);
    const saved = state().saveAsMeal(AYER, 'dinner', 'Cena rápida');

    const añadidas = state().applySavedMeal(saved!.id, HOY, 'dinner');

    expect(añadidas).toBe(1);
    expect(selectMealItems(state(), HOY, 'dinner')[0].name).toBe('Pechuga de pollo');
  });

  it('aplicar una comida que no existe devuelve 0', () => {
    expect(state().applySavedMeal('saved-inventada', HOY, 'lunch')).toBe(0);
  });

  it('elimina una comida guardada', () => {
    state().addItem(HOY, 'lunch', pollo, 150);
    const saved = state().saveAsMeal(HOY, 'lunch', 'Comida');
    state().removeSavedMeal(saved!.id);
    expect(state().savedMeals).toHaveLength(0);
  });
});

describe('reset', () => {
  it('deja el store y los alimentos manuales limpios', () => {
    state().addItem(HOY, 'lunch', pollo, 150);
    state().toggleFavorite('pollo-pechuga');

    state().reset();

    expect(state().days).toEqual({});
    expect(state().recentFoodIds).toEqual([]);
    expect(state().favoriteFoodIds).toEqual([]);
    expect(getManualFoods()).toEqual([]);
  });
});
