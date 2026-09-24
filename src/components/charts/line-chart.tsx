/**
 * Gráfica de línea con `react-native-svg`.
 *
 * Criterio de diseño, que aquí importa más que el código:
 *
 * - **La tendencia manda.** Una serie puede pintarse como línea (`line`) o
 *   como puntos sueltos (`dots`). Los registros diarios van de puntos
 *   discretos y la media móvil de línea gruesa, para que el usuario lea la
 *   dirección y no el ruido de la báscula de esta mañana.
 * - **El eje Y no exagera.** El dominio se calcula sobre los datos pero nunca
 *   se estrecha por debajo de `minSpan`: sin ese suelo, 300 g de agua parecen
 *   una montaña y una semana normal parece un desastre.
 * - **Sin colores literales.** Cada serie recibe su color de `useTheme()`.
 * - **Accesible.** El SVG entero es un único elemento con su etiqueta: un
 *   lector de pantalla no puede recorrer 60 círculos, así que el resumen
 *   numérico lo pone la pantalla al lado de la gráfica.
 */

import { useState } from 'react';
import { View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { Text } from '@/components/ui';
import { useTheme } from '@/providers/theme-provider';

/* ------------------------------------------------------------------ tipos */

export type SeriesMode = 'line' | 'dots';

export interface ChartSeries {
  id: string;
  /** Un `null` es un hueco real (día sin medir): no se interpola. */
  values: (number | null)[];
  color: string;
  mode?: SeriesMode;
  strokeWidth?: number;
  dotRadius?: number;
  opacity?: number;
}

export interface LineChartProps {
  series: ChartSeries[];
  /** Etiquetas del eje X. Solo se pintan la primera y la última. */
  labels?: string[];
  height?: number;
  /** Amplitud mínima del eje Y en unidades del dato. */
  minSpan?: number;
  /** Nº de líneas de referencia horizontales. */
  gridLines?: number;
  /** Obligatoria: la gráfica es una sola unidad para el lector de pantalla. */
  accessibilityLabel: string;
  style?: ViewStyle;
}

/* -------------------------------------------------------------- utilidades */

interface Domain {
  min: number;
  max: number;
}

/** Dominio vertical con margen y amplitud mínima. Nunca devuelve min === max. */
export function computeDomain(values: number[], minSpan: number): Domain {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) return { min: 0, max: minSpan || 1 };

  let min = Math.min(...finite);
  let max = Math.max(...finite);
  const span = max - min;
  const target = Math.max(span * 1.4, minSpan);
  const pad = (target - span) / 2;
  min -= pad;
  max += pad;

  if (max - min <= 0) {
    min -= 0.5;
    max += 0.5;
  }
  return { min, max };
}

/** Puntos de una serie ya proyectados al lienzo, saltando los huecos. */
function project(
  values: (number | null)[],
  domain: Domain,
  width: number,
  height: number,
  pad: number,
): { x: number; y: number }[] {
  const inner = Math.max(1, width - pad * 2);
  const innerH = Math.max(1, height - pad * 2);
  const step = values.length > 1 ? inner / (values.length - 1) : 0;
  const range = domain.max - domain.min || 1;

  return values.flatMap((value, index) => {
    if (value === null || !Number.isFinite(value)) return [];
    const x = pad + step * index;
    const y = pad + innerH * (1 - (value - domain.min) / range);
    return [{ x, y }];
  });
}

/** Path SVG de una polilínea. Cadena vacía si no hay al menos dos puntos. */
function toPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');
}

/* ------------------------------------------------------------- componente */

export function LineChart({
  series,
  labels,
  height = 180,
  minSpan = 1,
  gridLines = 3,
  accessibilityLabel,
  style,
}: LineChartProps) {
  const { colors, spacing } = useTheme();
  const [width, setWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const allValues = series.flatMap((s) =>
    s.values.filter((v): v is number => v !== null && Number.isFinite(v)),
  );
  const domain = computeDomain(allValues, minSpan);
  const pad = spacing.md;

  const gridRows = Array.from({ length: Math.max(2, gridLines) }, (_, i) => i);

  return (
    <View style={style} accessible accessibilityLabel={accessibilityLabel}>
      <View onLayout={onLayout} style={{ height }}>
        {width > 0 ? (
          <Svg width={width} height={height}>
            {gridRows.map((row) => {
              const ratio = row / (gridRows.length - 1);
              const y = pad + (height - pad * 2) * ratio;
              return (
                <Line
                  key={`grid-${row}`}
                  x1={pad}
                  x2={width - pad}
                  y1={y}
                  y2={y}
                  stroke={colors.border}
                  strokeWidth={1}
                />
              );
            })}

            {series.map((s) => {
              const points = project(s.values, domain, width, height, pad);
              const mode: SeriesMode = s.mode ?? 'line';

              if (mode === 'dots') {
                return points.map((p, i) => (
                  <Circle
                    key={`${s.id}-dot-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r={s.dotRadius ?? 2.5}
                    fill={s.color}
                    opacity={s.opacity ?? 0.45}
                  />
                ));
              }

              const d = toPath(points);
              if (!d) {
                // Un solo punto: se marca igualmente para no dejar el hueco vacío.
                return points.map((p, i) => (
                  <Circle key={`${s.id}-single-${i}`} cx={p.x} cy={p.y} r={3.5} fill={s.color} />
                ));
              }
              return (
                <Path
                  key={s.id}
                  d={d}
                  stroke={s.color}
                  strokeWidth={s.strokeWidth ?? 2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  opacity={s.opacity ?? 1}
                />
              );
            })}
          </Svg>
        ) : null}
      </View>

      {labels && labels.length > 0 ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: spacing.xs,
          }}
        >
          <Text variant="caption" color="muted">
            {labels[0]}
          </Text>
          <Text variant="caption" color="muted">
            {labels[labels.length - 1]}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
