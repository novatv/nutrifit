import * as Notifications from 'expo-notifications';

import { t } from '@/i18n';
import { logger } from './logger';

/**
 * Notificaciones locales.
 *
 * Todas son configurables y ninguna culpabiliza. Los de agua y moverse se
 * repiten a horas fijas del día; el resto avisa una vez. Nada de rachas
 * manipuladoras ni de avisos por no registrar.
 */

export type ReminderKind =
  | 'workout'
  | 'meal'
  | 'newWeek'
  | 'checkin'
  | 'water'
  | 'move'
  | 'sleep';

export type ReminderPreferences = Record<ReminderKind, boolean>;

export const defaultReminderPreferences: ReminderPreferences = {
  workout: true,
  meal: false,
  newWeek: true,
  checkin: true,
  water: true,
  move: true,
  sleep: true,
};

/** Texto de cada recordatorio. También lo usa la pantalla de ajustes como etiqueta. */
export const REMINDER_BODY_KEY: Record<ReminderKind, string> = {
  workout: 'notifications.workoutReady',
  meal: 'notifications.logDinner',
  newWeek: 'notifications.newWeek',
  checkin: 'notifications.checkinTime',
  water: 'notifications.drinkWater',
  move: 'notifications.moveAround',
  sleep: 'notifications.bedtime',
};

const BODY_KEY = REMINDER_BODY_KEY;

export async function requestPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleReminder(
  kind: ReminderKind,
  trigger: Notifications.NotificationTriggerInput,
  params?: Record<string, string | number>,
): Promise<string | null> {
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title: 'YL Nutrición', body: t(BODY_KEY[kind], params) },
      trigger,
    });
  } catch (error) {
    logger.error('No se pudo programar el recordatorio', error, { kind });
    return null;
  }
}

export async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
