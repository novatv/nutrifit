import { Stack } from 'expo-router';

import { useTheme } from '@/providers';

/**
 * Pila del entrenamiento. Sin cabecera propia: la sesión en vivo ocupa toda
 * la pantalla y trae sus propios controles, porque se usa con una mano y
 * sudando.
 */
export default function WorkoutLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="summary" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
