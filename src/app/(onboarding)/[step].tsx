import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { OptionGrid } from '@/components/onboarding/option-grid';
import { ProgressHeader } from '@/components/onboarding/progress-header';
import { Button, Input, Screen, Text } from '@/components/ui';
import {
  evaluateOnboardingSafety,
  validateStep,
  type DraftField,
  type OnboardingDraft,
  type StepValidation,
} from '@/features/onboarding/onboarding-schema';
import {
  BIRTH_DATE_MASK,
  NONE_VALUE,
  SCREENING_ITEMS,
  SUMMARY_ORDER,
  TOTAL_STEPS,
  UNIT_SYMBOL,
  choicePatch,
  findStepByParam,
  readChoice,
  type ScreeningItem,
  type StepDefinition,
} from '@/features/onboarding/steps';
import { t } from '@/i18n';
import { useTheme } from '@/providers';
import { minTouchTarget } from '@/theme';
import { useOnboardingStore } from '@/stores/onboarding-store';
import type { HealthScreening } from '@/types/domain';
import { cmToFeetInches, feetInchesToCm, kgToLb, lbToKg, roundTo } from '@/utils/units';

/** Cribado sin contestar: todo a false hasta que la persona diga lo contrario. */
const EMPTY_SCREENING: HealthScreening = {
  pregnantOrBreastfeeding: false,
  eatingDisorderCurrent: false,
  majorInjury: false,
  medicalNutritionTherapy: false,
  exerciseContraindicated: false,
};

/** Convierte lo tecleado en número, aceptando la coma decimal. */
function parseDecimal(text: string): number | undefined {
  const normalized = text.replace(',', '.').trim();
  if (normalized === '') return undefined;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

/** Va poniendo los guiones de AAAA-MM-DD mientras se teclea. */
function maskBirthDate(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  const parts = [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(
    (part) => part.length > 0,
  );
  return parts.join('-');
}

/* ------------------------------------------------------------- controles */

interface ControlProps {
  step: StepDefinition;
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
  errors: StepValidation['errors'];
}

/**
 * Paso 3. El dominio guarda siempre métrico; lo imperial es solo presentación
 * y se convierte aquí, en el borde de la interfaz, con `@/utils/units`.
 */
function MeasurementsControl({ step, draft, update, errors }: ControlProps) {
  const { spacing } = useTheme();
  const imperial = draft.unitSystem === 'imperial';

  const initialFeetInches = draft.heightCm ? cmToFeetInches(draft.heightCm) : undefined;

  const [birthText, setBirthText] = useState(draft.birthDate ?? '');
  const [heightText, setHeightText] = useState(
    draft.heightCm ? String(roundTo(draft.heightCm, 0)) : '',
  );
  const [feetText, setFeetText] = useState(
    initialFeetInches ? String(initialFeetInches.feet) : '',
  );
  const [inchesText, setInchesText] = useState(
    initialFeetInches ? String(initialFeetInches.inches) : '',
  );
  const [weightText, setWeightText] = useState(() => {
    if (draft.weightKg === undefined) return '';
    return String(roundTo(imperial ? kgToLb(draft.weightKg) : draft.weightKg, 1));
  });
  const [targetText, setTargetText] = useState(() => {
    if (draft.targetWeightKg === undefined) return '';
    return String(roundTo(imperial ? kgToLb(draft.targetWeightKg) : draft.targetWeightKg, 1));
  });

  const onBirthChange = (value: string) => {
    const masked = maskBirthDate(value);
    setBirthText(masked);
    update({ birthDate: masked.length === 10 ? masked : undefined });
  };

  const onHeightChange = (value: string) => {
    setHeightText(value);
    const cm = parseDecimal(value);
    update({ heightCm: cm === undefined ? undefined : roundTo(cm, 1) });
  };

  const onFeetInchesChange = (feet: string, inches: string) => {
    setFeetText(feet);
    setInchesText(inches);
    const f = parseDecimal(feet);
    const i = parseDecimal(inches) ?? 0;
    update({ heightCm: f === undefined ? undefined : roundTo(feetInchesToCm(f, i), 1) });
  };

  const onWeightChange = (value: string) => {
    setWeightText(value);
    const raw = parseDecimal(value);
    const kg = raw === undefined ? undefined : roundTo(imperial ? lbToKg(raw) : raw, 1);
    update({ weightKg: kg });
  };

  const onTargetChange = (value: string) => {
    setTargetText(value);
    const raw = parseDecimal(value);
    const kg = raw === undefined ? undefined : roundTo(imperial ? lbToKg(raw) : raw, 1);
    update({ targetWeightKg: kg });
  };

  const weightSuffix = imperial ? UNIT_SYMBOL.lb : UNIT_SYMBOL.kg;

  return (
    <View style={{ gap: spacing.xl }}>
      <Input
        label={t('onboarding.birthDate')}
        accessibilityLabel={t('onboarding.birthDate')}
        value={birthText}
        onChangeText={onBirthChange}
        keyboardType="number-pad"
        placeholder={BIRTH_DATE_MASK}
        maxLength={10}
        error={errors.birthDate ? t(errors.birthDate) : undefined}
        hint={BIRTH_DATE_MASK}
      />

      <View style={{ gap: spacing.sm }}>
        <Text variant="label" color="muted">
          {t('onboarding.sexTitle')}
        </Text>
        <OptionGrid
          options={step.options ?? []}
          value={readChoice('sex', draft)}
          mode="single"
          onChange={(next) => update(choicePatch('sex', next))}
          accessibilityLabel={t('onboarding.sexTitle')}
        />
        <Text variant="caption" color="muted">
          {t('onboarding.sexWhy')}
        </Text>
      </View>

      {imperial ? (
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Input
              label={t('onboarding.height')}
              accessibilityLabel={t('onboarding.height')}
              value={feetText}
              onChangeText={(value) => onFeetInchesChange(value, inchesText)}
              keyboardType="numeric"
              suffix={UNIT_SYMBOL.ft}
              error={errors.heightCm ? t(errors.heightCm) : undefined}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label={t('onboarding.height')}
              accessibilityLabel={t('onboarding.height')}
              value={inchesText}
              onChangeText={(value) => onFeetInchesChange(feetText, value)}
              keyboardType="numeric"
              suffix={UNIT_SYMBOL.in}
            />
          </View>
        </View>
      ) : (
        <Input
          label={t('onboarding.height')}
          accessibilityLabel={t('onboarding.height')}
          value={heightText}
          onChangeText={onHeightChange}
          keyboardType="numeric"
          suffix={UNIT_SYMBOL.cm}
          error={errors.heightCm ? t(errors.heightCm) : undefined}
        />
      )}

      <Input
        label={t('onboarding.weight')}
        accessibilityLabel={t('onboarding.weight')}
        value={weightText}
        onChangeText={onWeightChange}
        keyboardType="numeric"
        suffix={weightSuffix}
        error={errors.weightKg ? t(errors.weightKg) : undefined}
      />

      <Input
        label={t('onboarding.targetWeight')}
        accessibilityLabel={t('onboarding.targetWeight')}
        value={targetText}
        onChangeText={onTargetChange}
        keyboardType="numeric"
        suffix={weightSuffix}
        hint={t('common.optional')}
        error={errors.targetWeightKg ? t(errors.targetWeightKg) : undefined}
      />
    </View>
  );
}

/** Paso 6: dos preguntas que se contestan juntas, días y minutos. */
function AvailabilityControl({ step, draft, update }: ControlProps) {
  const { spacing } = useTheme();
  return (
    <View style={{ gap: spacing.xl }}>
      <OptionGrid
        options={step.options ?? []}
        value={readChoice('daysPerWeek', draft)}
        mode="single"
        onChange={(next) => update(choicePatch('daysPerWeek', next))}
        accessibilityLabel={t(step.titleKey)}
      />
      <View style={{ gap: spacing.sm }}>
        <Text variant="label" color="muted">
          {t(step.secondaryTitleKey ?? '')}
        </Text>
        <OptionGrid
          options={step.secondaryOptions ?? []}
          value={readChoice('sessionMinutes', draft)}
          mode="single"
          onChange={(next) => update(choicePatch('sessionMinutes', next))}
          accessibilityLabel={t(step.secondaryTitleKey ?? '')}
        />
      </View>
    </View>
  );
}

/** Paso 11: texto libre que se acumula como lista de chips. */
function TagsControl({ draft, update }: ControlProps) {
  const { spacing } = useTheme();
  const [text, setText] = useState('');
  const foods = draft.dislikedFoods ?? [];

  const addFood = () => {
    const value = text.trim();
    setText('');
    if (value === '' || foods.includes(value)) return;
    update({ dislikedFoods: [...foods, value] });
  };

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Input
            accessibilityLabel={t('onboarding.dislikesTitle')}
            value={text}
            onChangeText={setText}
            onSubmitEditing={addFood}
            returnKeyType="done"
            autoCapitalize="none"
          />
        </View>
        <Button
          label={t('common.add')}
          variant="secondary"
          size="md"
          fullWidth={false}
          onPress={addFood}
          accessibilityHint={t('onboarding.dislikesHint')}
        />
      </View>

      {foods.length > 0 ? (
        // Tocar un chip lo quita de la lista: sigue siendo una selección,
        // solo que las opciones las ha escrito la persona.
        <OptionGrid
          options={foods.map((food) => ({ value: food, label: food }))}
          value={foods}
          mode="multi"
          onChange={(next) => update({ dislikedFoods: next })}
          accessibilityLabel={t('onboarding.dislikesTitle')}
        />
      ) : null}
    </View>
  );
}

interface CheckRowProps {
  label: string;
  checked: boolean;
  onPress: () => void;
}

/** Fila de casilla. El estado se ve en el icono, no solo en el color. */
function CheckRow({ label, checked, onPress }: CheckRowProps) {
  const { colors, spacing, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={({ pressed }) => ({
        minHeight: minTouchTarget,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.md,
        borderWidth: checked ? 2 : 1,
        borderColor: checked ? colors.primary : colors.border,
        backgroundColor: checked ? colors.primarySubtle : colors.surface,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Ionicons
        name={checked ? 'checkbox' : 'square-outline'}
        size={22}
        color={checked ? colors.primary : colors.textMuted}
      />
      <Text variant="body" style={{ flex: 1 }}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Paso 15: cribado de seguridad, con su opción de "ninguna de las anteriores". */
function ScreeningControl({ draft, update }: ControlProps) {
  const { spacing } = useTheme();
  const screening = draft.screening;
  const noneChecked =
    screening !== undefined && SCREENING_ITEMS.every((item) => !screening[item]);

  const toggleItem = (item: ScreeningItem) => {
    const base = screening ?? EMPTY_SCREENING;
    const next: HealthScreening = { ...base };
    next[item] = !base[item];
    update({ screening: next });
  };

  const toggleNone = () => {
    // Marcar "ninguna" responde el paso entero; desmarcarla lo deja sin responder.
    update({ screening: noneChecked ? undefined : EMPTY_SCREENING });
  };

  return (
    <View style={{ gap: spacing.sm }}>
      {SCREENING_ITEMS.map((item) => (
        <CheckRow
          key={item}
          label={t(`onboarding.screening.${item}`)}
          checked={screening?.[item] === true}
          onPress={() => toggleItem(item)}
        />
      ))}
      <CheckRow
        label={t(`onboarding.screening.${NONE_VALUE}`)}
        checked={noneChecked}
        onPress={toggleNone}
      />
    </View>
  );
}

function StepControlView(props: ControlProps) {
  const { step, draft, update } = props;
  const field: DraftField = step.fields[0];

  switch (step.control) {
    case 'single':
    case 'multi':
      return (
        <OptionGrid
          options={step.options ?? []}
          value={readChoice(field, draft)}
          mode={step.control}
          onChange={(next) => update(choicePatch(field, next))}
          exclusiveValue={step.exclusiveValue}
          accessibilityLabel={t(step.titleKey)}
        />
      );
    case 'measurements':
      return <MeasurementsControl {...props} />;
    case 'availability':
      return <AvailabilityControl {...props} />;
    case 'tags':
      return <TagsControl {...props} />;
    case 'screening':
      return <ScreeningControl {...props} />;
    default:
      return null;
  }
}

/* --------------------------------------------------------------- pantalla */

/**
 * Pasos 2 a 15.
 *
 * Una sola ruta dinámica: el paso se resuelve en `steps.ts` y esta pantalla
 * solo sabe pintar tipos de control, mostrar el progreso y decidir si deja
 * avanzar. Añadir una pregunta no toca este archivo.
 */
export default function OnboardingStepScreen() {
  const params = useLocalSearchParams<{ step?: string }>();
  const { spacing } = useTheme();
  const draft = useOnboardingStore((state) => state.draft);
  const update = useOnboardingStore((state) => state.update);
  const setStep = useOnboardingStore((state) => state.setStep);

  const step = findStepByParam(params.step);

  useEffect(() => {
    if (step) setStep(step.order);
  }, [step, setStep]);

  // Ruta inventada o fuera de rango: se vuelve al principio del flujo.
  if (!step || step.order < 2 || step.order >= SUMMARY_ORDER) {
    return <Redirect href="/(onboarding)" />;
  }

  const validation = validateStep(step.id, draft);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(onboarding)');
  };

  const goNext = () => {
    if (!validation.ok) return;
    const latest = useOnboardingStore.getState().draft;

    // Cribado: si hay un motivo de seguridad no se genera nada automático.
    if (step.id === 'screening' && evaluateOnboardingSafety(latest).blocked) {
      router.replace('/(onboarding)/review');
      return;
    }

    // Si ya está todo contestado, es que se vino del resumen a corregir algo:
    // se vuelve allí en vez de recorrer otra vez los pasos siguientes.
    const answered = validateStep('summary', latest).ok;
    const next = step.order + 1;

    if (answered || next >= SUMMARY_ORDER) {
      setStep(SUMMARY_ORDER);
      router.push('/(onboarding)/summary');
      return;
    }

    setStep(next);
    router.push({ pathname: '/(onboarding)/[step]', params: { step: String(next) } });
  };

  return (
    <Screen>
      <ProgressHeader current={step.order} total={TOTAL_STEPS} onBack={goBack} />

      <View style={{ gap: spacing.lg, paddingTop: spacing['2xl'] }}>
        <Text variant="h1">{t(step.titleKey)}</Text>
        {step.hintKey ? (
          <Text variant="body" color="muted">
            {t(step.hintKey)}
          </Text>
        ) : null}

        <StepControlView step={step} draft={draft} update={update} errors={validation.errors} />
      </View>

      <Button
        label={t('common.continue')}
        disabled={!validation.ok}
        onPress={goNext}
        style={{ marginTop: spacing['3xl'] }}
      />
    </Screen>
  );
}
