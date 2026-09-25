import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Switch, View } from 'react-native';

import { Button, Card, Chip, Screen, Section, Text } from '@/components/ui';
import { HealthSection } from '@/features/health/health-section';
import { AVAILABLE_LOCALES, t } from '@/i18n';
import { useTheme } from '@/providers';
import { useAuth } from '@/providers/auth-provider';
import { demoUser } from '@/services/demo-data';
import { exportLocalData, resetLocalData, summarizeLocalData } from '@/services/local-data';
import { REMINDER_BODY_KEY } from '@/services/notifications';
import { isDemoMode } from '@/services/supabase';
import {
  APPEARANCE_OPTIONS,
  REMINDER_KINDS,
  UNIT_SYSTEMS,
  useSettingsStore,
} from '@/stores/settings-store';
import type { Locale, UnitSystem } from '@/types/domain';

const UNIT_LABEL: Record<UnitSystem, string> = {
  metric: 'settings.metric',
  imperial: 'settings.imperial',
};

/** Fila de ajuste con interruptor. El estado se anuncia, no solo se pinta. */
function SwitchRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.md,
        minHeight: 44,
      }}
    >
      <Text variant="body" style={{ flex: 1 }}>
        {label}
      </Text>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.track, true: colors.primary }}
      />
    </View>
  );
}

/**
 * Perfil y ajustes.
 *
 * Los datos de salud son sensibles, así que la sección de privacidad no es un
 * apartado escondido: va antes que lo decorativo y deja claro qué se guarda y
 * cómo borrarlo.
 */
export default function ProfileScreen() {
  const { spacing } = useTheme();

  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const locale = useSettingsStore((s) => s.locale);
  const appearance = useSettingsStore((s) => s.appearance);
  const reminders = useSettingsStore((s) => s.reminders);
  const setUnitSystem = useSettingsStore((s) => s.setUnitSystem);
  const setAppLocale = useSettingsStore((s) => s.setAppLocale);
  const setAppearance = useSettingsStore((s) => s.setAppearance);
  const setReminder = useSettingsStore((s) => s.setReminder);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const { signOut, confirmDeleteAccount, user } = useAuth();

  const viewData = () => {
    const d = summarizeLocalData();
    Alert.alert(
      t('settings.viewData'),
      t('settings.dataSummary', { days: d.loggedDays, checks: d.bodyChecks, photos: d.photos, health: d.healthDays }),
    );
  };

  const confirmReset = () => {
    // Borrar es definitivo: se pregunta siempre y se dice qué se pierde.
    Alert.alert(t('settings.resetData'), t('settings.resetDataConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.resetData'),
        style: 'destructive',
        onPress: () => {
          resetLocalData();
          Alert.alert(t('settings.resetDone'));
        },
      },
    ]);
  };

  const doSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  const doDeleteAccount = async () => {
    const ok = await confirmDeleteAccount();
    if (!ok) return;
    resetLocalData();
    setConfirmDelete(false);
    router.replace('/(auth)/sign-in');
  };

  return (
    <Screen>
      <View style={{ paddingTop: spacing.lg, gap: spacing.xs }}>
        <Text variant="h1">{t('settings.title')}</Text>
        <Text variant="body" color="muted">
          {user?.email ?? demoUser.displayName}
        </Text>
      </View>

      <Section title={t('settings.units')}>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {UNIT_SYSTEMS.map((u) => (
            <Chip
              key={u}
              label={t(UNIT_LABEL[u])}
              selected={unitSystem === u}
              onPress={() => setUnitSystem(u)}
            />
          ))}
        </View>
      </Section>

      <Section title={t('settings.language')}>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {AVAILABLE_LOCALES.map((l) => (
            <Chip
              key={l.code}
              label={l.label}
              selected={locale === l.code}
              onPress={() => setAppLocale(l.code as Locale)}
            />
          ))}
        </View>
      </Section>

      <Section title={t('settings.appearance')}>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {APPEARANCE_OPTIONS.map((a) => (
            <Chip
              key={a}
              label={t(`settings.appearance${a === 'system' ? 'System' : a === 'light' ? 'Light' : 'Dark'}`)}
              selected={appearance === a}
              onPress={() => setAppearance(a)}
            />
          ))}
        </View>
      </Section>

      <Section title={t('settings.notifications')}>
        <Card style={{ gap: spacing.md }}>
          {REMINDER_KINDS.map((kind) => (
            <SwitchRow
              key={kind}
              label={t(REMINDER_BODY_KEY[kind], { n: 1 })}
              value={reminders[kind]}
              onValueChange={(next) => {
                void setReminder(kind, next);
              }}
            />
          ))}
        </Card>
      </Section>

      <Section title={t('settings.health')}>
        <HealthSection />
      </Section>

      <Section title={t('settings.privacy')}>
        <Card style={{ gap: spacing.md }}>
          <Text variant="body">{t('settings.privacyBody')}</Text>
          <Button label={t('settings.viewData')} variant="secondary" onPress={viewData} />
          <Button label={t('settings.exportData')} variant="secondary" onPress={() => void exportLocalData()} />
          <Button label={t('settings.resetData')} variant="ghost" onPress={confirmReset} />
        </Card>
      </Section>

      <Section title={t('checkin.title')}>
        <Button
          label={t('checkin.submit')}
          variant="secondary"
          onPress={() => router.push('/checkin')}
        />
      </Section>

      <Section title={t('settings.account')}>
        <Card style={{ gap: spacing.md }}>
          {user?.email ? <Text variant="body">{user.email}</Text> : null}
          {isDemoMode ? (
            <Text variant="caption" color="muted">
              {t('auth.demoMode')}
            </Text>
          ) : null}
          <Button label={t('auth.signOut')} variant="secondary" onPress={() => void doSignOut()} />
          {confirmDelete ? (
            <>
              <Text variant="body" color="danger">
                {t('auth.deleteAccountWarning')}
              </Text>
              <Button label={t('auth.deleteAccount')} variant="danger" onPress={() => void doDeleteAccount()} />
              <Button
                label={t('common.cancel')}
                variant="ghost"
                onPress={() => setConfirmDelete(false)}
              />
            </>
          ) : (
            <Button
              label={t('auth.deleteAccount')}
              variant="ghost"
              onPress={() => setConfirmDelete(true)}
            />
          )}
        </Card>
      </Section>

      <Text variant="caption" color="muted" style={{ marginTop: spacing['2xl'] }}>
        {t('disclaimer.general')}
      </Text>
    </Screen>
  );
}
