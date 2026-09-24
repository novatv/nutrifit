/**
 * Puntuación de una comida candidata contra los objetivos del día.
 *
 * `scoreMeal` es una función PURA que devuelve un número entre 0 y 1.
 *
 * Principio de seguridad: una comida que aporta muy poca energía NO puntúa
 * mejor que una que encaja con el objetivo. La cercanía a las kcal objetivo se
 * mide con error relativo simétrico, así que quedarse corto penaliza igual que
 * pasarse. Aquí no se premia saltarse comidas.
 */

import type { Budget, CookingTime, PlannedMeal } from '@/types/domain';
import { clamp, safeNumber } from '@/utils/units';

/* ------------------------------------------------------------ constantes */

/** Peso de cada criterio. Suman 1. */
export const MEAL_SCORE_WEIGHTS = {
  kcalFit: 0.35,
  proteinFit: 0.3,
  variety: 0.15,
  prepTime: 0.1,
  budget: 0.1,
} as const;

/**
 * Error relativo de kcal a partir del cual la comida puntúa 0 en ese criterio.
 * 40% de desvío sobre el objetivo de la comida ya es otra comida distinta.
 */
export const KCAL_TOLERANCE = 0.4;

/** Minutos de preparación aceptables según la preferencia declarada. */
export const PREP_MINUTES_BY_PREFERENCE: Record<CookingTime, number> = {
  minimal: 15,
  normal: 30,
  enjoys: 60,
};

/** Coste orientativo máximo por comida y persona, en euros. */
export const COST_LIMIT_BY_BUDGET: Record<Budget, number> = {
  low: 2.5,
  medium: 4.5,
  flexible: 8,
};

/* --------------------------------------------------------------- contexto */

export interface MealScoringContext {
  /** kcal que debería aportar ESTA comida (no las del día entero). */
  targetKcal: number;
  /** Proteína en gramos que debería aportar esta comida. */
  targetProteinG: number;
  budget: Budget;
  cookingTime: CookingTime;
  /** Ids o nombres de comidas usadas recientemente, para premiar variedad. */
  recentMealKeys?: string[];
  /** Coste estimado de la comida, si se conoce. */
  estimatedCostEur?: number;
  /** Alimentos que la persona no quiere ver. */
  dislikedFoods?: string[];
}

export interface MealScoreBreakdown {
  kcalFit: number;
  proteinFit: number;
  variety: number;
  prepTime: number;
  budget: number;
  total: number;
}

/* --------------------------------------------------------------- helpers */

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/** Cercanía a un objetivo por error relativo simétrico, acotada a 0..1. */
function closeness(actual: number, target: number, tolerance: number): number {
  const goal = safeNumber(target);
  if (goal <= 0) return 1; // sin objetivo no se puede penalizar
  const error = Math.abs(safeNumber(actual) - goal) / goal;
  return clamp(1 - error / tolerance, 0, 1);
}

/** true si la comida contiene algún alimento rechazado por la persona. */
export function mealHasDislikedFood(meal: PlannedMeal, disliked: string[] = []): boolean {
  if (disliked.length === 0) return false;
  const haystack = [meal.name, ...meal.items.map((i) => i.name)].map(normalize);
  return disliked
    .map(normalize)
    .filter((d) => d.length > 0)
    .some((d) => haystack.some((h) => h.includes(d)));
}

/* ------------------------------------------------------------ puntuación */

/** Puntúa cada criterio por separado. Útil para explicar la decisión. */
export function scoreMealBreakdown(
  meal: PlannedMeal,
  context: MealScoringContext,
): MealScoreBreakdown {
  const kcalFit = closeness(meal.nutrients.kcal, context.targetKcal, KCAL_TOLERANCE);

  // Proteína: llegar al objetivo puntúa alto; pasarse penaliza poco, porque no
  // es un problema de seguridad, solo de reparto.
  const proteinGoal = safeNumber(context.targetProteinG);
  let proteinFit = 1;
  if (proteinGoal > 0) {
    const ratio = safeNumber(meal.nutrients.proteinG) / proteinGoal;
    proteinFit = ratio <= 1 ? clamp(ratio, 0, 1) : clamp(1 - (ratio - 1) * 0.25, 0.6, 1);
  }

  // Variedad: repetir la misma comida baja la nota, sin llegar a excluirla.
  const recent = (context.recentMealKeys ?? []).map(normalize);
  const key = normalize(meal.id || meal.name);
  const repeats = recent.filter((r) => r === key || r === normalize(meal.name)).length;
  const variety = clamp(1 - repeats * 0.35, 0, 1);

  // Tiempo de preparación: dentro del límite es 1, y se degrada a partir de ahí.
  const limit = PREP_MINUTES_BY_PREFERENCE[context.cookingTime] ?? 30;
  const prep = Math.max(0, safeNumber(meal.prepMinutes));
  const prepTime = prep <= limit ? 1 : clamp(1 - (prep - limit) / limit, 0, 1);

  // Presupuesto: si no se conoce el coste, no se castiga (criterio neutro).
  const costLimit = COST_LIMIT_BY_BUDGET[context.budget] ?? COST_LIMIT_BY_BUDGET.medium;
  const cost = context.estimatedCostEur;
  const budget =
    cost === undefined || !Number.isFinite(cost)
      ? 1
      : cost <= costLimit
        ? 1
        : clamp(1 - (cost - costLimit) / costLimit, 0, 1);

  const total =
    kcalFit * MEAL_SCORE_WEIGHTS.kcalFit +
    proteinFit * MEAL_SCORE_WEIGHTS.proteinFit +
    variety * MEAL_SCORE_WEIGHTS.variety +
    prepTime * MEAL_SCORE_WEIGHTS.prepTime +
    budget * MEAL_SCORE_WEIGHTS.budget;

  // Un alimento rechazado invalida la comida entera.
  const penalty = mealHasDislikedFood(meal, context.dislikedFoods) ? 0 : 1;

  return {
    kcalFit,
    proteinFit,
    variety,
    prepTime,
    budget,
    total: clamp(total * penalty, 0, 1),
  };
}

/** Puntuación final de la comida, entre 0 y 1. */
export function scoreMeal(meal: PlannedMeal, context: MealScoringContext): number {
  return scoreMealBreakdown(meal, context).total;
}

/** Ordena candidatas de mejor a peor. No muta el array de entrada. */
export function rankMeals(
  meals: PlannedMeal[],
  context: MealScoringContext,
): { meal: PlannedMeal; score: number }[] {
  return meals
    .map((meal) => ({ meal, score: scoreMeal(meal, context) }))
    .sort((a, b) => b.score - a.score);
}
