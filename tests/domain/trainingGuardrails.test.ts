import {
  LOAD_PROGRESSION,
  STEP_PROGRESSION,
  WEEKLY_SETS_PER_MUSCLE,
  buildStepProgression,
  canIncreaseLoad,
  capWeeklySets,
  decideLoadProgression,
  findVolumeViolations,
  isWeeklyVolumeSafe,
  nextLoadKg,
  nextStepTarget,
} from '@/domain/safety/trainingGuardrails';

describe('volumen semanal por grupo muscular', () => {
  it('acota las series al máximo de la experiencia', () => {
    expect(capWeeklySets(30, 'beginner')).toBe(WEEKLY_SETS_PER_MUSCLE.beginner.max);
    expect(capWeeklySets(30, 'advanced')).toBe(WEEKLY_SETS_PER_MUSCLE.advanced.max);
    expect(capWeeklySets(10, 'intermediate')).toBe(10);
  });

  it('el principiante tiene un techo menor que el avanzado', () => {
    expect(WEEKLY_SETS_PER_MUSCLE.beginner.max).toBeLessThan(
      WEEKLY_SETS_PER_MUSCLE.advanced.max,
    );
  });

  it('detecta grupos musculares por encima del techo', () => {
    const violations = findVolumeViolations({ chest: 20, back: 10 }, 'beginner');
    expect(violations).toHaveLength(1);
    expect(violations[0].muscle).toBe('chest');
    expect(isWeeklyVolumeSafe({ chest: 20, back: 10 }, 'beginner')).toBe(false);
    expect(isWeeklyVolumeSafe({ chest: 10, back: 10 }, 'beginner')).toBe(true);
  });
});

describe('progresión de pasos', () => {
  it('no salta de sedentario a 12.000 pasos', () => {
    const next = nextStepTarget(4000);
    expect(next).toBeLessThanOrEqual(4000 + STEP_PROGRESSION.maxWeeklyIncreaseSteps);
    expect(next).toBeGreaterThan(4000);
    expect(next).toBeLessThan(12000);
  });

  it('nunca sube más del 10% ni más de 1.000 pasos por semana', () => {
    const plan = buildStepProgression(4000, 6);
    let previous = 4000;
    for (const step of plan) {
      const increase = step - previous;
      expect(increase).toBeLessThanOrEqual(
        Math.min(
          previous * STEP_PROGRESSION.maxWeeklyIncreasePct,
          STEP_PROGRESSION.maxWeeklyIncreaseSteps,
        ) + 100, // margen del redondeo a centenas
      );
      previous = step;
    }
  });

  it('no pasa del objetivo final ni del techo de la app', () => {
    const plan = buildStepProgression(9000, 20, 10000);
    expect(Math.max(...plan)).toBeLessThanOrEqual(10000);
    expect(Math.max(...buildStepProgression(11000, 20))).toBeLessThanOrEqual(
      STEP_PROGRESSION.maxTargetSteps,
    );
  });

  it('arranca en el suelo si no hay historial', () => {
    expect(nextStepTarget(0)).toBe(STEP_PROGRESSION.minTargetSteps);
  });
});

describe('progresión de carga', () => {
  it('REGLA INNEGOCIABLE: el dolor agudo detiene cualquier subida de carga', () => {
    const decision = decideLoadProgression({
      painReported: true,
      perceivedDifficulty: 'very_easy',
      soreness: 1,
      completionRate: 1,
    });

    expect(decision.changePct).toBe(0);
    expect(decision.reasonKey).toBe('training.progression.painReported');
    expect(canIncreaseLoad({ painReported: true, perceivedDifficulty: 'very_easy' })).toBe(false);
    expect(nextLoadKg(60, { painReported: true, perceivedDifficulty: 'very_easy' })).toBe(60);
  });

  it('sube carga tras una sesión fácil y completada', () => {
    const decision = decideLoadProgression({
      perceivedDifficulty: 'very_easy',
      completionRate: 1,
    });
    expect(decision.changePct).toBe(LOAD_PROGRESSION.maxIncreasePct);
    expect(nextLoadKg(60, { perceivedDifficulty: 'very_easy', completionRate: 1 })).toBe(63);
  });

  it('mantiene la carga si la sesión fue dura o incompleta', () => {
    expect(canIncreaseLoad({ perceivedDifficulty: 'hard', completionRate: 1 })).toBe(false);
    expect(canIncreaseLoad({ perceivedDifficulty: 'good', completionRate: 0.5 })).toBe(false);
  });

  it('baja carga tras una sesión demasiado dura o con agujetas máximas', () => {
    expect(decideLoadProgression({ perceivedDifficulty: 'too_hard' }).changePct).toBe(
      LOAD_PROGRESSION.deloadPct,
    );
    expect(decideLoadProgression({ soreness: 5 }).changePct).toBe(LOAD_PROGRESSION.deloadPct);
  });
});
