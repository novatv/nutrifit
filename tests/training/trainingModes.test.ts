import {
  MODE_EQUIPMENT,
  applyTrainingMode,
  inferTrainingMode,
} from '@/domain/training/trainingModes';
import { canPerform, EXERCISES } from '@/domain/training/exerciseLibrary';
import type { UserProfile } from '@/types/domain';

const base = (equipment: UserProfile['equipment']): UserProfile =>
  ({
    id: 'u', displayName: 'T', birthDate: '1994-01-01', sex: 'male', heightCm: 180, weightKg: 80,
    goal: 'maintain', activityLevel: 'moderate', experience: 'intermediate', daysPerWeek: 3,
    sessionMinutes: 45, location: 'both', equipment, diet: 'omnivore', allergens: [],
    dislikedFoods: [], mealsPerDay: 3, budget: 'medium', cookingTime: 'normal',
    screening: { pregnantOrBreastfeeding: false, eatingDisorderCurrent: false, majorInjury: false,
      medicalNutritionTherapy: false, exerciseContraindicated: false },
    unitSystem: 'metric', locale: 'es',
  }) as UserProfile;

describe('modos de entrenamiento', () => {
  it('casa deja el equipo vacío aunque el usuario tuviera material', () => {
    const p = applyTrainingMode(base(['barbell', 'dumbbells']), 'home');
    expect(p.equipment).toEqual([]);
    expect(p.location).toBe('home');
  });

  it('gimnasio amplía el equipo sin quitar lo que ya había', () => {
    const p = applyTrainingMode(base(['kettlebell']), 'gym');
    expect(p.equipment).toEqual(expect.arrayContaining(['kettlebell', 'machines', 'cables', 'barbell']));
  });

  it('pesas libres no incluye máquinas ni poleas', () => {
    expect(MODE_EQUIPMENT.weights).not.toContain('machines');
    expect(MODE_EQUIPMENT.weights).not.toContain('cables');
  });

  it('cada modo tiene ejercicios para todos los patrones principales', () => {
    for (const mode of ['gym', 'weights', 'home'] as const) {
      const available = EXERCISES.filter((e) => canPerform(e, MODE_EQUIPMENT[mode]));
      const patterns = new Set(available.map((e) => e.pattern));
      // En casa no hay barra de dominadas: vertical_pull cae a horizontal_pull, y eso es aceptable.
      for (const p of ['squat', 'hinge', 'horizontal_push', 'horizontal_pull', 'lunge', 'core']) {
        expect(patterns.has(p as never)).toBe(true);
      }
    }
  });

  it('infiere el modo a partir del equipo declarado', () => {
    expect(inferTrainingMode([])).toBe('home');
    expect(inferTrainingMode(['dumbbells', 'bands'])).toBe('weights');
    expect(inferTrainingMode(['machines'])).toBe('gym');
  });
});
