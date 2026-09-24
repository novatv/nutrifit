import {
  MACRO_RULES,
  calculateMacros,
  fiberTargetG,
  macrosToKcal,
  proteinTargetG,
} from '@/domain/nutrition/macroCalculator';
import { makeProfile } from './factories';

describe('proteinTargetG', () => {
  it('escala con el peso corporal y el objetivo', () => {
    const cutting = proteinTargetG(makeProfile({ goal: 'lose_fat', experience: 'intermediate' }));
    const habits = proteinTargetG(makeProfile({ goal: 'habits', experience: 'intermediate' }));
    expect(cutting).toBeGreaterThan(habits);
    expect(cutting).toBe(Math.round(MACRO_RULES.protein.perKgByGoal.lose_fat * 80));
  });

  it('el avanzado lleva algo más de proteína que el principiante', () => {
    const beginner = proteinTargetG(makeProfile({ experience: 'beginner' }));
    const advanced = proteinTargetG(makeProfile({ experience: 'advanced' }));
    expect(advanced).toBeGreaterThan(beginner);
  });

  it('respeta los límites por kg', () => {
    const profile = makeProfile({ goal: 'recomp', experience: 'advanced', weightKg: 100 });
    const perKg = proteinTargetG(profile) / 100;
    expect(perKg).toBeLessThanOrEqual(MACRO_RULES.protein.maxPerKg);
    expect(perKg).toBeGreaterThanOrEqual(MACRO_RULES.protein.minPerKg);
  });
});

describe('calculateMacros', () => {
  it('principiante sedentario: los macros cuadran con las kcal', () => {
    const profile = makeProfile({ goal: 'maintain', experience: 'beginner' });
    const macros = calculateMacros(profile, 2136);

    expect(macrosToKcal(macros)).toBeGreaterThan(2136 - 25);
    expect(macrosToKcal(macros)).toBeLessThan(2136 + 25);
  });

  it('respeta el mínimo de grasa por kg de peso', () => {
    const profile = makeProfile({ goal: 'lose_fat', weightKg: 90 });
    const macros = calculateMacros(profile, 1900);
    expect(macros.fatG).toBeGreaterThanOrEqual(MACRO_RULES.fat.minPerKg * 90 - 1);
  });

  it('los carbohidratos son el resto y nunca son negativos', () => {
    const profile = makeProfile({ goal: 'lose_fat', weightKg: 110, experience: 'advanced' });
    const macros = calculateMacros(profile, 1600);
    expect(macros.carbsG).toBeGreaterThanOrEqual(0);
    expect(macrosToKcal(macros)).toBeLessThanOrEqual(1600 + 30);
  });

  it('no empuja a cetosis sin que nadie la pida', () => {
    const profile = makeProfile({ goal: 'lose_fat', weightKg: 95, experience: 'advanced' });
    const macros = calculateMacros(profile, 1800);
    expect(macros.carbsG).toBeGreaterThanOrEqual(MACRO_RULES.carbs.minGrams);
  });

  it('el avanzado con superávit tiene más carbohidratos que en déficit', () => {
    const bulking = calculateMacros(
      makeProfile({ goal: 'gain_muscle', experience: 'advanced' }),
      3000,
    );
    const cutting = calculateMacros(
      makeProfile({ goal: 'lose_fat', experience: 'advanced' }),
      1800,
    );
    expect(bulking.carbsG).toBeGreaterThan(cutting.carbsG);
  });

  it('con 0 kcal no produce valores negativos', () => {
    const macros = calculateMacros(makeProfile(), 0);
    expect(macros.carbsG).toBeGreaterThanOrEqual(0);
    expect(macros.fatG).toBeGreaterThanOrEqual(0);
    expect(macros.proteinG).toBeGreaterThanOrEqual(0);
  });
});

describe('fiberTargetG', () => {
  it('escala con las kcal dentro de los límites', () => {
    expect(fiberTargetG(2000)).toBe(28);
    expect(fiberTargetG(1000)).toBe(MACRO_RULES.fiber.minGrams);
    expect(fiberTargetG(6000)).toBe(MACRO_RULES.fiber.maxGrams);
  });
});
