import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/providers/theme-provider';

export interface CardProps extends ViewProps {
  elevated?: boolean;
  padded?: boolean;
}

export function Card({ elevated, padded = true, style, ...rest }: CardProps) {
  const { colors, radius, spacing, shadows } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: elevated ? colors.surfaceElevated : colors.surface,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          padding: padded ? spacing.lg : 0,
        },
        elevated ? shadows.raised : shadows.card,
        style,
      ]}
      {...rest}
    />
  );
}
