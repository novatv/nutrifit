import { useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/providers/theme-provider';
import { minTouchTarget } from '@/theme';
import { Text } from './text';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: string;
}

export function Input({ label, error, hint, suffix, style, ...rest }: InputProps) {
  const { colors, radius, spacing, typography } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: spacing.xs }}>
      {label ? <Text variant="label" color="muted">{label}</Text> : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          minHeight: minTouchTarget + 6,
          paddingHorizontal: spacing.md,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: error ? colors.danger : focused ? colors.primary : colors.border,
          backgroundColor: colors.surface,
        }}
      >
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.textMuted}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          style={[typography.body, { flex: 1, minWidth: 0, color: colors.text, paddingVertical: spacing.sm }, style]}
          {...rest}
        />
        {suffix ? (
          <Text variant="caption" color="muted" style={{ marginLeft: spacing.xs }}>
            {suffix}
          </Text>
        ) : null}
      </View>
      {error ? <Text variant="caption" color="danger">{error}</Text> : hint ? (
        <Text variant="caption" color="muted">{hint}</Text>
      ) : null}
    </View>
  );
}
