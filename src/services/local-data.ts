import { Platform, Share } from 'react-native';

import { logger } from './logger';
import { useBodyStore } from '@/stores/body-store';
import { useHealthStore } from '@/stores/health-store';
import { useLogStore } from '@/stores/log-store';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { usePhotosStore } from '@/stores/photos-store';
import { useWorkoutStore } from '@/stores/workout-store';

/**
 * Datos locales del usuario: verlos, exportarlos y borrarlos.
 *
 * Todo lo que la app guarda en el dispositivo pasa por aquí, para que
 * "Restablecer" borre de verdad todo y "Exportar" no se deje nada.
 */

export interface LocalDataSummary {
  loggedDays: number;
  bodyChecks: number;
  photos: number;
  healthDays: number;
}

export function summarizeLocalData(): LocalDataSummary {
  return {
    loggedDays: Object.keys(useLogStore.getState().days).length,
    bodyChecks: useBodyStore.getState().checks.length,
    photos: usePhotosStore.getState().photos.length,
    healthDays: Object.keys(useHealthStore.getState().days).length,
  };
}

export function collectLocalData(): Record<string, unknown> {
  const { days, manualFoods, favoriteFoodIds, savedMeals } = useLogStore.getState();
  return {
    exportedAt: new Date().toISOString(),
    app: 'YL Nutrición',
    log: { days, manualFoods, favoriteFoodIds, savedMeals },
    body: useBodyStore.getState().checks,
    // Solo el índice: las fotos en sí se quedan donde están.
    photos: usePhotosStore.getState().photos.map(({ id, kind, takenAt }) => ({ id, kind, takenAt })),
    health: useHealthStore.getState().days,
  };
}

/** Exporta en JSON: hoja de compartir en móvil, descarga en web. */
export async function exportLocalData(): Promise<boolean> {
  const json = JSON.stringify(collectLocalData(), null, 2);
  const name = `yl-nutricion-${new Date().toISOString().slice(0, 10)}.json`;
  try {
    if (Platform.OS === 'web') {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    }
    await Share.share({ message: json, title: name });
    return true;
  } catch (error) {
    logger.error('No se pudieron exportar los datos', error);
    return false;
  }
}

/** Borra todo lo local. Los ajustes de interfaz (idioma, unidades) se conservan. */
export function resetLocalData(): void {
  useLogStore.getState().reset();
  useBodyStore.getState().reset();
  usePhotosStore.getState().reset();
  useHealthStore.getState().disconnect();
  useOnboardingStore.getState().reset();
  useWorkoutStore.getState().reset();
}
