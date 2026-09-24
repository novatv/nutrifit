import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Chip, Screen, Section, StatCard, Text } from '@/components/ui';
import { detectPRs } from '@/domain/training/progressionEngine';
import { exerciseLabel } from '@/features/workout/use-workout-session';
import { t } from '@/i18n';
import { useTheme } from '@/providers';
import { useWorkoutStore } from '@/stores/workout-store';
import type { WorkoutSession } from '@/types/domain';

type Difficulty = NonNullable<WorkoutSession['perceivedDifficulty']>;

const DIFFICULTIES: Difficulty[] = ['very_easy', 'good', 'hard', 'too_hard'];

/** Volumen total movido: series completadas × peso × repeticiones. */
function totalVolume(session: WorkoutSession | null): number {
  if (!session) return 0;
  return session.logs.reduce(
    (acc, log) =>
      acc +
      log.sets.reduce(
        (sum, set) =>
          set.completed && set.weightKg && set.reps ? sum + set.weightKg * set.reps : sum,
        0,
      ),
    0,
  );
}

function durationMinutes(session: WorkoutSession | null): number {
  if (!session?.finishedAt) return 0;
  const ms = new Date(session.finishedAt).getTime() - new Date(session.startedAt).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

/**
 * Resumen de la sesión.
 *
 * Pregunta cómo fue y si hubo dolor. El dolor no se trata como falta de ganas:
 * si se declara, se dice qué hacer y se deja de proponer subir carga.
 */
export default function WorkoutSummaryScreen() {
  const { spacing } = useTheme();
  const lastSession = useWorkoutStore((s) => s.lastSession);
  const history = useWorkoutStore((s) => s.history);
  const submitFeedback = useWorkoutStore((s) => s.submitFeedback);

  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [pain, setPain] = useState<boolean | null>(null);

  const volume = totalVolume(lastSession);
  const minutes = durationMinutes(lastSession);
  const exerciseCount = lastSession?.logs.length ?? 0;

  const prs = useMemo(() => {
    if (!lastSession) return [];
    const previous = history.filter((s) => s.id !== lastSession.id);
    try {
      return detectPRs(lastSession, previous);
    } catch {
      return [];
    }
  }, [lastSession, history]);

  const close = () => {
    submitFeedback({
      perceivedDifficulty: difficulty ?? undefined,
      painReported: pain ?? undefined,
    });
    router.replace('/(tabs)');
  };

  return (
    <Screen>
      <View style={{ paddingTop: spacing['2xl'], gap: spacing.xs }}>
        <Text variant="h1">{t('workout.completed')}</Text>
      </View>

      <Section>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <StatCard label={t('workout.duration')} value={minutes} unit="min" showBar={false} />
          <StatCard label={t('workout.volume')} value={volume} unit="kg" showBar={false} />
        </View>
      </Section>

      <Section>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <StatCard label={t('workout.exercises')} value={exerciseCount} showBar={false} />
          <StatCard label={t('workout.prs')} value={prs.length} showBar={false} />
        </View>
      </Section>

      {prs.length > 0 ? (
        <Section title={t('workout.prs')}>
          <Card style={{ gap: spacing.sm }}>
            {prs.map((pr, i) => (
              <Text key={`${pr.exerciseSlug}-${i}`} variant="body">
                {exerciseLabel(pr.exerciseSlug)}
              </Text>
            ))}
          </Card>
        </Section>
      ) : null}

      <Section title={t('workout.howWasIt')}>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          {DIFFICULTIES.map((d) => (
            <Chip
              key={d}
              label={t(`workout.difficulty.${d}`)}
              selected={difficulty === d}
              onPress={() => setDifficulty(d)}
            />
          ))}
        </View>
      </Section>

      <Section title={t('workout.painQuestion')}>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Chip label={t('common.done')} selected={pain === true} onPress={() => setPain(true)} />
          <Chip label={t('common.skip')} selected={pain === false} onPress={() => setPain(false)} />
        </View>
        {pain ? (
          <Card style={{ marginTop: spacing.md }}>
            <Text variant="body">{t('workout.painFollowUp')}</Text>
          </Card>
        ) : null}
      </Section>

      <Button label={t('common.done')} onPress={close} style={{ marginTop: spacing['2xl'] }} />
    </Screen>
  );
}
