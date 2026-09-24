/**
 * Puerta única de seguridad: TODA generación de plan pasa por aquí.
 *
 * Combina el cribado del perfil con los guardarraíles de nutrición y devuelve
 * un único SafetyResult. Si esto no dice ALLOW o ALLOW_WITH_CAUTION, no se
 * genera nada automático.
 */

import type { NutritionTargets, SafetyFinding, SafetyResult, UserProfile } from '@/types/domain';
import {
  canGenerateAutomatedPlan,
  mergeSafetyResults,
  runSafetyScreening,
  worstVerdict,
} from '@/domain/safety/healthScreening';
import {
  isDeficitTooAggressive,
  isWeeklyRateSafe,
  maxWeeklyChangeKg,
} from '@/domain/safety/nutritionGuardrails';

export { canGenerateAutomatedPlan, maxWeeklyChangeKg };

/**
 * Revisa unos objetivos ya calculados contra los guardarraíles energéticos.
 * No mira el perfil médico: de eso se encarga el cribado.
 */
export function checkTargetsAgainstGuardrails(targets: NutritionTargets): SafetyResult {
  const findings: SafetyFinding[] = [];
  const { tdeeKcal, floorApplied } = targets.rationale;

  if (floorApplied) {
    findings.push({
      code: 'ENERGY_FLOOR_APPLIED',
      verdict: 'ALLOW_WITH_CAUTION',
      messageKey: 'safety.energyFloor',
    });
  }

  // El déficit final nunca debería superar el máximo: si pasa, es un bug y
  // se trata como hallazgo de seguridad en vez de dejarlo colar.
  if (isDeficitTooAggressive(tdeeKcal, targets.kcal)) {
    findings.push({
      code: 'AGGRESSIVE_RATE_REQUESTED',
      verdict: 'REQUIRES_PROFESSIONAL_REVIEW',
      messageKey: 'safety.aggressiveRate',
    });
  }

  return { verdict: worstVerdict(findings), findings };
}

/**
 * Revisa el ritmo de cambio de peso que la persona pide (kg por semana)
 * contra el máximo seguro según su peso corporal.
 */
export function checkRequestedRate(
  profile: UserProfile,
  desiredWeeklyChangeKg: number,
): SafetyResult {
  const findings: SafetyFinding[] = [];
  const direction = desiredWeeklyChangeKg < 0 ? 'loss' : 'gain';

  if (
    desiredWeeklyChangeKg !== 0 &&
    !isWeeklyRateSafe(desiredWeeklyChangeKg, profile.weightKg, direction)
  ) {
    findings.push({
      code: 'AGGRESSIVE_RATE_REQUESTED',
      verdict: 'ALLOW_WITH_CAUTION',
      messageKey: 'safety.aggressiveRate',
    });
  }

  return { verdict: worstVerdict(findings), findings };
}

/**
 * Comprobación final antes de entregar un plan.
 *
 * Devuelve siempre un SafetyResult; no lanza excepciones. Quien llame debe
 * usar `canGenerateAutomatedPlan` para decidir si sigue.
 *
 * Recordatorio: los objetivos son ESTIMACIONES. La app no diagnostica ni
 * garantiza resultados, y no premia saltarse comidas.
 */
export function assertPlanIsSafe(
  profile: UserProfile,
  targets: NutritionTargets,
  now: Date = new Date(),
): SafetyResult {
  return mergeSafetyResults(
    runSafetyScreening(profile, now),
    checkTargetsAgainstGuardrails(targets),
  );
}
