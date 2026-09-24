import type { Equipment, MovementPattern, TrainingExperience } from '@/types/domain';
import { canPerform, getExerciseOrThrow } from '@/domain/training/exerciseLibrary';
import {
  EXERCISE_COUNT_BY_MINUTES,
  buildCooldownKeys,
  buildWarmupKeys,
  buildWorkout,
  estimateBlockMinutes,
  estimateWorkoutMinutes,
  restSecondsFor,
  selectExerciseForPattern,
  stableHash,
} from '@/domain/training/workoutBuilder';

import { FULL_GYM, NO_EQUIPMENT } from './factories';

const basePatterns: MovementPattern[] = [
  'squat', 'horizontal_push', 'horizontal_pull', 'hinge', 'core', 'isolation', 'cardio',
];

function build(
  equipment: Equipment[],
  sessionMinutes: number,
  experience: TrainingExperience = 'intermediate',
) {
  return buildWorkout({
    id: 'w-1',
    nameKey: 'workout.day.full_body_a',
    dayIndex: 0,
    patterns: basePatterns,
    equipment,
    sessionMinutes,
    experience,
    sets: 3,
    targetRir: 2,
    seed: 'semilla-fija',
  });
}

describe('constructor de sesiones', () => {
  it('es determinista: misma entrada, misma sesión', () => {
    expect(build(FULL_GYM, 60)).toEqual(build(FULL_GYM, 60));
    expect(stableHash('abc')).toBe(stableHash('abc'));
    expect(stableHash('abc')).not.toBe(stableHash('abd'));
  });

  it('respeta los minutos disponibles en todas las combinaciones', () => {
    const minutes = [20, 30, 45, 60, 75];
    const experiences: TrainingExperience[] = ['beginner', 'intermediate', 'advanced'];
    [FULL_GYM, NO_EQUIPMENT, ['dumbbells'] as Equipment[]].forEach((equipment) => {
      minutes.forEach((m) => {
        experiences.forEach((exp) => {
          const workout = build(equipment, m, exp);
          expect(workout.exercises.length).toBeGreaterThan(0);
          expect(workout.estimatedMinutes).toBeLessThanOrEqual(m);
          expect(workout.estimatedMinutes).toBeGreaterThan(0);
        });
      });
    });
  });

  it('en casa sin material no propone nada que necesite equipo', () => {
    const workout = build(NO_EQUIPMENT, 45);
    expect(workout.exercises.length).toBeGreaterThan(0);
    workout.exercises.forEach((we) => {
      const exercise = getExerciseOrThrow(we.exerciseSlug);
      expect(canPerform(exercise, NO_EQUIPMENT)).toBe(true);
      expect(exercise.equipment).toEqual(['none']);
    });
  });

  it('con gimnasio completo usa material y no repite ejercicios', () => {
    const workout = build(FULL_GYM, 75);
    const slugs = workout.exercises.map((e) => e.exerciseSlug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs.some((s) => getExerciseOrThrow(s).equipment[0] !== 'none')).toBe(true);
  });

  it('al principiante no le asigna ejercicios avanzados', () => {
    const workout = build(FULL_GYM, 60, 'beginner');
    workout.exercises.forEach((we) => {
      expect(getExerciseOrThrow(we.exerciseSlug).difficulty).not.toBe('advanced');
    });
  });

  it('ajusta el número de ejercicios a la duración', () => {
    const corta = build(FULL_GYM, 20);
    const larga = build(FULL_GYM, 75);
    expect(larga.exercises.length).toBeGreaterThan(corta.exercises.length);
    expect(larga.exercises.length).toBeLessThanOrEqual(EXERCISE_COUNT_BY_MINUTES[75]);
  });

  it('sin barra fija sustituye el tirón vertical por uno horizontal', () => {
    const sinBarra = selectExerciseForPattern('vertical_pull', NO_EQUIPMENT, 'beginner', 's');
    expect(sinBarra).toBeUndefined();
    const workout = buildWorkout({
      id: 'w-2',
      nameKey: 'workout.day.upper',
      dayIndex: 1,
      patterns: ['vertical_pull'],
      equipment: NO_EQUIPMENT,
      sessionMinutes: 45,
      experience: 'beginner',
      sets: 3,
      targetRir: 2,
      seed: 'semilla-fija',
    });
    expect(workout.exercises.length).toBeGreaterThan(0);
    const pattern = getExerciseOrThrow(workout.exercises[0].exerciseSlug).pattern;
    expect(pattern).toBe('horizontal_pull');
  });

  it('incluye calentamiento y vuelta a la calma como claves i18n', () => {
    const workout = build(FULL_GYM, 60);
    expect(workout.warmupKeys.length).toBeGreaterThan(1);
    expect(workout.cooldownKeys.length).toBeGreaterThan(1);
    [...workout.warmupKeys, ...workout.cooldownKeys].forEach((k) => {
      expect(k).toMatch(/^(warmup|cooldown)\.[a-z_]+\.[a-z_0-9]+$/);
    });
    expect(buildWarmupKeys(['squat'])).toContain('warmup.specific.hips_and_ankles');
    expect(buildCooldownKeys(['squat'])).toContain('cooldown.stretch.quads');
  });

  it('la estimación de duración crece con las series y los descansos', () => {
    const uno = estimateBlockMinutes([
      { exerciseSlug: 'barbell-back-squat', sets: 2, repMin: 6, repMax: 10, restSeconds: 150, targetRir: 2 },
    ]);
    const dos = estimateBlockMinutes([
      { exerciseSlug: 'barbell-back-squat', sets: 4, repMin: 6, repMax: 10, restSeconds: 150, targetRir: 2 },
    ]);
    expect(dos).toBeGreaterThan(uno);
    expect(estimateWorkoutMinutes([], 60)).toBe(10);
  });

  it('descansa menos en los ejercicios de peso corporal que con barra', () => {
    expect(restSecondsFor(getExerciseOrThrow('bodyweight-squat')))
      .toBeLessThan(restSecondsFor(getExerciseOrThrow('barbell-back-squat')));
  });

  it('aplica la nota i18n recibida a todos los ejercicios', () => {
    const workout = buildWorkout({
      id: 'w-3',
      nameKey: 'workout.day.lower',
      dayIndex: 2,
      patterns: ['squat', 'hinge', 'core'],
      equipment: FULL_GYM,
      sessionMinutes: 45,
      experience: 'intermediate',
      sets: 3,
      targetRir: 2,
      seed: 'semilla-fija',
      notesKey: 'workout.note.deload_week',
    });
    workout.exercises.forEach((e) => expect(e.notesKey).toBe('workout.note.deload_week'));
  });
});
