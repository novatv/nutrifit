import { Stack } from 'expo-router';

import { useTheme } from '@/providers';

/**
 * Pila del onboarding.
 *
 * Sin cabecera de navegación: cada paso pinta la suya (`ProgressHeader`) para
 * que el progreso y el botón de atrás sean parte del contenido y no un chrome
 * aparte. `generating` y `review` no se pueden cerrar con gesto: una es un
 * proceso que termina solo y la otra es una decisión de seguridad que hay que
 * leer, no algo de lo que se sale deslizando sin querer.
 */
export default function OnboardingLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[step]" />
      <Stack.Screen name="summary" />
      <Stack.Screen name="generating" options={{ gestureEnabled: false }} />
      <Stack.Screen name="review" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
