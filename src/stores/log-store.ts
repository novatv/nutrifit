/**
 * Registro de comidas del día.
 *
 * Guarda lo que come el usuario por fecha y tipo de comida, junto con lo que
 * hace falta para registrar rápido: recientes, favoritos, comidas guardadas y
 * alimentos creados a mano.
 *
 * Decisiones:
 * - El estado se guarda por FECHA (yyyy-mm-dd) para que "repetir lo de ayer" y
 *   "copiar comida" sean operaciones sobre datos, no sobre la pantalla.
 * - Los totales NO se guardan: se derivan con selectores. Un total almacenado
 *   se desincroniza en cuanto se edita un gramaje.
 * - Cada item lleva su propio `id`: `MealItem` del contrato no lo tiene, y sin
 *   él no se puede editar ni borrar una línea concreta cuando el mismo
 *   alimento aparece dos veces en la misma comida.
 */

import { create } from 'zustand';

import {
  nutrientsForGrams,
  registerManualFood,
  setManualFoods,
} from '@/services/food-provider';
import type { Food, MealItem, MealType, Nutrients } from '@/types/domain';
import { roundTo, safeNumber } from '@/utils/units';

/* ------------------------------------------------------------------ tipos */

/**
 * Línea registrada. Extiende `MealItem` sin modificar el contrato.
 *
 * Guarda además los valores por 100 g del alimento: con ellos se puede
 * recalcular el gramaje sin volver al proveedor, así que editar una cantidad
 * funciona igual sin red.
 */
export interface LoggedItem extends MealItem {
  id: string;
  loggedAt: string;
  per100g: Nutrients;
}

export type MealLog = Record<MealType, LoggedItem[]>;

/** Comida que el usuario ha guardado para reutilizarla. */
export interface SavedMeal {
  id: string;
  name: string;
  type: MealType;
  items: LoggedItem[];
  savedAt: string;
}

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

/** Clave i18n del nombre de cada comida. */
export const MEAL_TYPE_KEYS: Record<MealType, string> = {
  breakfast: 'log.breakfast',
  lunch: 'log.lunch',
  dinner: 'log.dinner',
  snack: 'log.snacks',
};

/** Nº máximo de alimentos recientes que se recuerdan. */
export const MAX_RECENT_FOODS = 20;

/** Total en cero, para no repetir el literal por todas partes. */
export const EMPTY_NUTRIENTS: Nutrients = {
  kcal: 0,
  proteinG: 0,
  carbsG: 0,
  fatG: 0,
  fiberG: 0,
};

/* -------------------------------------------------------------- utilidades */

/** Fecha en formato yyyy-mm-dd en horario LOCAL (no UTC: el día del usuario). */
export function toDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Día anterior a una clave de fecha. */
export function previousDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  date.setDate(date.getDate() - 1);
  return toDateKey(date);
}

export function emptyMealLog(): MealLog {
  return { breakfast: [], lunch: [], dinner: [], snack: [] };
}

let itemCounter = 0;

/** Id de línea. No usa aleatoriedad para que los tests sean deterministas. */
function nextItemId(): string {
  itemCounter += 1;
  return `item-${Date.now().toString(36)}-${itemCounter}`;
}

/** `safeNumber` para campos opcionales: undefined cuenta como 0. */
const num = (value: number | undefined): number => safeNumber(value ?? 0);

/** Suma nutrientes. Los campos opcionales ausentes se tratan como 0. */
export function sumNutrients(items: { nutrients: Nutrients }[]): Nutrients {
  const total = items.reduce<Nutrients>(
    (acc, item) => {
      const n = item.nutrients;
      return {
        kcal: acc.kcal + safeNumber(n.kcal),
        proteinG: acc.proteinG + safeNumber(n.proteinG),
        carbsG: acc.carbsG + safeNumber(n.carbsG),
        fatG: acc.fatG + safeNumber(n.fatG),
        fiberG: num(acc.fiberG) + num(n.fiberG),
        sugarG: num(acc.sugarG) + num(n.sugarG),
        sodiumMg: num(acc.sodiumMg) + num(n.sodiumMg),
      };
    },
    { ...EMPTY_NUTRIENTS, sugarG: 0, sodiumMg: 0 },
  );

  return {
    kcal: roundTo(total.kcal, 0),
    proteinG: roundTo(total.proteinG, 1),
    carbsG: roundTo(total.carbsG, 1),
    fatG: roundTo(total.fatG, 1),
    fiberG: roundTo(num(total.fiberG), 1),
    sugarG: roundTo(num(total.sugarG), 1),
    sodiumMg: roundTo(num(total.sodiumMg), 0),
  };
}

/** Convierte un alimento y unos gramos en una línea registrada. */
export function buildLoggedItem(food: Food, grams: number, now: Date = new Date()): LoggedItem {
  const safeGrams = Math.max(0, roundTo(safeNumber(grams), 0));
  return {
    id: nextItemId(),
    foodId: food.id,
    name: food.name,
    grams: safeGrams,
    nutrients: nutrientsForGrams(food, safeGrams),
    loggedAt: now.toISOString(),
    per100g: { ...food.per100g },
  };
}

/* ------------------------------------------------------------------ store */

export interface LogState {
  /** Registro por fecha (yyyy-mm-dd). */
  days: Record<string, MealLog>;
  /** Ids de alimento usados recientemente, del más reciente al más antiguo. */
  recentFoodIds: string[];
  favoriteFoodIds: string[];
  /** Alimentos creados a mano por el usuario, por id. */
  manualFoods: Record<string, Food>;
  savedMeals: SavedMeal[];

  /* ------------------------------------------------------------- acciones */
  addItem(dateKey: string, type: MealType, food: Food, grams: number): LoggedItem;
  updateItemGrams(dateKey: string, type: MealType, itemId: string, grams: number): void;
  removeItem(dateKey: string, type: MealType, itemId: string): void;
  clearMeal(dateKey: string, type: MealType): void;

  toggleFavorite(foodId: string): void;
  addManualFood(food: Food): Food;

  /** Copia la comida del mismo tipo del día anterior. Devuelve cuántas líneas trajo. */
  repeatYesterday(dateKey: string, type: MealType): number;
  /** Copia una comida a otro tipo (y opcionalmente a otra fecha). */
  copyMeal(
    dateKey: string,
    from: MealType,
    to: MealType,
    targetDateKey?: string,
  ): number;
  /** Guarda la comida actual como plantilla reutilizable. */
  saveAsMeal(dateKey: string, type: MealType, name: string): SavedMeal | null;
  /** Vuelca una comida guardada en el registro. */
  applySavedMeal(savedMealId: string, dateKey: string, type: MealType): number;
  removeSavedMeal(savedMealId: string): void;

  reset(): void;
}

const initialState = {
  days: {} as Record<string, MealLog>,
  recentFoodIds: [] as string[],
  favoriteFoodIds: [] as string[],
  manualFoods: {} as Record<string, Food>,
  savedMeals: [] as SavedMeal[],
};

/** Devuelve el día pedido, creándolo vacío si no existe. */
function dayOf(days: Record<string, MealLog>, dateKey: string): MealLog {
  return days[dateKey] ?? emptyMealLog();
}

function withDay(
  days: Record<string, MealLog>,
  dateKey: string,
  next: MealLog,
): Record<string, MealLog> {
  return { ...days, [dateKey]: next };
}

function pushRecent(recent: string[], foodId: string): string[] {
  return [foodId, ...recent.filter((id) => id !== foodId)].slice(0, MAX_RECENT_FOODS);
}

export const useLogStore = create<LogState>((set, get) => ({
  ...initialState,

  addItem(dateKey, type, food, grams) {
    const item = buildLoggedItem(food, grams);
    set((state) => {
      const day = dayOf(state.days, dateKey);
      return {
        days: withDay(state.days, dateKey, { ...day, [type]: [...day[type], item] }),
        recentFoodIds: pushRecent(state.recentFoodIds, food.id),
      };
    });
    return item;
  },

  updateItemGrams(dateKey, type, itemId, grams) {
    set((state) => {
      const day = dayOf(state.days, dateKey);
      const items = day[type].map((item) => {
        if (item.id !== itemId) return item;
        const safeGrams = Math.max(0, roundTo(safeNumber(grams), 0));
        return {
          ...item,
          grams: safeGrams,
          nutrients: nutrientsForGrams(foodShell(item), safeGrams),
        };
      });
      return { days: withDay(state.days, dateKey, { ...day, [type]: items }) };
    });
  },

  removeItem(dateKey, type, itemId) {
    set((state) => {
      const day = dayOf(state.days, dateKey);
      return {
        days: withDay(state.days, dateKey, {
          ...day,
          [type]: day[type].filter((item) => item.id !== itemId),
        }),
      };
    });
  },

  clearMeal(dateKey, type) {
    set((state) => {
      const day = dayOf(state.days, dateKey);
      return { days: withDay(state.days, dateKey, { ...day, [type]: [] }) };
    });
  },

  toggleFavorite(foodId) {
    set((state) => ({
      favoriteFoodIds: state.favoriteFoodIds.includes(foodId)
        ? state.favoriteFoodIds.filter((id) => id !== foodId)
        : [...state.favoriteFoodIds, foodId],
    }));
  },

  addManualFood(food) {
    // El proveedor también debe conocerlo para que aparezca al buscar.
    const stored = registerManualFood(food);
    set((state) => ({ manualFoods: { ...state.manualFoods, [stored.id]: stored } }));
    return stored;
  },

  repeatYesterday(dateKey, type) {
    const source = get().days[previousDateKey(dateKey)]?.[type] ?? [];
    if (source.length === 0) return 0;
    const copies = source.map((item) => ({
      ...item,
      id: nextItemId(),
      loggedAt: new Date().toISOString(),
    }));
    set((state) => {
      const day = dayOf(state.days, dateKey);
      return {
        days: withDay(state.days, dateKey, { ...day, [type]: [...day[type], ...copies] }),
        recentFoodIds: copies.reduce(
          (acc, item) => pushRecent(acc, item.foodId),
          state.recentFoodIds,
        ),
      };
    });
    return copies.length;
  },

  copyMeal(dateKey, from, to, targetDateKey) {
    const target = targetDateKey ?? dateKey;
    const source = get().days[dateKey]?.[from] ?? [];
    if (source.length === 0) return 0;
    const copies = source.map((item) => ({
      ...item,
      id: nextItemId(),
      loggedAt: new Date().toISOString(),
    }));
    set((state) => {
      const day = dayOf(state.days, target);
      return {
        days: withDay(state.days, target, { ...day, [to]: [...day[to], ...copies] }),
      };
    });
    return copies.length;
  },

  saveAsMeal(dateKey, type, name) {
    const items = get().days[dateKey]?.[type] ?? [];
    if (items.length === 0) return null;
    const saved: SavedMeal = {
      id: `saved-${Date.now().toString(36)}-${get().savedMeals.length + 1}`,
      name: name.trim(),
      type,
      items: items.map((item) => ({ ...item })),
      savedAt: new Date().toISOString(),
    };
    set((state) => ({ savedMeals: [saved, ...state.savedMeals] }));
    return saved;
  },

  applySavedMeal(savedMealId, dateKey, type) {
    const saved = get().savedMeals.find((meal) => meal.id === savedMealId);
    if (!saved || saved.items.length === 0) return 0;
    const copies = saved.items.map((item) => ({
      ...item,
      id: nextItemId(),
      loggedAt: new Date().toISOString(),
    }));
    set((state) => {
      const day = dayOf(state.days, dateKey);
      return {
        days: withDay(state.days, dateKey, { ...day, [type]: [...day[type], ...copies] }),
        recentFoodIds: copies.reduce(
          (acc, item) => pushRecent(acc, item.foodId),
          state.recentFoodIds,
        ),
      };
    });
    return copies.length;
  },

  removeSavedMeal(savedMealId) {
    set((state) => ({
      savedMeals: state.savedMeals.filter((meal) => meal.id !== savedMealId),
    }));
  },

  reset() {
    setManualFoods([]);
    set({ ...initialState, days: {}, recentFoodIds: [], favoriteFoodIds: [], savedMeals: [] });
  },
}));

/* --------------------------------------------------------------- internos */

/**
 * Envoltorio mínimo para reutilizar `nutrientsForGrams` sin volver a buscar
 * el alimento: la línea ya lleva sus valores por 100 g.
 */
function foodShell(item: LoggedItem): Food {
  return {
    id: item.foodId,
    name: item.name,
    servingLabel: '100 g',
    servingGrams: 100,
    per100g: item.per100g,
    source: 'manual',
  };
}

/* -------------------------------------------------------------- selectores */

export function selectMealItems(
  state: LogState,
  dateKey: string,
  type: MealType,
): LoggedItem[] {
  return state.days[dateKey]?.[type] ?? [];
}

export function selectMealTotals(
  state: LogState,
  dateKey: string,
  type: MealType,
): Nutrients {
  return sumNutrients(selectMealItems(state, dateKey, type));
}

export function selectDayItems(state: LogState, dateKey: string): LoggedItem[] {
  const day = state.days[dateKey];
  if (!day) return [];
  return MEAL_TYPES.flatMap((type) => day[type]);
}

/** Totales del día. Derivados siempre, nunca almacenados. */
export function selectDayTotals(state: LogState, dateKey: string): Nutrients {
  return sumNutrients(selectDayItems(state, dateKey));
}

/** Totales de cada comida del día, en el orden de `MEAL_TYPES`. */
export function selectTotalsByMeal(
  state: LogState,
  dateKey: string,
): Record<MealType, Nutrients> {
  return {
    breakfast: selectMealTotals(state, dateKey, 'breakfast'),
    lunch: selectMealTotals(state, dateKey, 'lunch'),
    dinner: selectMealTotals(state, dateKey, 'dinner'),
    snack: selectMealTotals(state, dateKey, 'snack'),
  };
}

export function selectIsFavorite(state: LogState, foodId: string): boolean {
  return state.favoriteFoodIds.includes(foodId);
}

/** true si el día tiene al menos una línea registrada. */
export function selectDayHasItems(state: LogState, dateKey: string): boolean {
  return selectDayItems(state, dateKey).length > 0;
}

/** Comidas guardadas compatibles con un tipo de comida. */
export function selectSavedMealsForType(state: LogState, type: MealType): SavedMeal[] {
  return state.savedMeals.filter((meal) => meal.type === type);
}
