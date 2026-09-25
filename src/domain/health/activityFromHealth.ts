import type { DailyHealth } from '@/services/health/types';

/**
 * Lectura de la actividad del reloj para el plan.
 *
 * Determinista y sin red. Convierte los días de salud en las cifras que usa
 * la app (pasos de hoy, media semanal, sueño) y en una sugerencia de nivel de
 * actividad que el usuario puede aceptar o no: el reloj informa, no decide.
 */

export interface ActivityDay {
  date: string;
  steps: number;
  trainingMinutes: number;
}

export interface HealthSummary {
  stepsToday: number;
  /** Media de los últimos 7 días con datos (0 si no hay ninguno). */
  averageSteps7d: number;
  /** Horas de sueño medias en la última semana, null sin datos. */
  averageSleepHours7d: number | null;
  restingHr: number | null;
  trainingMinutes7d: number;
  daysWithData: number;
}

export function toActivityDays(days: DailyHealth[]): ActivityDay[] {
  return [...days]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      date: d.date,
      steps: d.steps,
      trainingMinutes: d.workouts.reduce((acc, w) => acc + w.minutes, 0),
    }));
}

export function summarizeHealth(days: DailyHealth[], today: string): HealthSummary {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const withData = sorted.filter((d) => d.steps > 0 || d.workouts.length > 0 || d.sleepMinutes);
  const last7 = sorted.filter((d) => d.date <= today).slice(-7);
  const stepsToday = sorted.find((d) => d.date === today)?.steps ?? 0;

  const stepDays = last7.filter((d) => d.steps > 0);
  const averageSteps7d = stepDays.length
    ? Math.round(stepDays.reduce((a, d) => a + d.steps, 0) / stepDays.length)
    : 0;

  const sleepDays = last7.filter((d) => typeof d.sleepMinutes === 'number' && d.sleepMinutes > 0);
  const averageSleepHours7d = sleepDays.length
    ? Math.round((sleepDays.reduce((a, d) => a + (d.sleepMinutes ?? 0), 0) / sleepDays.length / 60) * 10) / 10
    : null;

  const hrDays = last7.filter((d) => typeof d.restingHr === 'number');
  const restingHr = hrDays.length
    ? Math.round(hrDays.reduce((a, d) => a + (d.restingHr ?? 0), 0) / hrDays.length)
    : null;

  return {
    stepsToday,
    averageSteps7d,
    averageSleepHours7d,
    restingHr,
    trainingMinutes7d: last7.reduce((a, d) => a + d.workouts.reduce((x, w) => x + w.minutes, 0), 0),
    daysWithData: withData.length,
  };
}

/**
 * Nivel de actividad que sugieren los pasos. Umbrales de uso común en la
 * literatura de podometría (Tudor-Locke); son orientativos y así se presentan.
 */
export type SuggestedActivity = 'sedentary' | 'light' | 'moderate' | 'active' | null;

export function suggestActivityLevel(summary: HealthSummary): SuggestedActivity {
  // Con menos de 4 días no se sugiere nada: un fin de semana no define a nadie.
  if (summary.daysWithData < 4 || summary.averageSteps7d === 0) return null;
  const s = summary.averageSteps7d;
  if (s < 5000) return 'sedentary';
  if (s < 7500) return 'light';
  if (s < 10000) return 'moderate';
  return 'active';
}

/** Escala 1–5 de sueño para el check-in, a partir de las horas medias. */
export function sleepScore(hours: number | null): 1 | 2 | 3 | 4 | 5 | null {
  if (hours === null) return null;
  if (hours < 5) return 1;
  if (hours < 6) return 2;
  if (hours < 7) return 3;
  if (hours < 8) return 4;
  return 5;
}
