import {
  ACTIVITY_MULTIPLIERS,
  adjustmentKcal,
  calculateBmr,
  calculateTdee,
  estimateEnergyNeeds,
  formatEstimate,
} from '@/domain/nutrition/nutritionCalculator';
import { ABSOLUTE_KCAL_FLOOR } from '@/domain/safety/nutritionGuardrails';
import { NOW, makeProfile } from './factories';

describe('calculateBmr (Mifflin-St Jeor)', () => {
  it('calcula el BMR de un hombre', () => {
    // 10*80 + 6.25*180 - 5*30 + 5 = 1780
    const profile = makeProfile();
    expect(calculateBmr(profile, NOW)).toBe(1780);
  });

  it('calcula el BMR de una mujer', () => {
    // 10*60 + 6.25*165 - 5*30 - 161 = 1320.25 -> 1320
    const profile = makeProfile({ sex: 'female', weightKg: 60, heightCm: 165 });
    expect(calculateBmr(profile, NOW)).toBe(1320);
  });

  it("para sex 'unspecified' devuelve la media de las dos fórmulas", () => {
    const base = { weightKg: 70, heightCm: 172 };
    const male = calculateBmr(makeProfile({ ...base, sex: 'male' }), NOW);
    const female = calculateBmr(makeProfile({ ...base, sex: 'female' }), NOW);
    const unspecified = calculateBmr(makeProfile({ ...base, sex: 'unspecified' }), NOW);

    expect(unspecified).toBe(Math.round((male + female) / 2));
  });
});

describe('calculateTdee', () => {
  it('aplica el multiplicador de actividad', () => {
    const profile = makeProfile({ activityLevel: 'sedentary' });
    expect(calculateTdee(profile, NOW)).toBe(Math.round(1780 * ACTIVITY_MULTIPLIERS.sedentary));
  });

  it('sube con la actividad', () => {
    const sedentary = calculateTdee(makeProfile({ activityLevel: 'sedentary' }), NOW);
    const veryHigh = calculateTdee(makeProfile({ activityLevel: 'very_high' }), NOW);
    expect(veryHigh).toBeGreaterThan(sedentary);
  });
});

describe('estimateEnergyNeeds', () => {
  it('principiante sedentario en mantenimiento: objetivo = TDEE', () => {
    const profile = makeProfile({ goal: 'maintain', experience: 'beginner' });
    const estimate = estimateEnergyNeeds(profile, NOW);

    expect(estimate.bmrKcal).toBe(1780);
    expect(estimate.tdeeKcal).toBe(2136);
    expect(estimate.targetKcal).toBe(2136);
    expect(estimate.floorApplied).toBe(false);
  });

  it('avanzado con actividad alta y ganancia de masa: superávit contenido', () => {
    const profile = makeProfile({
      experience: 'advanced',
      activityLevel: 'high',
      goal: 'gain_muscle',
      weightKg: 85,
      heightCm: 183,
    });
    const estimate = estimateEnergyNeeds(profile, NOW);

    expect(estimate.targetKcal).toBeGreaterThan(estimate.tdeeKcal);
    // Nunca más de 500 kcal ni más del 15% por encima del TDEE.
    expect(estimate.targetKcal - estimate.tdeeKcal).toBeLessThanOrEqual(500);
    expect(estimate.targetKcal).toBeLessThanOrEqual(estimate.tdeeKcal * 1.15 + 1);
    expect(estimate.floorApplied).toBe(false);
  });

  it('pérdida de grasa aplica un déficit dentro de los límites', () => {
    const profile = makeProfile({ goal: 'lose_fat' });
    const estimate = estimateEnergyNeeds(profile, NOW);

    expect(estimate.targetKcal).toBeLessThan(estimate.tdeeKcal);
    expect(estimate.tdeeKcal - estimate.targetKcal).toBeLessThanOrEqual(750);
    expect(adjustmentKcal(estimate)).toBeLessThan(0);
  });

  it('aplica el suelo cuando el objetivo bajaría de las kcal mínimas', () => {
    // Mujer pequeña y sedentaria: el -20% cae por debajo del suelo de 1200.
    const profile = makeProfile({
      sex: 'female',
      weightKg: 50,
      heightCm: 155,
      goal: 'lose_fat',
      activityLevel: 'sedentary',
    });
    const estimate = estimateEnergyNeeds(profile, NOW);

    expect(estimate.floorApplied).toBe(true);
    expect(estimate.targetKcal).toBe(ABSOLUTE_KCAL_FLOOR.female);
    expect(estimate.targetKcal).toBeGreaterThanOrEqual(ABSOLUTE_KCAL_FLOOR.female);
  });

  it('el objetivo nunca baja del suelo del sexo declarado', () => {
    const sexes = ['male', 'female', 'unspecified'] as const;
    for (const sex of sexes) {
      const profile = makeProfile({ sex, weightKg: 45, heightCm: 150, goal: 'lose_fat' });
      const estimate = estimateEnergyNeeds(profile, NOW);
      expect(estimate.targetKcal).toBeGreaterThanOrEqual(ABSOLUTE_KCAL_FLOOR[sex]);
    }
  });
});

describe('formatEstimate', () => {
  it('redondea a la decena más cercana', () => {
    expect(formatEstimate(2314)).toBe(2310);
    expect(formatEstimate(2316)).toBe(2320);
    expect(formatEstimate(2300)).toBe(2300);
  });

  it('no rompe con entradas inválidas', () => {
    expect(formatEstimate(Number.NaN)).toBe(0);
  });
});
