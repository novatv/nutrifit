import { Platform, type TextStyle } from 'react-native';

/**
 * Tipografía. Se apoya en la fuente del sistema (San Francisco / Roboto):
 * es la que mejor rinde en móvil y respeta los ajustes de accesibilidad
 * del usuario sin coste de carga.
 */
const family = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

const familyMedium = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  default: 'System',
});

export const typography = {
  /** Cifras grandes de panel: calorías, peso, volumen. */
  display: {
    fontFamily: familyMedium,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: '700',
    letterSpacing: -0.8,
  } as TextStyle,
  h1: {
    fontFamily: familyMedium,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.4,
  } as TextStyle,
  h2: {
    fontFamily: familyMedium,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.2,
  } as TextStyle,
  h3: {
    fontFamily: familyMedium,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
  } as TextStyle,
  body: {
    fontFamily: family,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
  } as TextStyle,
  bodyStrong: {
    fontFamily: familyMedium,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  } as TextStyle,
  caption: {
    fontFamily: family,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  } as TextStyle,
  /** Etiquetas en mayúsculas: secciones, estados. */
  label: {
    fontFamily: familyMedium,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  } as TextStyle,
  /** Cifras que se alinean en columna (series, macros). */
  numeric: {
    fontFamily: familyMedium,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  } as TextStyle,
} as const;

export type TypographyKey = keyof typeof typography;
