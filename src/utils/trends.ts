/**
 * Tendencias sobre series temporales (peso, adherencia, etc.).
 *
 * Nada de estadística pesada: media móvil y regresión lineal simple.
 * Ninguna función divide entre cero ni devuelve NaN.
 */

import { clamp, roundTo, safeNumber } from '@/utils/units';

/** Punto de peso registrado por el usuario. */
export interface WeightPoint {
  /** Fecha ISO (yyyy-mm-dd) o cualquier cosa que Date sepa parsear. */
  date: string;
  weightKg: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_WEEK = 7;

/**
 * Media móvil con ventana hacia atrás.
 *
 * Devuelve un array de la misma longitud que la entrada. Los primeros
 * elementos usan la ventana parcial disponible (no se descartan), así el
 * usuario ve tendencia desde el primer día. Ventana <= 0 o serie vacía -> [].
 */
export function movingAverage(values: number[], window: number): number[] {
  const size = Math.trunc(safeNumber(window));
  if (!Array.isArray(values) || values.length === 0 || size <= 0) return [];

  const out: number[] = [];
  for (let i = 0; i < values.length; i += 1) {
    const from = Math.max(0, i - size + 1);
    const slice = values.slice(from, i + 1);
    let sum = 0;
    for (const v of slice) sum += safeNumber(v);
    // slice.length nunca es 0 aquí: i >= from siempre.
    out.push(sum / slice.length);
  }
  return out;
}

export interface WeightTrend {
  /** Pendiente en kg por semana. Negativo = bajando. */
  kgPerWeek: number;
  /** Nº de puntos usados. Con menos de 2 la tendencia es 0. */
  sampleSize: number;
  /** Días cubiertos entre el primer y el último punto. */
  spanDays: number;
  /** true si hay datos suficientes para que el dato signifique algo. */
  reliable: boolean;
}

/**
 * Tendencia de peso por regresión lineal simple (mínimos cuadrados) sobre
 * los días transcurridos. Es robusta frente al ruido diario (agua, glucógeno)
 * porque usa TODOS los puntos, no solo el primero y el último.
 *
 * Es una ESTIMACIÓN de la tendencia observada, no una previsión ni una promesa.
 */
export function weightTrend(points: WeightPoint[]): WeightTrend {
  const empty: WeightTrend = { kgPerWeek: 0, sampleSize: 0, spanDays: 0, reliable: false };
  if (!Array.isArray(points) || points.length === 0) return empty;

  // Se ignoran puntos con fecha o peso inválidos.
  const parsed = points
    .map((p) => ({ t: new Date(p.date).getTime(), w: safeNumber(p.weightKg) }))
    .filter((p) => Number.isFinite(p.t) && p.w > 0)
    .sort((a, b) => a.t - b.t);

  if (parsed.length < 2) {
    return { ...empty, sampleSize: parsed.length };
  }

  const t0 = parsed[0].t;
  const xs = parsed.map((p) => (p.t - t0) / MS_PER_DAY);
  const ys = parsed.map((p) => p.w);
  const n = parsed.length;
  const spanDays = xs[n - 1];

  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = xs[i] - meanX;
    numerator += dx * (ys[i] - meanY);
    denominator += dx * dx;
  }

  // Todos los puntos el mismo día: sin eje X no hay pendiente.
  if (denominator === 0) {
    return { kgPerWeek: 0, sampleSize: n, spanDays, reliable: false };
  }

  const kgPerDay = numerator / denominator;
  return {
    kgPerWeek: roundTo(kgPerDay * DAYS_PER_WEEK, 3),
    sampleSize: n,
    spanDays: roundTo(spanDays, 1),
    // Con menos de 2 semanas o menos de 4 pesadas el ruido domina la señal.
    reliable: n >= 4 && spanDays >= 10,
  };
}

/**
 * Adherencia 0..1. `planned <= 0` devuelve 0 (no hay nada planificado,
 * no se puede presumir 100%). Nunca divide entre cero y nunca pasa de 1.
 */
export function adherence(completed: number, planned: number): number {
  const done = Math.max(0, safeNumber(completed));
  const total = safeNumber(planned);
  if (total <= 0) return 0;
  return clamp(done / total, 0, 1);
}

/**
 * Adherencia media de varias semanas. Sin semanas -> 0.
 */
export function averageAdherence(values: number[]): number {
  if (!Array.isArray(values) || values.length === 0) return 0;
  const sum = values.reduce((acc, v) => acc + clamp(safeNumber(v), 0, 1), 0);
  return clamp(sum / values.length, 0, 1);
}
