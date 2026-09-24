import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';

import { ProgressHeader } from '@/components/onboarding/progress-header';
import { Button, Card, Screen, Text } from '@/components/ui';
import {
  cautionKeys,
  evaluateOnboardingSafety,
  validateStep,
  type OnboardingDraft,
} from '@/features/onboarding/onboarding-schema';
import {
  SUMMARY_ORDER,
  TOTAL_STEPS,
  UNIT_SYMBOL,
  stepById,
} from '@/features/onboarding/steps';
import { t } from '@/i18n';
import { useTheme } from '@/providers';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { cmToFeetInches, displayWeight, roundTo } from '@/utils/units';

interface SummaryRow {
  key: string;
  labelKey: string;
  value: string;
  /** Paso al que se vuelve si se toca la fila. */
  order: number;
}

/** Une varias opciones ya elegidas en una sola línea legible. */
function joinLabels(values: readonly string[] | undefined, prefix: string): string {
  if (!values || values.length === 0) return '—';
  return values.map((value) => t(`${prefix}.${value}`)).join(' · ');
}

/** Altura y peso en las unidades que usa la persona, no en las del dominio. */
function formatBody(draft: OnboardingDraft): string {
  const imperial = draft.unitSystem === 'imperial';
  const parts: string[] = [];

  if (draft.birthDate) parts.push(draft.birthDate);

  if (draft.heightCm !== undefined) {
    if (imperial) {
      const { feet, inches } = cmToFeetInches(draft.heightCm);
      parts.push(`${feet}${UNIT_SYMBOL.ft} ${inches}${UNIT_SYMBOL.in}`);
    } else {
      parts.push(`${roundTo(draft.heightCm, 0)} ${UNIT_SYMBOL.cm}`);
    }
  }

  if (draft.weightKg !== undefined) {
    const weight = displayWeight(draft.weightKg, imperial ? 'imperial' : 'metric');
    parts.push(`${weight.value} ${weight.unit}`);
  }

  return parts.length > 0 ? parts.join(' · ') : '—';
}

function buildRows(draft: OnboardingDraft): SummaryRow[] {
  const rows: SummaryRow[] = [
    {
      key: 'goal',
      labelKey: 'onboarding.goalTitle',
      value: draft.goal ? t(`onboarding.goal.${draft.goal}`) : '—',
      order: stepById('goal').order,
    },
    {
      key: 'data',
      labelKey: 'onboarding.dataTitle',
      value: formatBody(draft),
      order: stepById('data').order,
    },
    {
      key: 'activity',
      labelKey: 'onboarding.activityTitle',
      value: draft.activityLevel ? t(`onboarding.activity.${draft.activityLevel}`) : '—',
      order: stepById('activity').order,
    },
    {
      key: 'experience',
      labelKey: 'onboarding.experienceTitle',
      value: draft.experience ? t(`onboarding.experience.${draft.experience}`) : '—',
      order: stepById('experience').order,
    },
    {
      key: 'availability',
      labelKey: 'onboarding.availabilityTitle',
      value:
        draft.daysPerWeek !== undefined && draft.sessionMinutes !== undefined
          ? `${draft.daysPerWeek} · ${t('onboarding.minutes', { n: draft.sessionMinutes })}`
          : '—',
      order: stepById('availability').order,
    },
    {
      key: 'location',
      labelKey: 'onboarding.locationTitle',
      value: draft.location ? t(`onboarding.location.${draft.location}`) : '—',
      order: stepById('location').order,
    },
    {
      key: 'equipment',
      labelKey: 'onboarding.equipmentTitle',
      value: joinLabels(draft.equipment, 'onboarding.equipment'),
      order: stepById('equipment').order,
    },
    {
      key: 'diet',
      labelKey: 'onboarding.dietTitle',
      value: draft.diet ? t(`onboarding.diet.${draft.diet}`) : '—',
      order: stepById('diet').order,
    },
    {
      key: 'allergens',
      labelKey: 'onboarding.allergensTitle',
      value: joinLabels(draft.allergens, 'onboarding.allergen'),
      order: stepById('allergens').order,
    },
    {
      key: 'dislikes',
      labelKey: 'onboarding.dislikesTitle',
      value:
        draft.dislikedFoods && draft.dislikedFoods.length > 0
          ? draft.dislikedFoods.join(' · ')
          : '—',
      order: stepById('dislikes').order,
    },
    {
      key: 'meals',
      labelKey: 'onboarding.mealsTitle',
      value: draft.mealsPerDay !== undefined ? String(draft.mealsPerDay) : '—',
      order: stepById('meals').order,
    },
    {
      key: 'budget',
      labelKey: 'onboarding.budgetTitle',
      value: draft.budget ? t(`onboarding.budget.${draft.budget}`) : '—',
      order: stepById('budget').order,
    },
    {
      key: 'cooking',
      labelKey: 'onboarding.cookingTitle',
      value: draft.cookingTime ? t(`onboarding.cooking.${draft.cookingTime}`) : '—',
      order: stepById('cooking').order,
    },
  ];
  return rows;
}

/**
 * Paso 16: resumen.
 *
 * Antes de calcular nada, la persona ve exactamente con qué vamos a calcular
 * y puede corregir cualquier respuesta tocándola.
 */
export default function OnboardingSummaryScreen() {
  const { colors, spacing, radius } = useTheme();
  const draft = useOnboardingStore((state) => state.draft);
  const setStep = useOnboardingStore((state) => state.setStep);

  useEffect(() => {
    setStep(SUMMARY_ORDER);
  }, [setStep]);

  const rows = buildRows(draft);
  const complete = validateStep('summary', draft).ok;
  const cautions = cautionKeys(draft);

  const goToStep = (order: number) => {
    setStep(order);
    router.push({ pathname: '/(onboarding)/[step]', params: { step: String(order) } });
  };

  const createPlan = () => {
    // Última comprobación antes de generar: el cribado manda siempre.
    if (evaluateOnboardingSafety(draft).blocked) {
      router.replace('/(onboarding)/review');
      return;
    }
    router.replace('/(onboarding)/generating');
  };

  return (
    <Screen>
      <ProgressHeader
        current={SUMMARY_ORDER}
        total={TOTAL_STEPS}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(onboarding)'))}
      />

      <View style={{ gap: spacing.lg, paddingTop: spacing['2xl'] }}>
        <Text variant="h1">{t('onboarding.summaryTitle')}</Text>

        <Card padded={false} style={{ overflow: 'hidden' }}>
          {rows.map((row, index) => (
            <Pressable
              key={row.key}
              onPress={() => goToStep(row.order)}
              accessibilityRole="button"
              accessibilityLabel={`${t(row.labelKey)}: ${row.value}`}
              accessibilityHint={t('common.edit')}
              style={({ pressed }) => ({
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                gap: spacing.xs,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: colors.border,
                borderRadius: index === 0 ? radius.xl : radius.none,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text variant="label" color="muted">
                {t(row.labelKey)}
              </Text>
              <Text variant="body">{row.value}</Text>
            </Pressable>
          ))}
        </Card>

        {cautions.map((key) => (
          <Card key={key}>
            <Text variant="body">{t(key)}</Text>
          </Card>
        ))}

        <Text variant="caption" color="muted">
          {t('disclaimer.estimate')}
        </Text>
      </View>

      <Button
        label={t('onboarding.createPlan')}
        disabled={!complete}
        onPress={createPlan}
        style={{ marginTop: spacing['3xl'] }}
      />

      <Text variant="caption" color="muted" style={{ marginTop: spacing.lg }}>
        {t('disclaimer.general')}
      </Text>
    </Screen>
  );
}
