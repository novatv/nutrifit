import { Platform } from 'react-native';

import { AppleHealthProvider } from './apple-health';
import { HealthConnectProvider } from './health-connect';
import { PedometerProvider } from './pedometer';
import type { HealthProvider, HealthSource } from './types';

export * from './types';

/**
 * Elige el proveedor real de la plataforma; si no está disponible (Expo Go,
 * simulador sin Health, Android sin Health Connect) cae al podómetro.
 * En web no hay nada: se devuelve null y la interfaz lo dice.
 */
export async function resolveHealthProvider(): Promise<HealthProvider | null> {
  if (Platform.OS === 'web') return null;
  const primary: HealthProvider = Platform.OS === 'ios' ? new AppleHealthProvider() : new HealthConnectProvider();
  if (await primary.isAvailable()) return primary;
  const pedometer = new PedometerProvider();
  return (await pedometer.isAvailable()) ? pedometer : null;
}

/** Nombre de la fuente para la interfaz. */
export const HEALTH_SOURCE_KEY: Record<HealthSource, string> = {
  apple_health: 'health.source.appleHealth',
  health_connect: 'health.source.healthConnect',
  pedometer: 'health.source.pedometer',
  none: 'health.source.none',
};
