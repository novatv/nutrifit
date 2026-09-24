/**
 * Constructor de sesiones concretas.
 *
 * A partir de unos patrones objetivo, el equipo disponible y los minutos que
 * tiene la persona, elige ejercicios reales y devuelve un `Workout` completo
 * con calentamiento, bloque principal y vuelta a la calma.
 *
 * Funciones puras y deterministas: con la misma entrada sale la misma sesión.
 */

import type {
  Difficulty,
  Equipment,
  Exercise,
  MovementPattern,
  TrainingExperience,
  Workout,
  WorkoutExercise,
} from '@/types/domain';

import { DIFFICULTY_RANK, byPattern, canPerform, getExercise } from './exerciseLibrary';

/* ------------------------------------------------------------ determinismo */

/**
 * Hash estable (FNV-1a de 32 bits). No es criptográfico: solo sirve para
 * elegir siempre la misma variante ante la misma entrada, sin Math.random.
 */
export function stableHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* -------------------------------------------------------------- parámetros */

interface PatternScheme {
  repMin: number;
  repMax: number;
  restSeconds: number;
  /** true si es un patrón compuesto y pesado: merece más descanso y menos reps. */
  compound: boolean;
}

/** Esquema base de repeticiones y descanso por patrón de movimiento. */
export const PATTERN_SCHEMES: Record<MovementPattern, PatternScheme> = {
  squat: { repMin: 6, repMax: 10, restSeconds: 150, compound: true },
  hinge: { repMin: 5, repMax: 8, restSeconds: 150, compound: true },
  horizontal_push: { repMin: 6, repMax: 10, restSeconds: 120, compound: true },
  vertical_push: { repMin: 6, repMax: 10, restSeconds: 120, compound: true },
  horizontal_pull: { repMin: 8, repMax: 12, restSeconds: 90, compound: true },
  vertical_pull: { repMin: 6, repMax: 10, restSeconds: 120, compound: true },
  lunge: { repMin: 8, repMax: 12, restSeconds: 90, compound: true },
  carry: { repMin: 1, repMax: 2, restSeconds: 90, compound: false },
  core: { repMin: 8, repMax: 15, restSeconds: 45, compound: false },
  isolation: { repMin: 10, repMax: 15, restSeconds: 60, compound: false },
  cardio: { repMin: 1, repMax: 1, restSeconds: 60, compound: false },
};

/** Número de ejercicios del bloque principal según los minutos disponibles. */
export const EXERCISE_COUNT_BY_MINUTES: Record<number, number> = {
  20: 3,
  30: 4,
  45: 4,
  60: 5,
  75: 6,
};

/** Dificultad máxima que se le ofrece a cada nivel de experiencia. */
const MAX_DIFFICULTY: Record<TrainingExperience, Difficulty> = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
};

/**
 * Si un patrón no tiene ninguna opción con el equipo disponible se cae a otro
 * patrón equivalente. Sin barra fija en casa no hay tirón vertical: se cubre
 * la espalda con tirón horizontal (remo invertido con una mesa, banda, etc.).
 */
const PATTERN_FALLBACK: Partial<Record<MovementPattern, MovementPattern>> = {
  vertical_pull: 'horizontal_pull',
  horizontal_pull: 'isolation',
  vertical_push: 'horizontal_push',
  carry: 'core',
  hinge: 'lunge',
  squat: 'lunge',
};

/** Minutos fijos que se reservan a un bloque de cardio dentro de la sesión. */
const CARDIO_BLOCK_MINUTES = 8;
/** Segundos por repetición en un ejercicio de fuerza (subida + bajada + pausa). */
const SECONDS_PER_REP = 3.5;
/** Segundos por recorrido en un acarreo. */
const SECONDS_PER_CARRY = 30;

/* ----------------------------------------------------- selección de ejercicio */

/**
 * Elige un ejercicio para un patrón. Determinista: la semilla decide la
 * variante, así que el mismo perfil recibe siempre el mismo programa.
 */
export function selectExerciseForPattern(
  pattern: MovementPattern,
  equipment: Equipment[],
  experience: TrainingExperience,
  seed: string,
  exclude: string[] = [],
): Exercise | undefined {
  const maxRank = DIFFICULTY_RANK[MAX_DIFFICULTY[experience]];
  const usable = byPattern(pattern).filter((e) => canPerform(e, equipment));
  if (usable.length === 0) return undefined;

  // Primero lo apropiado al nivel; si no hay nada, se relaja un escalón.
  let candidates = usable.filter((e) => DIFFICULTY_RANK[e.difficulty] <= maxRank);
  if (candidates.length === 0) {
    candidates = usable.filter((e) => DIFFICULTY_RANK[e.difficulty] <= maxRank + 1);
  }
  if (candidates.length === 0) candidates = usable;

  const excluded = new Set(exclude);
  const pool = candidates.filter((e) => !excluded.has(e.slug));
  const finalPool = pool.length > 0 ? pool : candidates;

  const index = stableHash(`${seed}|${pattern}`) % finalPool.length;
  return finalPool[index];
}

/** Resuelve un patrón, cayendo a su equivalente si no hay material para él. */
function resolvePattern(
  pattern: MovementPattern,
  equipment: Equipment[],
  experience: TrainingExperience,
  seed: string,
  exclude: string[],
): Exercise | undefined {
  const seen = new Set<MovementPattern>();
  let current: MovementPattern | undefined = pattern;
  while (current && !seen.has(current)) {
    seen.add(current);
    const found = selectExerciseForPattern(current, equipment, experience, seed, exclude);
    if (found) return found;
    current = PATTERN_FALLBACK[current];
  }
  return undefined;
}

/* ------------------------------------------------------------- duraciones */

/** Minutos de calentamiento reservados según la duración de la sesión. */
export function warmupMinutes(sessionMinutes: number): number {
  return sessionMinutes <= 30 ? 4 : 6;
}

/** Minutos de vuelta a la calma reservados según la duración de la sesión. */
export function cooldownMinutes(sessionMinutes: number): number {
  return sessionMinutes <= 30 ? 2 : 4;
}

/**
 * Estima la duración del bloque principal en minutos a partir de series,
 * repeticiones y descansos. Es una estimación, no un cronómetro.
 */
export function estimateBlockMinutes(exercises: WorkoutExercise[]): number {
  const seconds = exercises.reduce((total, we) => {
    const exercise = getExercise(we.exerciseSlug);
    const pattern = exercise?.pattern ?? 'isolation';
    if (pattern === 'cardio') return total + CARDIO_BLOCK_MINUTES * 60;
    const avgReps = (we.repMin + we.repMax) / 2;
    const perRep = pattern === 'carry' ? SECONDS_PER_CARRY : SECONDS_PER_REP;
    const work = avgReps * perRep;
    // El último descanso de cada ejercicio se solapa con montar el siguiente.
    return total + we.sets * work + (we.sets - 1) * we.restSeconds + we.restSeconds;
  }, 0);
  return Math.round(seconds / 60);
}

/** Duración total estimada: calentamiento + bloque principal + vuelta a la calma. */
export function estimateWorkoutMinutes(
  exercises: WorkoutExercise[],
  sessionMinutes: number,
): number {
  return (
    warmupMinutes(sessionMinutes) +
    estimateBlockMinutes(exercises) +
    cooldownMinutes(sessionMinutes)
  );
}

/* --------------------------------------------------- calentamiento y calma */

const WARMUP_BY_PATTERN: Partial<Record<MovementPattern, string>> = {
  squat: 'warmup.specific.hips_and_ankles',
  hinge: 'warmup.specific.hamstrings_and_hips',
  lunge: 'warmup.specific.hip_flexors',
  horizontal_push: 'warmup.specific.shoulders_and_scapulae',
  vertical_push: 'warmup.specific.thoracic_and_shoulders',
  horizontal_pull: 'warmup.specific.scapular_activation',
  vertical_pull: 'warmup.specific.lats_and_shoulders',
  carry: 'warmup.specific.grip_and_trunk',
  core: 'warmup.specific.trunk_activation',
  isolation: 'warmup.specific.light_first_set',
  cardio: 'warmup.specific.progressive_pace',
};

const COOLDOWN_BY_PATTERN: Partial<Record<MovementPattern, string>> = {
  squat: 'cooldown.stretch.quads',
  hinge: 'cooldown.stretch.hamstrings',
  lunge: 'cooldown.stretch.hip_flexors',
  horizontal_push: 'cooldown.stretch.chest',
  vertical_push: 'cooldown.stretch.shoulders',
  horizontal_pull: 'cooldown.stretch.upper_back',
  vertical_pull: 'cooldown.stretch.lats',
  carry: 'cooldown.stretch.forearms',
  core: 'cooldown.stretch.trunk',
  isolation: 'cooldown.stretch.worked_muscle',
  cardio: 'cooldown.general.easy_pace_2min',
};

/** Claves i18n del calentamiento, específicas de los patrones del día. */
export function buildWarmupKeys(patterns: MovementPattern[]): string[] {
  const keys = ['warmup.general.raise_pulse_3min', 'warmup.general.joint_mobility'];
  patterns.forEach((p) => {
    const key = WARMUP_BY_PATTERN[p];
    if (key && !keys.includes(key)) keys.push(key);
  });
  keys.push('warmup.general.first_set_light');
  return keys.slice(0, 5);
}

/** Claves i18n de la vuelta a la calma. */
export function buildCooldownKeys(patterns: MovementPattern[]): string[] {
  const keys = ['cooldown.general.easy_breathing_2min'];
  patterns.forEach((p) => {
    const key = COOLDOWN_BY_PATTERN[p];
    if (key && !keys.includes(key)) keys.push(key);
  });
  keys.push('cooldown.general.hydrate_and_log');
  return keys.slice(0, 5);
}

/* ------------------------------------------------------------ construcción */

export interface WorkoutBlueprint {
  id: string;
  nameKey: string;
  dayIndex: number;
  /** Patrones objetivo, en orden de prioridad: los primeros son los importantes. */
  patterns: MovementPattern[];
  equipment: Equipment[];
  sessionMinutes: number;
  experience: TrainingExperience;
  /** Series base para los patrones compuestos. */
  sets: number;
  /** Repeticiones en reserva objetivo (menos RIR = más intensidad). */
  targetRir: number;
  /** Semilla determinista: mismo valor, misma selección de variantes. */
  seed: string;
  /** Slugs que conviene no repetir (variedad entre días de la semana). */
  exclude?: string[];
  /** Nota i18n aplicada a todos los ejercicios (por ejemplo en descarga). */
  notesKey?: string;
}

/** Ajuste de repeticiones por experiencia: el principiante trabaja más lejos del fallo. */
function repShift(experience: TrainingExperience, compound: boolean): number {
  if (!compound) return 0;
  if (experience === 'beginner') return 2;
  if (experience === 'advanced') return -1;
  return 0;
}

/**
 * Descanso real del ejercicio. Una serie de peso corporal no deja la misma
 * fatiga que una serie pesada con barra: pedir tres minutos entre series de
 * sentadilla sin carga solo vacía la sesión.
 */
export function restSecondsFor(exercise: Exercise): number {
  const scheme = PATTERN_SCHEMES[exercise.pattern];
  const bodyweight = exercise.equipment.every((eq) => eq === 'none');
  if (!bodyweight || exercise.pattern === 'cardio') return scheme.restSeconds;
  return Math.max(30, Math.round((scheme.restSeconds * 0.6) / 15) * 15);
}

function buildExercise(
  exercise: Exercise,
  bp: WorkoutBlueprint,
): WorkoutExercise {
  const scheme = PATTERN_SCHEMES[exercise.pattern];
  const shift = repShift(bp.experience, scheme.compound);
  const isAccessory = !scheme.compound && exercise.pattern !== 'cardio';
  const sets = exercise.pattern === 'cardio' ? 1 : Math.max(2, scheme.compound ? bp.sets : bp.sets - 1);
  return {
    exerciseSlug: exercise.slug,
    sets,
    repMin: Math.max(1, scheme.repMin + shift),
    repMax: Math.max(2, scheme.repMax + shift),
    restSeconds: restSecondsFor(exercise),
    // El accesorio se lleva cerca del fallo; el compuesto guarda más margen.
    targetRir: isAccessory ? Math.max(0, bp.targetRir - 1) : bp.targetRir,
    ...(bp.notesKey ? { notesKey: bp.notesKey } : {}),
  };
}

/**
 * Construye la sesión: elige un ejercicio por patrón y recorta el bloque hasta
 * que la estimación cabe en los minutos disponibles.
 */
export function buildWorkout(bp: WorkoutBlueprint): Workout {
  const targetCount = EXERCISE_COUNT_BY_MINUTES[bp.sessionMinutes] ?? 5;
  const chosen: Exercise[] = [];
  const used = new Set<string>(bp.exclude ?? []);

  bp.patterns.forEach((pattern) => {
    if (chosen.length >= targetCount) return;
    const exercise = resolvePattern(
      pattern,
      bp.equipment,
      bp.experience,
      bp.seed,
      [...used],
    );
    if (exercise && !chosen.some((e) => e.slug === exercise.slug)) {
      chosen.push(exercise);
      used.add(exercise.slug);
    }
  });

  // Búsqueda determinista: de todas las combinaciones (nº de ejercicios x
  // series) que caben en el tiempo disponible se queda la de más volumen.
  // Así, al subir las series base de la semana, el volumen real nunca baja.
  const minExercises = Math.min(chosen.length, bp.sessionMinutes <= 20 ? 2 : 3);
  let exercises: WorkoutExercise[] = [];
  let bestVolume = -1;

  for (let count = chosen.length; count >= minExercises; count -= 1) {
    for (let setsBase = bp.sets; setsBase >= 2; setsBase -= 1) {
      const candidate = chosen
        .slice(0, count)
        .map((e) => buildExercise(e, { ...bp, sets: setsBase }));
      if (estimateWorkoutMinutes(candidate, bp.sessionMinutes) > bp.sessionMinutes) continue;
      const volume = candidate.reduce((total, e) => total + e.sets, 0);
      if (volume > bestVolume) {
        bestVolume = volume;
        exercises = candidate;
      }
      // Para un número de ejercicios dado, las series más altas que caben
      // son siempre las de más volumen: no hace falta seguir bajando.
      break;
    }
  }

  // Si ni la versión mínima cabe, se entrega igualmente la más corta posible.
  if (exercises.length === 0) {
    exercises = chosen.slice(0, minExercises).map((e) => buildExercise(e, { ...bp, sets: 2 }));
  }

  const patternsUsed = exercises
    .map((e) => getExercise(e.exerciseSlug)?.pattern)
    .filter((p): p is MovementPattern => Boolean(p));

  return {
    id: bp.id,
    nameKey: bp.nameKey,
    dayIndex: bp.dayIndex,
    estimatedMinutes: estimateWorkoutMinutes(exercises, bp.sessionMinutes),
    warmupKeys: buildWarmupKeys(patternsUsed),
    exercises,
    cooldownKeys: buildCooldownKeys(patternsUsed),
  };
}
