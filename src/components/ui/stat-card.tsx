import { View } from 'react-native';

import { useTheme } from '@/providers/theme-provider';
import { Card } from './card';
import { ProgressBar } from './progress';
import { Text } from './text';

export interface StatCardProps {
  label: string;
  value: number;
  target?: number;
  unit?: string;
  color?: string;
  /** Muestra la barra de avance cuando hay objetivo. */
  showBar?: boolean;
}

/**
 * Cifra con su objetivo. El estado se lee del número y de la barra, nunca
 * solo del color: hay que poder entenderlo sin distinguir tonos.
 */
export function StatCard({ label, value, target, unit, color, showBar = true }: StatCardProps) {
  const { spacing, typography } = useTheme();
  return (
    <Card style={{ flex: 1, gap: spacing.sm }}>
      <Text variant="label" color="muted">{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
        <Text style={typography.h2}>{Math.round(value).toLocaleString('es-ES')}</Text>
        {target !== undefined ? (
          <Text variant="caption" color="muted">
            / {Math.round(target).toLocaleString('es-ES')}{unit ? ` ${unit}` : ''}
          </Text>
        ) : unit ? (
          <Text variant="caption" color="muted">{unit}</Text>
        ) : null}
      </View>
      {showBar && target !== undefined ? (
        <ProgressBar value={value} max={target} color={color} label={label} />
      ) : null}
    </Card>
  );
}
