import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, View, type ViewStyle } from 'react-native';

import { useTheme } from '@/providers/theme-provider';
import { minTouchTarget } from '@/theme';
import { Text } from './text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  /** Feedback háptico discreto; se omite en acciones repetitivas. */
  haptic?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled,
  loading,
  fullWidth = true,
  icon,
  haptic = true,
  style,
  accessibilityHint,
}: ButtonProps) {
  const { colors, radius, spacing } = useTheme();
  const inactive = disabled || loading;

  const surface: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.danger },
  };

  const labelColor =
    variant === 'primary' ? 'inverse' : variant === 'danger' ? 'inverse' : 'default';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      accessibilityHint={accessibilityHint}
      disabled={inactive}
      onPress={() => {
        if (haptic) void Haptics.selectionAsync();
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          minHeight: size === 'lg' ? 52 : minTouchTarget,
          paddingHorizontal: spacing.xl,
          borderRadius: radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: spacing.sm,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: inactive ? 0.5 : pressed ? 0.85 : 1,
        },
        surface[variant],
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.onPrimary : colors.text} />
      ) : (
        <>
          {icon ? <View>{icon}</View> : null}
          <Text
            variant="bodyStrong"
            color={variant === 'primary' || variant === 'danger' ? labelColor : 'default'}
            style={variant === 'primary' ? { color: colors.onPrimary } : undefined}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
