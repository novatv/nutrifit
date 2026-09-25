/**
 * Crear cuenta.
 *
 * Si el proyecto de Supabase exige confirmar el email, no hay sesión al
 * terminar: la pantalla se queda enseñando el éxito en vez de navegar, porque
 * mandar al onboarding a alguien que aún no puede entrar es peor que esperar.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Logo } from '@/components/brand/logo';
import { Button, Input, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { useAuth } from '@/providers/auth-provider';
import { useTheme } from '@/providers/theme-provider';
import { signUpSchema, type SignUpValues } from '@/services/auth';
import { useAuthStore } from '@/stores/auth-store';

export default function SignUpScreen() {
  const { spacing } = useTheme();
  const { signUp, status, errorKey, isLoading, clearError } = useAuth();

  const { control, handleSubmit, formState } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = handleSubmit(async (values) => {
    const creada = await signUp(values);
    // Se lee el estado recién escrito, no el del render: hay sesión solo si la
    // cuenta ya es utilizable (proyecto sin confirmación de email obligatoria).
    if (creada && useAuthStore.getState().session) router.replace('/(onboarding)');
  });

  return (
    <Screen>
      <View style={{ gap: spacing.xl, paddingTop: spacing['4xl'] }}>
        <Logo size="lg" style={{ alignSelf: 'center' }} />
        <Text variant="h1">{t('auth.signUpTitle')}</Text>

        <View style={{ gap: spacing.lg }}>
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
                returnKeyType="next"
                editable={!isLoading}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <Input
                label={t('auth.password')}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                textContentType="newPassword"
                returnKeyType="go"
                editable={!isLoading}
                onSubmitEditing={() => void onSubmit()}
              />
            )}
          />
        </View>

        <View accessibilityLiveRegion="polite" style={{ minHeight: spacing['2xl'] }}>
          {isLoading ? (
            <Text variant="caption" color="muted">
              {t('common.loading')}
            </Text>
          ) : status === 'error' && errorKey ? (
            <Text variant="caption" color="danger" accessibilityRole="alert">
              {t(errorKey)}
            </Text>
          ) : status === 'success' ? (
            <Text variant="caption" color="success">
              {t('common.done')}
            </Text>
          ) : null}
        </View>

        <Button
          label={t('auth.signUp')}
          onPress={() => void onSubmit()}
          loading={isLoading}
          disabled={isLoading || formState.isSubmitting}
        />

        <View style={{ gap: spacing.xs, alignItems: 'center' }}>
          <Text variant="caption" color="muted">
            {t('auth.hasAccount')}
          </Text>
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
