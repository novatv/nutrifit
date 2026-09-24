/**
 * Paleta.
 *
 * Criterio: la interfaz es sobria y el color se reserva para los datos.
 * Los macronutrientes son lo que el usuario mira veinte veces al día, así que
 * se llevan la paleta viva; el resto del cromo se mantiene neutro para no
 * competir con ellos. Los neutros tienen un sesgo frío-verdoso para armonizar
 * con el esmeralda de marca en vez de ser grises puros.
 */

const palette = {
  // Marca: un solo acento, usado con moderación (CTA principal, anillos, rachas).
  emerald50: '#E6F7F1',
  emerald200: '#9BE3CB',
  emerald400: '#35C79A',
  emerald500: '#12B886',
  emerald600: '#0E9A70',
  emerald700: '#0A7355',

  // Neutros con sesgo frío-verdoso.
  ink900: '#0C1311',
  ink800: '#121A18',
  ink700: '#1A2422',
  ink600: '#25322F',
  ink500: '#3A4A46',
  ink400: '#5C706B',
  ink300: '#8A9B96',
  ink200: '#B9C6C2',
  ink100: '#DCE5E2',
  ink50: '#F1F5F4',
  white: '#FFFFFF',

  // Datos: un tono por macro, separados en matiz para distinguirse de un vistazo.
  protein: '#FF6B6B',
  carbs: '#FFA94D',
  fat: '#9775FA',
  fiber: '#4DABF7',

  // Semánticos, independientes del acento de marca.
  success: '#2FB344',
  warning: '#F0A202',
  danger: '#E5484D',
  info: '#4DABF7',
} as const;

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  primarySubtle: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  macroProtein: string;
  macroCarbs: string;
  macroFat: string;
  macroFiber: string;
  track: string;
  overlay: string;
  skeleton: string;
}

export const lightColors: ThemeColors = {
  background: palette.ink50,
  surface: palette.white,
  surfaceElevated: palette.white,
  border: palette.ink100,
  borderStrong: palette.ink200,
  text: palette.ink900,
  textMuted: palette.ink400,
  textInverse: palette.white,
  primary: palette.emerald600,
  primaryPressed: palette.emerald700,
  onPrimary: palette.white,
  primarySubtle: palette.emerald50,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  info: palette.info,
  macroProtein: palette.protein,
  macroCarbs: palette.carbs,
  macroFat: palette.fat,
  macroFiber: palette.fiber,
  track: palette.ink100,
  overlay: 'rgba(12,19,17,0.45)',
  skeleton: palette.ink100,
};

export const darkColors: ThemeColors = {
  background: palette.ink900,
  surface: palette.ink800,
  surfaceElevated: palette.ink700,
  border: palette.ink700,
  borderStrong: palette.ink600,
  text: palette.ink50,
  textMuted: palette.ink300,
  textInverse: palette.ink900,
  primary: palette.emerald500,
  primaryPressed: palette.emerald400,
  onPrimary: palette.ink900,
  primarySubtle: 'rgba(18,184,134,0.14)',
  success: '#48C95F',
  warning: '#F5B93B',
  danger: '#FF6369',
  info: palette.fiber,
  macroProtein: palette.protein,
  macroCarbs: palette.carbs,
  macroFat: palette.fat,
  macroFiber: palette.fiber,
  track: palette.ink600,
  overlay: 'rgba(0,0,0,0.6)',
  skeleton: palette.ink700,
};

/** Color de cada macro, para gráficas y anillos. */
export const macroColor = (
  c: ThemeColors,
  macro: 'protein' | 'carbs' | 'fat' | 'fiber',
): string =>
  ({
    protein: c.macroProtein,
    carbs: c.macroCarbs,
    fat: c.macroFat,
    fiber: c.macroFiber,
  })[macro];

export { palette };
