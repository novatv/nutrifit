import { es, type TranslationSchema } from './es';
import { en } from './en';
import type { Locale } from '@/types/domain';

/**
 * i18n mínimo y sin dependencias.
 *
 * El español es el idioma de referencia y está completo; los demás pueden ser
 * parciales y caen de vuelta al español clave a clave, de modo que una
 * traducción a medias nunca deja la pantalla en blanco.
 */

/**
 * `es` se declara `as const`, así que sus valores son tipos literales
 * ('Continuar', 'Atrás'…). Si el resto de idiomas tuviera que satisfacer ese
 * tipo, solo una copia del español compilaría. `Translations` ensancha las
 * hojas a `string` conservando el árbol, que es lo que de verdad queremos
 * comprobar: que no falte ni sobre ninguna clave.
 */
type Translations<T> = {
  [K in keyof T]: T[K] extends string ? string : Translations<T[K]>;
};

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

export type LocaleDictionary = DeepPartial<Translations<TranslationSchema>>;

const dictionaries: Record<Locale, LocaleDictionary> = { es, en };

let currentLocale: Locale = 'es';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

function lookup(dict: unknown, path: string[]): unknown {
  return path.reduce<unknown>(
    (acc, key) =>
      acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined,
    dict,
  );
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

/**
 * Traduce una clave con notación de puntos: t('today.dailyGoal').
 * Si falta en el idioma activo usa el español; si tampoco está, devuelve la
 * propia clave, que en desarrollo canta lo suficiente como para arreglarlo.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const path = key.split('.');
  const active = lookup(dictionaries[currentLocale], path);
  const value = typeof active === 'string' ? active : lookup(es, path);
  if (typeof value !== 'string') {
    if (__DEV__) console.warn(`[i18n] clave sin traducir: ${key}`);
    return key;
  }
  return interpolate(value, params);
}

/** Idiomas que la app ofrece hoy. */
export const AVAILABLE_LOCALES: { code: Locale; label: string }[] = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
];

export { es, en };
export type { TranslationSchema };
