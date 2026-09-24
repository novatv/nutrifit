/**
 * Entrar con email y contraseña.
 *
 * La validación es de formato, no de identidad: si el email existe o no lo
 * decide el servidor, y su respuesta se cuenta siempre igual
 * (`auth.errorInvalid`) para no revelar qué correos tienen cuenta.
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
import { signInSchema, type SignInValues } from '@/services/auth';

export default function SignInScreen() {
  const { spacing } = useTheme();
  const { signIn, status, errorKey, isLoading, clearError } = useAuth();
  const { control, handleSubmit, formState } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onTouched',
  });

  // El estado de autenticación es compartido: se limpia lo que dejó la
  // pantalla anterior para no heredar un error ajeno.
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = handleSubmit(async (values) => {
    const entrado = await signIn(values);
    if (entrado) router.replace('/(tabs)');
  });

  return (
    <Screen>
      <View style={{ gap: spacing.xl, paddingTop: spacing['4xl'] }}>
        <Text variant="h1">{t('auth.signInTitle')}</Text>

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
                inputMode="email"
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
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                editable={!isLoading}
                onSubmitEditing={() => void onSubmit()}
              />
            )}
          />
        </View>

        {/* Un solo hueco para el estado de la operación, siempre en el mismo sitio. */}
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
          label={t('auth.signIn')}
          onPress={() => void onSubmit()}
          loading={isLoading}
          disabled={isLoading || formState.isSubmitting}
        />

        <View style={{ gap: spacing.xs, alignItems: 'center' }}>
          <Button
            label={t('auth.forgot')}
            variant="ghost"
            fullWidth={false}
            haptic={false}
            disabled={isLoading}
            onPress={() => router.push('/(auth)/forgot-password')}
          />
          <Text variant="caption" color="muted">
            {t('auth.noAccount')}
          </Text>
          <Button
            label={t('auth.signUp')}
            variant="ghost"
            fullWidth={false}
            haptic={false}
            disabled={isLoading}
            onPress={() => router.push('/(auth)/sign-up')}
          />
        </View>
      </View>
    </Screen>
  );
}
