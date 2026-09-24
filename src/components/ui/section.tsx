import { View } from 'react-native';

import { useTheme } from '@/providers/theme-provider';
import { Text } from './text';

export interface SectionProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export function Section({ title, action, children }: SectionProps) {
  const { spacing } = useTheme();
  return (
    <View style={{ marginTop: spacing['2xl'] }}>
      {(title || action) && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.md,
          }}
        >
          {title ? <Text variant="label" color="muted">{title}</Text> : <View />}
          {action}
        </View>
      )}
      {children}
    </View>
  );
}
