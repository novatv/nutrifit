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
} from './types';

/**
 * Health Connect (Android 8+). Igual que HealthKit: carga en diferido porque
 * el módulo nativo solo existe en builds de desarrollo o producción.
 */
type HC = typeof import('react-native-health-connect');

let hc: HC | null | undefined;

function loadHc(): HC | null {
  if (hc !== undefined) return hc;
  if (Platform.OS !== 'android') return (hc = null);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- carga diferida de módulo nativo opcional
    hc = require('react-native-health-connect') as HC;
  } catch (error) {
    logger.info('react-native-health-connect no disponible', { error: String(error) });
    hc = null;
  }
  return hc;
}

const READ_TYPES = ['Steps', 'ActiveCaloriesBurned', 'SleepSession', 'RestingHeartRate', 'ExerciseSession', 'Weight'] as const;

export class HealthConnectProvider implements HealthProvider {
  readonly source = 'health_connect' as const;

  async isAvailable(): Promise<boolean> {
    const h = loadHc();
    if (!h) return false;
    try {
      const status = await h.getSdkStatus();
      return status === h.SdkAvailabilityStatus.SDK_AVAILABLE;
    } catch {
      return false;
    }
  }

  async requestAccess(): Promise<boolean> {
    const h = loadHc();
    if (!h) return false;
    try {
      const ok = await h.initialize();
      if (!ok) return false;
      const granted = await h.requestPermission(
        READ_TYPES.map((recordType) => ({ accessType: 'read' as const, recordType })),
      );
      // Con pasos ya se puede trabajar; el resto es opcional.
      return granted.some((p) => 'recordType' in p && p.recordType === 'Steps');
    } catch (error) {
      logger.error('Health Connect: permisos', error);
      return false;
    }
  }

  async readDays(from: string, to: string): Promise<DailyHealth[]> {
    const h = loadHc();
    if (!h) return [];
    const days = new Map<string, DailyHealth>();
    for (const date of dayRange(from, to)) days.set(date, emptyDay(date));

    // Pasos y energía: agregados por día, que es lo que Health Connect hace mejor.
    for (const date of days.keys()) {
      const { start, end } = localDayBounds(date);
      const timeRangeFilter = { operator: 'between' as const, startTime: start.toISOString(), endTime: end.toISOString() };
      const day = days.get(date)!;
      try {
        const steps = await h.aggregateRecord({ recordType: 'Steps', timeRangeFilter });
        day.steps = steps.COUNT_TOTAL ?? 0;
      } catch (error) {
        logger.error('Health Connect: pasos', error, { date });
      }
      try {
        const energy = await h.aggregateRecord({ recordType: 'ActiveCaloriesBurned', timeRangeFilter });
        const kcal = energy.ACTIVE_CALORIES_TOTAL?.inKilocalories;
        if (kcal) day.activeKcal = Math.round(kcal);
      } catch {
        /* sin permiso de energía: se deja vacío */
      }
    }

    const { start } = localDayBounds(from);
    const { end } = localDayBounds(to);
    const wide = { operator: 'between' as const, startTime: start.toISOString(), endTime: end.toISOString() };

    try {
      const { records } = await h.readRecords('SleepSession', { timeRangeFilter: wide });
      for (const s of records) {
        const day = days.get(dayKey(new Date(s.endTime)));
        if (day) day.sleepMinutes = (day.sleepMinutes ?? 0) + minutesBetween(s.startTime, s.endTime);
      }
    } catch {
      /* opcional */
    }

    try {
      const { records } = await h.readRecords('RestingHeartRate', { timeRangeFilter: wide });
      const byDay = new Map<string, number[]>();
      for (const r of records) {
        const key = dayKey(new Date(r.time));
        byDay.set(key, [...(byDay.get(key) ?? []), r.beatsPerMinute]);
      }
      for (const [key, values] of byDay) {
        const day = days.get(key);
        if (day) day.restingHr = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
      }
    } catch {
      /* opcional */
    }

    try {
      const { records } = await h.readRecords('ExerciseSession', { timeRangeFilter: wide });
      for (const w of records) {
        const day = days.get(dayKey(new Date(w.startTime)));
        if (!day) continue;
        day.workouts.push({
          id: w.metadata?.id ?? `${w.startTime}-${w.exerciseType}`,
          name: w.title || `exercise_${w.exerciseType}`,
          start: w.startTime,
          end: w.endTime,
          minutes: minutesBetween(w.startTime, w.endTime),
        });
      }
    } catch {
      /* opcional */
    }

    return [...days.values()];
  }

  async latestWeightKg(): Promise<{ kg: number; date: string } | null> {
    const h = loadHc();
    if (!h) return null;
    try {
      const since = new Date();
      since.setFullYear(since.getFullYear() - 1);
      const { records } = await h.readRecords('Weight', {
        timeRangeFilter: { operator: 'after', startTime: since.toISOString() },
        ascendingOrder: false,
        pageSize: 1,
      });
      const last = records[0];
      if (!last) return null;
      return { kg: Math.round(last.weight.inKilograms * 10) / 10, date: dayKey(new Date(last.time)) };
    } catch {
      return null;
    }
  }
}
