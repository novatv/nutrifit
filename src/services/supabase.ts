import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { config } from './config';

/**
 * Cliente de Supabase.
 *
 * Usa únicamente la clave publicable: es la que puede viajar en el cliente,
 * y toda la protección real la da Row Level Security en la base de datos.
 * La service-role nunca debe aparecer en la app móvil.
 *
 * Si no hay credenciales configuradas el cliente es `null` y la app funciona
 * en modo demostración con datos locales, para poder abrirla sin montar nada.
 */
export const supabase: SupabaseClient | null = config.isRemoteConfigured
  ? createClient(config.supabaseUrl!, config.supabasePublishableKey!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // En móvil no hay URL de la que leer el token: lo maneja expo-linking.
        detectSessionInUrl: false,
      },
    })
  : null;

/** Úsalo cuando una operación exija servidor de verdad. */
export function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      'Supabase no está configurado. Copia .env.example a .env y rellena EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
    );
  }
  return supabase;
}

export const isDemoMode = !config.isRemoteConfigured;
