import { router } from 'expo-router';
import { View } from 'react-native';

import {
  Button,
  Card,
  MacroCard,
  ProgressRing,
  Screen,
  Section,
  StatCard,
  Text,
} from '@/components/ui';
import { t } from '@/i18n';
import { useTheme } from '@/providers';
import {
  demoActivity,
  demoConsumed,
  demoNextMeal,
  demoTargets,
  demoUser,
  demoWeeklyAdherence,
  demoWorkout,
} from '@/services/demo-data';

function greetingKey(hour: number): string {
  if (hour < 12) return 'today.greetingMorning';
  if (hour < 20) return 'today.greetingAfternoon';
  return 'today.greetingEvening';
}

/**
 * Pantalla Hoy.
 *
 * Prioriza la acción pendiente en vez de apilar tarjetas: primero el objetivo
 * del día, luego lo que falta por hacer. Si no hay entrenamiento, ese hueco
 * no se rellena con ruido.
 */
export default function TodayScreen() {
  const { colors, spacing } = useTheme();
  const hour = new Date().getHours();

  const kcalLeft = Math.max(0, demoTargets.kcal - demoConsumed.kcal);

  return (
    <Screen>
      <View style={{ paddingTop: spacing.lg, gap: spacing.xs }}>
        <Text variant="h1">{t(greetingKey(hour), { name: demoUser.displayName })}</Text>
        <Text variant="label" color="muted">
          {t('today.weekDay', { week: demoUser.weekNumber, day: demoUser.dayNumber })}
        </Text>
      </View>

      <Section title={t('today.dailyGoal')}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xl }}>
          <ProgressRing
            value={demoConsumed.kcal}
            max={demoTargets.kcal}
            size={116}
            caption={t('today.calories')}
            center={
              <View style={{ alignItems: 'center' }}>
                <Text variant="h2">{kcalLeft.toLocaleString('es-ES')}</Text>
                <Text variant="caption" color="muted">
                  kcal
                </Text>
              </View>
            }
          />
          <View style={{ flex: 1, gap: spacing.xs }}>
            <Text variant="bodyStrong">
              {demoConsumed.kcal.toLocaleString('es-ES')} / {demoTargets.kcal.toLocaleString('es-ES')}
            </Text>
            <Text variant="caption" color="muted">
              {t('disclaimer.estimate')}
            </Text>
          </View>
        </Card>
      </Section>

      <Section>
        <MacroCard consumed={demoConsumed} target={demoTargets} />
      </Section>

      <Section>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <StatCard
            label={t('today.steps')}
            value={demoActivity.steps}
            target={demoActivity.stepTarget}
          />
          <StatCard
            label={t('today.water')}
            value={demoActivity.waterMl / 1000}
            target={demoActivity.waterTargetMl / 1000}
            unit="L"
            color={colors.macroFiber}
          />
        </View>
      </Section>

      <Section title={t('today.todayWorkout')}>
        <Card style={{ gap: spacing.lg }}>
          {demoWorkout.isRestDay ? (
            <Text variant="body" color="muted">
              {t('today.restDay')}
            </Text>
          ) : (
            <>
              <View style={{ gap: spacing.xs }}>
                <Text variant="h3">{demoWorkout.name}</Text>
                <Text variant="caption" color="muted">
                  {t('common.minutes', { n: demoWorkout.estimatedMinutes })} ·{' '}
                  {demoWorkout.exerciseCount} {t('workout.exercises').toLowerCase()}
                </Text>
              </View>
              <Button
                label={t('today.startWorkout')}
                onPress={() => router.push('/workout')}
                accessibilityHint={demoWorkout.name}
              />
            </>
          )}
        </Card>
      </Section>

      <Section title={t('today.nextMeal')}>
        <Card style={{ gap: spacing.sm }}>
          <Text variant="h3">{demoNextMeal.name}</Text>
          <Text variant="caption" color="muted">
            {demoNextMeal.kcal} kcal · {demoNextMeal.proteinG} g {t('today.protein').toLowerCase()} ·{' '}
            {t('common.minutes', { n: demoNextMeal.prepMinutes })}
          </Text>
          <Button
            label={t('log.addFood')}
            variant="secondary"
            onPress={() => router.push('/(tabs)/log')}
          />
        </Card>
      </Section>

      <Section title={t('today.adherenceWeek')}>
        <Card style={{ gap: spacing.sm }}>
          <Text variant="h2">{Math.round(demoWeeklyAdherence * 100)}%</Text>
          <Text variant="caption" color="muted">
            {t('today.streak', { n: demoUser.streakDays })}
          </Text>
        </Card>
      </Section>

      <Text variant="caption" color="muted" style={{ marginTop: spacing['2xl'] }}>
        {t('disclaimer.general')}
      </Text>
    </Screen>
  );
}
