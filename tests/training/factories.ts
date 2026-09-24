/** Fábricas compartidas por los tests de entrenamiento. No contiene tests. */

import type {
  Equipment,
  ExerciseLog,
  SetLog,
  UserProfile,
  WorkoutSession,
} from '@/types/domain';

/** Gimnasio con todo el material. */
export const FULL_GYM: Equipment[] = [
  'barbell', 'plates', 'rack', 'bench', 'dumbbells',
  'machines', 'cables', 'kettlebell', 'bands', 'bike', 'treadmill', 'rower',
];

/** Casa sin nada: solo peso corporal. */
export const NO_EQUIPMENT: Equipment[] = ['none'];

export function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'user-test',
    displayName: 'Persona de prueba',
    birthDate: '1990-05-10',
    sex: 'male',
    heightCm: 178,
    weightKg: 80,
    goal: 'gain_muscle',
    activityLevel: 'moderate',
    experience: 'intermediate',
    daysPerWeek: 4,
    sessionMinutes: 60,
    location: 'gym',
    equipment: FULL_GYM,
    diet: 'omnivore',
    allergens: [],
    dislikedFoods: [],
    mealsPerDay: 3,
    budget: 'medium',
    cookingTime: 'normal',
    screening: {
      pregnantOrBreastfeeding: false,
      eatingDisorderCurrent: false,
      majorInjury: false,
      medicalNutritionTherapy: false,
      exerciseContraindicated: false,
    },
    unitSystem: 'metric',
    locale: 'es',
    ...overrides,
  };
}

/** Serie registrada. Por defecto completada. */
export function makeSet(
  setIndex: number,
  weightKg: number | null,
  reps: number | null,
  rir: number | null = 2,
  completed = true,
): SetLog {
  return { setIndex, weightKg, reps, rir, completed };
}

/** Registro de un ejercicio con `sets` series idénticas. */
export function makeLog(
  exerciseSlug: string,
  sets: number,
  weightKg: number,
  reps: number,
  rir = 2,
  completed = true,
): ExerciseLog {
  return {
    exerciseSlug,
    sets: Array.from({ length: sets }, (_, i) => makeSet(i, weightKg, reps, rir, completed)),
  };
}

export function makeSession(
  id: string,
  logs: ExerciseLog[],
  overrides: Partial<WorkoutSession> = {},
): WorkoutSession {
  return {
    id,
    workoutId: `workout-${id}`,
    startedAt: '2026-01-05T09:00:00.000Z',
    finishedAt: '2026-01-05T10:00:00.000Z',
    logs,
    ...overrides,
  };
}
