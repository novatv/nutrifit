import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';

import { Button, Card, Text } from '@/components/ui';
import { attributionFor, mediaFor } from '@/data/exercise-media';
import { getExercise } from '@/domain/training/exerciseLibrary';
import { t } from '@/i18n';
import { useTheme } from '@/providers';
import { minTouchTarget } from '@/theme';

import { ExerciseVisual } from './exercise-visual';

/**
 * "Cómo se hace": foto grande, vídeo si lo hay, pasos, errores y seguridad.
 *
 * Va plegado por defecto: en mitad de una serie lo que importa es el peso y
 * las repeticiones; la explicación se abre cuando hace falta. La atribución
 * de la foto/vídeo es obligatoria por licencia y se muestra siempre que se
 * muestra el medio.
 */
export function ExerciseHowTo({ slug }: { slug: string }) {
  const { colors, radius, spacing } = useTheme();
  const [open, setOpen] = useState(false);
  const exercise = getExercise(slug);
  const media = mediaFor(slug);
  if (!exercise) return null;

  const hasMedia = Boolean(media?.image || media?.videoUrl || exercise.imageUrl);

  return (
    <Card style={{ gap: spacing.md }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((v) => !v)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: minTouchTarget,
        }}
      >
        <Text variant="bodyStrong">{t(open ? 'workout.hideHowTo' : 'workout.showHowTo')}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
      </Pressable>

      {open ? (
        <View style={{ gap: spacing.lg }}>
          {media?.image ? (
            <Image
              source={media.image}
              style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: radius.lg }}
              contentFit="contain"
              accessibilityLabel={t(`${exercise.nameKey}.name`)}
            />
          ) : (
            <ExerciseVisual slug={slug} size={120} style={{ alignSelf: 'center' }} />
          )}

          {media?.videoUrl ? (
            <Button
              label={t('workout.watchVideo')}
              variant="secondary"
              icon={<Ionicons name="play-circle-outline" size={18} color={colors.primary} />}
              onPress={() => {
                void Linking.openURL(media.videoUrl as string);
              }}
            />
          ) : null}

          {hasMedia && media ? (
            <Text variant="caption" color="muted">
              {t('workout.mediaCredit', { credit: attributionFor(media) })}
            </Text>
          ) : null}

          <StepList title={t('workout.howTo')} keys={exercise.instructionKeys} numbered />
          <StepList title={t('workout.mistakes')} keys={exercise.commonMistakeKeys} />
          <StepList title={t('workout.safetyNotes')} keys={exercise.safetyNoteKeys} />
        </View>
      ) : null}
    </Card>
  );
}

function StepList({ title, keys, numbered }: { title: string; keys: string[]; numbered?: boolean }) {
  const { spacing } = useTheme();
  if (keys.length === 0) return null;
  return (
    <View style={{ gap: spacing.xs }}>
      <Text variant="label" color="muted">
        {title}
      </Text>
      {keys.map((key, i) => (
        <Text key={key} variant="body">
          {numbered ? `${i + 1}. ` : '· '}
          {t(key)}
        </Text>
      ))}
    </View>
  );
}
