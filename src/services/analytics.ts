import { logger } from './logger';

/**
 * Analítica.
 *
 * Interfaz abstracta para no atarse a un proveedor. Solo se envían nombres de
 * evento y propiedades no sensibles: nunca peso, medidas, fotos, contenido de
 * comidas ni identificadores personales.
 */

export type AnalyticsEvent =
  | 'onboarding_started'
  | 'onboarding_completed'
  | 'plan_generated'
  | 'meal_logged'
  | 'workout_started'
  | 'workout_completed'
  | 'weekly_checkin_completed'
  | 'meal_swapped'
  | 'exercise_swapped';

/** Propiedades permitidas: solo categóricas o agregadas, nunca datos de salud. */
export type AnalyticsProps = Record<string, string | number | boolean>;

export interface AnalyticsProvider {
  track(event: AnalyticsEvent, props?: AnalyticsProps): void;
  identify(anonymousId: string): void;
  reset(): void;
}

/** Proveedor por defecto: no sale nada del dispositivo. */
const noopProvider: AnalyticsProvider = {
  track(event, props) {
    logger.debug(`analytics: ${event}`, props);
  },
  identify() {},
  reset() {},
};

let provider: AnalyticsProvider = noopProvider;

export function setAnalyticsProvider(next: AnalyticsProvider): void {
  provider = next;
}

export const analytics: AnalyticsProvider = {
  track: (event, props) => provider.track(event, props),
  identify: (id) => provider.identify(id),
  reset: () => provider.reset(),
};
