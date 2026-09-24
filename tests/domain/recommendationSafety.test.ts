import { buildNutritionTargets } from '@/domain/nutrition';
import {
  assertPlanIsSafe,
  checkRequestedRate,
  checkTargetsAgainstGuardrails,
} from '@/domain/safety/recommendationSafety';
import { canGenerateAutomatedPlan } from '@/domain/safety/healthScreening';
import { NOW, makeProfile } from './factories';

describe('assertPlanIsSafe', () => {
  it('permite el plan de un adulto sano', () => {
    const profile = makeProfile({ goal: 'lose_fat' });
    const targets = buildNutritionTargets(profile, NOW);
    const result = assertPlanIsSafe(profile, targets, NOW);

    expect(result.verdict).toBe('ALLOW');
    expect(canGenerateAutomatedPlan(result)).toBe(true);
  });

  it('avisa cuando se ha aplicado el suelo energético', () => {
    const profile = makeProfile({
      sex: 'female',
      weightKg: 50,
      heightCm: 155,
      goal: 'lose_fat',
    });
    const targets = buildNutritionTargets(profile, NOW);
    const result = assertPlanIsSafe(profile, targets, NOW);

    expect(targets.rationale.floorApplied).toBe(true);
    expect(result.verdict).toBe('ALLOW_WITH_CAUTION');
    expect(result.findings.map((f) => f.code)).toContain('ENERGY_FLOOR_APPLIED');
    expect(
      result.findings.find((f) => f.code === 'ENERGY_FLOOR_APPLIED')?.messageKey,
    ).toBe('safety.energyFloor');
    // El suelo avisa, pero no bloquea: el plan sigue con el número seguro.
    expect(canGenerateAutomatedPlan(result)).toBe(true);
  });

  it('bloquea el plan de un menor aunque los objetivos sean correctos', () => {
    const profile = makeProfile({ birthDate: '2012-05-10', weightKg: 55, heightCm: 165 });
    const targets = buildNutritionTargets(profile, NOW);
    const result = assertPlanIsSafe(profile, targets, NOW);

    expect(result.verdict).toBe('BLOCK_AUTOMATED_PLAN');
    expect(canGenerateAutomatedPlan(result)).toBe(false);
  });

  it('exige revisión profesional con embarazo declarado', () => {
    const profile = makeProfile({
      sex: 'female',
      goal: 'lose_fat',
      screening: { ...makeProfile().screening, pregnantOrBreastfeeding: true },
    });
    const targets = buildNutritionTargets(profile, NOW);
    const result = assertPlanIsSafe(profile, targets, NOW);

    expect(result.verdict).toBe('REQUIRES_PROFESSIONAL_REVIEW');
    expect(canGenerateAutomatedPlan(result)).toBe(false);
  });
});

describe('checkTargetsAgainstGuardrails', () => {
  it('marca como agresivos unos objetivos manipulados', () => {
    const profile = makeProfile();
    const targets = buildNutritionTargets(profile, NOW);
    const tampered = { ...targets, kcal: 900 };

    const result = checkTargetsAgainstGuardrails(tampered);
    expect(result.verdict).toBe('REQUIRES_PROFESSIONAL_REVIEW');
    expect(result.findings.map((f) => f.code)).toContain('AGGRESSIVE_RATE_REQUESTED');
  });
});

describe('checkRequestedRate', () => {
  it('acepta un ritmo razonable', () => {
    const result = checkRequestedRate(makeProfile(), -0.6);
    expect(result.verdict).toBe('ALLOW');
    expect(result.findings).toHaveLength(0);
  });

  it('avisa si el ritmo pedido pasa del 1% del peso corporal', () => {
    const result = checkRequestedRate(makeProfile({ weightKg: 80 }), -1.5);
    expect(result.verdict).toBe('ALLOW_WITH_CAUTION');
    expect(result.findings[0].code).toBe('AGGRESSIVE_RATE_REQUESTED');
    expect(result.findings[0].messageKey).toBe('safety.aggressiveRate');
  });
});
