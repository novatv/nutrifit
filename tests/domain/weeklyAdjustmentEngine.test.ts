import {
  MIN_ADHERENCE_TO_ADJUST,
  applyAdjustment,
  collectWeeklyData,
  determineWeeklyAdjustment,
  type WeeklyData,
} from '@/domain/progress/weeklyAdjustmentEngine';
import type {
  NutritionTargets,
  UserProfile,
  WeeklyCheckin,
  WorkoutSession,
} from '@/types/domain';

const profile = (over: Partial<UserProfile> = {}): UserProfile =>
  ({
    id: 'u1',
    displayName: 'Test',
    birthDate: '1994-03-12',
    sex: 'male',
    heightCm: 180,
    weightKg: 80,
    goal: 'lose_fat',
    activityLevel: 'moderate',
    experience: 'intermediate',
    daysPerWeek: 4,
    sessionMinutes: 45,
    location: 'gym',
    equipment: ['barbell', 'dumbbells'],
    diet: 'omnivore',
    allergens: [],
    dislikedFoods: [],
    mealsPerDay: 4,
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
    ...over,
  }) as UserProfile;

const targets: NutritionTargets = {
  kcal: 2200,
  proteinG: 150,
  carbsG: 230,
  fatG: 70,
  fiberG: 30,
  rationale: { bmrKcal: 1780, tdeeKcal: 2450, adjustmentKcal: -250, floorApplied: false },
};

const checkin = (over: Partial<WeeklyCheckin> = {}): WeeklyCheckin => ({
  weekNumber: 1,
  date: '2026-09-01',
  nutritionAdherence: 0.9,
  workoutsCompleted: 4,
  workoutsPlanned: 4,
  hunger: 3,
  energy: 4,
  sleep: 4,
  difficulty: 3,
  perceivedProgress: 3,
  ...over,
});

/** Serie de pesos con la pendiente semanal pedida, cuatro semanas. */
const weights = (startKg: number, kgPerWeek: number) =>
  Array.from({ length: 5 }, (_, i) => ({
    date: new Date(2026, 8, 1 + i * 7).toISOString().slice(0, 10),
    weightKg: startKg + kgPerWeek * i,
  }));

const base = (over: Partial<WeeklyData> = {}): WeeklyData => ({
  profile: profile(),
  currentTargets: targets,
  checkins: [checkin({ weekNumber: 1 }), checkin({ weekNumber: 2 }), checkin({ weekNumber: 3 })],
  weights: weights(80, -0.4),
  sessions: [],
  ...over,
});

describe('recogida de datos semanales', () => {
  it('calcula adherencia, tendencia y ritmo respecto al peso corporal', () => {
    const a = collectWeeklyData(base());
    expect(a.adherenceNutrition).toBeCloseTo(0.9, 2);
    expect(a.adherenceTraining).toBe(1);
    expect(a.trendKgPerWeek).toBeCloseTo(-0.4, 1);
    expect(a.trendReliable).toBe(true);
    expect(a.ratePctBodyweight).toBeLessThan(0);
  });
});

describe('no se ajusta sin motivo suficiente', () => {
  it('con un solo check-in no toca nada y lo explica', () => {
    const r = determineWeeklyAdjustment(base({ checkins: [checkin()], weights: [] }));
    expect(r.decision).toBe('KEEP');
    expect(r.explanationKey).toBe('checkin.explain.singleDataPoint');
    expect(r.after).toBeUndefined();
  });

  it('con adherencia baja mantiene el plan en vez de recortar calorías', () => {
    const low = MIN_ADHERENCE_TO_ADJUST - 0.3;
    const r = determineWeeklyAdjustment(
      base({
        checkins: [
          checkin({ nutritionAdherence: low }),
          checkin({ nutritionAdherence: low }),
          checkin({ nutritionAdherence: low }),
        ],
        weights: weights(80, 0), // estancado
      }),
    );
    expect(r.decision).toBe('KEEP');
    expect(r.explanationKey).toBe('checkin.explain.lowAdherence');
  });

  it('progresando dentro de lo previsto, mantiene', () => {
    const r = determineWeeklyAdjustment(base());
    expect(r.decision).toBe('KEEP');
    expect(r.explanationKey).toBe('checkin.explain.keepOnTrack');
  });
});

describe('ajustes por tendencia', () => {
  it('estancado con buena adherencia baja ligeramente las calorías', () => {
    const r = determineWeeklyAdjustment(base({ weights: weights(80, 0) }));
    expect(r.decision).toBe('ADJUST_NUTRITION');
    expect(r.before?.kcal).toBe(2200);
    expect(r.after?.kcal).toBe(2090); // -5%
    expect(r.requiresConfirmation).toBe(true);
  });

  it('bajando demasiado rápido sube las calorías', () => {
    // 80 kg, 1% = 0,8 kg/semana. -1,2 lo supera.
    const r = determineWeeklyAdjustment(base({ weights: weights(80, -1.2) }));
    expect(r.decision).toBe('ADJUST_NUTRITION');
    expect(r.after!.kcal!).toBeGreaterThan(2200);
    expect(r.explanationKey).toBe('checkin.explain.trendTooFast');
  });

  it('nunca ajusta por debajo del suelo de seguridad', () => {
    const tiny = profile({ sex: 'female', weightKg: 48, heightCm: 158 });
    const lowTargets: NutritionTargets = {
      ...targets,
      kcal: 1250,
      rationale: { ...targets.rationale, tdeeKcal: 1500 },
    };
    const r = determineWeeklyAdjustment(
      base({ profile: tiny, currentTargets: lowTargets, weights: weights(48, 0) }),
    );
    expect(r.after!.kcal!).toBeGreaterThanOrEqual(1200);
    expect(r.explanationKey).toBe('safety.energyFloor');
  });
});

describe('las reglas de seguridad van por delante de los números', () => {
  it('dolor reportado manda a revisión y no cambia calorías', () => {
    const session = { painReported: true } as unknown as WorkoutSession;
    const r = determineWeeklyAdjustment(base({ sessions: [session] }));
    expect(r.decision).toBe('NEEDS_REVIEW');
    expect(r.after).toBeUndefined();
  });

  it('dos sesiones demasiado duras piden semana de recuperación', () => {
    const hard = { perceivedDifficulty: 'too_hard' } as unknown as WorkoutSession;
    const r = determineWeeklyAdjustment(base({ sessions: [hard, hard] }));
    expect(r.decision).toBe('RECOVERY_WEEK');
    expect(r.requiresConfirmation).toBe(true);
  });

  it('energía y sueño bajos sostenidos piden recuperación', () => {
    const tired = checkin({ energy: 2, sleep: 1 });
    const r = determineWeeklyAdjustment(base({ checkins: [checkin(), tired, tired] }));
    expect(r.decision).toBe('RECOVERY_WEEK');
  });
});

describe('aplicar el ajuste', () => {
  it('escala carbohidratos y grasa pero conserva la proteína', () => {
    const adj = determineWeeklyAdjustment(base({ weights: weights(80, 0) }));
    const next = applyAdjustment(targets, adj);
    expect(next.kcal).toBe(2090);
    expect(next.proteinG).toBe(150);
    expect(next.carbsG).toBeLessThan(targets.carbsG);
    expect(next.fatG).toBeLessThan(targets.fatG);
  });

  it('no hace nada si el ajuste no era de nutrición', () => {
    const next = applyAdjustment(targets, {
      decision: 'KEEP',
      explanationKey: 'checkin.explain.keepOnTrack',
      requiresConfirmation: false,
    });
    expect(next).toEqual(targets);
  });
});
