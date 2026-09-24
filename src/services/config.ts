import { z } from 'zod';

/**
 * Configuración de entorno.
 *
 * Solo se leen variables con prefijo EXPO_PUBLIC_, que son las que Expo
 * empaqueta en el cliente. Cualquier secreto real (service-role de Supabase,
 * claves de proveedores de alimentos) vive exclusivamente en el servidor:
 * si alguna vez aparece aquí, está filtrada.
 */

const schema = z.object({
  supabaseUrl: z.string().url().optional(),
  supabasePublishableKey: z.string().min(10).optional(),
});

const parsed = schema.safeParse({
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});

const values = parsed.success ? parsed.data : {};

export const config = {
  supabaseUrl: values.supabaseUrl,
  supabasePublishableKey: values.supabasePublishableKey,
  /**
   * Sin credenciales la app arranca igualmente en modo demostración con datos
   * locales, para poder abrirla y verla sin configurar nada.
   */
  get isRemoteConfigured(): boolean {
    return Boolean(values.supabaseUrl && values.supabasePublishableKey);
  },
} as const;

/** Banderas de funcionalidad. Solo se activa lo que está realmente implementado. */
export const featureFlags = {
  AI_COACH: false,
  BARCODE_SCANNER: false,
  HEALTHKIT: false,
  HEALTH_CONNECT: false,
  PREMIUM: false,
  SOCIAL: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

export const isEnabled = (flag: FeatureFlag): boolean => featureFlags[flag];
