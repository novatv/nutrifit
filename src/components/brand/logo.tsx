import { View, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui';
import { useTheme } from '@/providers';

export interface LogoProps {
  /** Alto del bloque; el ancho se deriva. */
  size?: 'sm' | 'md' | 'lg';
  /** Sin la palabra "nutrición", solo el monograma. */
  markOnly?: boolean;
  style?: ViewStyle;
}

const SIZES = { sm: 18, md: 26, lg: 40 } as const;

/**
 * Logotipo tipográfico de YL Nutrición.
 *
 * Reproduce el bloque del logo oficial —"YL" en oro, "nutrición" en verde—
 * con texto, para que la marca esté presente desde el primer arranque sin
 * depender de un archivo. Cuando el PNG oficial esté en
 * `assets/images/logo.png`, este componente es el único sitio que cambiar.
 */
export function Logo({ size = 'md', markOnly = false, style }: LogoProps) {
  const { colors, spacing } = useTheme();
  const px = SIZES[size];

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="YL Nutrición"
      style={[{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs }, style]}
    >
      <Text
        style={{
          fontSize: px,
          lineHeight: px * 1.1,
          fontWeight: '900',
          letterSpacing: -px * 0.04,
          color: colors.brand,
        }}
      >
        YL
      </Text>
      {markOnly ? null : (
        <Text
          style={{
            fontSize: px * 0.72,
            lineHeight: px * 1.1,
            fontWeight: '700',
            letterSpacing: -px * 0.01,
            color: colors.primary,
          }}
        >
          nutrición
        </Text>
      )}
    </View>
  );
}
