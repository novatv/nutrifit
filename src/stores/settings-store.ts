/**
 * Ajustes de la aplicación: unidades, idioma, apariencia y recordatorios.
 *
 * Decisiones:
 * - **Se persisten.** A diferencia del borrador de onboarding, aquí no hay
 *   datos de salud: son preferencias de interfaz y el usuario espera
 *   encontrarlas igual al volver a abrir la app.
 * - **El idioma se aplica al escribirlo.** `setLocale` de `@/i18n` cambia una
 *   variable de módulo, así que el store guarda además el idioma para que las
 *   pantallas suscritas se vuelvan a renderizar al cambiarlo.
 * - **Las notificaciones no se programan aquí a ciegas.** Activar un
 *   recordatorio pide permiso primero; si el usuario lo deniega, la
 *   preferencia se queda apagada en vez de mentir con un interruptor activo.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { TrainingMode } from '@/domain/training/trainingModes';
import { setLocale } from '@/i18n';
import {
  cancelAll,
  defaultReminderPreferences,
  requestPermission,
  scheduleReminder,
  type ReminderKind,
  type ReminderPreferences,
} from '@/services/notifications';
import { logger } from '@/services/logger';
import { persistStorage } from '@/stores/safe-storage';
import type { Locale, UnitSystem } from '@/types/domain';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

/* ------------------------------------------------------------------ tipos */

/** `system` sigue el ajuste del dispositivo; es el valor por defecto. */
export type AppearancePreference = 'system' | 'light' | 'dark';

export const APPEARANCE_OPTIONS: AppearancePreference[] = ['system', 'light', 'dark'];

export const UNIT_SYSTEMS: UnitSystem[] = ['metric', 'imperial'];

export const REMINDER_KINDS: ReminderKind[] = [
  'workout',
  'meal',
  'water',
  'move',
  'sleep',
  'newWeek',
  'checkin',
];

export interface ReminderTime {
  hour: number;
  minute: number;
}

/**
 * Horas de cada recordatorio. Agua y moverse se reparten por el día en horas
 * de vigilia; el de dormir avisa con margen para desconectar antes de la cama.
 */
export const REMINDER_TIMES: Record<ReminderKind, ReminderTime[]> = {
  workout: [{ hour: 8, minute: 30 }],
  meal: [{ hour: 20, minute: 0 }],
  water: [10, 12, 14, 16, 18, 20].map((hour) => ({ hour, minute: 0 })),
  move: [11, 13, 15, 17].map((hour) => ({ hour, minute: 30 })),
  sleep: [{ hour: 22, minute: 30 }],
  newWeek: [{ hour: 19, minute: 0 }],
  checkin: [{ hour: 10, minute: 0 }],
};

export interface SettingsState {
  unitSystem: UnitSystem;
  locale: Locale;
  appearance: AppearancePreference;
  reminders: ReminderPreferences;
  /** Gimnasio, pesas libres o casa: decide qué ejercicios se sirven. */
  trainingMode: TrainingMode;
  /** true cuando `persist` ya ha leído del almacenamiento. */
  hydrated: boolean;

  setUnitSystem: (unitSystem: UnitSystem) => void;
  setAppLocale: (locale: Locale) => void;
  setAppearance: (appearance: AppearancePreference) => void;
  setTrainingMode: (mode: TrainingMode) => void;
  /** Devuelve el valor que quedó activo: `false` si faltó el permiso. */
  setReminder: (kind: ReminderKind, enabled: boolean) => Promise<boolean>;
  /** Vuelve a programar los recordatorios activos (tras cambiar de idioma). */
  rescheduleReminders: () => Promise<void>;
  reset: () => void;
}

const INITIAL = {
  unitSystem: 'metric' as UnitSystem,
  locale: 'es' as Locale,
  appearance: 'system' as AppearancePreference,
  reminders: { ...defaultReminderPreferences },
  trainingMode: 'gym' as TrainingMode,
};

/* ------------------------------------------------------------------ store */

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...INITIAL,
      hydrated: false,

      setUnitSystem: (unitSystem) => set({ unitSystem }),

      setAppLocale: (locale) => {
        setLocale(locale);
        set({ locale });
        // Los textos de los recordatorios ya programados están en el idioma
        // anterior: se vuelven a crear para que no queden a medias.
        void get().rescheduleReminders();
      },

      setAppearance: (appearance) => set({ appearance }),

      setTrainingMode: (trainingMode) => set({ trainingMode }),

      async setReminder(kind, enabled) {
        if (!enabled) {
          set((state) => ({ reminders: { ...state.reminders, [kind]: false } }));
          await get().rescheduleReminders();
          return false;
        }

        const granted = await requestPermission().catch((error: unknown) => {
          logger.error('No se pudo pedir el permiso de notificaciones', error, { kind });
          return false;
        });
        if (!granted) return false;

        set((state) => ({ reminders: { ...state.reminders, [kind]: true } }));
        await get().rescheduleReminders();
        return true;
      },

      async rescheduleReminders() {
        try {
          await cancelAll();
          const { reminders } = get();
          for (const kind of REMINDER_KINDS) {
            if (!reminders[kind]) continue;
            for (const { hour, minute } of REMINDER_TIMES[kind]) {
              await scheduleReminder(
                kind,
                { type: SchedulableTriggerInputTypes.DAILY, hour, minute },
                kind === 'newWeek' ? { n: 1 } : undefined,
              );
            }
          }
        } catch (error) {
          logger.error('No se pudieron reprogramar los recordatorios', error);
        }
      },

      reset: () => set({ ...INITIAL }),
    }),
    {
      name: 'nutrifit.settings',
      storage: persistStorage(),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<SettingsState>;
        return {
          ...current,
          ...saved,
          // Ajustes guardados antes de existir un recordatorio no lo traen: se
          // completa con el valor por defecto en vez de dejarlo indefinido.
          reminders: { ...defaultReminderPreferences, ...(saved.reminders ?? {}) },
        };
      },
      partialize: (state) => ({
        unitSystem: state.unitSystem,
        locale: state.locale,
        appearance: state.appearance,
        reminders: state.reminders,
        trainingMode: state.trainingMode,
      }),
      onRehydrateStorage: () => (state) => {
        // El idioma guardado tiene que estar activo antes del primer `t()`.
        if (state?.locale) setLocale(state.locale);
        useSettingsStore.setState({ hydrated: true });
      },
    },
  ),
);

/* -------------------------------------------------------------- selectores */

export const useUnitSystem = (): UnitSystem => useSettingsStore((s) => s.unitSystem);

/**
 * Idioma activo. Las pantallas lo leen aunque no lo pinten: suscribirse es lo
 * que hace que se vuelvan a renderizar cuando el usuario cambia de idioma.
 */
export const useAppLocale = (): Locale => useSettingsStore((s) => s.locale);

export const useAppearance = (): AppearancePreference => useSettingsStore((s) => s.appearance);
export const useTrainingMode = (): TrainingMode => useSettingsStore((s) => s.trainingMode);

export const useReminders = (): ReminderPreferences => useSettingsStore((s) => s.reminders);
