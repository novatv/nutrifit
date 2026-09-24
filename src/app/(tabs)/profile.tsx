import { router } from 'expo-router';
import { useState } from 'react';
import { Switch, View } from 'react-native';

import { Button, Card, Chip, Screen, Section, Text } from '@/components/ui';
import { AVAILABLE_LOCALES, t } from '@/i18n';
import { useTheme } from '@/providers';
import { demoUser } from '@/services/demo-data';
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

  return (
    <Screen>
      <View style={{ paddingTop: spacing.lg, gap: spacing.xs }}>
        <Text variant="h1">{t('settings.title')}</Text>
        <Text variant="body" color="muted">
          {demoUser.displayName}
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
              label={t(
                kind === 'workout'
                  ? 'notifications.workoutReady'
                  : kind === 'meal'
                    ? 'notifications.logDinner'
                    : kind === 'newWeek'
                      ? 'notifications.newWeek'
                      : 'notifications.checkinTime',
                { n: 1 },
              )}
              value={reminders[kind]}
              onValueChange={(next) => {
                void setReminder(kind, next);
              }}
            />
          ))}
        </Card>
      </Section>

      <Section title={t('settings.privacy')}>
        <Card style={{ gap: spacing.md }}>
          <Text variant="body">{t('settings.privacyBody')}</Text>
          <Button label={t('settings.viewData')} variant="secondary" onPress={() => {}} />
          <Button label={t('settings.exportData')} variant="secondary" onPress={() => {}} />
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
          {isDemoMode ? (
            <Text variant="caption" color="muted">
              {t('states.offlineBody')}
            </Text>
          ) : null}
          <Button label={t('auth.signOut')} variant="secondary" onPress={() => {}} />
          {confirmDelete ? (
            <>
              <Text variant="body" color="danger">
                {t('auth.deleteAccountWarning')}
              </Text>
              <Button label={t('auth.deleteAccount')} variant="danger" onPress={() => {}} />
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
