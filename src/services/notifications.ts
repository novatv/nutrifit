import * as Notifications from 'expo-notifications';

import { t } from '@/i18n';
import { logger } from './logger';

/**
 * Notificaciones locales.
 *
 * Todas son configurables y ninguna insiste: un recordatorio por tipo y día.
 * Nada de rachas manipuladoras ni de avisos que culpabilicen por no registrar.
 */

export type ReminderKind = 'workout' | 'meal' | 'newWeek' | 'checkin';

export interface ReminderPreferences {
  workout: boolean;
  meal: boolean;
  newWeek: boolean;
  checkin: boolean;
}

export const defaultReminderPreferences: ReminderPreferences = {
  workout: true,
  meal: false,
  newWeek: true,
  checkin: true,
};

const BODY_KEY: Record<ReminderKind, string> = {
  workout: 'notifications.workoutReady',
  meal: 'notifications.logDinner',
  newWeek: 'notifications.newWeek',
  checkin: 'notifications.checkinTime',
};

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
      content: { title: 'NutriFit 12', body: t(BODY_KEY[kind], params) },
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
