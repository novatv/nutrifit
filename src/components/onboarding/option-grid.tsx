import { View } from 'react-native';

import { Chip } from '@/components/ui';
import { t } from '@/i18n';
import { useTheme } from '@/providers';
import { toggleMultiValue, type ChoiceOption } from '@/features/onboarding/steps';

export type OptionGridMode = 'single' | 'multi';

export interface OptionGridProps {
  options: readonly ChoiceOption[];
  /** Valores seleccionados; en modo `single` tendrá 0 o 1 elemento. */
  value: readonly string[];
  mode: OptionGridMode;
  onChange: (next: string[]) => void;
  /** Valor que anula al resto ("Ninguno", "Ninguna de las anteriores"). */
  exclusiveValue?: string;
  /** Nombre accesible del grupo; normalmente el título del paso. */
  accessibilityLabel?: string;
}

/**
 * Rejilla de opciones reutilizable, construida sobre `Chip`.
 *
 * `Chip` ya marca la selección con borde y fondo además del color, así que el
 * estado se distingue sin depender de distinguir tonos, y expone el estado
 * `selected` al lector de pantalla.
 */
export function OptionGrid({
  options,
  value,
  mode,
  onChange,
  exclusiveValue,
  accessibilityLabel,
}: OptionGridProps) {
  const { spacing } = useTheme();

  const handlePress = (optionValue: string) => {
    if (mode === 'single') {
      onChange([optionValue]);
      return;
    }
    onChange(toggleMultiValue(value, optionValue, exclusiveValue));
  };

  return (
    <View
      accessibilityRole={mode === 'single' ? 'radiogroup' : 'list'}
      accessibilityLabel={accessibilityLabel}
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}
    >
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label ?? t(option.labelKey ?? '', option.labelParams)}
          selected={value.includes(option.value)}
          onPress={() => handlePress(option.value)}
        />
      ))}
    </View>
  );
}
