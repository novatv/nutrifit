import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { View, type ViewStyle } from 'react-native';

import { getExercise } from '@/domain/training/exerciseLibrary';
import { useTheme } from '@/providers';
import type { MovementPattern } from '@/types/domain';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/**
 * Un pictograma por patrón de movimiento.
 *
 * Es deliberado que sea por patrón y no por ejercicio: 146 imágenes distintas
 * salen caras, pesan y nunca quedan iguales entre sí. Once pictogramas
 * coherentes se reconocen al instante y no dependen de red ni de licencias.
 * Cuando un ejercicio traiga `imageUrl`, esa imagen manda sobre el pictograma.
 */
const PATTERN_ICON: Record<MovementPattern, IconName> = {
  squat: 'weight-lifter',
  hinge: 'kettlebell',
  horizontal_push: 'arm-flex',
  vertical_push: 'human-handsup',
  horizontal_pull: 'rowing',
  vertical_pull: 'weight',
  lunge: 'walk',
  carry: 'bag-personal',
  core: 'yoga',
  isolation: 'dumbbell',
  cardio: 'run',
};

export interface ExerciseVisualProps {
  slug: string;
  size?: number;
  style?: ViewStyle;
}

export function ExerciseVisual({ slug, size = 96, style }: ExerciseVisualProps) {
  const { colors, radius } = useTheme();
  const exercise = getExercise(slug);
  const pattern: MovementPattern = exercise?.pattern ?? 'isolation';

  const frame: ViewStyle = {
    width: size,
    height: size,
    borderRadius: radius.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    // Fondo verde de marca, pictograma en oro: el mismo lockup que el logo.
    backgroundColor: colors.primarySubtle,
  };

  if (exercise?.imageUrl) {
    return (
      <View style={[frame, style]} accessible accessibilityRole="image" accessibilityLabel={slug}>
        <Image
          source={{ uri: exercise.imageUrl }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={150}
        />
      </View>
    );
  }

  return (
    <View
      style={[frame, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={slug}
    >
      <MaterialCommunityIcons name={PATTERN_ICON[pattern]} size={size * 0.52} color={colors.brand} />
    </View>
  );
}
