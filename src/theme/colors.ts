/**
 * Paleta de YL Nutrición.
 *
 * Sale del logo: oro metálico y verde hoja sobre blanco. El oro es la marca y
 * se gasta con cuentagotas (acción principal, logotipo, un detalle por
 * pantalla); el verde es el color de trabajo: progreso, éxito, lo que va bien.
 * El resto del cromo se mantiene neutro y cálido para que el oro no se vea
 * chillón y el verde no se convierta en una app de colorines.
 *
 * Los macronutrientes llevan su propia paleta de datos, deliberadamente
 * separada del oro y del verde de marca para que nunca se confundan.
 */

const palette = {
  // Oro de marca. Cuidado: sobre fondo claro el oro medio no tiene contraste
  // suficiente para texto pequeño; para texto se usa el oscuro.
  gold100: '#F7EDCF',
  gold300: '#E5C76B',
  gold500: '#C8A548',
  gold700: '#9C7A2A',
  gold900: '#6B5218',

  // Verde hoja.
  leaf100: '#E4F1DD',
  leaf300: '#8FCB6A',
  leaf500: '#4C8C2B',
  leaf700: '#2F6B1E',
  leaf900: '#1B4212',

  // Neutros cálidos, con un sesgo mínimo hacia el oro.
  ink900: '#141310',
  ink800: '#1C1A16',
  ink700: '#262320',
  ink600: '#35312B',
  ink500: '#514B42',
  ink400: '#7A7266',
  ink300: '#A39A8C',
  ink200: '#CBC4B7',
  ink100: '#E6E1D7',
  ink50: '#F6F3EC',
  white: '#FFFFFF',

  // Datos: un tono por macro, lejos del oro y del verde de marca.
  protein: '#D9534F',
  carbs: '#F0873A',
  fat: '#8E6CF0',
  fiber: '#3AA6B9',

  // Semánticos.
  success: '#4C8C2B',
  warning: '#D99A1E',
  danger: '#D14343',
  info: '#3A7BB9',
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
  /** Acción principal. */
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  primarySubtle: string;
  /** Oro de marca, para el logotipo y un detalle por pantalla. */
  brand: string;
  brandSubtle: string;
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
  primary: palette.leaf500,
  primaryPressed: palette.leaf700,
  onPrimary: palette.white,
  primarySubtle: palette.leaf100,
  brand: palette.gold700,
  brandSubtle: palette.gold100,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,
  info: palette.info,
  macroProtein: palette.protein,
  macroCarbs: palette.carbs,
  macroFat: palette.fat,
  macroFiber: palette.fiber,
  track: palette.ink100,
  overlay: 'rgba(20,19,16,0.45)',
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
  primary: palette.leaf300,
  primaryPressed: palette.leaf500,
  onPrimary: palette.ink900,
  primarySubtle: 'rgba(143,203,106,0.14)',
  // En oscuro el oro brilla solo; se usa el claro para que no se apague.
  brand: palette.gold300,
  brandSubtle: 'rgba(229,199,107,0.12)',
  success: palette.leaf300,
  warning: '#E8B347',
  danger: '#E86B6B',
  info: '#6FA6DA',
  macroProtein: '#E8706C',
  macroCarbs: '#F59C5A',
  macroFat: '#A48CF5',
  macroFiber: '#5BBFD0',
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
