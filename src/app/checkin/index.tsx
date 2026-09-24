import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Chip, Input, Screen, Section, Text } from '@/components/ui';
import {
  applyAdjustment,
  determineWeeklyAdjustment,
} from '@/domain/progress/weeklyAdjustmentEngine';
import { t } from '@/i18n';
import { useTheme } from '@/providers';
import { demoTargets } from '@/services/demo-data';
import { logger } from '@/services/logger';
import type { PlanAdjustment, WeeklyCheckin } from '@/types/domain';

type Scale = 1 | 2 | 3 | 4 | 5;
const SCALE: Scale[] = [1, 2, 3, 4, 5];

/** Fila de 1 a 5. El valor se lee del número, no solo del relleno. */
function ScaleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Scale;
  onChange: (v: Scale) => void;
}) {
  const { spacing } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="bodyStrong">{label}</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {SCALE.map((n) => (
          <Chip
            key={n}
            label={String(n)}
            selected={value === n}
            onPress={() => onChange(n)}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * Check-in semanal.
 *
 * Al enviar no se aplica nada: se enseña la propuesta con su antes, su después
 * y su razón, y el usuario decide. Un plan que cambia solo es un plan en el que
 * se deja de confiar.
 */
export default function CheckinScreen() {
  const { spacing } = useTheme();

  const [weight, setWeight] = useState('');
  const [adherence, setAdherence] = useState<Scale>(4);
  const [workouts, setWorkouts] = useState('4');
  const [hunger, setHunger] = useState<Scale>(3);
  const [energy, setEnergy] = useState<Scale>(4);
  const [sleep, setSleep] = useState<Scale>(4);
  const [difficulty, setDifficulty] = useState<Scale>(3);
  const [progress, setProgress] = useState<Scale>(3);

  const [proposal, setProposal] = useState<PlanAdjustment | null>(null);

  const submit = () => {
    const checkin: WeeklyCheckin = {
      weekNumber: 3,
      date: new Date().toISOString().slice(0, 10),
      weightKg: weight ? Number(weight.replace(',', '.')) : undefined,
      nutritionAdherence: adherence / 5,
      workoutsCompleted: Number(workouts) || 0,
      workoutsPlanned: 4,
      hunger,
      energy,
      sleep,
      difficulty,
      perceivedProgress: progress,
    };

    // Con datos reales aquí entrarían el historial y las sesiones de la semana.
    const result = determineWeeklyAdjustment({
      profile: {
        weightKg: checkin.weightKg ?? 80,
        goal: 'lose_fat',
        sex: 'male',
      } as never,
      currentTargets: demoTargets,
      checkins: [checkin, checkin, checkin],
      weights: [],
      sessions: [],
    });

    logger.info('Check-in enviado', { decision: result.decision });
    setProposal(result);
  };

  if (proposal) {
    const changes = proposal.before?.kcal !== undefined && proposal.after?.kcal !== undefined;
    return (
      <Screen>
        <View style={{ paddingTop: spacing.lg, gap: spacing.sm }}>
          <Text variant="h1">{t(`checkin.decision.${proposal.decision}`)}</Text>
        </View>

        {changes ? (
          <Section>
            <Card style={{ gap: spacing.lg }}>
              <View style={{ flexDirection: 'row', gap: spacing.xl }}>
                <View style={{ flex: 1, gap: spacing.xs }}>
                  <Text variant="label" color="muted">{t('checkin.before')}</Text>
                  <Text variant="h2">{proposal.before!.kcal} kcal</Text>
                </View>
                <View style={{ flex: 1, gap: spacing.xs }}>
                  <Text variant="label" color="muted">{t('checkin.after')}</Text>
                  <Text variant="h2" color="primary">{proposal.after!.kcal} kcal</Text>
                </View>
              </View>
              <View style={{ gap: spacing.xs }}>
                <Text variant="label" color="muted">{t('checkin.reason')}</Text>
                <Text variant="body">{t(proposal.explanationKey)}</Text>
              </View>
            </Card>
          </Section>
        ) : (
          <Section>
            <Card>
              <Text variant="body">{t(proposal.explanationKey)}</Text>
            </Card>
          </Section>
        )}

        <View style={{ gap: spacing.md, marginTop: spacing['2xl'] }}>
          {proposal.requiresConfirmation && changes ? (
            <>
              <Button
                label={t('checkin.confirmChange')}
                onPress={() => {
                  applyAdjustment(demoTargets, proposal);
                  router.back();
                }}
              />
              <Button
                label={t('checkin.keepAsIs')}
                variant="secondary"
                onPress={() => router.back()}
              />
            </>
          ) : (
            <Button label={t('common.done')} onPress={() => router.back()} />
          )}
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ paddingTop: spacing.lg, gap: spacing.xs }}>
        <Text variant="h1">{t('checkin.title')}</Text>
        <Text variant="body" color="muted">{t('checkin.subtitle')}</Text>
      </View>

      <Section>
        <Card style={{ gap: spacing.xl }}>
          <Input
            label={t('checkin.weight')}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder="80,0"
            suffix="kg"
            hint={t('common.optional')}
          />
          <Input
            label={t('checkin.workouts')}
            value={workouts}
            onChangeText={setWorkouts}
            keyboardType="number-pad"
          />
        </Card>
      </Section>

      <Section>
        <Card style={{ gap: spacing.xl }}>
          <ScaleRow label={t('checkin.adherence')} value={adherence} onChange={setAdherence} />
          <ScaleRow label={t('checkin.hunger')} value={hunger} onChange={setHunger} />
          <ScaleRow label={t('checkin.energy')} value={energy} onChange={setEnergy} />
          <ScaleRow label={t('checkin.sleep')} value={sleep} onChange={setSleep} />
          <ScaleRow label={t('checkin.difficulty')} value={difficulty} onChange={setDifficulty} />
          <ScaleRow
            label={t('checkin.perceivedProgress')}
            value={progress}
            onChange={setProgress}
          />
        </Card>
      </Section>

      <Button
        label={t('checkin.submit')}
        onPress={submit}
        style={{ marginTop: spacing['2xl'] }}
      />
    </Screen>
  );
}
