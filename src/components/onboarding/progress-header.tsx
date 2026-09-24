import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { ProgressBar, Text } from '@/components/ui';
import { t } from '@/i18n';
import { useTheme } from '@/providers';
import { minTouchTarget } from '@/theme';

export interface ProgressHeaderProps {
  /** Paso actual, 1..total. */
  current: number;
  total: number;
  /** Si no se pasa, no hay sitio al que volver (primer paso). */
  onBack?: () => void;
}

/**
 * Cabecera del onboarding: dónde estoy y cómo vuelvo.
 *
 * El progreso se dice dos veces a propósito, con número y con barra: el
 * número lo lee el lector de pantalla y la barra da la sensación de avance.
 */
export function ProgressHeader({ current, total, onBack }: ProgressHeaderProps) {
  const { colors, spacing } = useTheme();
  const stepLabel = t('onboarding.stepOf', { current, total });

  return (
    <View style={{ paddingTop: spacing.sm, gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            hitSlop={spacing.sm}
            style={({ pressed }) => ({
              width: minTouchTarget,
              height: minTouchTarget,
              marginLeft: -spacing.md,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
        ) : (
          <View style={{ width: minTouchTarget - spacing.md, height: minTouchTarget }} />
        )}
        <Text variant="label" color="muted">
          {stepLabel}
        </Text>
      </View>
      <ProgressBar value={current} max={total} accessibilityLabel={stepLabel} />
    </View>
  );
}
