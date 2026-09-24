import React from 'react';
import { View } from 'react-native';

import { logger } from '@/services/logger';
import { t } from '@/i18n';
import { Button, Text } from '@/components/ui';

interface State { hasError: boolean }

/**
 * Última red de seguridad: un fallo de render nunca debe dejar la pantalla
 * en blanco sin explicación ni salida.
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('Fallo de render no controlado', error, { componentStack: info.componentStack });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }}>
        <Text variant="h2" center>{t('states.errorTitle')}</Text>
        <Text variant="body" color="muted" center>{t('states.errorBody')}</Text>
        <Button
          label={t('common.retry')}
          fullWidth={false}
          onPress={() => this.setState({ hasError: false })}
        />
      </View>
    );
  }
}
