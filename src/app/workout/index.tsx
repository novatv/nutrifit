import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  ProgressBar,
  Section,
  Skeleton,
  Text,
} from '@/components/ui';
import { useWorkoutSession } from '@/features/workout/use-workout-session';
import { t } from '@/i18n';
import { useTheme } from '@/providers';
import { minTouchTarget, screenPadding } from '@/theme';
import type { SetLog } from '@/types/domain';

/* ------------------------------------------------------------ fila de serie */

interface SetRowProps {
  index: number;
  set: SetLog;
  onChange: (patch: Partial<SetLog>) => void;
  onToggle: () => void;
}

/**
 * Una serie. Campos grandes y teclado numérico: esto se rellena de pie, con
 * una mano y con prisa entre series.
 */
function SetRow({ index, set, onChange, onToggle }: SetRowProps) {
  const { colors, radius, spacing, typography } = useTheme();

  const field = (
    value: number | null,
    onText: (n: number | null) => void,
    label: string,
    step: 'decimal-pad' | 'number-pad',
  ) => (
    <TextInput
      accessibilityLabel={label}
      keyboardType={step}
      value={value === null ? '' : String(value)}
      onChangeText={(text) => {
        const clean = text.replace(',', '.');
        onText(clean === '' ? null : Number(clean));
      }}
      placeholder="—"
      placeholderTextColor={colors.textMuted}
      style={[
        typography.numeric,
        {
          flex: 1,
          minHeight: minTouchTarget,
          textAlign: 'center',
          color: colors.text,
          backgroundColor: colors.background,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.border,
        },
      ]}
    />
  );

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <Text variant="numeric" color="muted" style={{ width: 24 }}>
        {index + 1}
      </Text>
      {field(set.weightKg, (n) => onChange({ weightKg: n }), t('workout.weight'), 'decimal-pad')}
      {field(set.reps, (n) => onChange({ reps: n }), t('workout.reps'), 'number-pad')}
      {field(set.rir, (n) => onChange({ rir: n }), t('workout.rir'), 'number-pad')}
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: set.completed }}
        accessibilityLabel={`${t('workout.set')} ${index + 1}`}
        onPress={onToggle}
        style={{
          width: minTouchTarget,
          height: minTouchTarget,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: set.completed ? 0 : 1,
          borderColor: colors.border,
          backgroundColor: set.completed ? colors.primary : colors.background,
        }}
      >
        <Ionicons
          name={set.completed ? 'checkmark' : 'ellipse-outline'}
          size={20}
          color={set.completed ? colors.onPrimary : colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

/* ------------------------------------------------------------- pantalla */

export default function WorkoutScreen() {
  const { colors, radius, spacing } = useTheme();
  const s = useWorkoutSession();
  const [showSwap, setShowSwap] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  if (s.status === 'loading') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: screenPadding, gap: spacing.lg }}>
          <Skeleton height={28} width="60%" />
          <Skeleton height={120} />
          <Skeleton height={48} />
          <Skeleton height={48} />
        </View>
      </SafeAreaView>
    );
  }

  if (s.status === 'error') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ErrorState body={s.errorKey ? t(s.errorKey) : undefined} onRetry={s.retry} />
      </SafeAreaView>
    );
  }

  if (s.status === 'empty' || !s.exercise) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          title={t('today.restDay')}
          actionLabel={t('common.back')}
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const { exercise } = s;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Cabecera compacta: siempre se ve dónde estás. */}
      <View
        style={{
          paddingHorizontal: screenPadding,
          paddingBottom: spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          onPress={() => router.back()}
          style={{ width: minTouchTarget, height: minTouchTarget, justifyContent: 'center' }}
        >
          <Ionicons name="chevron-down" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong">{s.workoutName}</Text>
          <Text variant="caption" color="muted">
            {t('workout.exerciseOf', { current: s.exerciseIndex + 1, total: s.exerciseTotal })}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: screenPadding, paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
      >
        {s.restored || s.offlineSaved ? (
          <Card style={{ marginBottom: spacing.lg, borderColor: colors.warning }}>
            <Text variant="caption">{t('workout.offlineSaved')}</Text>
          </Card>
        ) : null}

        <Text variant="h1" style={{ marginBottom: spacing.xs }}>
          {s.exerciseName}
        </Text>
        <Text variant="label" color="muted">
          {t('workout.target')}: {exercise.sets} × {exercise.repMin}–{exercise.repMax} · RIR{' '}
          {exercise.targetRir}
        </Text>

        {s.lastTimeSets.length > 0 ? (
          <Section title={t('workout.lastTime')}>
            <Card>
              <Text variant="numeric" color="muted">
                {s.lastTimeSets
                  .map((set) => `${set.weightKg ?? '—'} kg × ${set.reps ?? '—'}`)
                  .join('   ')}
              </Text>
            </Card>
          </Section>
        ) : null}

        {/* La sugerencia se propone; nunca se aplica sola. */}
        {s.suggestion && s.canIncreaseLoad ? (
          <Section>
            <Card style={{ gap: spacing.md, borderColor: colors.primary }}>
              <Text variant="bodyStrong">
                {s.suggestion.suggestedWeightKg !== null
                  ? `${s.suggestion.suggestedWeightKg} kg · ${s.suggestion.suggestedRepMin}–${s.suggestion.suggestedRepMax}`
                  : `${s.suggestion.suggestedRepMin}–${s.suggestion.suggestedRepMax} ${t('workout.reps').toLowerCase()}`}
              </Text>
              <Text variant="caption" color="muted">
                {t(s.suggestion.reasonKey, s.suggestion.reasonParams)}
              </Text>
              {/* Propuesta, no imposición: el peso solo sube si se toca esto. */}
              <Button
                label={t('common.continue')}
                variant="secondary"
                onPress={s.applySuggestion}
              />
            </Card>
          </Section>
        ) : null}

        <Section>
          <Card style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Text variant="label" color="muted" style={{ width: 24 }} />
              <Text variant="label" color="muted" style={{ flex: 1, textAlign: 'center' }}>
                {t('workout.weight')}
              </Text>
              <Text variant="label" color="muted" style={{ flex: 1, textAlign: 'center' }}>
                {t('workout.reps')}
              </Text>
              <Text variant="label" color="muted" style={{ flex: 1, textAlign: 'center' }}>
                {t('workout.rir')}
              </Text>
              <View style={{ width: minTouchTarget }} />
            </View>

            {s.sets.map((set, i) => (
              <SetRow
                key={i}
                index={i}
                set={set}
                onChange={(patch) => s.changeSet(i, patch)}
                onToggle={() => s.toggleSet(i)}
              />
            ))}

            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button
                label={t('common.add')}
                variant="ghost"
                fullWidth={false}
                size="md"
                onPress={s.addSet}
              />
              {s.sets.length > 1 ? (
                <Button
                  label={t('common.delete')}
                  variant="ghost"
                  fullWidth={false}
                  size="md"
                  onPress={s.removeLastSet}
                />
              ) : null}
            </View>
          </Card>
        </Section>

        <Section>
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            <Chip
              label={t('workout.swapExercise')}
              selected={showSwap}
              onPress={() => setShowSwap((v) => !v)}
            />
            <Chip
              label={t('workout.notes')}
              selected={showNotes}
              onPress={() => setShowNotes((v) => !v)}
            />
          </View>
        </Section>

        {showSwap ? (
          <Section>
            <Card style={{ gap: spacing.sm }}>
              {s.alternatives.length === 0 ? (
                <Text variant="caption" color="muted">
                  {t('states.emptyBody')}
                </Text>
              ) : (
                s.alternatives.map((alt) => (
                  <Button
                    key={alt.slug}
                    label={t(alt.nameKey)}
                    variant="secondary"
                    onPress={() => {
                      s.swapExercise(alt.slug);
                      setShowSwap(false);
                    }}
                  />
                ))
              )}
            </Card>
          </Section>
        ) : null}

        {showNotes ? (
          <Section>
            <Card>
              <TextInput
                accessibilityLabel={t('workout.notes')}
                multiline
                value={s.notes}
                onChangeText={s.saveNotes}
                placeholder={t('workout.notes')}
                placeholderTextColor={colors.textMuted}
                style={{
                  minHeight: 88,
                  color: colors.text,
                  textAlignVertical: 'top',
                }}
              />
            </Card>
          </Section>
        ) : null}
      </ScrollView>

      {/* Barra fija: descanso y avance, siempre al alcance del pulgar. */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: screenPadding,
          paddingTop: spacing.md,
          paddingBottom: spacing['2xl'],
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          borderTopLeftRadius: radius.xl,
          borderTopRightRadius: radius.xl,
          gap: spacing.md,
        }}
      >
        {s.rest.visible ? (
          <View style={{ gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="label" color="muted">
                {t('workout.rest')}
              </Text>
              <Pressable accessibilityRole="button" onPress={s.skipRest}>
                <Text variant="label" color="primary">
                  {t('common.skip')} · {s.rest.label}
                </Text>
              </Pressable>
            </View>
            <ProgressBar value={s.rest.progress} max={1} label={t('workout.rest')} />
          </View>
        ) : null}

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          {s.exerciseIndex < s.exerciseTotal - 1 ? (
            <Button label={t('workout.nextExercise')} onPress={s.nextExercise} />
          ) : (
            <Button
              label={t('workout.finish')}
              onPress={() => {
                s.finish();
                router.replace('/workout/summary');
              }}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
