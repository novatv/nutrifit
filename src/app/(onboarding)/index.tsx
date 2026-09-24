import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import { Logo } from '@/components/brand/logo';
import { ProgressHeader } from '@/components/onboarding/progress-header';
import { Button, Screen, Text } from '@/components/ui';
import { FIRST_QUESTION_ORDER, TOTAL_STEPS, stepById } from '@/features/onboarding/steps';
import { t } from '@/i18n';
import { useTheme } from '@/providers';
import { useOnboardingStore } from '@/stores/onboarding-store';

/**
 * Paso 1: bienvenida.
 *
 * Explica qué vamos a preguntar y por qué, y pone el aviso general antes de
 * pedir el primer dato de salud, no después.
 */
export default function OnboardingWelcomeScreen() {
  const { spacing } = useTheme();
  const step = stepById('welcome');
  const setStep = useOnboardingStore((state) => state.setStep);

  // Volver aquí desde el paso 2 no borra lo contestado: solo mueve el progreso.
  useEffect(() => {
    setStep(step.order);
  }, [setStep, step.order]);

  return (
    <Screen>
      <ProgressHeader current={step.order} total={TOTAL_STEPS} />

      <View style={{ flex: 1, gap: spacing.md, paddingTop: spacing['4xl'] }}>
        <Logo size="lg" style={{ marginBottom: spacing.lg }} />
        <Text variant="h1">{t(step.titleKey)}</Text>
        <Text variant="body" color="muted">
          {t('onboarding.welcomeBody')}
        </Text>
        <Text variant="caption" color="muted" style={{ marginTop: spacing.lg }}>
          {t('disclaimer.general')}
        </Text>
      </View>

      <View style={{ marginTop: spacing['4xl'] }}>
        <Button
          label={t('common.continue')}
          onPress={() => {
            useOnboardingStore.getState().setStep(FIRST_QUESTION_ORDER);
            router.push({
              pathname: '/(onboarding)/[step]',
              params: { step: String(FIRST_QUESTION_ORDER) },
            });
          }}
        />
      </View>
    </Screen>
  );
}
