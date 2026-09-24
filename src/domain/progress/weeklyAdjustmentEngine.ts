/**
 * Motor de ajuste semanal. Es el corazón de la parte "adaptativa".
 *
 * Dos principios que mandan sobre todo lo demás:
 *
 * 1. **Nunca se ajusta por un dato suelto.** Un peso puntual sube o baja por
 *    sal, agua, fibra o el ciclo menstrual. Solo se toca el plan cuando hay
 *    tendencia sobre varias semanas Y adherencia suficiente para que esa
 *    tendencia signifique algo.
 * 2. **Nunca se cambian los objetivos en silencio.** Toda modificación sale
 *    con antes, después, razón, y exige confirmación del usuario.
 */

import {
  MAX_WEEKLY_GAIN_PCT_BODYWEIGHT,
  MAX_WEEKLY_LOSS_PCT_BODYWEIGHT,
  applyEnergyFloor,
} from '@/domain/safety/nutritionGuardrails';
import { adherence, averageAdherence, weightTrend, type WeightPoint } from '@/utils/trends';
import type {
  AdjustmentDecision,
  NutritionTargets,
  PlanAdjustment,
  UserProfile,
  WeeklyCheckin,
  WorkoutSession,
} from '@/types/domain';

/* ------------------------------------------------------------- constantes */

/** Semanas de historial mínimas para fiarse de una tendencia de peso. */
export const MIN_WEEKS_FOR_TREND = 2;

/** Por debajo de esta adherencia, el problema no son los números del plan. */
export const MIN_ADHERENCE_TO_ADJUST = 0.8;

/** Cambio de calorías por ajuste, como fracción del objetivo actual. */
export const ADJUSTMENT_STEP_PCT = 0.05;

/** Umbral para considerar que la tendencia está plana, en % del peso/semana. */
export const STALL_THRESHOLD_PCT = 0.002; // 0,2% semanal

/** A partir de aquí, las sesiones se perciben demasiado duras de forma sostenida. */
export const HIGH_DIFFICULTY = 4;

/** Energía o sueño por debajo de esto, sostenido, pide recuperación. */
export const LOW_RECOVERY = 2;

/* ------------------------------------------------------------- entradas */

export interface WeeklyData {
  profile: UserProfile;
  currentTargets: NutritionTargets;
  /** Check-ins ordenados de más antiguo a más reciente. */
  checkins: WeeklyCheckin[];
  /** Pesos registrados, en cualquier orden. */
  weights: WeightPoint[];
  /** Sesiones de la semana que se está cerrando. */
  sessions: WorkoutSession[];
}

export interface WeeklyAnalysis {
  adherenceNutrition: number;
  adherenceTraining: number;
  trendKgPerWeek: number;
  trendReliable: boolean;
  /** Ritmo observado como fracción del peso corporal por semana. */
  ratePctBodyweight: number;
  sessionsTooHard: number;
  painReported: boolean;
  lowRecovery: boolean;
}

/* ------------------------------------------------------------ 1. recogida */

export function collectWeeklyData(data: WeeklyData): WeeklyAnalysis {
  const recent = data.checkins.slice(-4);
  const last = recent[recent.length - 1];

  const adherenceNutrition = averageAdherence(recent.map((c) => c.nutritionAdherence));
  const adherenceTraining = last
    ? adherence(last.workoutsCompleted, last.workoutsPlanned)
    : 0;

  const trend = weightTrend(data.weights);
  const weight = last?.weightKg ?? data.profile.weightKg;
  const ratePctBodyweight = weight > 0 ? trend.kgPerWeek / weight : 0;

  const sessionsTooHard = data.sessions.filter(
    (s) => s.perceivedDifficulty === 'too_hard',
  ).length;
  const painReported = data.sessions.some((s) => s.painReported === true);

  const lowRecovery = recent.length > 0 &&
    recent.slice(-2).every((c) => c.energy <= LOW_RECOVERY || c.sleep <= LOW_RECOVERY);

  return {
    adherenceNutrition,
    adherenceTraining,
    trendKgPerWeek: trend.kgPerWeek,
    trendReliable: trend.reliable && recent.length >= MIN_WEEKS_FOR_TREND,
    ratePctBodyweight,
    sessionsTooHard,
    painReported,
    lowRecovery,
  };
}

/* ------------------------------------------------------- 2. reglas duras */

/**
 * Situaciones en las que no se toca el plan por números, porque hay algo más
 * importante delante. Se evalúan antes que cualquier otra regla.
 */
function runSafetyRules(a: WeeklyAnalysis): AdjustmentDecision | null {
  // Dolor reportado: nunca se sube nada, y conviene que lo miren.
  if (a.painReported) return 'NEEDS_REVIEW';

  // Fatiga sostenida o demasiadas sesiones al límite: toca recuperar.
  if (a.lowRecovery || a.sessionsTooHard >= 2) return 'RECOVERY_WEEK';

  return null;
}

/* ------------------------------------------------- 3. decisión y explicación */

interface Decision {
  decision: AdjustmentDecision;
  explanationKey: string;
  kcalDelta: number;
}

function decide(a: WeeklyAnalysis, profile: UserProfile): Decision {
  const safety = runSafetyRules(a);
  if (safety) {
    return {
      decision: safety,
      explanationKey:
        safety === 'RECOVERY_WEEK'
          ? 'checkin.explain.fatigueHigh'
          : 'workout.painFollowUp',
      kcalDelta: 0,
    };
  }

  // Sin tendencia fiable todavía: se sigue igual y se dice por qué.
  if (!a.trendReliable) {
    return {
      decision: 'KEEP',
      explanationKey: 'checkin.explain.singleDataPoint',
      kcalDelta: 0,
    };
  }

  // Adherencia baja: el plan no es el problema, así que no se toca.
  if (a.adherenceNutrition < MIN_ADHERENCE_TO_ADJUST) {
    return {
      decision: 'KEEP',
      explanationKey: 'checkin.explain.lowAdherence',
      kcalDelta: 0,
    };
  }

  const losing = profile.goal === 'lose_fat';
  const gaining = profile.goal === 'gain_muscle';
  const rate = a.ratePctBodyweight;

  // Bajando (o subiendo) más rápido de lo recomendable: se frena.
  if (losing && rate < -MAX_WEEKLY_LOSS_PCT_BODYWEIGHT) {
    return {
      decision: 'ADJUST_NUTRITION',
      explanationKey: 'checkin.explain.trendTooFast',
      kcalDelta: +1,
    };
  }
  if (gaining && rate > MAX_WEEKLY_GAIN_PCT_BODYWEIGHT) {
    return {
      decision: 'ADJUST_NUTRITION',
      explanationKey: 'checkin.explain.trendTooFast',
      kcalDelta: -1,
    };
  }

  // Estancado con buena adherencia: ahí sí tiene sentido mover las calorías.
  const stalled = Math.abs(rate) < STALL_THRESHOLD_PCT;
  if (stalled && losing) {
    return {
      decision: 'ADJUST_NUTRITION',
      explanationKey: 'checkin.explain.trendStalled',
      kcalDelta: -1,
    };
  }
  if (stalled && gaining) {
    return {
      decision: 'ADJUST_NUTRITION',
      explanationKey: 'checkin.explain.trendStalled',
      kcalDelta: +1,
    };
  }

  // Entrenando poco pero comiendo bien: se ajusta el entrenamiento, no la dieta.
  if (a.adherenceTraining < 0.5) {
    return {
      decision: 'ADJUST_TRAINING',
      explanationKey: 'checkin.explain.lowAdherence',
      kcalDelta: 0,
    };
  }

  return {
    decision: 'KEEP',
    explanationKey: 'checkin.explain.keepOnTrack',
    kcalDelta: 0,
  };
}

/* ----------------------------------------------------- 4. salida completa */

/**
 * Ejecuta el análisis y devuelve el ajuste propuesto.
 *
 * Nunca aplica nada: devuelve el antes y el después para que la interfaz lo
 * enseñe y el usuario confirme.
 */
export function determineWeeklyAdjustment(data: WeeklyData): PlanAdjustment {
  const analysis = collectWeeklyData(data);
  const { decision, explanationKey, kcalDelta } = decide(analysis, data.profile);

  if (decision !== 'ADJUST_NUTRITION' || kcalDelta === 0) {
    return {
      decision,
      explanationKey,
      requiresConfirmation: decision === 'RECOVERY_WEEK' || decision === 'ADJUST_TRAINING',
    };
  }

  const current = data.currentTargets;
  const step = Math.round(current.kcal * ADJUSTMENT_STEP_PCT);
  const desired = current.kcal + kcalDelta * step;

  // El suelo de seguridad manda también sobre los ajustes, no solo sobre el
  // plan inicial: un ajuste no puede colarse por debajo.
  const { kcal, floorApplied } = applyEnergyFloor(
    current.rationale.tdeeKcal,
    desired,
    data.profile,
  );

  return {
    decision: 'ADJUST_NUTRITION',
    explanationKey: floorApplied ? 'safety.energyFloor' : explanationKey,
    explanationParams: { before: current.kcal, after: kcal },
    before: { kcal: current.kcal },
    after: { kcal },
    requiresConfirmation: true,
  };
}

/** Aplica un ajuste ya confirmado por el usuario. */
export function applyAdjustment(
  targets: NutritionTargets,
  adjustment: PlanAdjustment,
): NutritionTargets {
  if (adjustment.decision !== 'ADJUST_NUTRITION' || adjustment.after?.kcal === undefined) {
    return targets;
  }
  const kcal = adjustment.after.kcal;
  const ratio = targets.kcal > 0 ? kcal / targets.kcal : 1;

  // La proteína se mantiene: es lo último que conviene recortar en déficit.
  return {
    ...targets,
    kcal,
    carbsG: Math.round(targets.carbsG * ratio),
    fatG: Math.round(targets.fatG * ratio),
    rationale: {
      ...targets.rationale,
      adjustmentKcal: kcal - targets.rationale.tdeeKcal,
    },
  };
}
