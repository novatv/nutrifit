/**
 * Motor de progresión (doble progresión).
 *
 * Primero se suben repeticiones dentro del rango; solo cuando se completan
 * todas las series en el extremo alto del rango con el margen previsto se
 * sugiere subir carga.
 *
 * REGLA INNEGOCIABLE: este módulo NUNCA sube el peso por su cuenta. Devuelve
 * una sugerencia con `requiresConfirmation: true`; quien decide es la persona.
 */

import type { ExerciseLog, SetLog, WorkoutSession } from '@/types/domain';

import { getExercise } from './exerciseLibrary';

/* ----------------------------------------------------------------- tipos */

export type ProgressionAction =
  | 'increase_load'
  | 'add_reps'
  | 'hold'
  | 'reduce_load'
  | 'insufficient_data';

/** Prescripción vigente del ejercicio, contra la que se compara lo registrado. */
export interface LoadTarget {
  exerciseSlug: string;
  sets: number;
  repMin: number;
  repMax: number;
  targetRir: number;
}

export interface LoadSuggestion {
  exerciseSlug: string;
  action: ProgressionAction;
  /** Carga de la última sesión registrada, si la hubo. */
  currentWeightKg: number | null;
  /** Carga propuesta. Es una propuesta: no se aplica sola. */
  suggestedWeightKg: number | null;
  incrementKg: number;
  suggestedRepMin: number;
  suggestedRepMax: number;
  /** Siempre true: ningún cambio de carga se aplica sin confirmación. */
  requiresConfirmation: true;
  reasonKey: string;
  reasonParams?: Record<string, string | number>;
}

export interface ProgressionOptions {
  /**
   * Dolor declarado por la persona. Si es true no se propone subir carga.
   * Dolor no es falta de ganas: se respeta sin interpretarlo.
   */
  painReported?: boolean;
}

/* ------------------------------------------------------------ incrementos */

/** Incremento sugerido para tren superior (kg). */
export const UPPER_INCREMENT_KG = 1.25;
/** Incremento sugerido para tren inferior (kg). */
export const LOWER_INCREMENT_KG = 2.5;
/** Porcentaje que se retira tras fallos repetidos. */
export const DELOAD_LOAD_FACTOR = 0.9;

const LOWER_BODY_PATTERNS = new Set(['squat', 'hinge', 'lunge']);
const LOWER_BODY_MUSCLES = new Set(['quads', 'hamstrings', 'glutes', 'calves']);

/** true si el ejercicio es de tren inferior (tolera saltos de carga mayores). */
export function isLowerBody(exerciseSlug: string): boolean {
  const exercise = getExercise(exerciseSlug);
  if (!exercise) return false;
  if (LOWER_BODY_PATTERNS.has(exercise.pattern)) return true;
  return exercise.primaryMuscles.some((m) => LOWER_BODY_MUSCLES.has(m));
}

/** Incremento de carga sugerido para ese ejercicio. */
export function incrementForExercise(exerciseSlug: string): number {
  return isLowerBody(exerciseSlug) ? LOWER_INCREMENT_KG : UPPER_INCREMENT_KG;
}

/** Redondea a múltiplos de 0,5 kg, que es lo que permite un gimnasio normal. */
export function roundLoad(kg: number): number {
  return Math.round(kg * 2) / 2;
}

/* ------------------------------------------------------ lectura de registros */

const isDone = (set: SetLog): boolean =>
  set.completed && set.reps !== null && set.reps > 0;

/** Carga de trabajo de una serie registrada (peso corporal cuenta como 0). */
const setWeight = (set: SetLog): number => set.weightKg ?? 0;

/** Carga máxima levantada en ese registro. */
export function topWeight(log: ExerciseLog): number | null {
  const done = log.sets.filter(isDone);
  if (done.length === 0) return null;
  return done.reduce((max, s) => Math.max(max, setWeight(s)), 0);
}

/** Volumen de carga del registro: suma de peso x repeticiones de las series hechas. */
export function loadVolume(log: ExerciseLog): number {
  return log.sets
    .filter(isDone)
    .reduce((total, s) => total + setWeight(s) * (s.reps ?? 0), 0);
}

/** true si se completaron todas las series en el tope del rango y con el RIR previsto. */
export function hitTopOfRange(log: ExerciseLog, target: LoadTarget): boolean {
  const done = log.sets.filter(isDone);
  if (done.length < target.sets) return false;
  return done.every(
    (s) => (s.reps ?? 0) >= target.repMax && (s.rir === null || s.rir <= target.targetRir),
  );
}

/** true si la sesión se quedó corta: series sin completar o por debajo del rango. */
export function missedTarget(log: ExerciseLog, target: LoadTarget): boolean {
  const done = log.sets.filter(isDone);
  if (done.length < target.sets) return true;
  return done.some((s) => (s.reps ?? 0) < target.repMin);
}

/* ------------------------------------------------------------- sugerencia */

/**
 * Sugiere qué hacer con la carga en la próxima sesión.
 *
 * @param history Registros de ESE ejercicio ordenados de más antiguo a más reciente.
 * @param target  Prescripción vigente.
 */
export function suggestNextLoad(
  history: ExerciseLog[],
  target: LoadTarget,
  options: ProgressionOptions = {},
): LoadSuggestion {
  const increment = incrementForExercise(target.exerciseSlug);
  const relevant = history.filter((log) => log.exerciseSlug === target.exerciseSlug);
  const last = relevant[relevant.length - 1];
  const current = last ? topWeight(last) : null;

  const base = {
    exerciseSlug: target.exerciseSlug,
    currentWeightKg: current,
    incrementKg: increment,
    suggestedRepMin: target.repMin,
    suggestedRepMax: target.repMax,
    requiresConfirmation: true as const,
  };

  if (!last) {
    return {
      ...base,
      action: 'insufficient_data',
      suggestedWeightKg: null,
      reasonKey: 'progression.reason.no_history',
    };
  }

  // Dolor declarado: se mantiene o se baja, nunca se propone subir.
  if (options.painReported) {
    return {
      ...base,
      action: 'hold',
      suggestedWeightKg: current,
      reasonKey: 'progression.reason.pain_reported_hold',
    };
  }

  const previous = relevant[relevant.length - 2];
  const failedTwice = missedTarget(last, target) && previous !== undefined && missedTarget(previous, target);

  if (failedTwice) {
    const reduced = current === null ? null : roundLoad(current * DELOAD_LOAD_FACTOR);
    return {
      ...base,
      action: 'reduce_load',
      suggestedWeightKg: reduced,
      reasonKey: 'progression.reason.repeated_misses_reduce',
      reasonParams: { sessions: 2 },
    };
  }

  if (missedTarget(last, target)) {
    return {
      ...base,
      action: 'hold',
      suggestedWeightKg: current,
      reasonKey: 'progression.reason.missed_once_hold',
    };
  }

  if (hitTopOfRange(last, target)) {
    return {
      ...base,
      action: 'increase_load',
      suggestedWeightKg: current === null ? null : roundLoad(current + increment),
      // Al subir carga se vuelve a la parte baja del rango de repeticiones.
      suggestedRepMin: target.repMin,
      suggestedRepMax: target.repMax,
      reasonKey: 'progression.reason.top_of_range_increase',
      reasonParams: { increment, repMax: target.repMax },
    };
  }

  return {
    ...base,
    action: 'add_reps',
    suggestedWeightKg: current,
    reasonKey: 'progression.reason.add_reps_first',
    reasonParams: { repMax: target.repMax },
  };
}

/* ---------------------------------------------------------------- e1RM */

/** Método usado por `estimateE1RM`. */
export const E1RM_METHOD = 'epley' as const;

/** Clave i18n que debe acompañar SIEMPRE a un e1RM mostrado en pantalla. */
export const E1RM_DISCLAIMER_KEY = 'progression.e1rm.is_an_estimate';

/**
 * ESTIMACIÓN de una repetición máxima con la fórmula de Epley.
 *
 *   e1RM = peso x (1 + repeticiones / 30)
 *
 * No es una medición: es una aproximación estadística que pierde fiabilidad
 * por encima de unas 12 repeticiones. Nunca debe presentarse como un dato real
 * ni usarse para programar cargas máximas sin criterio.
 */
export function estimateE1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return Math.round(weightKg * 10) / 10;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

/** La estimación solo es razonable en rangos bajos de repeticiones. */
export function isE1RMReliable(reps: number): boolean {
  return reps >= 1 && reps <= 12;
}

/** Mejor e1RM estimado de un registro. */
export function bestE1RM(log: ExerciseLog): number {
  return log.sets
    .filter(isDone)
    .reduce((max, s) => Math.max(max, estimateE1RM(setWeight(s), s.reps ?? 0)), 0);
}

/* ------------------------------------------------------------------ récords */

export type PrType = 'max_load' | 'max_reps_at_load' | 'session_volume' | 'estimated_1rm';

export interface PersonalRecord {
  exerciseSlug: string;
  type: PrType;
  value: number;
  /** Marca anterior. Sin historial previo no se celebra nada. */
  previousValue: number | null;
  /** true cuando el valor sale de una fórmula, no de una medición directa. */
  isEstimate: boolean;
  messageKey: string;
  messageParams: Record<string, string | number>;
}

/** Máximo de repeticiones hechas con esa carga exacta en un registro. */
function repsAtWeight(log: ExerciseLog, weightKg: number): number {
  return log.sets
    .filter((s) => isDone(s) && setWeight(s) === weightKg)
    .reduce((max, s) => Math.max(max, s.reps ?? 0), 0);
}

const logsFor = (sessions: WorkoutSession[], slug: string): ExerciseLog[] =>
  sessions.flatMap((s) => s.logs.filter((l) => l.exerciseSlug === slug));

/**
 * Detecta récords personales de la sesión frente al historial previo.
 *
 * Tipos: carga máxima, más repeticiones con la misma carga, volumen de la
 * sesión y e1RM estimado (marcado como estimación).
 */
export function detectPRs(
  session: WorkoutSession,
  history: WorkoutSession[],
): PersonalRecord[] {
  const previousSessions = history.filter((s) => s.id !== session.id);
  const records: PersonalRecord[] = [];

  session.logs.forEach((log) => {
    const slug = log.exerciseSlug;
    const past = logsFor(previousSessions, slug);
    if (past.length === 0) return; // Primera vez: hay dato, no hay récord.

    // 1. Carga máxima.
    const load = topWeight(log);
    const pastLoad = past.reduce<number | null>((max, l) => {
      const w = topWeight(l);
      if (w === null) return max;
      return max === null ? w : Math.max(max, w);
    }, null);
    if (load !== null && load > 0 && pastLoad !== null && load > pastLoad) {
      records.push({
        exerciseSlug: slug,
        type: 'max_load',
        value: load,
        previousValue: pastLoad,
        isEstimate: false,
        messageKey: 'progression.pr.max_load',
        messageParams: { weightKg: load, previousKg: pastLoad },
      });
    }

    // 2. Más repeticiones con la misma carga.
    if (load !== null && load > 0) {
      const reps = repsAtWeight(log, load);
      const pastReps = past.reduce((max, l) => Math.max(max, repsAtWeight(l, load)), 0);
      if (pastReps > 0 && reps > pastReps) {
        records.push({
          exerciseSlug: slug,
          type: 'max_reps_at_load',
          value: reps,
          previousValue: pastReps,
          isEstimate: false,
          messageKey: 'progression.pr.max_reps_at_load',
          messageParams: { reps, previousReps: pastReps, weightKg: load },
        });
      }
    }

    // 3. Volumen de carga del ejercicio en la sesión.
    const volume = loadVolume(log);
    const pastVolume = past.reduce((max, l) => Math.max(max, loadVolume(l)), 0);
    if (volume > 0 && pastVolume > 0 && volume > pastVolume) {
      records.push({
        exerciseSlug: slug,
        type: 'session_volume',
        value: Math.round(volume),
        previousValue: Math.round(pastVolume),
        isEstimate: false,
        messageKey: 'progression.pr.session_volume',
        messageParams: { volumeKg: Math.round(volume), previousKg: Math.round(pastVolume) },
      });
    }

    // 4. e1RM estimado: siempre marcado como estimación.
    const e1rm = bestE1RM(log);
    const pastE1rm = past.reduce((max, l) => Math.max(max, bestE1RM(l)), 0);
    if (e1rm > 0 && pastE1rm > 0 && e1rm > pastE1rm) {
      records.push({
        exerciseSlug: slug,
        type: 'estimated_1rm',
        value: e1rm,
        previousValue: pastE1rm,
        isEstimate: true,
        messageKey: 'progression.pr.estimated_1rm',
        messageParams: { e1rmKg: e1rm, previousKg: pastE1rm, disclaimer: E1RM_DISCLAIMER_KEY },
      });
    }
  });

  return records;
}
