/**
 * Datos de la pantalla de Progreso.
 *
 * Reglas que salen de aquí y no de la vista, porque son decisiones sobre los
 * datos y no sobre píxeles:
 *
 * - **Sin dos semanas de historial no hay tendencia.** Con cuatro pesadas en
 *   cinco días la regresión da una pendiente preciosa y completamente falsa.
 *   Antes de `MIN_TREND_DAYS` la pantalla enseña `progress.noData` en lugar de
 *   una cifra inventada.
 * - **La media móvil es de 7 días.** Es el ciclo natural de la vida de la
 *   gente (fin de semana incluido), así que suaviza justo el ruido que sobra.
 * - **Los huecos son huecos.** Un día sin pesarse entra como `null` y la
 *   gráfica no lo interpola: la báscula no midió, no hay dato.
 * - **Un único `status`.** La pantalla no deduce si está cargando, vacía o
 *   rota: lo lee.
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  demoActivityDays,
  demoMeasurements,
  demoNutritionDays,
  demoProgressPhotos,
  demoStrength,
  demoTargets,
  demoWeights,
  type DemoActivityDay,
  type DemoMeasurement,
  type DemoNutritionDay,
  type DemoStrengthSeries,
} from '@/services/demo-data';
import { toActivityDays } from '@/domain/health/activityFromHealth';
import { useHealthDays } from '@/stores/health-store';
import { averageAdherence, movingAverage, weightTrend, type WeightTrend } from '@/utils/trends';
import { roundTo } from '@/utils/units';

/* ------------------------------------------------------------------ tipos */

export type ProgressStatus = 'loading' | 'error' | 'empty' | 'success';

export const PROGRESS_TABS = [
  'general',
  'weight',
  'measurements',
  'body',
  'strength',
  'nutrition',
  'activity',
] as const;

export type ProgressTab = (typeof PROGRESS_TABS)[number];

export interface WeightEntry {
  /** Fecha ISO yyyy-mm-dd. */
  date: string;
  weightKg: number;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  uri: string;
}

export interface WeightSeries {
  /** Un punto por día del rango, con `null` en los días sin pesada. */
  daily: (number | null)[];
  /** Media móvil sobre los días medidos, alineada con `daily`. */
  trendLine: (number | null)[];
  /** Fechas de cada posición de `daily`. */
  dates: string[];
  trend: WeightTrend;
  /** Días cubiertos entre la primera y la última pesada. */
  spanDays: number;
  /** true si hay historial suficiente para enseñar una tendencia. */
  hasEnoughHistory: boolean;
  latestKg: number | null;
  /** Diferencia respecto a la primera pesada; `null` si no hay dos. */
  totalChangeKg: number | null;
}

export interface NutritionSummary {
  days: DemoNutritionDay[];
  averageKcal: number;
  averageProteinG: number;
  /** 0..1 */
  adherence: number;
  targetKcal: number;
}

export interface ActivitySummary {
  days: DemoActivityDay[];
  averageSteps: number;
  totalTrainingMinutes: number;
  sessions: number;
}

export interface ProgressData {
  weight: WeightSeries;
  measurements: DemoMeasurement[];
  strength: DemoStrengthSeries[];
  nutrition: NutritionSummary;
  activity: ActivitySummary;
  photos: ProgressPhoto[];
}

export interface UseProgressDataResult {
  status: ProgressStatus;
  data: ProgressData | null;
  error: Error | null;
  retry: () => void;
  isRefetching: boolean;
}

/* --------------------------------------------------------------- constantes */

/** Ventana de la media móvil, en días. */
export const TREND_WINDOW_DAYS = 7;

/** Historial mínimo para hablar de tendencia: dos semanas. */
export const MIN_TREND_DAYS = 14;

/** Nº mínimo de pesadas para que la media móvil signifique algo. */
export const MIN_TREND_POINTS = 4;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/* -------------------------------------------------------- funciones puras */

/** Días enteros entre dos fechas ISO. Devuelve 0 si alguna no es válida. */
export function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to)) return 0;
  return Math.round((to - from) / MS_PER_DAY);
}

/**
 * Serie de peso lista para pintar.
 *
 * Expande los registros a una rejilla diaria (para que dos pesadas separadas
 * por una semana no salgan pegadas en el eje X) y calcula la media móvil solo
 * sobre los días medidos, colocándola en la posición que le toca.
 */
export function buildWeightSeries(
  entries: WeightEntry[],
  window: number = TREND_WINDOW_DAYS,
): WeightSeries {
  const empty: WeightSeries = {
    daily: [],
    trendLine: [],
    dates: [],
    trend: { kgPerWeek: 0, sampleSize: 0, spanDays: 0, reliable: false },
    spanDays: 0,
    hasEnoughHistory: false,
    latestKg: null,
    totalChangeKg: null,
  };

  const clean = (entries ?? [])
    .filter((e) => e && typeof e.date === 'string' && Number.isFinite(e.weightKg) && e.weightKg > 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (clean.length === 0) return empty;

  const first = clean[0];
  const last = clean[clean.length - 1];
  const spanDays = Math.max(0, daysBetween(first.date, last.date));

  // Rejilla diaria: una posición por día entre la primera y la última pesada.
  const byOffset = new Map<number, number>();
  for (const entry of clean) {
    byOffset.set(daysBetween(first.date, entry.date), entry.weightKg);
  }

  const dates: string[] = [];
  const daily: (number | null)[] = [];
  const base = new Date(first.date).getTime();
  for (let offset = 0; offset <= spanDays; offset += 1) {
    dates.push(new Date(base + offset * MS_PER_DAY).toISOString().slice(0, 10));
    daily.push(byOffset.get(offset) ?? null);
  }

  // La media móvil se calcula sobre los valores medidos, no sobre los huecos:
  // meter ceros donde no hubo pesada hundiría la línea.
  const measured = clean.map((e) => e.weightKg);
  const smoothed = movingAverage(measured, window);
  const trendLine: (number | null)[] = daily.map(() => null);
  clean.forEach((entry, index) => {
    const position = daysBetween(first.date, entry.date);
    if (position >= 0 && position < trendLine.length) {
      trendLine[position] = roundTo(smoothed[index] ?? entry.weightKg, 2);
    }
  });

  const trend = weightTrend(clean.map((e) => ({ date: e.date, weightKg: e.weightKg })));
  const hasEnoughHistory = spanDays >= MIN_TREND_DAYS && clean.length >= MIN_TREND_POINTS;

  return {
    daily,
    trendLine,
    dates,
    trend,
    spanDays,
    hasEnoughHistory,
    latestKg: last.weightKg,
    totalChangeKg: clean.length >= 2 ? roundTo(last.weightKg - first.weightKg, 1) : null,
  };
}

/** Resumen de nutrición de los días recibidos. Sin días, todo a cero. */
export function summarizeNutrition(
  days: DemoNutritionDay[],
  targetKcal: number,
): NutritionSummary {
  const list = days ?? [];
  if (list.length === 0) {
    return { days: [], averageKcal: 0, averageProteinG: 0, adherence: 0, targetKcal };
  }
  const sum = list.reduce(
    (acc, day) => ({ kcal: acc.kcal + day.kcal, protein: acc.protein + day.proteinG }),
    { kcal: 0, protein: 0 },
  );
  return {
    days: list,
    averageKcal: Math.round(sum.kcal / list.length),
    averageProteinG: Math.round(sum.protein / list.length),
    adherence: averageAdherence(list.map((day) => day.adherence)),
    targetKcal,
  };
}

/** Resumen de actividad. Una sesión es un día con minutos de entrenamiento. */
export function summarizeActivity(days: DemoActivityDay[]): ActivitySummary {
  const list = days ?? [];
  if (list.length === 0) {
    return { days: [], averageSteps: 0, totalTrainingMinutes: 0, sessions: 0 };
  }
  const steps = list.reduce((acc, day) => acc + day.steps, 0);
  const minutes = list.reduce((acc, day) => acc + day.trainingMinutes, 0);
  return {
    days: list,
    averageSteps: Math.round(steps / list.length),
    totalTrainingMinutes: minutes,
    sessions: list.filter((day) => day.trainingMinutes > 0).length,
  };
}

/** true cuando no hay absolutamente nada que enseñar en ninguna pestaña. */
export function isProgressEmpty(data: ProgressData): boolean {
  return (
    data.weight.daily.length === 0 &&
    data.measurements.length === 0 &&
    data.strength.length === 0 &&
    data.nutrition.days.length === 0 &&
    data.activity.days.length === 0
  );
}

/* ------------------------------------------------------------- obtención */

/**
 * Carga el progreso. Hoy sale de `demo-data` para que la app funcione sin
 * Supabase; cuando haya sesión real se sustituye esta función y nada más.
 */
export async function fetchProgressData(): Promise<ProgressData> {
  return {
    weight: buildWeightSeries(demoWeights),
    measurements: demoMeasurements,
    strength: demoStrength,
    nutrition: summarizeNutrition(demoNutritionDays, demoTargets.kcal),
    activity: summarizeActivity(demoActivityDays),
    photos: demoProgressPhotos,
  };
}

/* ------------------------------------------------------------------- hook */

export function useProgressData(): UseProgressDataResult {
  const query = useQuery<ProgressData, Error>({
    queryKey: ['progress-data'],
    queryFn: fetchProgressData,
    staleTime: 60_000,
  });

  const status: ProgressStatus = useMemo(() => {
    if (query.isPending) return 'loading';
    if (query.isError) return 'error';
    if (!query.data || isProgressEmpty(query.data)) return 'empty';
    return 'success';
  }, [query.isPending, query.isError, query.data]);

  // Con reloj conectado, la pestaña de actividad enseña los días reales.
  const healthDays = useHealthDays();
  const data = useMemo(() => {
    if (!query.data || healthDays.length === 0) return query.data ?? null;
    return { ...query.data, activity: summarizeActivity(toActivityDays(healthDays)) };
  }, [query.data, healthDays]);

  return {
    status,
    data,
    error: query.error ?? null,
    retry: () => void query.refetch(),
    isRefetching: query.isRefetching,
  };
}
