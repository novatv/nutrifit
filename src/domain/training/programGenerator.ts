/**
 * Generador de programas de 12 semanas.
 *
 * Estructura:
 *   semanas 1-4   adaptación    (aprender técnica, volumen contenido)
 *   semanas 5-8   progresión    (sube volumen e intensidad; la 8 es descarga)
 *   semanas 9-12  consolidación (volumen alto y menos repeticiones en reserva)
 *
 * Todo es determinista: el mismo perfil produce exactamente el mismo programa,
 * sin Math.random ni fechas del sistema.
 */

import type {
  MovementPattern,
  ProgramWeek,
  SplitType,
  TrainingExperience,
  TrainingProgram,
  UserProfile,
  WeekPhase,
  Workout,
} from '@/types/domain';

import { buildWorkout } from './workoutBuilder';

/** Semana de descarga dentro del bloque de 12. */
export const DELOAD_WEEK = 8;

/** Semanas totales del programa. */
export const PROGRAM_WEEKS = 12;

/* ------------------------------------------------------------------ reparto */

/**
 * Elige el reparto semanal. La base es el número de días disponibles y la
 * experiencia lo ajusta: quien empieza gana más con sesiones de cuerpo
 * completo, y quien lleva años tolera repartos más fragmentados.
 */
export function determineTrainingSplit(profile: UserProfile): SplitType {
  const { daysPerWeek, experience } = profile;
  switch (daysPerWeek) {
    case 2:
      // Con dos días, cuerpo completo siempre: cada músculo necesita estímulo.
      return 'full_body';
    case 3:
      return experience === 'advanced' ? 'ppl' : 'full_body';
    case 4:
      return experience === 'beginner' ? 'full_body' : 'upper_lower';
    case 5:
      return experience === 'beginner' ? 'upper_lower' : 'upper_lower_plus';
    case 6:
    default:
      return experience === 'beginner' ? 'upper_lower_plus' : 'ppl';
  }
}

/** Plantilla de un día: nombre i18n y patrones objetivo por orden de prioridad. */
export interface DayTemplate {
  nameKey: string;
  patterns: MovementPattern[];
}

const FULL_BODY_A: DayTemplate = {
  nameKey: 'workout.day.full_body_a',
  patterns: ['squat', 'horizontal_push', 'horizontal_pull', 'hinge', 'core', 'isolation', 'cardio'],
};
const FULL_BODY_B: DayTemplate = {
  nameKey: 'workout.day.full_body_b',
  patterns: ['hinge', 'vertical_push', 'vertical_pull', 'lunge', 'core', 'isolation', 'carry'],
};
const FULL_BODY_C: DayTemplate = {
  nameKey: 'workout.day.full_body_c',
  patterns: ['lunge', 'horizontal_push', 'vertical_pull', 'squat', 'isolation', 'core', 'cardio'],
};
const UPPER: DayTemplate = {
  nameKey: 'workout.day.upper',
  patterns: ['horizontal_push', 'horizontal_pull', 'vertical_push', 'vertical_pull', 'isolation', 'isolation', 'core'],
};
const LOWER: DayTemplate = {
  nameKey: 'workout.day.lower',
  patterns: ['squat', 'hinge', 'lunge', 'isolation', 'core', 'carry', 'cardio'],
};
const PUSH: DayTemplate = {
  nameKey: 'workout.day.push',
  patterns: ['horizontal_push', 'vertical_push', 'horizontal_push', 'isolation', 'isolation', 'core', 'carry'],
};
const PULL: DayTemplate = {
  nameKey: 'workout.day.pull',
  patterns: ['vertical_pull', 'horizontal_pull', 'horizontal_pull', 'isolation', 'isolation', 'core', 'carry'],
};
const LEGS: DayTemplate = {
  nameKey: 'workout.day.legs',
  patterns: ['squat', 'hinge', 'lunge', 'isolation', 'isolation', 'core', 'cardio'],
};

/** Ciclo de plantillas de cada reparto; se recorre tantas veces como haga falta. */
export const SPLIT_CYCLES: Record<SplitType, DayTemplate[]> = {
  full_body: [FULL_BODY_A, FULL_BODY_B, FULL_BODY_C],
  upper_lower: [UPPER, LOWER],
  upper_lower_plus: [UPPER, LOWER, UPPER, LOWER, FULL_BODY_C],
  ppl: [PUSH, PULL, LEGS],
};

/** Reparto de los días dentro de la semana (0 = lunes) dejando descansos. */
export function dayIndexesFor(daysPerWeek: number): number[] {
  switch (daysPerWeek) {
    case 2:
      return [0, 3];
    case 3:
      return [0, 2, 4];
    case 4:
      return [0, 1, 3, 4];
    case 5:
      return [0, 1, 2, 4, 5];
    default:
      return [0, 1, 2, 3, 4, 5];
  }
}

/* -------------------------------------------------------------- progresión */

/** Fase de la semana. La descarga tiene fase propia aunque caiga en progresión. */
export function phaseForWeek(weekNumber: number): WeekPhase {
  if (weekNumber === DELOAD_WEEK) return 'deload';
  if (weekNumber <= 4) return 'adaptation';
  if (weekNumber <= 8) return 'progression';
  return 'consolidation';
}

/** Series añadidas sobre la base, semana a semana (índice 1..12). */
const SET_BONUS_BY_WEEK: readonly number[] = [0, 0, 0, 1, 1, 1, 2, 2, -1, 2, 2, 3, 3];

/** Series base de los ejercicios compuestos según experiencia. */
const BASE_SETS: Record<TrainingExperience, number> = {
  beginner: 2,
  intermediate: 3,
  advanced: 4,
};

/** Series por ejercicio compuesto en una semana concreta. */
export function setsForWeek(weekNumber: number, experience: TrainingExperience): number {
  const bonus = SET_BONUS_BY_WEEK[weekNumber] ?? 0;
  return Math.min(6, Math.max(2, BASE_SETS[experience] + bonus));
}

/** Repeticiones en reserva objetivo. Menos RIR = más cerca del fallo = más intensidad. */
const RIR_BY_WEEK: readonly number[] = [3, 3, 3, 3, 3, 2, 2, 2, 4, 2, 1, 1, 1];

export function targetRirForWeek(weekNumber: number, experience: TrainingExperience): number {
  const base = RIR_BY_WEEK[weekNumber] ?? 2;
  if (experience === 'beginner') return Math.min(4, base + 1);
  if (experience === 'advanced') return Math.max(0, base - 1);
  return base;
}

/** Pasos diarios objetivo: suben poco a poco y bajan en la semana de descarga. */
const BASE_STEPS: Record<UserProfile['activityLevel'], number> = {
  sedentary: 6000,
  light: 7000,
  moderate: 8000,
  high: 9000,
  very_high: 10000,
};

export function stepTargetForWeek(
  weekNumber: number,
  activityLevel: UserProfile['activityLevel'],
): number {
  const base = BASE_STEPS[activityLevel];
  if (weekNumber === DELOAD_WEEK) return base;
  return base + Math.min(250 * (weekNumber - 1), 2000);
}

/** Bloque de variantes: los ejercicios se mantienen 4 semanas y luego rotan. */
export function variantBlockForWeek(weekNumber: number): number {
  return Math.ceil(weekNumber / 4);
}

/* -------------------------------------------------------------- generación */

/** Construye las sesiones de una semana concreta del programa. */
export function buildWeek(
  profile: UserProfile,
  split: SplitType,
  weekNumber: number,
  programId: string,
): ProgramWeek {
  const phase = phaseForWeek(weekNumber);
  const isDeload = phase === 'deload';
  const cycle = SPLIT_CYCLES[split];
  const dayIndexes = dayIndexesFor(profile.daysPerWeek);
  const block = variantBlockForWeek(weekNumber);

  const sets = setsForWeek(weekNumber, profile.experience);
  const targetRir = targetRirForWeek(weekNumber, profile.experience);

  const seenTemplates = new Map<string, number>();
  const workouts: Workout[] = dayIndexes.map((dayIndex, position) => {
    const template = cycle[position % cycle.length];
    const occurrence = seenTemplates.get(template.nameKey) ?? 0;
    seenTemplates.set(template.nameKey, occurrence + 1);

    return buildWorkout({
      id: `${programId}-w${weekNumber}-d${dayIndex}`,
      nameKey: template.nameKey,
      dayIndex,
      patterns: template.patterns,
      equipment: profile.equipment,
      sessionMinutes: profile.sessionMinutes,
      experience: profile.experience,
      sets,
      targetRir,
      // La semilla no depende de la semana dentro del mismo bloque: así se
      // repiten los ejercicios y se puede progresar carga sobre ellos.
      seed: `${profile.id}|${split}|${template.nameKey}|o${occurrence}|b${block}`,
      ...(isDeload ? { notesKey: 'workout.note.deload_week' } : {}),
    });
  });

  return {
    weekNumber,
    phase,
    workouts,
    stepTarget: stepTargetForWeek(weekNumber, profile.activityLevel),
    focusKey: `program.focus.${phase}`,
  };
}

/**
 * Genera el programa completo de 12 semanas para un perfil.
 *
 * No evalúa contraindicaciones médicas: de eso se ocupa el módulo de seguridad
 * antes de ofrecer un plan. Aquí solo se construye la estructura de entreno.
 */
export function generate12WeekProgram(profile: UserProfile): TrainingProgram {
  const split = determineTrainingSplit(profile);
  const id = `program-${profile.id}-${split}`;
  const weeks: ProgramWeek[] = [];
  for (let weekNumber = 1; weekNumber <= PROGRAM_WEEKS; weekNumber += 1) {
    weeks.push(buildWeek(profile, split, weekNumber, id));
  }
  return { id, split, weeks };
}

/** Volumen total de la semana en series efectivas: útil para comprobar progresión. */
export function weeklySetVolume(week: ProgramWeek): number {
  return week.workouts.reduce(
    (total, workout) => total + workout.exercises.reduce((sum, e) => sum + e.sets, 0),
    0,
  );
}
