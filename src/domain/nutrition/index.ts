/** Punto de entrada del motor de nutrición. */

import type { NutritionTargets, UserProfile } from '@/types/domain';
import { calculateMacros } from '@/domain/nutrition/macroCalculator';
import { estimateEnergyNeeds } from '@/domain/nutrition/nutritionCalculator';

export * from '@/domain/nutrition/nutritionCalculator';
export * from '@/domain/nutrition/macroCalculator';
export * from '@/domain/nutrition/mealScoring';
export * from '@/domain/nutrition/foodSubstitutions';
export * from '@/domain/nutrition/shoppingListGenerator';

/**
 * Objetivos nutricionales completos del día, con su trazabilidad.
 *
 * Son ESTIMACIONES: el seguimiento semanal de peso real es lo que ajusta el
 * plan, no la fórmula. Antes de entregarlos hay que pasarlos por
 * `assertPlanIsSafe`.
 */
export function buildNutritionTargets(
  profile: UserProfile,
  now: Date = new Date(),
): NutritionTargets {
  const energy = estimateEnergyNeeds(profile, now);
  const macros = calculateMacros(profile, energy.targetKcal);

  return {
    ...macros,
    kcal: energy.targetKcal,
    rationale: {
      bmrKcal: energy.bmrKcal,
      tdeeKcal: energy.tdeeKcal,
      adjustmentKcal: energy.targetKcal - energy.tdeeKcal,
      floorApplied: energy.floorApplied,
    },
  };
}
