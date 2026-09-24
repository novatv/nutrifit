/** Escala de espaciado en múltiplos de 4. Usar siempre estos valores, nunca números sueltos. */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
} as const;

export type SpacingKey = keyof typeof spacing;

/** Margen lateral de pantalla. Constante en toda la app. */
export const screenPadding = spacing.lg;

/** Altura mínima táctil recomendada (accesibilidad). */
export const minTouchTarget = 44;
