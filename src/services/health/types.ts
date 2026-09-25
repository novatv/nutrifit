/**
 * Contrato de la integración con relojes y pulseras.
 *
 * No se habla con cada marca (Garmin, Fitbit, Samsung, Xiaomi, Polar…): todas
 * vuelcan sus datos en Apple Health (iOS) o Health Connect (Android), y la app
 * lee de ahí. Un solo proveedor por plataforma y, si no hay ninguno (web,
 * Expo Go), el podómetro del propio teléfono para los pasos.
 */

export type HealthSource = 'apple_health' | 'health_connect' | 'pedometer' | 'none';

export interface HealthWorkout {
  id: string;
  /** Nombre tal como lo etiquetó el reloj ("Running", "Traditional Strength Training"…). */
  name: string;
  /** ISO 8601 */
  start: string;
  end: string;
  minutes: number;
  kcal?: number;
}

export interface DailyHealth {
  /** YYYY-MM-DD */
  date: string;
  steps: number;
  /** Energía activa del día, si el reloj la registra. */
  activeKcal?: number;
  /** Minutos dormidos la noche que termina ese día. */
  sleepMinutes?: number;
  /** Pulsaciones en reposo (media del día), si hay datos. */
  restingHr?: number;
  workouts: HealthWorkout[];
}

export interface HealthProvider {
  readonly source: HealthSource;
  /** true si la plataforma y el módulo nativo permiten usarlo. */
  isAvailable(): Promise<boolean>;
  /** Pide permisos de lectura. Devuelve false si el usuario los niega. */
  requestAccess(): Promise<boolean>;
  /** Datos por día en el rango [from, to], ambos YYYY-MM-DD inclusive. */
  readDays(from: string, to: string): Promise<DailyHealth[]>;
  /** Último peso registrado (báscula o reloj), si lo hay. */
  latestWeightKg(): Promise<{ kg: number; date: string } | null>;
}

/* ------------------------------------------------------------ utilidades */

export const dayKey = (d: Date): string => d.toISOString().slice(0, 10);

export function dayRange(from: string, to: string): string[] {
  const out: string[] = [];
  const cursor = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  while (cursor <= end) {
    out.push(dayKey(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

/** Límites locales de un día (00:00 → 23:59:59.999) como ISO. */
export function localDayBounds(date: string): { start: Date; end: Date } {
  const [y, m, d] = date.split('-').map(Number);
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end = new Date(y, m - 1, d, 23, 59, 59, 999);
  return { start, end };
}

export const minutesBetween = (a: string, b: string): number =>
  Math.max(0, Math.round((Date.parse(b) - Date.parse(a)) / 60_000));

export function emptyDay(date: string): DailyHealth {
  return { date, steps: 0, workouts: [] };
}
