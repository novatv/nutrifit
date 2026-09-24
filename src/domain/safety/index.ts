/** Punto de entrada del motor de seguridad. */

export * from '@/domain/safety/healthScreening';
export * from '@/domain/safety/nutritionGuardrails';
export * from '@/domain/safety/trainingGuardrails';
export {
  assertPlanIsSafe,
  checkRequestedRate,
  checkTargetsAgainstGuardrails,
} from '@/domain/safety/recommendationSafety';
