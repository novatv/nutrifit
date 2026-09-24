/**
 * Guardarraíles de nutrición. MÓDULO CRÍTICO.
 *
 * Todas las constantes de seguridad viven aquí, centralizadas y documentadas.
 * Ningún otro módulo puede inventarse un suelo de calorías ni un déficit.
 *
 * Nota importante sobre el ritmo de pérdida: NO se usa la regla fija de
 * "3500 kcal = 1 kg" para prometer pérdidas exactas. Esa regla ignora la
 * adaptación metabólica y produce promesas falsas. Los límites de ritmo se
 * expresan como % del peso corporal por semana y los de energía como % del
 * TDEE y kcal absolutas, sin convertir kcal en kg.
 */

import type { BiologicalSex, Goal, UserProfile } from '@/types/domain';
import { clamp, roundTo, safeNumber } from '@/utils/units';

/* ------------------------------------------------------------ constantes */

/**
 * Suelo absoluto de kcal diarias por sexo. NUNCA se genera un objetivo por
 * debajo de estos valores desde la app.
 *
 * Fundamento: por debajo de ~1200 kcal (mujer) / ~1500 kcal (hombre) es muy
 * difícil cubrir micronutrientes con comida normal, y las dietas de muy baja
 * energía requieren supervisión clínica. 'unspecified' usa el punto medio.
 */
export const ABSOLUTE_KCAL_FLOOR: Record<BiologicalSex, number> = {
  male: 1500,
  female: 1200,
  unspecified: 1350,
};

/**
 * Déficit máximo como fracción del TDEE. 25% mantiene la pérdida en un rango
 * sostenible y preserva masa magra mejor que déficits agresivos.
 */
export const MAX_DEFICIT_PCT_OF_TDEE = 0.25;

/** Déficit máximo en kcal absolutas, para TDEE muy altos. */
export const MAX_DEFICIT_KCAL = 750;

/**
 * Superávit máximo (ganancia de masa). Más allá de esto la ganancia extra es
 * mayoritariamente grasa, sin más músculo.
 */
export const MAX_SURPLUS_PCT_OF_TDEE = 0.15;

/** Superávit máximo en kcal absolutas. */
export const MAX_SURPLUS_KCAL = 500;

/**
 * Ritmo máximo de cambio de peso por semana, como fracción del peso corporal.
 * Pérdida: 1% semanal es el techo habitual antes de perder masa magra y
 * rendimiento. Ganancia: 0,5% semanal ya es rápido para la mayoría.
 */
export const MAX_WEEKLY_LOSS_PCT_BODYWEIGHT = 0.01;
export const MAX_WEEKLY_GAIN_PCT_BODYWEIGHT = 0.005;

/**
 * Ajuste energético sugerido por objetivo, como fracción del TDEE.
 * Es el punto de PARTIDA; después pasa siempre por los guardarraíles.
 */
export const GOAL_ENERGY_ADJUSTMENT_PCT: Record<Goal, number> = {
  lose_fat: -0.2,   // déficit moderado, sostenible
  gain_muscle: 0.1, // superávit contenido
  recomp: -0.05,    // ligerísimo déficit con proteína alta
  maintain: 0,
  fitness: 0,       // rendimiento: se come para entrenar
  habits: 0,        // foco en hábitos, no en el número
};

/* ------------------------------------------------------------- funciones */

/** Suelo efectivo de kcal para un perfil: el más alto de todos los límites. */
export function energyFloorFor(tdee: number, profile: UserProfile): number {
  const safeTdee = Math.max(0, safeNumber(tdee));
  const sexFloor = ABSOLUTE_KCAL_FLOOR[profile.sex] ?? ABSOLUTE_KCAL_FLOOR.unspecified;
  const pctFloor = safeTdee * (1 - MAX_DEFICIT_PCT_OF_TDEE);
  const absFloor = safeTdee - MAX_DEFICIT_KCAL;
  return Math.max(sexFloor, pctFloor, absFloor);
}

export interface EnergyFloorResult {
  /** kcal finales, ya seguras. */
  kcal: number;
  /** true si el suelo recortó lo que pedía el usuario. */
  floorApplied: boolean;
}

/**
 * Aplica el suelo energético.
 *
 * Si el objetivo deseado exigiría bajar del suelo, NO se aplica ese recorte:
 * se devuelve el suelo y `floorApplied: true`. El plan sigue adelante con el
 * número seguro y la UI debe explicar por qué no es el que pidió la persona.
 */
export function applyEnergyFloor(
  tdee: number,
  desiredTarget: number,
  profile: UserProfile,
): EnergyFloorResult {
  const floor = energyFloorFor(tdee, profile);
  const desired = Math.max(0, safeNumber(desiredTarget));

  if (desired < floor) {
    return { kcal: roundTo(floor, 0), floorApplied: true };
  }
  return { kcal: roundTo(desired, 0), floorApplied: false };
}

/**
 * Techo energético para objetivos de ganancia: evita superávits absurdos.
 * No es un tema de seguridad grave, pero sí de honestidad del plan.
 */
export function applyEnergyCeiling(tdee: number, desiredTarget: number): EnergyFloorResult {
  const safeTdee = Math.max(0, safeNumber(tdee));
  const ceiling = Math.min(
    safeTdee * (1 + MAX_SURPLUS_PCT_OF_TDEE),
    safeTdee + MAX_SURPLUS_KCAL,
  );
  const desired = Math.max(0, safeNumber(desiredTarget));

  if (safeTdee > 0 && desired > ceiling) {
    return { kcal: roundTo(ceiling, 0), floorApplied: true };
  }
  return { kcal: roundTo(desired, 0), floorApplied: false };
}

/** Máximo cambio de peso semanal seguro, en kg, para un peso corporal dado. */
export function maxWeeklyChangeKg(
  weightKg: number,
  direction: 'loss' | 'gain',
): number {
  const weight = Math.max(0, safeNumber(weightKg));
  const pct =
    direction === 'loss' ? MAX_WEEKLY_LOSS_PCT_BODYWEIGHT : MAX_WEEKLY_GAIN_PCT_BODYWEIGHT;
  return roundTo(weight * pct, 3);
}

/**
 * ¿Es seguro el ritmo pedido? `weeklyChangeKg` en valor absoluto.
 * Se compara contra el % del peso corporal, no contra kcal.
 */
export function isWeeklyRateSafe(
  weeklyChangeKg: number,
  weightKg: number,
  direction: 'loss' | 'gain',
): boolean {
  const rate = Math.abs(safeNumber(weeklyChangeKg));
  const max = maxWeeklyChangeKg(weightKg, direction);
  if (max <= 0) return false;
  return rate <= max + 1e-9;
}

/**
 * Déficit real (positivo) o superávit (negativo) respecto al TDEE,
 * expresado como fracción del TDEE. Nunca divide entre cero.
 */
export function deficitFractionOfTdee(tdee: number, targetKcal: number): number {
  const safeTdee = safeNumber(tdee);
  if (safeTdee <= 0) return 0;
  return clamp((safeTdee - safeNumber(targetKcal)) / safeTdee, -1, 1);
}

/** true si el déficit pedido supera el máximo permitido. */
export function isDeficitTooAggressive(tdee: number, targetKcal: number): boolean {
  const safeTdee = safeNumber(tdee);
  if (safeTdee <= 0) return false;
  const deficitKcal = safeTdee - safeNumber(targetKcal);
  return (
    deficitFractionOfTdee(tdee, targetKcal) > MAX_DEFICIT_PCT_OF_TDEE + 1e-9 ||
    deficitKcal > MAX_DEFICIT_KCAL + 1e-9
  );
}
