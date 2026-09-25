import { Redirect } from 'expo-router';

import { useAuth } from '@/providers/auth-provider';
import { isDemoMode } from '@/services/supabase';

/**
 * Punto de entrada.
 *
 * Con servidor configurado, sin sesión se va a la pantalla de acceso. En modo
 * demostración (sin Supabase) se entra directo al panel: la cuenta local no
 * sobrevive a un recargo y obligar a "registrarse" cada vez sería mentir.
 */
export default function Index() {
  const { initialized, isAuthenticated } = useAuth();

  if (isDemoMode) return <Redirect href="/(tabs)" />;
  if (!initialized) return null;
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/(auth)/sign-in'} />;
}
