import { config } from './config';
import { logger } from './logger';
import { supabase } from './supabase';

/**
 * Escaneo de comida por foto.
 *
 * La foto va a una Edge Function que consulta un modelo de visión y devuelve
 * qué alimentos ve y cuántos gramos estima. La clave del modelo vive en el
 * servidor; el móvil nunca la conoce.
 *
 * Lo que vuelve es una ESTIMACIÓN que el usuario revisa y corrige antes de
 * registrarla. Nunca se apunta nada solo por lo que dijo el modelo.
 */

export interface ScannedItem {
  /** Nombre en el idioma del usuario, tal como lo diría en la cocina. */
  name: string;
  /** Gramos estimados en el plato. */
  grams: number;
  /** Calorías estimadas para esos gramos. */
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  /** 0..1 — qué seguro está el modelo de haberlo identificado bien. */
  confidence: number;
}

export interface ScanResult {
  items: ScannedItem[];
  /** Aviso corto del modelo cuando algo no se ve bien (plato tapado, foto oscura). */
  note?: string;
}

export type ScanOutcome =
  | { status: 'ok'; result: ScanResult }
  | { status: 'unavailable'; reasonKey: string }
  | { status: 'error'; reasonKey: string };

export interface FoodScanProvider {
  scan(imageBase64: string, locale: 'es' | 'en'): Promise<ScanOutcome>;
}

/** Sin servidor no hay modelo: se dice, no se simula. */
export class DemoFoodScan implements FoodScanProvider {
  async scan(): Promise<ScanOutcome> {
    return { status: 'unavailable', reasonKey: 'scan.unavailableDemo' };
  }
}

/** Llama a la Edge Function `food-scan` con la sesión del usuario. */
export class EdgeFoodScan implements FoodScanProvider {
  async scan(imageBase64: string, locale: 'es' | 'en'): Promise<ScanOutcome> {
    if (!supabase) return { status: 'unavailable', reasonKey: 'scan.unavailableDemo' };
    try {
      const { data, error } = await supabase.functions.invoke<ScanResult>('food-scan', {
        body: { image: imageBase64, locale },
      });
      if (error) throw error;
      if (!data || !Array.isArray(data.items)) throw new Error('respuesta sin items');
      // Se sanean los números: el modelo puede devolver algo raro y no queremos NaN en pantalla.
      const items = data.items
        .map((i) => ({
          name: String(i.name ?? '').trim(),
          grams: clamp(i.grams, 0, 5000),
          kcal: clamp(i.kcal, 0, 10000),
          proteinG: clamp(i.proteinG, 0, 1000),
          carbsG: clamp(i.carbsG, 0, 1000),
          fatG: clamp(i.fatG, 0, 1000),
          confidence: clamp(i.confidence, 0, 1),
        }))
        .filter((i) => i.name.length > 0 && i.grams > 0);
      return { status: 'ok', result: { items, note: data.note } };
    } catch (error) {
      logger.error('Escaneo de comida fallido', error);
      return { status: 'error', reasonKey: 'scan.failed' };
    }
  }
}

function clamp(n: unknown, min: number, max: number): number {
  const v = typeof n === 'number' && Number.isFinite(n) ? n : 0;
  return Math.min(max, Math.max(min, Math.round(v * 10) / 10));
}

export const foodScan: FoodScanProvider = config.isRemoteConfigured
  ? new EdgeFoodScan()
  : new DemoFoodScan();
