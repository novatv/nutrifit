import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button, Card, ProgressBar, Screen, Text } from '@/components/ui';
import { buildNutritionTargets } from '@/domain/nutrition';
import {
  evaluateOnboardingSafety,
  toUserProfile,
  validateStep,
} from '@/features/onboarding/onboarding-schema';
import { getLocale, t } from '@/i18n';
import { useTheme } from '@/providers';
import { useOnboardingStore } from '@/stores/onboarding-store';
import type { NutritionTargets } from '@/types/domain';

/**
 * Estados reales por los que pasa la creación del plan, en orden.
 * No hay ninguna IA pensando detrás: son los pasos del cálculo.
 */
const PHASE_KEYS = [
  'onboarding.generating.analyzing',
  'onboarding.generating.targets',
  'onboarding.generating.training',
  'onboarding.generating.nutrition',
  'onboarding.generating.weeks',
] as const;

/**
 * El cálculo es instantáneo; este intervalo solo existe para que cada estado
 * se pueda leer. Es corto a propósito: no simulamos un trabajo que no existe.
 */
const PHASE_MS = 450;

/**
 * Pantalla de generación.
 *
 * Calcula los objetivos nutricionales de verdad con el motor de dominio y
 * enseña el resumen inicial. Si algo del perfil no cuadra, no inventa cifras:
 * enseña solo lo que puede justificar.
 */
export default function OnboardingGeneratingScreen() {
  const { colors, spacing } = useTheme();
  const draft = useOnboardingStore((state) => state.draft);
  const [phase, setPhase] = useState(0);

  const complete = validateStep('summary', draft).ok;
  const blocked = evaluateOnboardingSafety(draft).blocked;

  const targets = useMemo<NutritionTargets | null>(() => {
    const profile = toUserProfile(draft, {
      id: 'onboarding-draft',
      displayName: '',
      locale: getLocale(),
    });
    if (!profile) return null;
    try {
      return buildNutritionTargets(profile);
    } catch {
      // El motor no debería fallar, pero una cifra inventada sería peor que ninguna.
      return null;
    }
  }, [draft]);

  useEffect(() => {
    if (phase >= PHASE_KEYS.length) return;
    const timer = setTimeout(() => setPhase((current) => current + 1), PHASE_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  if (blocked) return <Redirect href="/(onboarding)/review" />;
  if (!complete) return <Redirect href="/(onboarding)/summary" />;

  const ready = phase >= PHASE_KEYS.length;

  if (!ready) {
    return (
      <Screen scroll={false}>
        <View style={{ flex: 1, justifyContent: 'center', gap: spacing['2xl'] }}>
          <View style={{ gap: spacing.sm }}>
            <Text variant="h2">{t(PHASE_KEYS[phase])}</Text>
            <ProgressBar
              value={phase + 1}
              max={PHASE_KEYS.length}
              accessibilityLabel={t(PHASE_KEYS[phase])}
            />
          </View>

          <View style={{ gap: spacing.sm }}>
            {PHASE_KEYS.map((key, index) => (
              <View
                key={key}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
              >
                <Ionicons
                  name={index < phase ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={index < phase ? colors.success : colors.textMuted}
                />
                <Text variant="body" color={index <= phase ? 'default' : 'muted'}>
                  {t(key)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: spacing.lg, paddingTop: spacing['4xl'] }}>
        <Text variant="h1">{t('onboarding.ready.title')}</Text>

        <Card style={{ gap: spacing.md }}>
          <Text variant="bodyStrong">{t('onboarding.ready.weeks')}</Text>
          {draft.daysPerWeek !== undefined ? (
            <Text variant="body" color="muted">
              {t('onboarding.ready.sessions', { n: draft.daysPerWeek })}
            </Text>
          ) : null}
          {targets ? (
            <>
              <Text variant="body" color="muted">
                {t('onboarding.ready.kcal', { n: Math.round(targets.kcal) })}
              </Text>
              <Text variant="body" color="muted">
                {t('onboarding.ready.protein', { n: Math.round(targets.proteinG) })}
              </Text>
            </>
          ) : null}
        </Card>

        <Text variant="caption" color="muted">
          {t('disclaimer.estimate')}
        </Text>

        <Button
          label={t('onboarding.ready.cta')}
          onPress={() => router.replace('/(tabs)')}
          style={{ marginTop: spacing.lg }}
        />
      </View>
    </Screen>
  );
}
