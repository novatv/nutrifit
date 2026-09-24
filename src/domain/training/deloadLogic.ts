/**
 * Lógica de descarga (deload).
 *
 * Decide si toca bajar el pie del acelerador por tres vías:
 *   1. la semana programada dentro del bloque de 12,
 *   2. acumulación de sesiones muy duras o mala recuperación,
 *   3. dolor declarado por la persona.
 *
 * Límites deliberados: aquí no se diagnostica nada ni se da consejo médico.
 * Si hay dolor, la respuesta es bajar carga y ofrecer la clave i18n que
 * sugiere consultar a un profesional. El dolor nunca se trata como falta de
 * motivación ni como algo que haya que "aguantar".
 */

import type { WeeklyCheckin, Workout, WorkoutExercise, WorkoutSession } from '@/types/domain';

import { DELOAD_WEEK } from './programGenerator';
import { estimateBlockMinutes } from './workoutBuilder';

export type DeloadReason =
  | 'scheduled_week'
  | 'hard_sessions_accumulated'
  | 'pain_reported'
  | 'low_recovery';

export interface DeloadInput {
  /** Semana del programa (1..12). */
  weekNumber: number;
  /** Sesiones recientes, de la más antigua a la más reciente. */
  recentSessions?: WorkoutSession[];
  /** Check-in semanal, si existe. */
  checkin?: WeeklyCheckin;
  /** Dolor declarado explícitamente fuera del registro de sesiones. */
  painReported?: boolean;
}

export interface DeloadDecision {
  deload: boolean;
  reasons: DeloadReason[];
  /** Factor a aplicar al número de series (1 = sin cambios). */
  volumeMultiplier: number;
  /** Repeticiones en reserva que se suman al objetivo: menos intensidad. */
  rirDelta: number;
  /** false siempre que haya descarga o dolor: no se propone subir carga. */
  allowLoadIncrease: boolean;
  messageKey: string;
  /** Clave i18n para sugerir valoración profesional. No es un diagnóstico. */
  suggestProfessionalKey?: string;
  /** Cualquier cambio de plan se muestra y se confirma, no se aplica en silencio. */
  requiresConfirmation: boolean;
}

/** Sesiones recientes que se miran para detectar acumulación de fatiga. */
export const HARD_SESSION_WINDOW = 4;
/** Cuántas sesiones duras dentro de la ventana disparan la descarga. */
export const HARD_SESSION_THRESHOLD = 3;

/** true si la sesión se vivió como muy dura o con mala recuperación. */
export function isHardSession(session: WorkoutSession): boolean {
  if (session.perceivedDifficulty === 'too_hard') return true;
  if ((session.soreness ?? 0) >= 4) return true;
  if (session.energy !== undefined && session.energy <= 2) return true;
  return false;
}

/** true si el check-in refleja poca recuperación (sueño y energía bajos). */
export function isLowRecovery(checkin: WeeklyCheckin | undefined): boolean {
  if (!checkin) return false;
  return checkin.energy <= 2 && checkin.sleep <= 2;
}

/** Decide si toca descarga y con qué intensidad. */
export function shouldDeload(input: DeloadInput): DeloadDecision {
  const sessions = input.recentSessions ?? [];
  const window = sessions.slice(-HARD_SESSION_WINDOW);

  const painSessions = window.filter((s) => s.painReported === true);
  const pain = input.painReported === true || painSessions.length > 0;
  const hardCount = window.filter(isHardSession).length;

  const reasons: DeloadReason[] = [];
  if (pain) reasons.push('pain_reported');
  if (input.weekNumber === DELOAD_WEEK) reasons.push('scheduled_week');
  if (hardCount >= HARD_SESSION_THRESHOLD) reasons.push('hard_sessions_accumulated');
  if (isLowRecovery(input.checkin)) reasons.push('low_recovery');

  if (reasons.length === 0) {
    return {
      deload: false,
      reasons: [],
      volumeMultiplier: 1,
      rirDelta: 0,
      allowLoadIncrease: true,
      messageKey: 'training.deload.not_needed',
      requiresConfirmation: false,
    };
  }

  // Se aplica el recorte más conservador de los motivos presentes.
  const multipliers: Record<DeloadReason, number> = {
    pain_reported: 0.5,
    scheduled_week: 0.6,
    hard_sessions_accumulated: 0.6,
    low_recovery: 0.7,
  };
  const volumeMultiplier = Math.min(...reasons.map((r) => multipliers[r]));

  return {
    deload: true,
    reasons,
    volumeMultiplier,
    rirDelta: pain ? 3 : 2,
    // Ni con descarga programada ni con dolor se propone subir carga.
    allowLoadIncrease: false,
    messageKey: `training.deload.${reasons[0]}`,
    ...(pain
      ? { suggestProfessionalKey: 'training.pain.consider_professional_review' }
      : {}),
    requiresConfirmation: true,
  };
}

/**
 * Aplica la decisión de descarga a una sesión ya construida.
 * Recalcula la duración conservando el tiempo de calentamiento y vuelta a la calma.
 */
export function applyDeloadToWorkout(workout: Workout, decision: DeloadDecision): Workout {
  if (!decision.deload) return workout;

  const overhead = workout.estimatedMinutes - estimateBlockMinutes(workout.exercises);
  const exercises: WorkoutExercise[] = workout.exercises.map((e) => ({
    ...e,
    sets: Math.max(1, Math.round(e.sets * decision.volumeMultiplier)),
    targetRir: Math.min(5, e.targetRir + decision.rirDelta),
    notesKey: 'workout.note.deload_week',
  }));

  return {
    ...workout,
    exercises,
    estimatedMinutes: overhead + estimateBlockMinutes(exercises),
  };
}

/**
 * Atajo de seguridad: ¿se puede proponer subir carga ahora mismo?
 * Con dolor declarado la respuesta es siempre no.
 */
export function canProposeLoadIncrease(input: DeloadInput): boolean {
  return shouldDeload(input).allowLoadIncrease;
}
