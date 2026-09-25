import { Platform } from 'react-native';

import { logger } from '../logger';
import {
  dayKey,
  dayRange,
  emptyDay,
  localDayBounds,
  minutesBetween,
  type DailyHealth,
  type HealthProvider,
  type HealthWorkout,
} from './types';

/**
 * Apple Health (HealthKit). Solo iOS y solo en builds nativas: en Expo Go el
 * módulo no existe, así que se carga en diferido y se comprueba antes de usar.
 */
type HealthKit = typeof import('react-native-health').default;

let kit: HealthKit | null | undefined;

function loadKit(): HealthKit | null {
  if (kit !== undefined) return kit;
  if (Platform.OS !== 'ios') return (kit = null);
  try {
    // require diferido: si el módulo nativo no está enlazado, el import
    // estático rompería la app entera en vez de solo esta función.
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- carga diferida de módulo nativo opcional
    kit = (require('react-native-health') as { default: HealthKit }).default;
  } catch (error) {
    logger.info('react-native-health no disponible', { error: String(error) });
    kit = null;
  }
  return kit;
}

const call = <T>(fn: (cb: (err: unknown, res: T) => void) => void): Promise<T> =>
  new Promise((resolve, reject) => {
    try {
      fn((err, res) => (err ? reject(new Error(String((err as { message?: string })?.message ?? err))) : resolve(res)));
    } catch (error) {
      reject(error);
    }
  });

/** Valores de sueño que cuentan como dormido (los demás: en cama / despierto). */
const ASLEEP = new Set(['ASLEEP', 'CORE', 'DEEP', 'REM']);

export class AppleHealthProvider implements HealthProvider {
  readonly source = 'apple_health' as const;

  async isAvailable(): Promise<boolean> {
    const k = loadKit();
    if (!k) return false;
    try {
      return await call<boolean>((cb) => k.isAvailable(cb));
    } catch {
      return false;
    }
  }

  async requestAccess(): Promise<boolean> {
    const k = loadKit();
    if (!k) return false;
    const P = k.Constants.Permissions;
    try {
      await call((cb) =>
        k.initHealthKit(
          {
            permissions: {
              read: [P.Steps, P.StepCount, P.ActiveEnergyBurned, P.SleepAnalysis, P.HeartRate, P.RestingHeartRate, P.Workout, P.Weight],
              write: [],
            },
          },
          cb,
        ),
      );
      return true;
    } catch (error) {
      logger.error('HealthKit: permisos denegados o error', error);
      return false;
    }
  }

  async readDays(from: string, to: string): Promise<DailyHealth[]> {
    const k = loadKit();
    if (!k) return [];
    const days = new Map<string, DailyHealth>();
    for (const date of dayRange(from, to)) days.set(date, emptyDay(date));

    const { start } = localDayBounds(from);
    const { end } = localDayBounds(to);
    const range = { startDate: start.toISOString(), endDate: end.toISOString() };

    // Pasos por día (HealthKit ya los agrupa por jornada local).
    try {
      const samples = await call<{ startDate: string; value: number }[]>((cb) =>
        k.getDailyStepCountSamples({ ...range, includeManuallyAdded: true }, cb),
      );
      for (const s of samples) {
        const day = days.get(dayKey(new Date(s.startDate)));
        if (day) day.steps += Math.round(s.value);
      }
    } catch (error) {
      logger.error('HealthKit: pasos', error);
    }

    try {
      const energy = await call<{ startDate: string; value: number }[]>((cb) =>
        k.getActiveEnergyBurned({ ...range, includeManuallyAdded: true }, cb),
      );
      for (const s of energy) {
        const day = days.get(dayKey(new Date(s.startDate)));
        if (day) day.activeKcal = (day.activeKcal ?? 0) + s.value;
      }
    } catch (error) {
      logger.error('HealthKit: energía activa', error);
    }

    // Sueño: la noche se atribuye al día en que termina.
    try {
      // La librería tipa `value` como número, pero en sueño llega la fase como texto.
      const sleep = (await call<{ startDate: string; endDate: string; value: unknown }[]>((cb) =>
        k.getSleepSamples({ ...range, ascending: true }, cb),
      )) as { startDate: string; endDate: string; value: unknown }[];
      for (const s of sleep) {
        if (!ASLEEP.has(String(s.value).toUpperCase())) continue;
        const day = days.get(dayKey(new Date(s.endDate)));
        if (day) day.sleepMinutes = (day.sleepMinutes ?? 0) + minutesBetween(s.startDate, s.endDate);
      }
    } catch (error) {
      logger.error('HealthKit: sueño', error);
    }

    try {
      const hr = await call<{ startDate: string; value: number }[]>((cb) =>
        k.getRestingHeartRateSamples({ ...range }, cb),
      );
      const byDay = new Map<string, number[]>();
      for (const s of hr) {
        const key = dayKey(new Date(s.startDate));
        byDay.set(key, [...(byDay.get(key) ?? []), s.value]);
      }
      for (const [key, values] of byDay) {
        const day = days.get(key);
        if (day) day.restingHr = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      }
    } catch (error) {
      logger.error('HealthKit: pulso en reposo', error);
    }

    try {
      const res = await call<{ data: { id: string; activityName: string; calories: number; start: string; end: string }[] }>(
        (cb) => k.getAnchoredWorkouts({ ...range }, cb),
      );
      for (const w of res.data ?? []) {
        const day = days.get(dayKey(new Date(w.start)));
        if (!day) continue;
        const workout: HealthWorkout = {
          id: w.id,
          name: w.activityName,
          start: w.start,
          end: w.end,
          minutes: minutesBetween(w.start, w.end),
          kcal: w.calories > 0 ? Math.round(w.calories) : undefined,
        };
        day.workouts.push(workout);
      }
    } catch (error) {
      logger.error('HealthKit: entrenamientos', error);
    }

    for (const day of days.values()) {
      if (day.activeKcal !== undefined) day.activeKcal = Math.round(day.activeKcal);
    }
    return [...days.values()];
  }

  async latestWeightKg(): Promise<{ kg: number; date: string } | null> {
    const k = loadKit();
    if (!k) return null;
    try {
      const res = await call<{ value: number; startDate: string }>((cb) =>
        k.getLatestWeight({ unit: k.Constants.Units.gram }, cb),
      );
      if (!res || !res.value) return null;
      return { kg: Math.round((res.value / 1000) * 10) / 10, date: dayKey(new Date(res.startDate)) };
    } catch {
      return null;
    }
  }
}
