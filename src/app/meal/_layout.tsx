import { Stack } from 'expo-router';

import { useTheme } from '@/providers';

/**
 * Pila de la hoja de comidas.
 *
 * Existe para que la ruta `meal` que declara el layout raíz sea real: sin
 * este layout, `meal/add` colgaría del stack raíz y la presentación modal
 * declarada arriba no se aplicaría.
 */
export default function MealLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
