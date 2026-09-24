import { Redirect } from 'expo-router';

/**
 * Punto de entrada. Cuando exista sesión real decidirá entre onboarding,
 * acceso y app; de momento entra directo al panel para poder verlo con los
 * datos de demostración.
 */
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
