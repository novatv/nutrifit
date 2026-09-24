/**
 * Proveedor de sesión.
 *
 * Se suscribe una sola vez a los cambios de sesión de Supabase y los vuelca en
 * el store. Las pantallas no hablan con el servicio: usan `useAuth()`, que es
 * la única puerta.
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';

import { t } from '@/i18n';
import { onAuthStateChange, type AuthSession, type AuthUser } from '@/services/auth';
import {
  selectIsAuthenticated,
  selectIsLoading,
  useAuthStore,
  type AuthStatus,
  type AuthStore,
} from '@/stores/auth-store';

export interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  status: AuthStatus;
  /** Clave i18n del error; ya traducida no, cruda de Supabase nunca. */
  errorKey: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialized: boolean;

  signIn: AuthStore['signIn'];
  signUp: AuthStore['signUp'];
  signOut: AuthStore['signOut'];
  resetPassword: AuthStore['resetPassword'];
  clearError: AuthStore['clearError'];

  /**
   * Pide confirmación explícita antes de borrar la cuenta y enseña el aviso
   * de que la acción no se puede deshacer. Solo si el usuario pulsa
   * "Eliminar" se llama al borrado real.
   */
  confirmDeleteAccount: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const session = useAuthStore((estado) => estado.session);
  const user = useAuthStore((estado) => estado.user);
  const status = useAuthStore((estado) => estado.status);
  const errorKey = useAuthStore((estado) => estado.errorKey);
  const initialized = useAuthStore((estado) => estado.initialized);
  const isLoading = useAuthStore(selectIsLoading);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const setSession = useAuthStore((estado) => estado.setSession);
  const initialize = useAuthStore((estado) => estado.initialize);
  const signIn = useAuthStore((estado) => estado.signIn);
  const signUp = useAuthStore((estado) => estado.signUp);
  const signOut = useAuthStore((estado) => estado.signOut);
  const resetPassword = useAuthStore((estado) => estado.resetPassword);
  const deleteAccount = useAuthStore((estado) => estado.deleteAccount);
  const clearError = useAuthStore((estado) => estado.clearError);

  useEffect(() => {
    void initialize();
    // La suscripción también cubre el refresco de token y el cierre remoto.
    return onAuthStateChange(setSession);
  }, [initialize, setSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      status,
      errorKey,
      isLoading,
      isAuthenticated,
      initialized,
      signIn,
      signUp,
      signOut,
      resetPassword,
      clearError,
      confirmDeleteAccount: () =>
        new Promise<boolean>((resolve) => {
          Alert.alert(
            t('auth.deleteAccount'),
            t('auth.deleteAccountWarning'),
            [
              { text: t('common.cancel'), style: 'cancel', onPress: () => resolve(false) },
              {
                text: t('common.delete'),
                style: 'destructive',
                onPress: () => {
                  void deleteAccount({ confirmed: true }).then(resolve);
                },
              },
            ],
            { cancelable: true, onDismiss: () => resolve(false) },
          );
        }),
    }),
    [
      session,
      user,
      status,
      errorKey,
      isLoading,
      isAuthenticated,
      initialized,
      signIn,
      signUp,
      signOut,
      resetPassword,
      clearError,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
