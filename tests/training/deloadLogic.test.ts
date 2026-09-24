import type { WeeklyCheckin } from '@/types/domain';
import {
  HARD_SESSION_THRESHOLD,
  applyDeloadToWorkout,
  canProposeLoadIncrease,
  isHardSession,
  isLowRecovery,
  shouldDeload,
} from '@/domain/training/deloadLogic';
import { DELOAD_WEEK } from '@/domain/training/programGenerator';
import { buildWorkout } from '@/domain/training/workoutBuilder';

import { FULL_GYM, makeLog, makeSession } from './factories';

const sesion = (id: string, overrides = {}) =>
  makeSession(id, [makeLog('barbell-back-squat', 3, 60, 8)], overrides);

const checkin = (overrides: Partial<WeeklyCheckin> = {}): WeeklyCheckin => ({
  weekNumber: 5,
  date: '2026-02-09',
  nutritionAdherence: 0.8,
  workoutsCompleted: 3,
  workoutsPlanned: 4,
  hunger: 3,
  energy: 3,
  sleep: 3,
  difficulty: 3,
  perceivedProgress: 3,
  ...overrides,
});

describe('detección de sesiones duras', () => {
  it('marca como dura la sesión percibida como excesiva', () => {
    expect(isHardSession(sesion('a', { perceivedDifficulty: 'too_hard' }))).toBe(true);
    expect(isHardSession(sesion('b', { soreness: 5 }))).toBe(true);
    expect(isHardSession(sesion('c', { energy: 1 }))).toBe(true);
    expect(isHardSession(sesion('d', { perceivedDifficulty: 'good' }))).toBe(false);
  });

  it('detecta baja recuperación en el check-in', () => {
    expect(isLowRecovery(checkin({ energy: 1, sleep: 2 }))).toBe(true);
    expect(isLowRecovery(checkin({ energy: 1, sleep: 4 }))).toBe(false);
    expect(isLowRecovery(undefined)).toBe(false);
  });
});

describe('decisión de descarga', () => {
  it('en una semana normal y sin señales no toca descarga', () => {
    const d = shouldDeload({ weekNumber: 3, recentSessions: [sesion('a'), sesion('b')] });
    expect(d.deload).toBe(false);
    expect(d.reasons).toEqual([]);
    expect(d.volumeMultiplier).toBe(1);
    expect(d.allowLoadIncrease).toBe(true);
    expect(d.messageKey).toBe('training.deload.not_needed');
  });

  it('descarga por la semana programada del bloque', () => {
    const d = shouldDeload({ weekNumber: DELOAD_WEEK });
    expect(d.deload).toBe(true);
    expect(d.reasons).toContain('scheduled_week');
    expect(d.volumeMultiplier).toBeLessThan(1);
    expect(d.rirDelta).toBeGreaterThan(0);
    expect(d.allowLoadIncrease).toBe(false);
    expect(d.requiresConfirmation).toBe(true);
  });

  it('descarga por acumulación de sesiones muy duras', () => {
    const duras = Array.from({ length: HARD_SESSION_THRESHOLD }, (_, i) =>
      sesion(`dura-${i}`, { perceivedDifficulty: 'too_hard' }),
    );
    const d = shouldDeload({ weekNumber: 6, recentSessions: [sesion('ok'), ...duras] });
    expect(d.deload).toBe(true);
    expect(d.reasons).toContain('hard_sessions_accumulated');
  });

  it('dos sesiones duras aún no disparan la descarga', () => {
    const d = shouldDeload({
      weekNumber: 6,
      recentSessions: [
        sesion('a', { perceivedDifficulty: 'too_hard' }),
        sesion('b', { soreness: 4 }),
        sesion('c'),
        sesion('d'),
      ],
    });
    expect(d.reasons).not.toContain('hard_sessions_accumulated');
  });

  it('solo mira las sesiones recientes, no todo el historial', () => {
    const antiguas = Array.from({ length: 5 }, (_, i) =>
      sesion(`vieja-${i}`, { perceivedDifficulty: 'too_hard' as const }),
    );
    const d = shouldDeload({
      weekNumber: 6,
      recentSessions: [...antiguas, sesion('n1'), sesion('n2'), sesion('n3'), sesion('n4')],
    });
    expect(d.deload).toBe(false);
  });

  it('descarga por baja recuperación declarada en el check-in', () => {
    const d = shouldDeload({ weekNumber: 5, checkin: checkin({ energy: 1, sleep: 1 }) });
    expect(d.deload).toBe(true);
    expect(d.reasons).toContain('low_recovery');
  });
});

describe('dolor declarado', () => {
  it('el dolor manda: descarga, sin subir carga y con derivación a profesional', () => {
    const d = shouldDeload({ weekNumber: 4, painReported: true });
    expect(d.deload).toBe(true);
    expect(d.reasons[0]).toBe('pain_reported');
    expect(d.allowLoadIncrease).toBe(false);
    expect(d.volumeMultiplier).toBeLessThanOrEqual(0.5);
    expect(d.suggestProfessionalKey).toBe('training.pain.consider_professional_review');
    expect(d.messageKey).toBe('training.deload.pain_reported');
  });

  it('también detecta el dolor registrado en una sesión', () => {
    const d = shouldDeload({ weekNumber: 4, recentSessions: [sesion('a', { painReported: true })] });
    expect(d.reasons).toContain('pain_reported');
    expect(d.allowLoadIncrease).toBe(false);
  });

  it('con dolor nunca se puede proponer subir carga', () => {
    expect(canProposeLoadIncrease({ weekNumber: 2, painReported: true })).toBe(false);
    expect(canProposeLoadIncrease({ weekNumber: DELOAD_WEEK })).toBe(false);
    expect(canProposeLoadIncrease({ weekNumber: 2 })).toBe(true);
  });

  it('sin dolor no sugiere valoración profesional', () => {
    expect(shouldDeload({ weekNumber: DELOAD_WEEK }).suggestProfessionalKey).toBeUndefined();
  });

  it('aplica el recorte más conservador cuando hay varios motivos', () => {
    const d = shouldDeload({
      weekNumber: DELOAD_WEEK,
      painReported: true,
      checkin: checkin({ energy: 1, sleep: 1 }),
    });
    expect(d.reasons.length).toBeGreaterThan(1);
    expect(d.volumeMultiplier).toBe(0.5);
  });
});

describe('aplicación de la descarga a una sesión', () => {
  const workout = buildWorkout({
    id: 'w-deload',
    nameKey: 'workout.day.lower',
    dayIndex: 0,
    patterns: ['squat', 'hinge', 'lunge', 'core'],
    equipment: FULL_GYM,
    sessionMinutes: 60,
    experience: 'intermediate',
    sets: 4,
    targetRir: 2,
    seed: 'semilla-fija',
  });

  it('baja series, sube el RIR y acorta la sesión', () => {
    const decision = shouldDeload({ weekNumber: DELOAD_WEEK });
    const rebajado = applyDeloadToWorkout(workout, decision);
    const antes = workout.exercises.reduce((t, e) => t + e.sets, 0);
    const despues = rebajado.exercises.reduce((t, e) => t + e.sets, 0);
    expect(despues).toBeLessThan(antes);
    expect(rebajado.estimatedMinutes).toBeLessThan(workout.estimatedMinutes);
    rebajado.exercises.forEach((e, i) => {
      expect(e.sets).toBeGreaterThanOrEqual(1);
      expect(e.targetRir).toBeGreaterThan(workout.exercises[i].targetRir);
      expect(e.notesKey).toBe('workout.note.deload_week');
    });
  });

  it('no toca la sesión si no hay descarga', () => {
    const decision = shouldDeload({ weekNumber: 3 });
    expect(applyDeloadToWorkout(workout, decision)).toBe(workout);
  });
});
