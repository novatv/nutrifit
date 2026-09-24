/**
 * Cálculo de gasto energético.
 *
 * TODO lo que sale de aquí es una ESTIMACIÓN estadística, nunca una medición
 * ni una garantía. Dos personas con el mismo perfil pueden diferir un 10-15%.
 * Por eso los números se muestran redondeados (ver `formatEstimate`): dar
 * "2.314 kcal" transmite una precisión que la fórmula no tiene.
 */

import type { ActivityLevel, EnergyEstimate, UserProfile } from '@/types/domain';
import { calculateAge } from '@/domain/safety/healthScreening';
import {
  GOAL_ENERGY_ADJUSTMENT_PCT,
  applyEnergyCeiling,
  applyEnergyFloor,
} from '@/domain/safety/nutritionGuardrails';
import { roundTo, roundToNearest, safeNumber } from '@/utils/units';

/* ------------------------------------------------------------ constantes */

/**
 * Multiplicadores de actividad sobre el BMR (factores clásicos de Harris
 * revisados). Incluyen entrenamiento y actividad diaria (NEAT).
 */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,   // trabajo de oficina, poco o nada de ejercicio
  light: 1.375,     // 1-3 sesiones/semana o trabajo de pie
  moderate: 1.55,   // 3-5 sesiones/semana
  high: 1.725,      // 6-7 sesiones/semana
  very_high: 1.9,   // trabajo físico duro + entrenamiento diario
};

/**
 * Coeficientes de Mifflin-St Jeor (1990), la fórmula predictiva con menor
 * error medio en población general sana.
 *   BMR = 10*kg + 6.25*cm - 5*edad + constante(sexo)
 */
export const MIFFLIN_COEFFICIENTS = {
  weight: 10,
  height: 6.25,
  age: -5,
  sexConstant: {
    male: 5,
    female: -161,
    /**
     * Para 'unspecified' se usa la MEDIA de las dos fórmulas: (5 + -161)/2 = -78.
     * No es una tercera fórmula validada; es el punto intermedio entre las dos
     * existentes, elegido para no imponer un sexo a quien no lo declara. El
     * error esperado es mayor que en las otras dos y se compensa con el
     * seguimiento semanal de peso real.
     */
    unspecified: -78,
  },
} as const;

/** Edad por defecto cuando la fecha de nacimiento no es utilizable. */
const FALLBACK_AGE_YEARS = 30;

/* ------------------------------------------------------------- funciones */

/**
 * Redondea una estimación a la decena más cercana.
 * Un objetivo es "2.300 kcal", no "2.314 kcal".
 */
export function formatEstimate(kcal: number): number {
  return roundToNearest(safeNumber(kcal), 10);
}

/** Edad usada por las fórmulas; cae a 30 años si el dato no sirve. */
export function resolveAge(profile: UserProfile, now: Date = new Date()): number {
  const age = calculateAge(profile.birthDate, now);
  return age >= 0 && age <= 100 ? age : FALLBACK_AGE_YEARS;
}

/**
 * Metabolismo basal estimado con Mifflin-St Jeor.
 * Para sexo 'unspecified' equivale a la media aritmética de la fórmula
 * masculina y la femenina (ver MIFFLIN_COEFFICIENTS.sexConstant).
 */
export function calculateBmr(profile: UserProfile, now: Date = new Date()): number {
  const { weight, height, age, sexConstant } = MIFFLIN_COEFFICIENTS;
  const constant = sexConstant[profile.sex] ?? sexConstant.unspecified;

  const bmr =
    weight * safeNumber(profile.weightKg) +
    height * safeNumber(profile.heightCm) +
    age * resolveAge(profile, now) +
    constant;

  // Un BMR negativo o absurdo solo aparece con datos imposibles; el cribado
  // los bloquea antes, pero aquí se acota para no propagar basura.
  return Math.max(0, roundTo(bmr, 0));
}

/** Gasto total diario estimado = BMR x multiplicador de actividad. */
export function calculateTdee(profile: UserProfile, now: Date = new Date()): number {
  const multiplier =
    ACTIVITY_MULTIPLIERS[profile.activityLevel] ?? ACTIVITY_MULTIPLIERS.sedentary;
  return Math.max(0, roundTo(calculateBmr(profile, now) * multiplier, 0));
}

/**
 * Estimación energética completa: BMR, TDEE y objetivo diario tras aplicar
 * el ajuste del objetivo y los guardarraíles de seguridad.
 *
 * El objetivo NUNCA baja del suelo de seguridad: si el ajuste lo exigiera,
 * se devuelve el suelo con `floorApplied: true`.
 */
export function estimateEnergyNeeds(
  profile: UserProfile,
  now: Date = new Date(),
): EnergyEstimate {
  const bmrKcal = calculateBmr(profile, now);
  const tdeeKcal = calculateTdee(profile, now);

  const adjustmentPct = GOAL_ENERGY_ADJUSTMENT_PCT[profile.goal] ?? 0;
  const desired = tdeeKcal * (1 + adjustmentPct);

  const guarded =
    adjustmentPct < 0
      ? applyEnergyFloor(tdeeKcal, desired, profile)
      : applyEnergyCeiling(tdeeKcal, desired);

  // El suelo siempre manda: aunque el objetivo sea de ganancia, no se entrega
  // un número por debajo del mínimo seguro.
  const withFloor = applyEnergyFloor(tdeeKcal, guarded.kcal, profile);

  return {
    bmrKcal,
    tdeeKcal,
    targetKcal: withFloor.kcal,
    floorApplied: guarded.floorApplied || withFloor.floorApplied,
  };
}

/** Ajuste aplicado respecto al TDEE, en kcal (negativo = déficit). */
export function adjustmentKcal(estimate: EnergyEstimate): number {
  return roundTo(estimate.targetKcal - estimate.tdeeKcal, 0);
}
