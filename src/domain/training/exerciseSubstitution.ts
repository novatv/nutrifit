/**
 * Sustitución de ejercicios.
 *
 * Sirve para tres casos reales: no hay material, el ejercicio queda grande o
 * pequeño para el nivel, o hay una molestia declarada en una zona concreta.
 * Nunca se interpreta la molestia: simplemente se evita esa musculatura.
 */

import type { Difficulty, Equipment, Exercise, MuscleGroup } from '@/types/domain';

import { DIFFICULTY_RANK, EXERCISES, canPerform, getExercise } from './exerciseLibrary';

export interface SubstitutionOptions {
  /** Material disponible. Si se omite, no se filtra por equipo. */
  equipment?: Equipment[];
  /** Dificultad máxima aceptada. Si se omite, no se filtra por dificultad. */
  difficulty?: Difficulty;
  /** Músculos a evitar por molestia declarada. */
  avoidMuscles?: MuscleGroup[];
  /** Número máximo de resultados (por defecto 5). */
  limit?: number;
}

/** Puntuación de cercanía entre el ejercicio original y un candidato. */
function score(original: Exercise, candidate: Exercise): number {
  let points = 0;
  // Lo que la propia ficha declara como alternativa va primero.
  if (original.alternatives.includes(candidate.slug)) points += 100;
  if (original.pattern === candidate.pattern) points += 40;
  original.primaryMuscles.forEach((m) => {
    if (candidate.primaryMuscles.includes(m)) points += 10;
    else if (candidate.secondaryMuscles.includes(m)) points += 4;
  });
  original.secondaryMuscles.forEach((m) => {
    if (candidate.primaryMuscles.includes(m)) points += 2;
    else if (candidate.secondaryMuscles.includes(m)) points += 1;
  });
  if (original.difficulty === candidate.difficulty) points += 5;
  return points;
}

/** true si el ejercicio involucra alguno de los músculos que hay que evitar. */
export function touchesMuscles(exercise: Exercise, muscles: MuscleGroup[]): boolean {
  if (muscles.length === 0) return false;
  const avoid = new Set(muscles);
  return (
    exercise.primaryMuscles.some((m) => avoid.has(m)) ||
    exercise.secondaryMuscles.some((m) => avoid.has(m))
  );
}

/**
 * Busca alternativas a un ejercicio, ordenadas de más a menos parecidas.
 *
 * Devuelve `[]` si el slug no existe o si ningún ejercicio pasa los filtros:
 * es mejor no proponer nada que proponer algo que la persona no puede hacer.
 */
export function findAlternatives(
  slug: string,
  options: SubstitutionOptions = {},
): Exercise[] {
  const original = getExercise(slug);
  if (!original) return [];

  const { equipment, difficulty, avoidMuscles = [], limit = 5 } = options;
  const maxRank = difficulty ? DIFFICULTY_RANK[difficulty] : undefined;

  const candidates = EXERCISES.filter((candidate) => {
    if (candidate.slug === original.slug) return false;
    if (equipment && !canPerform(candidate, equipment)) return false;
    if (maxRank !== undefined && DIFFICULTY_RANK[candidate.difficulty] > maxRank) return false;
    if (touchesMuscles(candidate, avoidMuscles)) return false;
    // Debe parecerse a algo: mismo patrón o algún músculo primario en común.
    const sharesPattern = candidate.pattern === original.pattern;
    const sharesMuscle = original.primaryMuscles.some(
      (m) => candidate.primaryMuscles.includes(m) || candidate.secondaryMuscles.includes(m),
    );
    return sharesPattern || sharesMuscle;
  });

  return candidates
    .map((candidate, index) => ({ candidate, index, points: score(original, candidate) }))
    .sort((a, b) => (b.points - a.points) || (a.index - b.index))
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

/**
 * Elige la mejor sustitución directa, o `undefined` si no hay ninguna válida.
 */
export function substituteExercise(
  slug: string,
  options: SubstitutionOptions = {},
): Exercise | undefined {
  return findAlternatives(slug, { ...options, limit: 1 })[0];
}
