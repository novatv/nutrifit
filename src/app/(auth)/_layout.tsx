import { Stack } from 'expo-router';

import { useTheme } from '@/providers/theme-provider';

/**
 * Pila de acceso.
 *
 * Sin cabecera: cada pantalla pinta su propio título, igual que el
 * onboarding, para que el acceso se lea como una sola página y no como un
 * formulario metido dentro de un navegador.
 */
export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
