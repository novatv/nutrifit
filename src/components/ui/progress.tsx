import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useTheme } from '@/providers/theme-provider';
import { Text } from './text';

const clamp01 = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0);

export interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
  label?: string;
  /** Texto accesible; si falta se compone con label y valores. */
  accessibilityLabel?: string;
}

export function ProgressBar({
  value,
  max,
  color,
  height = 8,
  label,
  accessibilityLabel,
}: ProgressBarProps) {
  const { colors, radius } = useTheme();
  const ratio = clamp01(max > 0 ? value / max : 0);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? `${label ?? ''} ${Math.round(value)} de ${Math.round(max)}`}
      accessibilityValue={{ min: 0, max: Math.round(max), now: Math.round(value) }}
    >
      <View style={{ height, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden' }}>
        <View
          style={{
            width: `${ratio * 100}%`,
            height: '100%',
            borderRadius: radius.pill,
            backgroundColor: color ?? colors.primary,
          }}
        />
      </View>
    </View>
  );
}

export interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  thickness?: number;
  color?: string;
  caption?: string;
  center?: React.ReactNode;
}

/** Anillo de progreso. Nunca pasa del 100% visual aunque el valor se exceda. */
export function ProgressRing({
  value,
  max,
  size = 120,
  thickness = 10,
  color,
  caption,
  center,
}: ProgressRingProps) {
  const { colors } = useTheme();
  const ratio = clamp01(max > 0 ? value / max : 0);
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <View
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={caption}
      accessibilityValue={{ min: 0, max: Math.round(max), now: Math.round(value) }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.track} strokeWidth={thickness} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color ?? colors.primary}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - ratio)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {center ?? (caption ? <Text variant="caption" color="muted">{caption}</Text> : null)}
    </View>
  );
}
