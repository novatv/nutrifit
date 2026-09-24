/**
 * Pipeline de generación del plan.
 *
 * Es el único sitio donde se orquesta todo: seguridad, energía, macros,
 * entrenamiento y comidas. Los motores de `nutrition/`, `training/` y
 * `safety/` no se llaman entre ellos; se coordinan aquí.
 *
 * Dos garantías:
 *
 * - **La seguridad va primero.** Si el cribado bloquea, no se genera nada:
 *   se devuelve el motivo para que la interfaz muestre la pantalla segura.
 * - **Es idempotente.** Con el mismo perfil sale exactamente el mismo plan,
 *   así que repetir la petición no duplica nada ni cambia los números.
 */

import { buildNutritionTargets } from '@/domain/nutrition';
import { assertPlanIsSafe } from '@/domain/safety';
import { determineTrainingSplit, generate12WeekProgram } from '@/domain/training';
import { logger } from '@/services/logger';
import type {
  NutritionTargets,
  SafetyResult,
  TrainingProgram,
  UserProfile,
} from '@/types/domain';

/* ------------------------------------------------------------- resultados */

export interface PlanSummary {
  weeks: number;
  sessionsPerWeek: number;
  targetKcal: number;
  proteinG: number;
  stepTarget: number;
  split: TrainingProgram['split'];
  /** true si un suelo de seguridad recortó el objetivo pedido. */
  energyFloorApplied: boolean;
}

export interface GeneratedPlan {
  profileId: string;
  targets: NutritionTargets;
  program: TrainingProgram;
  summary: PlanSummary;
  safety: SafetyResult;
}

export type PlanResult =
  | { status: 'generated'; plan: GeneratedPlan }
  | { status: 'blocked'; safety: SafetyResult };

/* ----------------------------------------------------- 1. validar perfil */

export class InvalidProfileError extends Error {
  constructor(public readonly field: string) {
    super(`Perfil inválido: falta o es incorrecto "${field}"`);
    this.name = 'InvalidProfileError';
  }
}

function validateProfile(profile: UserProfile): void {
  if (!profile.id) throw new InvalidProfileError('id');
  if (!profile.birthDate) throw new InvalidProfileError('birthDate');
  if (!(profile.heightCm > 0)) throw new InvalidProfileError('heightCm');
  if (!(profile.weightKg > 0)) throw new InvalidProfileError('weightKg');
  if (!profile.daysPerWeek) throw new InvalidProfileError('daysPerWeek');
}

/* -------------------------------------------------- 2. objetivo de pasos */

/**
 * Pasos iniciales. Arranca desde donde está la persona, no desde una cifra
 * redonda: mandar 10.000 pasos a alguien sedentario es la forma más rápida de
 * que abandone en la primera semana.
 */
const STEP_BASELINE: Record<UserProfile['activityLevel'], number> = {
  sedentary: 5000,
  light: 7000,
  moderate: 8500,
  high: 10000,
  very_high: 11000,
};

/* ------------------------------------------------------ pipeline completo */

export function generatePlan(profile: UserProfile, now: Date = new Date()): PlanResult {
  validateProfile(profile);

  // Los objetivos hacen falta para el cribado completo, pero nada se entrega
  // hasta que la seguridad da el visto bueno.
  const targets = buildNutritionTargets(profile, now);
  const safety = assertPlanIsSafe(profile, targets);

  if (safety.verdict === 'BLOCK_AUTOMATED_PLAN' || safety.verdict === 'REQUIRES_PROFESSIONAL_REVIEW') {
    logger.info('Plan no generado por cribado de seguridad', {
      verdict: safety.verdict,
      codes: safety.findings.map((f) => f.code),
    });
    return { status: 'blocked', safety };
  }

  const program = generate12WeekProgram(profile);
  const split = determineTrainingSplit(profile);
  const stepTarget = STEP_BASELINE[profile.activityLevel];

  const summary: PlanSummary = {
    weeks: program.weeks.length,
    sessionsPerWeek: profile.daysPerWeek,
    targetKcal: targets.kcal,
    proteinG: targets.proteinG,
    stepTarget,
    split,
    energyFloorApplied: targets.rationale.floorApplied,
  };

  logger.info('Plan generado', {
    weeks: summary.weeks,
    split,
    floorApplied: summary.energyFloorApplied,
  });

  return {
    status: 'generated',
    plan: { profileId: profile.id, targets, program, summary, safety },
  };
}

/**
 * Clave estable del plan para un perfil. Sirve para no duplicar el plan si la
 * petición se repite: mismo perfil, misma clave, mismo plan.
 */
export function planKey(profile: UserProfile): string {
  return [
    profile.id,
    profile.goal,
    profile.weightKg,
    profile.heightCm,
    profile.daysPerWeek,
    profile.sessionMinutes,
    profile.experience,
    profile.activityLevel,
    [...profile.equipment].sort().join('+'),
  ].join(':');
}
