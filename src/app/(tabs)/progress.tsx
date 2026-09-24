import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { LineChart, type SeriesMode } from '@/components/charts/line-chart';
import {
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Screen,
  Skeleton,
  StatCard,
  Text,
} from '@/components/ui';
import {
  PROGRESS_TABS,
  useProgressData,
  type ProgressData,
  type ProgressTab,
} from '@/features/progress/use-progress-data';
import { t } from '@/i18n';
import { useTheme } from '@/providers';

/* ------------------------------------------------------------------ peso */

function WeightTab({ data }: { data: ProgressData }) {
  const { colors, spacing } = useTheme();
  const { weight } = data;

  if (!weight.hasEnoughHistory) {
    return <EmptyState body={t('progress.noData')} />;
  }

  const kgPerWeek = weight.trend.kgPerWeek;

  return (
    <View style={{ gap: spacing.lg }}>
      <Card style={{ gap: spacing.md }}>
        {/*
          Los puntos diarios van discretos y la tendencia gruesa: el peso
          oscila por agua y sal, y dramatizar esas subidas es la forma más
          rápida de que alguien se desanime por un dato que no significa nada.
        */}
        <LineChart
          height={200}
          minSpan={2}
          accessibilityLabel={`${t('progress.tabs.weight')}. ${t('progress.trend')}: ${kgPerWeek.toFixed(2)} kg/${t('common.week').toLowerCase()}`}
          labels={weight.dates}
          series={[
            {
              id: 'daily',
              values: weight.daily,
              color: colors.textMuted,
              mode: 'dots' as SeriesMode,
              dotRadius: 2,
              opacity: 0.5,
            },
            {
              id: 'trend',
              values: weight.trendLine,
              color: colors.primary,
              mode: 'line' as SeriesMode,
              strokeWidth: 3,
            },
          ]}
        />
        <View style={{ flexDirection: 'row', gap: spacing.lg }}>
          <View style={{ flex: 1 }}>
            <Text variant="label" color="muted">
              {t('progress.trend')}
            </Text>
            <Text variant="h3">
              {kgPerWeek > 0 ? '+' : ''}
              {kgPerWeek.toFixed(2)} kg
            </Text>
          </View>
          {weight.latestKg !== null ? (
            <View style={{ flex: 1 }}>
              <Text variant="label" color="muted">
                {t('progress.measurement.weight')}
              </Text>
              <Text variant="h3">{weight.latestKg.toFixed(1)} kg</Text>
            </View>
          ) : null}
        </View>
        <Text variant="caption" color="muted">
          {t('progress.dailyPoints')}
        </Text>
      </Card>
    </View>
  );
}

/* -------------------------------------------------------------- medidas */

function MeasurementsTab({ data }: { data: ProgressData }) {
  const { spacing } = useTheme();
  if (data.measurements.length === 0) return <EmptyState />;

  const latest = data.measurements[0];
  const rows: [string, number, string][] = [
    [t('progress.measurement.waist'), latest.waistCm, 'cm'],
    [t('progress.measurement.hip'), latest.hipCm, 'cm'],
    [t('progress.measurement.chest'), latest.chestCm, 'cm'],
    [t('progress.measurement.arm'), latest.armCm, 'cm'],
    [t('progress.measurement.thigh'), latest.thighCm, 'cm'],
  ];

  return (
    <View style={{ gap: spacing.lg }}>
      <Card style={{ gap: spacing.md }}>
        {rows.map(([label, value, unit]) => (
          <View
            key={label}
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text variant="body">{label}</Text>
            <Text variant="numeric">
              {value} {unit}
            </Text>
          </View>
        ))}
      </Card>
      <Card style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="body">{t('progress.measurement.bodyFat')}</Text>
          <Text variant="numeric">{latest.bodyFatPct} %</Text>
        </View>
        <Text variant="caption" color="muted">
          {t('progress.bodyFatHint')}
        </Text>
      </Card>
    </View>
  );
}

/* --------------------------------------------------------------- fuerza */

function StrengthTab({ data }: { data: ProgressData }) {
  const { colors, spacing } = useTheme();
  if (data.strength.length === 0) return <EmptyState />;

  return (
    <View style={{ gap: spacing.lg }}>
      {data.strength.map((serie) => (
        <Card key={serie.exerciseSlug} style={{ gap: spacing.md }}>
          <Text variant="h3">{serie.name}</Text>
          <LineChart
            height={120}
            minSpan={10}
            accessibilityLabel={serie.name}
            series={[
              {
                id: serie.exerciseSlug,
                values: serie.points.map((p) => p.estimated1RmKg),
                color: colors.primary,
                mode: 'line' as SeriesMode,
                strokeWidth: 2,
              },
            ]}
          />
          <Text variant="caption" color="muted">
            {t('disclaimer.estimate')}
          </Text>
        </Card>
      ))}
    </View>
  );
}

/* ------------------------------------------------------------ nutrición */

function NutritionTab({ data }: { data: ProgressData }) {
  const { colors, spacing } = useTheme();
  const { nutrition } = data;

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <StatCard
          label={t('today.calories')}
          value={nutrition.averageKcal}
          target={nutrition.targetKcal}
        />
        <StatCard
          label={t('today.protein')}
          value={nutrition.averageProteinG}
          unit="g"
          showBar={false}
        />
      </View>
      <Card style={{ gap: spacing.md }}>
        <Text variant="label" color="muted">
          {t('today.calories')}
        </Text>
        <LineChart
          height={140}
          accessibilityLabel={t('today.calories')}
          series={[
            {
              id: 'kcal',
              values: nutrition.days.map((d) => d.kcal),
              color: colors.macroCarbs,
              mode: 'line' as SeriesMode,
              strokeWidth: 2,
            },
          ]}
        />
      </Card>
    </View>
  );
}

/* ----------------------------------------------------------- actividad */

function ActivityTab({ data }: { data: ProgressData }) {
  const { colors, spacing } = useTheme();
  const { activity } = data;

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <StatCard label={t('today.steps')} value={activity.averageSteps} showBar={false} />
        <StatCard
          label={t('workout.exercises')}
          value={activity.sessions}
          showBar={false}
        />
      </View>
      <Card style={{ gap: spacing.md }}>
        <Text variant="label" color="muted">
          {t('today.steps')}
        </Text>
        <LineChart
          height={140}
          accessibilityLabel={t('today.steps')}
          series={[
            {
              id: 'steps',
              values: activity.days.map((d) => d.steps),
              color: colors.macroFiber,
              mode: 'line' as SeriesMode,
              strokeWidth: 2,
            },
          ]}
        />
      </Card>
    </View>
  );
}

/* ------------------------------------------------------------- general */

function GeneralTab({ data }: { data: ProgressData }) {
  const { spacing } = useTheme();
  const { weight, nutrition, activity } = data;

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <StatCard
          label={t('progress.measurement.weight')}
          value={weight.latestKg ?? 0}
          unit="kg"
          showBar={false}
        />
        <StatCard
          label={t('today.adherenceWeek')}
          value={Math.round(nutrition.adherence * 100)}
          unit="%"
          showBar={false}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <StatCard label={t('today.steps')} value={activity.averageSteps} showBar={false} />
        <StatCard
          label={t('workout.duration')}
          value={activity.totalTrainingMinutes}
          unit="min"
          showBar={false}
        />
      </View>
      {weight.hasEnoughHistory ? <WeightTab data={data} /> : null}
    </View>
  );
}

/* ------------------------------------------------------------ pantalla */

const TAB_CONTENT: Record<ProgressTab, (data: ProgressData) => React.ReactNode> = {
  general: (d) => <GeneralTab data={d} />,
  weight: (d) => <WeightTab data={d} />,
  measurements: (d) => <MeasurementsTab data={d} />,
  strength: (d) => <StrengthTab data={d} />,
  nutrition: (d) => <NutritionTab data={d} />,
  activity: (d) => <ActivityTab data={d} />,
};

export default function ProgressScreen() {
  const { spacing } = useTheme();
  const [tab, setTab] = useState<ProgressTab>('general');
  const { status, data, retry } = useProgressData();

  return (
    <Screen>
      <View style={{ paddingTop: spacing.lg, gap: spacing.lg }}>
        <Text variant="h1">{t('progress.title')}</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.lg }}
        >
          {PROGRESS_TABS.map((key) => (
            <Chip
              key={key}
              label={t(`progress.tabs.${key}`)}
              selected={tab === key}
              onPress={() => setTab(key)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        {status === 'loading' ? (
          <View style={{ gap: spacing.md }}>
            <Skeleton height={96} />
            <Skeleton height={200} />
          </View>
        ) : status === 'error' ? (
          <ErrorState onRetry={retry} />
        ) : status === 'empty' || !data ? (
          <EmptyState />
        ) : (
          TAB_CONTENT[tab](data)
        )}
      </View>
    </Screen>
  );
}
