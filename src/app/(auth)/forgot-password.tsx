/**
 * Restablecer contraseña.
 *
 * Responde lo mismo exista o no el email: si dijéramos "ese correo no está
 * registrado" cualquiera podría averiguar quién usa la app probando
 * direcciones.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button, Input, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { useAuth } from '@/providers/auth-provider';
import { useTheme } from '@/providers/theme-provider';
import { resetPasswordSchema, type ResetPasswordValues } from '@/services/auth';
import { isDemoMode } from '@/services/supabase';

export default function ForgotPasswordScreen() {
  const { spacing } = useTheme();
  const { resetPassword, status, errorKey, isLoading, clearError } = useAuth();

  const { control, handleSubmit, formState } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onTouched',
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

  const enviado = status === 'success';

  const onSubmit = handleSubmit(async (values) => {
    await resetPassword(values.email);
  });

  return (
    <Screen>
      <View style={{ gap: spacing.xl, paddingTop: spacing['4xl'] }}>
        <Text variant="h1">{t('auth.forgot')}</Text>
        {isDemoMode ? (
          <Text variant="caption" color="muted">
            {t('auth.demoMode')}
          </Text>
        ) : null}

        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Input
              label={t('auth.email')}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              keyboardType="email-address"
              returnKeyType="send"
              editable={!isLoading && !enviado}
              onSubmitEditing={() => void onSubmit()}
            />
          )}
        />

        <View accessibilityLiveRegion="polite" style={{ minHeight: spacing['2xl'] }}>
          {isLoading ? (
            <Text variant="caption" color="muted">
              {t('common.loading')}
            </Text>
          ) : status === 'error' && errorKey ? (
            <Text variant="caption" color="danger" accessibilityRole="alert">
              {t(errorKey)}
            </Text>
          ) : enviado ? (
            <Text variant="caption" color="success">
              {t('auth.resetSent')}
            </Text>
          ) : null}
        </View>

        {/* Enviado el correo la acción ya no tiene sentido: se ofrece volver. */}
        {enviado ? (
          <Button label={t('common.back')} variant="secondary" onPress={() => router.back()} />
        ) : (
          <Button
            label={t('common.continue')}
            onPress={() => void onSubmit()}
            loading={isLoading}
            disabled={isLoading || formState.isSubmitting}
          />
        )}

        <View style={{ alignItems: 'center' }}>
          <Button
            label={t('auth.signIn')}
            variant="ghost"
            fullWidth={false}
            haptic={false}
            disabled={isLoading}
            onPress={() => router.replace('/(auth)/sign-in')}
          />
        </View>
      </View>
    </Screen>
  );
}
