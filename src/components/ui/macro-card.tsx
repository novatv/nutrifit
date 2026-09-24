import { View } from 'react-native';

import { useTheme } from '@/providers/theme-provider';
import { t } from '@/i18n';
import type { MacroTargets } from '@/types/domain';
import { Card } from './card';
import { ProgressBar } from './progress';
import { Text } from './text';

export interface MacroCardProps {
  consumed: MacroTargets;
  target: MacroTargets;
}

/** Las cuatro barras de macros, cada una con su color de la paleta de datos. */
export function MacroCard({ consumed, target }: MacroCardProps) {
  const { colors, spacing } = useTheme();

  const rows = [
    { key: 'protein', label: t('today.protein'), value: consumed.proteinG, max: target.proteinG, color: colors.macroProtein },
    { key: 'carbs', label: t('today.carbs'), value: consumed.carbsG, max: target.carbsG, color: colors.macroCarbs },
    { key: 'fat', label: t('today.fat'), value: consumed.fatG, max: target.fatG, color: colors.macroFat },
    { key: 'fiber', label: t('today.fiber'), value: consumed.fiberG, max: target.fiberG, color: colors.macroFiber },
  ];

  return (
    <Card style={{ gap: spacing.lg }}>
      {rows.map((row) => (
        <View key={row.key} style={{ gap: spacing.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Text variant="bodyStrong">{row.label}</Text>
            <Text variant="numeric" color="muted">
              {Math.round(row.value)} / {Math.round(row.max)} g
            </Text>
          </View>
          <ProgressBar value={row.value} max={row.max} color={row.color} label={row.label} />
        </View>
      ))}
    </Card>
  );
}
