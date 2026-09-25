import { Ionicons } from '@expo/vector-icons';
import { Platform, View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { summarizeHealth } from '@/domain/health/activityFromHealth';
import { t } from '@/i18n';
import { useTheme } from '@/providers';
import { HEALTH_SOURCE_KEY } from '@/services/health';
import { useHealthDays, useHealthStore } from '@/stores/health-store';

/**
 * Tarjeta "Reloj y salud" del perfil.
 *
 * Conecta con Apple Health o Health Connect: cualquier reloj que vuelque ahí
 * (Apple Watch, Garmin, Fitbit, Samsung, Xiaomi, Polar…) entra sin más.
 * Solo lectura; los permisos se quitan desde el sistema y aquí se explica.
 */
export function HealthSection() {
  const { colors, spacing } = useTheme();
  const status = useHealthStore((s) => s.status);
  const connected = useHealthStore((s) => s.connected);
  const source = useHealthStore((s) => s.source);
  const lastSyncAt = useHealthStore((s) => s.lastSyncAt);
  const connect = useHealthStore((s) => s.connect);
  const disconnect = useHealthStore((s) => s.disconnect);
  const sync = useHealthStore((s) => s.sync);
  const days = useHealthDays();

  const summary = summarizeHealth(days, new Date().toISOString().slice(0, 10));
  const busy = status === 'connecting' || status === 'syncing';
  const platformHint =
    Platform.OS === 'ios' ? 'health.hintIos' : Platform.OS === 'android' ? 'health.hintAndroid' : 'health.hintWeb';

  return (
    <Card style={{ gap: spacing.md }}>
      <Text variant="body" color="muted">
        {t('health.intro')}
      </Text>
      <Text variant="caption" color="muted">
        {t(platformHint)}
      </Text>

      {connected ? (
        <View style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text variant="bodyStrong">{t('health.connectedTo', { source: t(HEALTH_SOURCE_KEY[source]) })}</Text>
          </View>
          {lastSyncAt ? (
            <Text variant="caption" color="muted">
              {t('health.lastSync', { when: lastSyncAt.slice(0, 16).replace('T', ' ') })}
            </Text>
          ) : null}
          {summary.daysWithData > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
              <Stat label={t('health.stepsToday')} value={String(summary.stepsToday)} />
              <Stat label={t('health.avgSteps')} value={String(summary.averageSteps7d)} />
              {summary.averageSleepHours7d !== null ? (
                <Stat label={t('health.avgSleep')} value={`${summary.averageSleepHours7d} h`} />
              ) : null}
              {summary.restingHr !== null ? <Stat label={t('health.restingHr')} value={`${summary.restingHr} bpm`} /> : null}
            </View>
          ) : (
            <Text variant="caption" color="muted">
              {t('health.noDataYet')}
            </Text>
          )}
          <Button label={t('health.syncNow')} variant="secondary" loading={busy} onPress={() => void sync()} />
          <Button label={t('health.disconnect')} variant="ghost" onPress={disconnect} />
        </View>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {status === 'unavailable' ? (
            <Text variant="caption" color="danger">
              {t('health.unavailable')}
            </Text>
          ) : null}
          {status === 'denied' ? (
            <Text variant="caption" color="danger">
              {t('health.denied')}
            </Text>
          ) : null}
          {status === 'error' ? (
            <Text variant="caption" color="danger">
              {t('health.error')}
            </Text>
          ) : null}
          <Button
            label={t('health.connect')}
            loading={busy}
            icon={<Ionicons name="watch-outline" size={18} color={colors.onPrimary} />}
            onPress={() => void connect()}
          />
        </View>
      )}
      <Text variant="caption" color="muted">
        {t('health.readOnly')}
      </Text>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text variant="label" color="muted">
        {label}
      </Text>
      <Text variant="numeric">{value}</Text>
    </View>
  );
}
