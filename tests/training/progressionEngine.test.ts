import type { LoadTarget } from '@/domain/training/progressionEngine';
import {
  DELOAD_LOAD_FACTOR,
  E1RM_DISCLAIMER_KEY,
  E1RM_METHOD,
  LOWER_INCREMENT_KG,
  UPPER_INCREMENT_KG,
  bestE1RM,
  detectPRs,
  estimateE1RM,
  hitTopOfRange,
  incrementForExercise,
  isE1RMReliable,
  isLowerBody,
  loadVolume,
  missedTarget,
  suggestNextLoad,
  topWeight,
} from '@/domain/training/progressionEngine';

import { makeLog, makeSession, makeSet } from './factories';

const squatTarget: LoadTarget = {
  exerciseSlug: 'barbell-back-squat',
  sets: 3,
  repMin: 6,
  repMax: 10,
  targetRir: 2,
};

const benchTarget: LoadTarget = {
  exerciseSlug: 'barbell-bench-press',
  sets: 3,
  repMin: 6,
  repMax: 10,
  targetRir: 2,
};

describe('lectura de registros', () => {
  it('calcula carga máxima y volumen de un registro', () => {
    const log = makeLog('barbell-back-squat', 3, 60, 8);
    expect(topWeight(log)).toBe(60);
    expect(loadVolume(log)).toBe(60 * 8 * 3);
  });

  it('ignora las series no completadas', () => {
    const log = {
      exerciseSlug: 'barbell-back-squat',
      sets: [makeSet(0, 60, 8), makeSet(1, 80, 2, 0, false)],
    };
    expect(topWeight(log)).toBe(60);
    expect(loadVolume(log)).toBe(480);
  });

  it('detecta tope de rango y sesiones fallidas', () => {
    expect(hitTopOfRange(makeLog('barbell-back-squat', 3, 60, 10, 2), squatTarget)).toBe(true);
    expect(hitTopOfRange(makeLog('barbell-back-squat', 3, 60, 10, 4), squatTarget)).toBe(false);
    expect(hitTopOfRange(makeLog('barbell-back-squat', 2, 60, 10, 1), squatTarget)).toBe(false);
    expect(missedTarget(makeLog('barbell-back-squat', 3, 60, 4, 0), squatTarget)).toBe(true);
    expect(missedTarget(makeLog('barbell-back-squat', 3, 60, 8, 2), squatTarget)).toBe(false);
  });
});

describe('incrementos de carga', () => {
  it('distingue tren superior de tren inferior', () => {
    expect(isLowerBody('barbell-back-squat')).toBe(true);
    expect(isLowerBody('barbell-bench-press')).toBe(false);
    expect(incrementForExercise('barbell-back-squat')).toBe(LOWER_INCREMENT_KG);
    expect(incrementForExercise('barbell-bench-press')).toBe(UPPER_INCREMENT_KG);
    expect(LOWER_INCREMENT_KG).toBeGreaterThan(UPPER_INCREMENT_KG);
  });
});

describe('doble progresión', () => {
  it('sugiere subir carga tras completar el rango alto con el RIR previsto', () => {
    const history = [makeLog('barbell-back-squat', 3, 60, 10, 2)];
    const s = suggestNextLoad(history, squatTarget);
    expect(s.action).toBe('increase_load');
    expect(s.currentWeightKg).toBe(60);
    expect(s.suggestedWeightKg).toBe(62.5);
    expect(s.incrementKg).toBe(LOWER_INCREMENT_KG);
    expect(s.reasonKey).toBe('progression.reason.top_of_range_increase');
  });

  it('usa un incremento menor en tren superior', () => {
    const s = suggestNextLoad([makeLog('barbell-bench-press', 3, 50, 10, 1)], benchTarget);
    expect(s.action).toBe('increase_load');
    expect(s.suggestedWeightKg).toBe(51.5);
  });

  it('NUNCA aplica la subida sola: siempre exige confirmación', () => {
    const acciones = [
      suggestNextLoad([makeLog('barbell-back-squat', 3, 60, 10, 2)], squatTarget),
      suggestNextLoad([makeLog('barbell-back-squat', 3, 60, 8, 2)], squatTarget),
      suggestNextLoad([], squatTarget),
    ];
    acciones.forEach((s) => expect(s.requiresConfirmation).toBe(true));
  });

  it('primero sube repeticiones y no toca la carga a mitad de rango', () => {
    const s = suggestNextLoad([makeLog('barbell-back-squat', 3, 60, 8, 2)], squatTarget);
    expect(s.action).toBe('add_reps');
    expect(s.suggestedWeightKg).toBe(60);
    expect(s.currentWeightKg).toBe(60);
  });

  it('no sube si llegó al tope pero sin el margen previsto', () => {
    const s = suggestNextLoad([makeLog('barbell-back-squat', 3, 60, 10, 4)], squatTarget);
    expect(s.action).not.toBe('increase_load');
  });

  it('mantiene la carga tras un solo fallo', () => {
    const s = suggestNextLoad([makeLog('barbell-back-squat', 3, 60, 4, 0)], squatTarget);
    expect(s.action).toBe('hold');
    expect(s.suggestedWeightKg).toBe(60);
  });

  it('baja la carga tras fallar dos sesiones seguidas', () => {
    const history = [
      makeLog('barbell-back-squat', 3, 60, 4, 0),
      makeLog('barbell-back-squat', 3, 60, 3, 0),
    ];
    const s = suggestNextLoad(history, squatTarget);
    expect(s.action).toBe('reduce_load');
    expect(s.suggestedWeightKg).toBe(60 * DELOAD_LOAD_FACTOR);
    expect(s.reasonKey).toBe('progression.reason.repeated_misses_reduce');
  });

  it('sin historial no inventa nada', () => {
    const s = suggestNextLoad([], squatTarget);
    expect(s.action).toBe('insufficient_data');
    expect(s.suggestedWeightKg).toBeNull();
    expect(s.currentWeightKg).toBeNull();
  });

  it('con dolor declarado nunca propone subir', () => {
    const history = [makeLog('barbell-back-squat', 3, 60, 10, 1)];
    const s = suggestNextLoad(history, squatTarget, { painReported: true });
    expect(s.action).toBe('hold');
    expect(s.suggestedWeightKg).toBe(60);
    expect(s.reasonKey).toBe('progression.reason.pain_reported_hold');
  });

  it('solo mira el historial del ejercicio prescrito', () => {
    const history = [makeLog('barbell-bench-press', 3, 80, 10, 1)];
    expect(suggestNextLoad(history, squatTarget).action).toBe('insufficient_data');
  });
});

describe('e1RM estimado', () => {
  it('aplica Epley y se declara como estimación', () => {
    expect(E1RM_METHOD).toBe('epley');
    expect(E1RM_DISCLAIMER_KEY).toBe('progression.e1rm.is_an_estimate');
    expect(estimateE1RM(100, 1)).toBe(100);
    expect(estimateE1RM(100, 10)).toBe(133.3);
    expect(estimateE1RM(60, 5)).toBe(70);
  });

  it('devuelve 0 con entradas sin sentido y avisa del rango fiable', () => {
    expect(estimateE1RM(0, 5)).toBe(0);
    expect(estimateE1RM(100, 0)).toBe(0);
    expect(isE1RMReliable(5)).toBe(true);
    expect(isE1RMReliable(20)).toBe(false);
  });

  it('toma el mejor e1RM del registro', () => {
    expect(bestE1RM(makeLog('barbell-back-squat', 3, 100, 5))).toBe(estimateE1RM(100, 5));
  });
});

describe('detección de récords', () => {
  const previa = makeSession('s1', [makeLog('barbell-back-squat', 3, 60, 8)]);

  it('detecta récord de carga máxima', () => {
    const actual = makeSession('s2', [makeLog('barbell-back-squat', 3, 70, 8)]);
    const prs = detectPRs(actual, [previa]);
    const carga = prs.find((p) => p.type === 'max_load');
    expect(carga).toBeDefined();
    expect(carga?.value).toBe(70);
    expect(carga?.previousValue).toBe(60);
    expect(carga?.isEstimate).toBe(false);
  });

  it('detecta más repeticiones con la misma carga', () => {
    const actual = makeSession('s2', [makeLog('barbell-back-squat', 3, 60, 10)]);
    const prs = detectPRs(actual, [previa]);
    const reps = prs.find((p) => p.type === 'max_reps_at_load');
    expect(reps?.value).toBe(10);
    expect(reps?.previousValue).toBe(8);
    expect(prs.some((p) => p.type === 'max_load')).toBe(false);
  });

  it('detecta récord de volumen y de e1RM marcado como estimación', () => {
    const actual = makeSession('s2', [makeLog('barbell-back-squat', 4, 65, 9)]);
    const prs = detectPRs(actual, [previa]);
    expect(prs.some((p) => p.type === 'session_volume')).toBe(true);
    const e1rm = prs.find((p) => p.type === 'estimated_1rm');
    expect(e1rm?.isEstimate).toBe(true);
    expect(e1rm?.messageParams.disclaimer).toBe(E1RM_DISCLAIMER_KEY);
  });

  it('no celebra récords en la primera sesión de un ejercicio', () => {
    expect(detectPRs(previa, [])).toEqual([]);
  });

  it('no inventa récords si la sesión fue peor', () => {
    const actual = makeSession('s2', [makeLog('barbell-back-squat', 2, 50, 6)]);
    expect(detectPRs(actual, [previa])).toEqual([]);
  });

  it('no se compara consigo misma si la sesión ya está en el historial', () => {
    const actual = makeSession('s2', [makeLog('barbell-back-squat', 3, 70, 8)]);
    expect(detectPRs(actual, [previa, actual]).some((p) => p.type === 'max_load')).toBe(true);
  });
});
