import {
  sleepScore,
  suggestActivityLevel,
  summarizeHealth,
  toActivityDays,
} from '@/domain/health/activityFromHealth';
import type { DailyHealth } from '@/services/health/types';

const day = (date: string, steps: number, extra: Partial<DailyHealth> = {}): DailyHealth => ({
  date,
  steps,
  workouts: [],
  ...extra,
});

const week = [
  day('2026-09-19', 6000, { sleepMinutes: 420 }),
  day('2026-09-20', 8000, { sleepMinutes: 450, restingHr: 58 }),
  day('2026-09-21', 7000, { workouts: [{ id: 'w', name: 'Run', start: 'a', end: 'b', minutes: 40 }] }),
  day('2026-09-22', 9000, { sleepMinutes: 480, restingHr: 60 }),
  day('2026-09-23', 5000),
  day('2026-09-24', 11000, { sleepMinutes: 390 }),
  day('2026-09-25', 3000),
];

describe('actividad desde el reloj', () => {
  it('convierte días de salud en días de actividad ordenados', () => {
    const out = toActivityDays([week[2], week[0]]);
    expect(out.map((d) => d.date)).toEqual(['2026-09-19', '2026-09-21']);
    expect(out[1].trainingMinutes).toBe(40);
  });

  it('resume la última semana', () => {
    const s = summarizeHealth(week, '2026-09-25');
    expect(s.stepsToday).toBe(3000);
    expect(s.averageSteps7d).toBe(7000);
    expect(s.averageSleepHours7d).toBe(7.3);
    expect(s.restingHr).toBe(59);
    expect(s.trainingMinutes7d).toBe(40);
    expect(s.daysWithData).toBe(7);
  });

  it('ignora días futuros y sin datos en las medias', () => {
    const s = summarizeHealth([...week, day('2026-09-26', 0)], '2026-09-25');
    expect(s.averageSteps7d).toBe(7000);
    const empty = summarizeHealth([], '2026-09-25');
    expect(empty).toEqual({
      stepsToday: 0,
      averageSteps7d: 0,
      averageSleepHours7d: null,
      restingHr: null,
      trainingMinutes7d: 0,
      daysWithData: 0,
    });
  });

  it('no sugiere nivel de actividad con menos de 4 días', () => {
    expect(suggestActivityLevel(summarizeHealth(week.slice(0, 3), '2026-09-21'))).toBeNull();
  });

  it('clasifica por pasos medios con umbrales de podometría', () => {
    const at = (steps: number) =>
      suggestActivityLevel(
        summarizeHealth(
          ['19', '20', '21', '22', '23'].map((d) => day(`2026-09-${d}`, steps)),
          '2026-09-23',
        ),
      );
    expect(at(3000)).toBe('sedentary');
    expect(at(6000)).toBe('light');
    expect(at(8500)).toBe('moderate');
    expect(at(12000)).toBe('active');
  });

  it('puntúa el sueño en la escala del check-in', () => {
    expect(sleepScore(null)).toBeNull();
    expect(sleepScore(4.5)).toBe(1);
    expect(sleepScore(6.5)).toBe(3);
    expect(sleepScore(8.2)).toBe(5);
  });
});
