import {
  InvalidProfileError,
  generatePlan,
  planKey,
} from '@/domain/planPipeline';
import type { UserProfile } from '@/types/domain';

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
    equipment: ['barbell', 'dumbbells', 'bench', 'rack', 'cables', 'machines'],
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

describe('validación de entrada', () => {
  it('rechaza un perfil sin peso', () => {
    expect(() => generatePlan(profile({ weightKg: 0 }))).toThrow(InvalidProfileError);
  });

  it('rechaza un perfil sin fecha de nacimiento', () => {
    expect(() => generatePlan(profile({ birthDate: '' }))).toThrow(InvalidProfileError);
  });
});

describe('la seguridad manda sobre la generación', () => {
  it('no genera plan para un menor de edad', () => {
    const teen = profile({ birthDate: '2012-01-01' });
    const result = generatePlan(teen, new Date('2026-09-24'));
    expect(result.status).toBe('blocked');
    if (result.status === 'blocked') {
      expect(result.safety.findings.some((f) => f.code === 'UNDER_18')).toBe(true);
    }
  });

  it('no genera plan con embarazo declarado', () => {
    const p = profile({
      screening: {
        pregnantOrBreastfeeding: true,
        eatingDisorderCurrent: false,
        majorInjury: false,
        medicalNutritionTherapy: false,
        exerciseContraindicated: false,
      },
    });
    const result = generatePlan(p);
    expect(result.status).toBe('blocked');
  });

  it('no genera plan con trastorno alimentario declarado', () => {
    const p = profile({
      screening: {
        pregnantOrBreastfeeding: false,
        eatingDisorderCurrent: true,
        majorInjury: false,
        medicalNutritionTherapy: false,
        exerciseContraindicated: false,
      },
    });
    expect(generatePlan(p).status).toBe('blocked');
  });
});

describe('plan generado', () => {
  it('devuelve 12 semanas y un resumen coherente', () => {
    const result = generatePlan(profile());
    expect(result.status).toBe('generated');
    if (result.status !== 'generated') return;

    const { plan } = result;
    expect(plan.program.weeks).toHaveLength(12);
    expect(plan.summary.weeks).toBe(12);
    expect(plan.summary.sessionsPerWeek).toBe(4);
    expect(plan.summary.targetKcal).toBe(plan.targets.kcal);
    expect(plan.summary.proteinG).toBe(plan.targets.proteinG);
    expect(plan.summary.stepTarget).toBeGreaterThan(0);
  });

  it('parte de un objetivo de pasos acorde al nivel de actividad', () => {
    const sedentary = generatePlan(profile({ activityLevel: 'sedentary' }));
    const active = generatePlan(profile({ activityLevel: 'high' }));
    if (sedentary.status !== 'generated' || active.status !== 'generated') {
      throw new Error('ambos planes deberían generarse');
    }
    expect(sedentary.plan.summary.stepTarget).toBeLessThan(active.plan.summary.stepTarget);
    // A alguien sedentario no se le mandan 10.000 pasos de golpe.
    expect(sedentary.plan.summary.stepTarget).toBeLessThanOrEqual(6000);
  });

  it('marca cuando el suelo de energía ha recortado el objetivo', () => {
    const tiny = profile({ sex: 'female', weightKg: 48, heightCm: 155, goal: 'lose_fat' });
    const result = generatePlan(tiny);
    if (result.status !== 'generated') return;
    expect(result.plan.targets.kcal).toBeGreaterThanOrEqual(1200);
  });

  it('es idempotente: mismo perfil, mismo plan', () => {
    const p = profile();
    const a = generatePlan(p);
    const b = generatePlan(p);
    expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
    expect(planKey(p)).toEqual(planKey(p));
  });

  it('la clave del plan cambia si cambia algo que afecta al plan', () => {
    expect(planKey(profile())).not.toEqual(planKey(profile({ daysPerWeek: 6 })));
    expect(planKey(profile())).not.toEqual(planKey(profile({ goal: 'gain_muscle' })));
    // El nombre no afecta al plan, así que no debe cambiar la clave.
    expect(planKey(profile())).toEqual(planKey(profile({ displayName: 'Otro' })));
  });

  it('en casa sin equipo, ningún ejercicio del plan exige material', () => {
    const home = profile({ location: 'home', equipment: [], daysPerWeek: 3 });
    const result = generatePlan(home);
    if (result.status !== 'generated') throw new Error('debería generarse');

    const slugs = result.plan.program.weeks.flatMap((w) =>
      w.workouts.flatMap((k) => k.exercises.map((e) => e.exerciseSlug)),
    );
    expect(slugs.length).toBeGreaterThan(0);

    const { getExercise } = require('@/domain/training/exerciseLibrary');
    const needsKit = slugs.filter((slug: string) => {
      const ex = getExercise(slug);
      return ex && ex.equipment.some((q: string) => q !== 'none');
    });
    expect(needsKit).toEqual([]);
  });
});
