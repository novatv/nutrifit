/** Radios. La app usa esquinas generosas en tarjetas y suaves en controles. */
export const radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  pill: 999,
} as const;

export type RadiusKey = keyof typeof radius;
