import { Platform, type ViewStyle } from 'react-native';

/**
 * Sombras discretas. En modo oscuro la sombra apenas se ve, así que la
 * elevación se transmite además con el color de superficie.
 */
const make = (elevation: number, opacity: number, radiusPx: number, y: number): ViewStyle =>
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: opacity,
      shadowRadius: radiusPx,
      shadowOffset: { width: 0, height: y },
    },
    android: { elevation },
    default: {},
  }) as ViewStyle;

export const shadows = {
  none: {} as ViewStyle,
  card: make(2, 0.06, 10, 2),
  raised: make(6, 0.1, 18, 6),
  sheet: make(12, 0.18, 28, -4),
} as const;

export type ShadowKey = keyof typeof shadows;
