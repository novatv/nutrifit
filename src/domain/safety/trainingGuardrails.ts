/**
 * Guardarraíles de entrenamiento.
 *
 * Límites de volumen semanal, progresión gradual de pasos y la regla
 * innegociable: si la persona reporta dolor agudo, NO se sube carga.
 */

import type {
  MuscleGroup,
  TrainingExperience,
  WorkoutSession,
} from '@/types/domain';
import { clamp, roundTo, safeNumber } from '@/utils/units';

/* ------------------------------------------------------------ constantes */

/**
 * Series semanales por grupo muscular según experiencia.
 *
 * Fundamento: un principiante progresa con poco volumen y necesita margen
 * para recuperar y aprender técnica; el volumen alto solo tiene sentido
 * cuando ya hay base y capacidad de recuperación.
 */
export const WEEKLY_SETS_PER_MUSCLE: Record<
  TrainingExperience,
  { min: number; max: number }
> = {
  beginner: { min: 6, max: 12 },
  intermediate: { min: 8, max: 18 },
  advanced: { min: 10, max: 22 },
};

/**
 * Progresión de pasos diarios. Nunca se salta de sedentario a 12.000.
 * Se sube un máximo del 10% semanal, con tope absoluto de 1.000 pasos/semana.
 */
export const STEP_PROGRESSION = {
  /** Incremento máximo semanal como fracción del objetivo actual. */
  maxWeeklyIncreasePct: 0.1,
  /** Incremento máximo semanal en pasos absolutos. */
  maxWeeklyIncreaseSteps: 1000,
  /** Suelo: por debajo de esto no tiene sentido poner objetivo. */
  minTargetSteps: 3000,
  /** Techo por defecto de la app. */
  maxTargetSteps: 12000,
} as const;

/**
 * Incremento de carga sugerido por sesión, como fracción del peso usado.
 * Solo aplica si NO hay dolor y la sesión anterior fue completada.
 */
export const LOAD_PROGRESSION = {
  minIncreasePct: 0.025,
  maxIncreasePct: 0.05,
  /** Tras una sesión marcada 'too_hard' se mantiene o se baja. */
  deloadPct: -0.1,
} as const;

/* --------------------------------------------------------------- volumen */

/** Acota las series semanales de un grupo muscular al rango de la experiencia. */
export function capWeeklySets(sets: number, experience: TrainingExperience): number {
  const range = WEEKLY_SETS_PER_MUSCLE[experience] ?? WEEKLY_SETS_PER_MUSCLE.beginner;
  return Math.round(clamp(safeNumber(sets), 0, range.max));
}

export interface VolumeViolation {
  muscle: MuscleGroup;
  sets: number;
  max: number;
}

/** Devuelve los grupos musculares que superan el volumen máximo permitido. */
export function findVolumeViolations(
  setsByMuscle: Partial<Record<MuscleGroup, number>>,
  experience: TrainingExperience,
): VolumeViolation[] {
  const range = WEEKLY_SETS_PER_MUSCLE[experience] ?? WEEKLY_SETS_PER_MUSCLE.beginner;
  const violations: VolumeViolation[] = [];

  for (const [muscle, sets] of Object.entries(setsByMuscle)) {
    const value = safeNumber(sets ?? 0);
    if (value > range.max) {
      violations.push({ muscle: muscle as MuscleGroup, sets: value, max: range.max });
    }
  }
  return violations;
}

/** true si el reparto semanal respeta el techo de volumen. */
export function isWeeklyVolumeSafe(
  setsByMuscle: Partial<Record<MuscleGroup, number>>,
  experience: TrainingExperience,
): boolean {
  return findVolumeViolations(setsByMuscle, experience).length === 0;
}

/* ----------------------------------------------------------------- pasos */

/**
 * Siguiente objetivo de pasos: gradual y acotado.
 * Sin objetivo previo válido se arranca en el suelo, no en el techo.
 */
export function nextStepTarget(currentSteps: number, goalSteps?: number): number {
  const current = safeNumber(currentSteps);
  if (current <= 0) return STEP_PROGRESSION.minTargetSteps;

  const ceiling = clamp(
    safeNumber(goalSteps ?? STEP_PROGRESSION.maxTargetSteps) || STEP_PROGRESSION.maxTargetSteps,
    STEP_PROGRESSION.minTargetSteps,
    STEP_PROGRESSION.maxTargetSteps,
  );

  const increase = Math.min(
    current * STEP_PROGRESSION.maxWeeklyIncreasePct,
    STEP_PROGRESSION.maxWeeklyIncreaseSteps,
  );

  const next = clamp(current + increase, STEP_PROGRESSION.minTargetSteps, ceiling);
  // Se redondea a centenas: un objetivo de 5.517 pasos no le dice nada a nadie.
  return Math.round(next / 100) * 100;
}

/** Plan de pasos semana a semana, siempre gradual. */
export function buildStepProgression(
  currentSteps: number,
  weeks: number,
  goalSteps?: number,
): number[] {
  const total = Math.max(0, Math.trunc(safeNumber(weeks)));
  const plan: number[] = [];
  let current = safeNumber(currentSteps);

  for (let i = 0; i < total; i += 1) {
    current = nextStepTarget(current, goalSteps);
    plan.push(current);
  }
  return plan;
}

/* ------------------------------------------------------------ progresión */

export interface LoadProgressionInput {
  /** Dolor agudo reportado en la última sesión. */
  painReported?: boolean;
  perceivedDifficulty?: WorkoutSession['perceivedDifficulty'];
  soreness?: WorkoutSession['soreness'];
  /** Fracción de series completadas en la última sesión (0..1). */
  completionRate?: number;
}

export interface LoadProgressionDecision {
  /** Fracción a aplicar sobre la carga previa (0 = mantener). */
  changePct: number;
  /** Clave i18n con el motivo. */
  reasonKey: string;
}

/**
 * Decide si se sube carga.
 *
 * REGLA INNEGOCIABLE: si `painReported` es true, jamás se sube carga.
 * El dolor agudo para cualquier recomendación de progresión, sin excepciones
 * y sin importar el resto de señales.
 */
export function decideLoadProgression(
  input: LoadProgressionInput,
): LoadProgressionDecision {
  if (input.painReported) {
    return { changePct: 0, reasonKey: 'training.progression.painReported' };
  }

  if (input.perceivedDifficulty === 'too_hard' || (input.soreness ?? 0) >= 5) {
    return { changePct: LOAD_PROGRESSION.deloadPct, reasonKey: 'training.progression.deload' };
  }

  const completion = clamp(safeNumber(input.completionRate ?? 1), 0, 1);
  if (completion < 0.8) {
    return { changePct: 0, reasonKey: 'training.progression.hold' };
  }

  if (input.perceivedDifficulty === 'very_easy') {
    return {
      changePct: LOAD_PROGRESSION.maxIncreasePct,
      reasonKey: 'training.progression.increase',
    };
  }

  if (input.perceivedDifficulty === 'hard') {
    return { changePct: 0, reasonKey: 'training.progression.hold' };
  }

  return {
    changePct: LOAD_PROGRESSION.minIncreasePct,
    reasonKey: 'training.progression.increase',
  };
}

/** Atajo legible: ¿se puede subir carga con estas señales? */
export function canIncreaseLoad(input: LoadProgressionInput): boolean {
  return decideLoadProgression(input).changePct > 0;
}

/** Aplica la decisión a una carga concreta, redondeando a 0,5 kg. */
export function nextLoadKg(currentKg: number, input: LoadProgressionInput): number {
  const current = Math.max(0, safeNumber(currentKg));
  const { changePct } = decideLoadProgression(input);
  const next = current * (1 + changePct);
  return roundTo(Math.round(next * 2) / 2, 1);
}
