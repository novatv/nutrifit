import type { Goal, HealthScreening } from '@/types/domain';

/**
 * Monitoreo semanal de la figura.
 *
 * Compara el registro más reciente con el de hace ~4 semanas y traduce el
 * cambio en una lectura sencilla (en camino, estancado, demasiado rápido…)
 * con pautas generales y categorías de suplementos a considerar.
 *
 * Reglas fijas:
 * - Nunca se concluye nada con un solo registro ni con menos de 7 días.
 * - Las pautas son generales y educativas; no son un diagnóstico ni una
 *   prescripción. El texto que las acompaña lo deja claro.
 * - Si el cribado de salud marca embarazo/lactancia, TCA o terapia nutricional
 *   médica, no se sugiere ningún suplemento: eso lo decide un profesional.
 * - Todo es determinista: mismos datos, mismo informe.
 */

export interface BodyCheck {
  /** YYYY-MM-DD */
  date: string;
  weightKg?: number;
  waistCm?: number;
  hipCm?: number;
  chestCm?: number;
  armCm?: number;
  thighCm?: number;
  /** Estimación del usuario, no una medición clínica. */
  bodyFatPct?: number;
  /** Foto de progreso asociada, si la hubo. */
  photoId?: string;
}

export type BodyMeasure = Exclude<keyof BodyCheck, 'date' | 'photoId'>;

export const BODY_MEASURES: BodyMeasure[] = [
  'weightKg',
  'waistCm',
  'hipCm',
  'chestCm',
  'armCm',
  'thighCm',
  'bodyFatPct',
];

export interface MeasureDelta {
  measure: BodyMeasure;
  from: number;
  to: number;
  delta: number;
  /** Cambio por semana, para comparar tramos de distinta longitud. */
  perWeek: number;
}

export type BodyTrend = 'insufficient' | 'on_track' | 'stalled' | 'too_fast' | 'off_track';

export interface BodyReport {
  trend: BodyTrend;
  /** Semanas que separan los dos registros comparados (0 si no hay dos). */
  weeks: number;
  deltas: MeasureDelta[];
  guidelineKeys: string[];
  supplementKeys: string[];
  cautionKeys: string[];
  /** false cuando el cribado de salud impide sugerir suplementos. */
  supplementsAllowed: boolean;
}

export interface BodyReportInput {
  checks: BodyCheck[];
  goal: Goal;
  screening: HealthScreening;
  /** Ventana de comparación en semanas. Por defecto 4. */
  windowWeeks?: number;
}

const DAY_MS = 86_400_000;
const MIN_DAYS = 7;

/* ----------------------------------------------------------------- límites */

/** Pérdida de peso semanal considerada segura, en % del peso. */
const LOSS_MAX_PCT_PER_WEEK = 1.0;
const LOSS_MIN_PCT_PER_WEEK = 0.25;
/** Ganancia semanal razonable para músculo; más rápido suele ser grasa. */
const GAIN_MAX_PCT_PER_WEEK = 0.5;
const GAIN_MIN_PCT_PER_WEEK = 0.1;
/** Cintura: medio centímetro por semana ya es una señal clara. */
const WAIST_DROP_CM_PER_WEEK = 0.25;
const WAIST_RISE_CM_PER_WEEK = 0.5;
/** Mantener: oscilar ±1 % en un mes es normal. */
const MAINTAIN_BAND_PCT = 1.0;

/* --------------------------------------------------------------- utilidades */

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / DAY_MS);
}

function sortByDate(checks: BodyCheck[]): BodyCheck[] {
  return [...checks].sort((a, b) => a.date.localeCompare(b.date));
}

/** El registro más cercano a `windowWeeks` semanas antes del último. */
function pickBaseline(sorted: BodyCheck[], latest: BodyCheck, windowWeeks: number): BodyCheck | null {
  const target = windowWeeks * 7;
  let best: BodyCheck | null = null;
  let bestDistance = Infinity;
  for (const c of sorted) {
    if (c === latest) continue;
    const days = daysBetween(c.date, latest.date);
    if (days < MIN_DAYS) continue;
    const distance = Math.abs(days - target);
    if (distance < bestDistance) {
      best = c;
      bestDistance = distance;
    }
  }
  return best;
}

export function computeDeltas(from: BodyCheck, to: BodyCheck): MeasureDelta[] {
  const weeks = Math.max(daysBetween(from.date, to.date) / 7, 1 / 7);
  const out: MeasureDelta[] = [];
  for (const m of BODY_MEASURES) {
    const a = from[m];
    const b = to[m];
    if (typeof a !== 'number' || typeof b !== 'number') continue;
    const delta = round1(b - a);
    out.push({ measure: m, from: a, to: b, delta, perWeek: round2(delta / weeks) });
  }
  return out;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const round2 = (n: number) => Math.round(n * 100) / 100;

function find(deltas: MeasureDelta[], m: BodyMeasure): MeasureDelta | undefined {
  return deltas.find((d) => d.measure === m);
}

/* --------------------------------------------------------------- tendencia */

function classify(goal: Goal, deltas: MeasureDelta[]): BodyTrend {
  const weight = find(deltas, 'weightKg');
  const waist = find(deltas, 'waistCm');
  const arm = find(deltas, 'armCm');
  const chest = find(deltas, 'chestCm');

  // % de peso por semana, con signo.
  const weightPct = weight ? (weight.perWeek / weight.from) * 100 : null;

  switch (goal) {
    case 'lose_fat': {
      if (weightPct !== null && weightPct < -LOSS_MAX_PCT_PER_WEEK) return 'too_fast';
      const weightOk = weightPct !== null && weightPct <= -LOSS_MIN_PCT_PER_WEEK;
      const waistOk = waist !== undefined && waist.perWeek <= -WAIST_DROP_CM_PER_WEEK;
      if (weightOk || waistOk) return 'on_track';
      if (weightPct !== null && weightPct > LOSS_MIN_PCT_PER_WEEK) return 'off_track';
      return 'stalled';
    }
    case 'gain_muscle': {
      if (weightPct !== null && weightPct > GAIN_MAX_PCT_PER_WEEK) return 'too_fast';
      if (waist !== undefined && waist.perWeek >= WAIST_RISE_CM_PER_WEEK) return 'off_track';
      const weightOk = weightPct !== null && weightPct >= GAIN_MIN_PCT_PER_WEEK;
      const sizeOk = (arm !== undefined && arm.delta > 0) || (chest !== undefined && chest.delta > 0);
      if (weightOk || sizeOk) return 'on_track';
      return 'stalled';
    }
    case 'recomp': {
      // Recomposición: la cintura baja o el perímetro muscular sube con el peso estable.
      const waistDown = waist !== undefined && waist.delta < 0;
      const sizeUp = (arm !== undefined && arm.delta > 0) || (chest !== undefined && chest.delta > 0);
      if (waistDown || sizeUp) return 'on_track';
      if (waist !== undefined && waist.perWeek >= WAIST_RISE_CM_PER_WEEK) return 'off_track';
      return 'stalled';
    }
    default: {
      // maintain / fitness / habits: estabilidad es éxito.
      if (weight === undefined) return waist === undefined ? 'insufficient' : 'on_track';
      const monthPct = Math.abs((weight.delta / weight.from) * 100);
      return monthPct <= MAINTAIN_BAND_PCT ? 'on_track' : 'off_track';
    }
  }
}

/* ------------------------------------------------------------------ pautas */

const GUIDELINES: Record<Goal, Record<Exclude<BodyTrend, 'insufficient'>, string[]>> = {
  lose_fat: {
    on_track: ['body.guideline.keepGoing', 'body.guideline.proteinEachMeal'],
    stalled: ['body.guideline.checkPortions', 'body.guideline.dailySteps', 'body.guideline.sleepSeven'],
    too_fast: ['body.guideline.slowDown', 'body.guideline.keepStrength'],
    off_track: ['body.guideline.logHonestly', 'body.guideline.checkPortions'],
  },
  gain_muscle: {
    on_track: ['body.guideline.keepGoing', 'body.guideline.progressiveOverload'],
    stalled: ['body.guideline.eatSlightSurplus', 'body.guideline.progressiveOverload', 'body.guideline.sleepSeven'],
    too_fast: ['body.guideline.trimSurplus', 'body.guideline.dailySteps'],
    off_track: ['body.guideline.trimSurplus', 'body.guideline.proteinEachMeal'],
  },
  recomp: {
    on_track: ['body.guideline.keepGoing', 'body.guideline.proteinEachMeal'],
    stalled: ['body.guideline.progressiveOverload', 'body.guideline.proteinEachMeal', 'body.guideline.dailySteps'],
    too_fast: ['body.guideline.slowDown'],
    off_track: ['body.guideline.checkPortions', 'body.guideline.dailySteps'],
  },
  maintain: {
    on_track: ['body.guideline.keepGoing'],
    stalled: ['body.guideline.keepGoing'],
    too_fast: ['body.guideline.slowDown'],
    off_track: ['body.guideline.checkPortions', 'body.guideline.logHonestly'],
  },
  fitness: {
    on_track: ['body.guideline.keepGoing', 'body.guideline.dailySteps'],
    stalled: ['body.guideline.dailySteps'],
    too_fast: ['body.guideline.slowDown'],
    off_track: ['body.guideline.logHonestly'],
  },
  habits: {
    on_track: ['body.guideline.keepGoing', 'body.guideline.sleepSeven'],
    stalled: ['body.guideline.sleepSeven'],
    too_fast: ['body.guideline.slowDown'],
    off_track: ['body.guideline.logHonestly'],
  },
};

/**
 * Categorías de suplemento con evidencia razonable para cada objetivo.
 * Son categorías, no marcas ni dosis: el detalle lo da la tienda y, en caso de
 * duda, un profesional.
 */
const SUPPLEMENTS: Record<Goal, string[]> = {
  lose_fat: ['body.supplement.protein', 'body.supplement.omega3', 'body.supplement.vitaminD', 'body.supplement.electrolytes'],
  gain_muscle: ['body.supplement.protein', 'body.supplement.creatine', 'body.supplement.omega3', 'body.supplement.vitaminD'],
  recomp: ['body.supplement.protein', 'body.supplement.creatine', 'body.supplement.omega3'],
  maintain: ['body.supplement.omega3', 'body.supplement.vitaminD', 'body.supplement.magnesium'],
  fitness: ['body.supplement.electrolytes', 'body.supplement.omega3', 'body.supplement.magnesium'],
  habits: ['body.supplement.vitaminD', 'body.supplement.magnesium'],
};

export function supplementsAllowed(screening: HealthScreening): boolean {
  return !(
    screening.pregnantOrBreastfeeding ||
    screening.eatingDisorderCurrent ||
    screening.medicalNutritionTherapy
  );
}

/* ---------------------------------------------------------------- informe */

export function buildBodyReport(input: BodyReportInput): BodyReport {
  const { goal, screening } = input;
  const windowWeeks = input.windowWeeks ?? 4;
  const allowed = supplementsAllowed(screening);
  const sorted = sortByDate(input.checks);
  const latest = sorted.at(-1);
  const baseline = latest ? pickBaseline(sorted, latest, windowWeeks) : null;

  const insufficient = (): BodyReport => ({
    trend: 'insufficient',
    weeks: 0,
    deltas: [],
    guidelineKeys: ['body.guideline.keepMeasuring'],
    supplementKeys: [],
    cautionKeys: ['body.caution.notMedical'],
    supplementsAllowed: allowed,
  });

  if (!latest || !baseline) return insufficient();

  const deltas = computeDeltas(baseline, latest);
  if (deltas.length === 0) return insufficient();

  const trend = classify(goal, deltas);
  if (trend === 'insufficient') return insufficient();

  const cautionKeys = ['body.caution.notMedical'];
  if (trend === 'too_fast') cautionKeys.push('body.caution.tooFast');
  if (!allowed) cautionKeys.push('body.caution.noSupplements');

  return {
    trend,
    weeks: round1(daysBetween(baseline.date, latest.date) / 7),
    deltas,
    guidelineKeys: GUIDELINES[goal][trend],
    supplementKeys: allowed ? SUPPLEMENTS[goal] : [],
    cautionKeys,
    supplementsAllowed: allowed,
  };
}
