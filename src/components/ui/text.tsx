import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { useTheme } from '@/providers/theme-provider';
import type { TypographyKey } from '@/theme';

export interface TextProps extends RNTextProps {
  variant?: TypographyKey;
  color?: 'default' | 'muted' | 'inverse' | 'primary' | 'danger' | 'success';
  center?: boolean;
}

/** Texto del sistema. Respeta el tamaño de fuente del dispositivo. */
export function Text({
  variant = 'body',
  color = 'default',
  center,
  style,
  ...rest
}: TextProps) {
  const { colors, typography } = useTheme();
  const tone = {
    default: colors.text,
    muted: colors.textMuted,
    inverse: colors.textInverse,
    primary: colors.primary,
    danger: colors.danger,
    success: colors.success,
  }[color];

  return (
    <RNText
      style={[typography[variant], { color: tone }, center && { textAlign: 'center' }, style]}
      {...rest}
    />
  );
}
