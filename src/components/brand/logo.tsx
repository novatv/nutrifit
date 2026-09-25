import { Image } from 'expo-image';
import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/providers';

export interface LogoProps {
  /** Alto del bloque; el logo es cuadrado, así que el ancho es el mismo. */
  size?: 'sm' | 'md' | 'lg';
  /** Se mantiene por compatibilidad: el logo oficial ya incluye el nombre. */
  markOnly?: boolean;
  style?: ViewStyle;
}

const SIZES = { sm: 44, md: 64, lg: 160 } as const;

/**
 * Logotipo oficial de YL Nutrición (assets/images/logo.png).
 *
 * El archivo lleva fondo blanco, así que en modo oscuro se enmarca con un
 * radio y un borde fino en vez de dejar un cuadrado blanco flotando.
 */
export function Logo({ size = 'md', style }: LogoProps) {
  const { colors, radius } = useTheme();
  const px = SIZES[size];

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="YL Nutrición"
      style={[
        {
          width: px,
          height: px,
          borderRadius: radius.md,
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Image
        source={require('@/assets/images/logo.png')}
        style={{ width: '100%', height: '100%' }}
        contentFit="contain"
        transition={100}
      />
    </View>
  );
}
