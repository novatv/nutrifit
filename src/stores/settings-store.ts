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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
import type { Locale, UnitSystem } from '@/types/domain';
import { SchedulableTriggerInputTypes } from 'expo-notifications';

/* ------------------------------------------------------------------ tipos */

/** `system` sigue el ajuste del dispositivo; es el valor por defecto. */
export type AppearancePreference = 'system' | 'light' | 'dark';

export const APPEARANCE_OPTIONS: AppearancePreference[] = ['system', 'light', 'dark'];

export const UNIT_SYSTEMS: UnitSystem[] = ['metric', 'imperial'];

export const REMINDER_KINDS: ReminderKind[] = ['workout', 'meal', 'newWeek', 'checkin'];

/** Hora del día de cada recordatorio. Ninguno insiste más de una vez. */
export const REMINDER_HOURS: Record<ReminderKind, { hour: number; minute: number }> = {
  workout: { hour: 8, minute: 30 },
  meal: { hour: 20, minute: 0 },
  newWeek: { hour: 19, minute: 0 },
  checkin: { hour: 10, minute: 0 },
};

export interface SettingsState {
  unitSystem: UnitSystem;
  locale: Locale;
  appearance: AppearancePreference;
  reminders: ReminderPreferences;
  /** true cuando `persist` ya ha leído del almacenamiento. */
  hydrated: boolean;

  setUnitSystem: (unitSystem: UnitSystem) => void;
  setAppLocale: (locale: Locale) => void;
  setAppearance: (appearance: AppearancePreference) => void;
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
};

/* ---------------------------------------------------------- almacenamiento */

/**
 * Almacenamiento tolerante al render en servidor.
 *
 * Para web, Expo Router renderiza primero en Node, donde no existe `window`.
 * AsyncStorage lo toca al escribir, así que sin esta guarda el proceso muere
 * con "window is not defined" antes de pintar nada. En ese entorno no hay
 * nada que persistir: se devuelve un almacén vacío y la app arranca con los
 * valores por defecto, que es justo lo que debe pasar en un render de servidor.
 */
const isBrowserLike = typeof window !== 'undefined';

const noopStorage = {
  getItem: async (): Promise<string | null> => null,
  setItem: async (): Promise<void> => {},
  removeItem: async (): Promise<void> => {},
};

const safeStorage = isBrowserLike ? AsyncStorage : noopStorage;

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
            const { hour, minute } = REMINDER_HOURS[kind];
            await scheduleReminder(
              kind,
              { type: SchedulableTriggerInputTypes.DAILY, hour, minute },
              kind === 'newWeek' ? { n: 1 } : undefined,
            );
          }
        } catch (error) {
          logger.error('No se pudieron reprogramar los recordatorios', error);
        }
      },

      reset: () => set({ ...INITIAL }),
    }),
    {
      name: 'nutrifit.settings',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        unitSystem: state.unitSystem,
        locale: state.locale,
        appearance: state.appearance,
        reminders: state.reminders,
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

export const useReminders = (): ReminderPreferences => useSettingsStore((s) => s.reminders);
