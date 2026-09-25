import { Pedometer } from 'expo-sensors';

import { dayRange, emptyDay, localDayBounds, type DailyHealth, type HealthProvider } from './types';

/**
 * Podómetro del teléfono (CoreMotion / sensor Android).
 *
 * Es el respaldo cuando no hay Apple Health ni Health Connect: solo pasos,
 * pero funciona en Expo Go y no necesita reloj. En web no hay sensor.
 */
export class PedometerProvider implements HealthProvider {
  readonly source = 'pedometer' as const;

  async isAvailable(): Promise<boolean> {
    try {
      return await Pedometer.isAvailableAsync();
    } catch {
      return false;
    }
  }

  async requestAccess(): Promise<boolean> {
    try {
      const { granted } = await Pedometer.requestPermissionsAsync();
      return granted;
    } catch {
      return false;
    }
  }

  async readDays(from: string, to: string): Promise<DailyHealth[]> {
    const days: DailyHealth[] = [];
    for (const date of dayRange(from, to)) {
      const { start, end } = localDayBounds(date);
      try {
        const { steps } = await Pedometer.getStepCountAsync(start, end);
        days.push({ ...emptyDay(date), steps });
      } catch {
        days.push(emptyDay(date));
      }
    }
    return days;
  }

  async latestWeightKg(): Promise<null> {
    return null;
  }
}
