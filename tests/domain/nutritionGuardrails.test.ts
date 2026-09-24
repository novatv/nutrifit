import {
  ABSOLUTE_KCAL_FLOOR,
  MAX_DEFICIT_KCAL,
  MAX_DEFICIT_PCT_OF_TDEE,
  MAX_WEEKLY_LOSS_PCT_BODYWEIGHT,
  applyEnergyCeiling,
  applyEnergyFloor,
  deficitFractionOfTdee,
  energyFloorFor,
  isDeficitTooAggressive,
  isWeeklyRateSafe,
  maxWeeklyChangeKg,
} from '@/domain/safety/nutritionGuardrails';
import { makeProfile } from './factories';

describe('energyFloorFor', () => {
  it('manda el suelo absoluto del sexo cuando el TDEE es bajo', () => {
    const profile = makeProfile({ sex: 'female' });
    // TDEE 1300: 25% -> 975, absoluto -> 550; gana el suelo de 1200.
    expect(energyFloorFor(1300, profile)).toBe(ABSOLUTE_KCAL_FLOOR.female);
  });

  it('manda el % del TDEE cuando el TDEE es alto', () => {
    const profile = makeProfile({ sex: 'male' });
    // TDEE 2400: 25% -> 1800, absoluto -> 1650, sexo -> 1500.
    expect(energyFloorFor(2400, profile)).toBe(2400 * (1 - MAX_DEFICIT_PCT_OF_TDEE));
  });

  it('manda el déficit absoluto en TDEE muy altos', () => {
    const profile = makeProfile({ sex: 'male' });
    // TDEE 4000: 25% -> 3000, absoluto -> 3250. Gana 3250.
    expect(energyFloorFor(4000, profile)).toBe(4000 - MAX_DEFICIT_KCAL);
  });
});

describe('applyEnergyFloor', () => {
  it('no toca un objetivo que ya es seguro', () => {
    const profile = makeProfile();
    const result = applyEnergyFloor(2400, 2000, profile);
    expect(result).toEqual({ kcal: 2000, floorApplied: false });
  });

  it('devuelve el suelo y marca floorApplied ante un objetivo agresivo', () => {
    const profile = makeProfile();
    // El usuario quiere 900 kcal: no se le da, se le devuelve el suelo.
    const result = applyEnergyFloor(2400, 900, profile);

    expect(result.floorApplied).toBe(true);
    expect(result.kcal).toBe(1800);
    expect(result.kcal).toBeGreaterThanOrEqual(ABSOLUTE_KCAL_FLOOR.male);
  });

  it('nunca devuelve por debajo del suelo del sexo, ni pidiendo 0', () => {
    const sexes = ['male', 'female', 'unspecified'] as const;
    for (const sex of sexes) {
      const result = applyEnergyFloor(1400, 0, makeProfile({ sex }));
      expect(result.floorApplied).toBe(true);
      expect(result.kcal).toBeGreaterThanOrEqual(ABSOLUTE_KCAL_FLOOR[sex]);
    }
  });
});

describe('applyEnergyCeiling', () => {
  it('recorta superávits desproporcionados', () => {
    const result = applyEnergyCeiling(2500, 4000);
    expect(result.floorApplied).toBe(true);
    expect(result.kcal).toBe(2875); // min(2500*1.15, 2500+500)
  });

  it('deja pasar un superávit razonable', () => {
    expect(applyEnergyCeiling(2500, 2700)).toEqual({ kcal: 2700, floorApplied: false });
  });
});

describe('ritmo de cambio de peso', () => {
  it('el máximo semanal es un % del peso corporal', () => {
    expect(maxWeeklyChangeKg(80, 'loss')).toBe(80 * MAX_WEEKLY_LOSS_PCT_BODYWEIGHT);
    expect(maxWeeklyChangeKg(80, 'gain')).toBe(0.4);
  });

  it('acepta un ritmo dentro del límite y rechaza uno agresivo', () => {
    expect(isWeeklyRateSafe(-0.7, 80, 'loss')).toBe(true);
    expect(isWeeklyRateSafe(-1.5, 80, 'loss')).toBe(false);
    expect(isWeeklyRateSafe(0.3, 80, 'gain')).toBe(true);
    expect(isWeeklyRateSafe(1, 80, 'gain')).toBe(false);
  });

  it('con peso 0 no hay ritmo seguro y no divide entre cero', () => {
    expect(isWeeklyRateSafe(0.5, 0, 'loss')).toBe(false);
  });
});

describe('déficit', () => {
  it('calcula la fracción de déficit sin dividir entre cero', () => {
    expect(deficitFractionOfTdee(2000, 1600)).toBeCloseTo(0.2, 5);
    expect(deficitFractionOfTdee(0, 1600)).toBe(0);
  });

  it('detecta déficits demasiado agresivos', () => {
    expect(isDeficitTooAggressive(2400, 1800)).toBe(false); // 25% justo
    expect(isDeficitTooAggressive(2400, 1400)).toBe(true);  // 41%
    expect(isDeficitTooAggressive(4000, 3100)).toBe(true);  // 900 kcal absolutas
  });
});
