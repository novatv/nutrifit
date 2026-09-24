import { Redirect, router } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { evaluateOnboardingSafety } from '@/features/onboarding/onboarding-schema';
import { t } from '@/i18n';
import { useTheme } from '@/providers';
import { useOnboardingStore } from '@/stores/onboarding-store';

/**
 * Pantalla de parada por seguridad.
 *
 * Aquí se llega cuando el cribado (o la edad) dice que un plan automático no
 * es lo adecuado. No se genera nada, no se negocia y no se esconde el motivo:
 * se explica cuál es y se sugiere hablar con un profesional.
 *
 * El botón principal cierra el onboarding sin plan; todavía no hay directorio
 * de profesionales al que enlazar, y mandar a ningún sitio inventado sería
 * peor que no mandar a ninguno.
 */
export default function OnboardingReviewScreen() {
  const { spacing } = useTheme();
  const draft = useOnboardingStore((state) => state.draft);
  const gate = evaluateOnboardingSafety(draft);

  // Si ya no hay motivo (se corrigió una respuesta), esta pantalla no pinta nada.
  if (!gate.blocked) return <Redirect href="/(onboarding)/summary" />;

  return (
    <Screen>
      <View style={{ gap: spacing.lg, paddingTop: spacing['4xl'] }}>
        <Text variant="h1">{t('onboarding.screeningTitle')}</Text>

        {gate.messageKeys.map((key) => (
          <Card key={key}>
            <Text variant="body">{t(key)}</Text>
          </Card>
        ))}

        <Text variant="caption" color="muted">
          {t('disclaimer.general')}
        </Text>
      </View>

      <View style={{ marginTop: spacing['3xl'], gap: spacing.md }}>
        <Button
          label={t('safety.seeProfessional')}
          onPress={() => router.replace('/(tabs)')}
        />
        <Button
          label={t('common.back')}
          variant="secondary"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(onboarding)'))}
        />
      </View>
    </Screen>
  );
}
