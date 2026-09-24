/**
 * Conversiones de unidades y redondeos.
 *
 * Reglas:
 * - El dominio SIEMPRE trabaja en unidades métricas (kg, cm, g, ml).
 *   Lo imperial es solo presentación: se convierte en el borde de la UI.
 * - Ninguna función lanza excepciones por entradas raras: se normaliza y
 *   se devuelve un valor seguro (nunca NaN ni Infinity).
 */

/* ------------------------------------------------------------- constantes */

/** 1 libra = 0,45359237 kg (definición internacional exacta). */
export const KG_PER_LB = 0.45359237;
/** 1 pulgada = 2,54 cm (definición internacional exacta). */
export const CM_PER_INCH = 2.54;
/** 12 pulgadas por pie. */
export const INCHES_PER_FOOT = 12;
/** 1 litro = 1000 mililitros. */
export const ML_PER_LITER = 1000;
/** 1 kilogramo = 1000 gramos. */
export const G_PER_KG = 1000;

/* --------------------------------------------------------------- helpers */

/** Devuelve 0 si el valor no es un número finito. Evita NaN e Infinity. */
export function safeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

/** Redondea a `decimals` decimales (por defecto 0). */
export function roundTo(value: number, decimals = 0): number {
  const safe = safeNumber(value);
  const factor = 10 ** Math.max(0, Math.trunc(decimals));
  return Math.round(safe * factor) / factor;
}

/** Redondea al múltiplo de `step` más cercano (ej. step 10 -> 2314 => 2310). */
export function roundToNearest(value: number, step: number): number {
  const safeStep = Math.abs(safeNumber(step));
  if (safeStep === 0) return safeNumber(value);
  return Math.round(safeNumber(value) / safeStep) * safeStep;
}

/** Acota un valor entre `min` y `max`. Si min > max, manda `min`. */
export function clamp(value: number, min: number, max: number): number {
  const safe = safeNumber(value);
  if (min > max) return min;
  return Math.min(Math.max(safe, min), max);
}

/* ------------------------------------------------------------------- peso */

/** Kilogramos -> libras. */
export function kgToLb(kg: number): number {
  return safeNumber(kg) / KG_PER_LB;
}

/** Libras -> kilogramos. */
export function lbToKg(lb: number): number {
  return safeNumber(lb) * KG_PER_LB;
}

/** Gramos -> kilogramos. */
export function gToKg(grams: number): number {
  return safeNumber(grams) / G_PER_KG;
}

/** Kilogramos -> gramos. */
export function kgToG(kg: number): number {
  return safeNumber(kg) * G_PER_KG;
}

/* ----------------------------------------------------------------- altura */

/** Centímetros -> pulgadas. */
export function cmToInches(cm: number): number {
  return safeNumber(cm) / CM_PER_INCH;
}

/** Pulgadas -> centímetros. */
export function inchesToCm(inches: number): number {
  return safeNumber(inches) * CM_PER_INCH;
}

export interface FeetInches {
  feet: number;
  inches: number;
}

/**
 * Centímetros -> pies y pulgadas, con las pulgadas redondeadas al entero.
 * Si el redondeo llega a 12 pulgadas, se sube un pie (ej. 5'12" -> 6'0").
 */
export function cmToFeetInches(cm: number): FeetInches {
  const totalInches = cmToInches(cm);
  let feet = Math.floor(totalInches / INCHES_PER_FOOT);
  let inches = Math.round(totalInches - feet * INCHES_PER_FOOT);
  if (inches >= INCHES_PER_FOOT) {
    feet += 1;
    inches -= INCHES_PER_FOOT;
  }
  return { feet, inches };
}

/** Pies + pulgadas -> centímetros. */
export function feetInchesToCm(feet: number, inches: number): number {
  return inchesToCm(safeNumber(feet) * INCHES_PER_FOOT + safeNumber(inches));
}

/* --------------------------------------------------------------- volumen */

/** Mililitros -> litros. */
export function mlToL(ml: number): number {
  return safeNumber(ml) / ML_PER_LITER;
}

/** Litros -> mililitros. */
export function lToMl(liters: number): number {
  return safeNumber(liters) * ML_PER_LITER;
}

/* ----------------------------------------------- normalización para listas */

export type MassUnit = 'g' | 'kg';
export type VolumeUnit = 'ml' | 'L';

export interface NormalizedQuantity<U extends string> {
  value: number;
  unit: U;
}

/**
 * Normaliza una masa en gramos: por debajo de 1 kg se queda en gramos
 * (redondeados al entero), a partir de 1 kg pasa a kg con 2 decimales.
 */
export function normalizeMass(grams: number): NormalizedQuantity<MassUnit> {
  const safe = Math.max(0, safeNumber(grams));
  if (safe >= G_PER_KG) {
    return { value: roundTo(gToKg(safe), 2), unit: 'kg' };
  }
  return { value: roundTo(safe, 0), unit: 'g' };
}

/**
 * Normaliza un volumen en mililitros: por debajo de 1 L se queda en ml,
 * a partir de 1 L pasa a litros con 2 decimales.
 */
export function normalizeVolume(ml: number): NormalizedQuantity<VolumeUnit> {
  const safe = Math.max(0, safeNumber(ml));
  if (safe >= ML_PER_LITER) {
    return { value: roundTo(mlToL(safe), 2), unit: 'L' };
  }
  return { value: roundTo(safe, 0), unit: 'ml' };
}

/** Peso mostrado al usuario según su sistema de unidades (1 decimal). */
export function displayWeight(
  kg: number,
  unitSystem: 'metric' | 'imperial',
): NormalizedQuantity<'kg' | 'lb'> {
  return unitSystem === 'imperial'
    ? { value: roundTo(kgToLb(kg), 1), unit: 'lb' }
    : { value: roundTo(kg, 1), unit: 'kg' };
}
