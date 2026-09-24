import { View } from 'react-native';

import { useTheme } from '@/providers/theme-provider';
import { t } from '@/i18n';
import { Button } from './button';
import { Text } from './text';

export interface EmptyStateProps {
  title?: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, body, actionLabel, onAction }: EmptyStateProps) {
  const { spacing } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing['4xl'], gap: spacing.sm }}>
      <Text variant="h3" center>{title ?? t('states.emptyTitle')}</Text>
      <Text variant="body" color="muted" center style={{ maxWidth: 280 }}>
        {body ?? t('states.emptyBody')}
      </Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" fullWidth={false} style={{ marginTop: spacing.md }} />
      ) : null}
    </View>
  );
}

export interface ErrorStateProps {
  body?: string;
  onRetry?: () => void;
}

export function ErrorState({ body, onRetry }: ErrorStateProps) {
  const { spacing } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: spacing['4xl'], gap: spacing.sm }}>
      <Text variant="h3" center>{t('states.errorTitle')}</Text>
      <Text variant="body" color="muted" center style={{ maxWidth: 280 }}>
        {body ?? t('states.errorBody')}
      </Text>
      {onRetry ? (
        <Button label={t('common.retry')} onPress={onRetry} variant="secondary" fullWidth={false} style={{ marginTop: spacing.md }} />
      ) : null}
    </View>
  );
}

export interface SkeletonProps {
  height?: number;
  width?: number | `${number}%`;
  radiusKey?: 'sm' | 'md' | 'lg' | 'xl' | 'pill';
}

export function Skeleton({ height = 16, width = '100%', radiusKey = 'md' }: SkeletonProps) {
  const { colors, radius } = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ height, width, borderRadius: radius[radiusKey], backgroundColor: colors.skeleton }}
    />
  );
}
