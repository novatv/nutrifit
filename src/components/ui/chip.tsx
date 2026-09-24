import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';

import { useTheme } from '@/providers/theme-provider';
import { minTouchTarget } from '@/theme';
import { Text } from './text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

/** Opción seleccionable. El estado se marca con borde y fondo, no solo color. */
export function Chip({ label, selected, onPress, disabled }: ChipProps) {
  const { colors, radius, spacing } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress?.();
      }}
      style={({ pressed }) => ({
        minHeight: minTouchTarget,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        borderRadius: radius.pill,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primarySubtle : colors.surface,
        opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
      })}
    >
      <Text variant="bodyStrong" color={selected ? 'primary' : 'default'}>{label}</Text>
    </Pressable>
  );
}
