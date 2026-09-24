import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { Button, Card, EmptyState, ErrorState, Screen, Skeleton, Text } from '@/components/ui';
import type { PlanDay, PlanRow, PlanWeek, WeekStatus } from '@/features/plan/use-plan-data';
import { usePlanData } from '@/features/plan/use-plan-data';
import { t } from '@/i18n';
import { useTheme } from '@/providers';
import { useAppLocale } from '@/stores/settings-store';
import { minTouchTarget } from '@/theme';

/* ------------------------------------------------------------- iconografía */

type IconName = keyof typeof Ionicons.glyphMap;

/**
 * Cada estado tiene su FORMA además de su color.
 *
 * Un círculo vacío, un triángulo de reproducción y una marca de verificación
 * se distinguen sin ver el color; tres puntos de colores distintos, no. Cerca
 * del 8% de los hombres no distingue rojo de verde.
 */
const STATUS_ICON: Record<WeekStatus, IconName> = {
  pending: 'ellipse-outline',
  current: 'play-circle',
  completed: 'checkmark-circle',
};

const DAY_ICON: Record<PlanDay['kind'], IconName> = {
  workout: 'barbell-outline',
  rest: 'moon-outline',
  checkin: 'clipboard-outline',
};

/* ------------------------------------------------------------ día suelto */

function DayRow({ day }: { day: PlanDay }) {
  const { colors, spacing } = useTheme();

  const label =
    day.kind === 'workout' && day.workout
      ? t(day.workout.nameKey)
      : day.kind === 'checkin'
        ? t('plan.checkin')
        : t('plan.rest');

  const detail =
    day.kind === 'workout' && day.workout
      ? `${day.workout.exercises.length} ${t('workout.exercises').toLowerCase()} · ${day.workout.estimatedMinutes} min`
      : null;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: minTouchTarget,
        paddingVertical: spacing.xs,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <Ionicons
        name={DAY_ICON[day.kind]}
        size={18}
        color={day.kind === 'rest' ? colors.textMuted : colors.primary}
      />
      <View style={{ width: 56 }}>
        <Text variant="caption" color="muted">
          {t('common.day')} {day.dayIndex + 1}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {label}
        </Text>
        {detail ? (
          <Text variant="caption" color="muted">
            {detail}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/* ---------------------------------------------------------- tarjeta semana */

interface WeekCardProps {
  week: PlanWeek;
  expanded: boolean;
  onToggle: () => void;
}

function WeekCard({ week, expanded, onToggle }: WeekCardProps) {
  const { colors, spacing } = useTheme();

  const statusText = t(`plan.status.${week.status}`);
  const phaseText = t(`plan.phase.${week.phase}`);
  const weekText = t('plan.weekN', { n: week.weekNumber });

  const statusColor =
    week.status === 'completed'
      ? colors.success
      : week.status === 'current'
        ? colors.primary
        : colors.textMuted;

  return (
    <Card
      style={{
        marginBottom: spacing.md,
        gap: expanded ? spacing.sm : 0,
        // La semana en curso se marca también con el grosor del borde.
        borderWidth: week.status === 'current' ? 2 : 1,
        borderColor: week.status === 'current' ? colors.primary : colors.border,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${weekText}. ${phaseText}. ${statusText}`}
        accessibilityHint={`${week.workoutCount} ${t('workout.exercises').toLowerCase()}`}
        onPress={onToggle}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          minHeight: minTouchTarget,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Ionicons name={STATUS_ICON[week.status]} size={24} color={statusColor} />

        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="h3">{weekText}</Text>
          <Text variant="caption" color="muted">
            {phaseText} · {statusText}
          </Text>
        </View>

        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textMuted}
        />
      </Pressable>

      {expanded ? (
        <View>
          {week.days.map((day) => (
            <DayRow key={day.dayIndex} day={day} />
          ))}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: spacing.sm,
            }}
          >
            <Text variant="caption" color="muted">
              {t('today.steps')}
            </Text>
            <Text variant="numeric" color="muted">
              {week.stepTarget.toLocaleString('es-ES')}
            </Text>
          </View>
        </View>
      ) : null}
    </Card>
  );
}

/* ----------------------------------------------------------------- estados */

function PlanSkeleton() {
  const { spacing } = useTheme();
  return (
    <View style={{ gap: spacing.md, paddingTop: spacing.lg }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Skeleton key={i} height={76} radiusKey="xl" />
      ))}
    </View>
  );
}

/* ---------------------------------------------------------------- pantalla */

/**
 * Plan de 12 semanas.
 *
 * Las doce semanas se agrupan en tres meses porque "semana 9 de 12" no dice
 * nada por sí sola y "mes 3" sí: el usuario necesita saber en qué tramo del
 * viaje está. Cada semana lleva su fase y su estado, y al tocarla enseña los
 * siete días con lo que toca cada uno.
 */
export default function PlanScreen() {
  const { spacing } = useTheme();
  // Suscribirse al idioma hace que la pantalla se repinte al cambiarlo.
  useAppLocale();

  const { status, calendar, safety, retry } = usePlanData();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  const toggleWeek = useCallback((weekNumber: number) => {
    setExpandedWeek((current) => (current === weekNumber ? null : weekNumber));
  }, []);

  const header = (
    <View style={{ paddingTop: spacing.lg, gap: spacing.md }}>
      <View style={{ gap: spacing.xs }}>
        <Text variant="h1">{t('plan.title')}</Text>
        {calendar ? (
          <Text variant="label" color="muted">
            {t('onboarding.ready.sessions', { n: calendar.sessionsPerWeek })}
          </Text>
        ) : null}
      </View>
      <Button
        label={t('shopping.title')}
        variant="secondary"
        size="md"
        fullWidth={false}
        onPress={() => router.push('/shopping')}
      />
    </View>
  );

  const renderRow = useCallback(
    ({ item }: { item: PlanRow }) => {
      if (item.type === 'month') {
        return (
          <Text
            variant="label"
            color="muted"
            accessibilityRole="header"
            style={{ marginTop: spacing.xl, marginBottom: spacing.md }}
          >
            {t('plan.month', { n: item.month })}
          </Text>
        );
      }
      return (
        <WeekCard
          week={item.week}
          expanded={expandedWeek === item.week.weekNumber}
          onToggle={() => toggleWeek(item.week.weekNumber)}
        />
      );
    },
    [expandedWeek, spacing, toggleWeek],
  );

  if (status === 'loading') {
    return (
      <Screen>
        {header}
        <PlanSkeleton />
      </Screen>
    );
  }

  if (status === 'error') {
    return (
      <Screen>
        {header}
        <ErrorState onRetry={retry} />
      </Screen>
    );
  }

  // El cribado de seguridad manda: si bloquea, no se enseña calendario.
  if (status === 'blocked') {
    return (
      <Screen>
        {header}
        <Card style={{ gap: spacing.md, marginTop: spacing.xl }}>
          {(safety?.findings ?? []).map((finding) => (
            <Text key={finding.code} variant="body">
              {t(finding.messageKey)}
            </Text>
          ))}
          <Text variant="caption" color="muted">
            {t('disclaimer.general')}
          </Text>
        </Card>
      </Screen>
    );
  }

  if (status === 'empty' || !calendar) {
    return (
      <Screen>
        {header}
        <EmptyState />
      </Screen>
    );
  }

  return (
    <Screen scroll={false} bottomInset={0}>
      <FlatList
        data={calendar.rows}
        keyExtractor={(row) => row.key}
        renderItem={renderRow}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingBottom: spacing['4xl'] }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <Text variant="caption" color="muted" style={{ marginTop: spacing.lg }}>
            {t('disclaimer.general')}
          </Text>
        }
      />
    </Screen>
  );
}
