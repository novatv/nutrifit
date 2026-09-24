/**
 * Estado de sesión en memoria.
 *
 * Quien persiste la sesión es Supabase (AsyncStorage + refresco automático);
 * aquí solo vive el espejo que necesita la interfaz. Por eso no hay `persist`:
 * si este store y Supabase discreparan, mandaría el store equivocado.
 *
 * Del error se guarda la clave i18n, nunca el texto del proveedor.
 */

import { create } from 'zustand';

import {
  AUTH_ERROR_KEYS,
  deleteAccount as deleteAccountRemoto,
  getSession,
  resetPassword as resetPasswordRemoto,
  signIn as signInRemoto,
  signOut as signOutRemoto,
  signUp as signUpRemoto,
  type AuthSession,
  type AuthUser,
  type SignInValues,
  type SignUpValues,
} from '@/services/auth';
import { logger } from '@/services/logger';

/** Estado visible de la última operación. Rige qué pinta cada pantalla. */
export type AuthStatus = 'idle' | 'loading' | 'error' | 'success';

export interface AuthStore {
  session: AuthSession | null;
  user: AuthUser | null;
  status: AuthStatus;
  /** Clave i18n del error, p. ej. `auth.errorNetwork`. Nunca un mensaje crudo. */
  errorKey: string | null;
  /** `true` cuando ya se ha consultado la sesión inicial. */
  initialized: boolean;

  /** Refleja lo que diga Supabase. Lo llama el proveedor, no las pantallas. */
  setSession: (session: AuthSession | null) => void;
  /** Consulta la sesión guardada una sola vez al arrancar. */
  initialize: () => Promise<void>;

  signIn: (values: SignInValues) => Promise<boolean>;
  signUp: (values: SignUpValues) => Promise<boolean>;
  signOut: () => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  /**
   * Borra la cuenta. Exige confirmación explícita: sin `confirmed` no hace
   * nada, para que ningún camino accidental pueda destruir los datos.
   */
  deleteAccount: (options: { confirmed: boolean }) => Promise<boolean>;

  clearError: () => void;
  reset: () => void;
}

const ESTADO_INICIAL = {
  session: null,
  user: null,
  status: 'idle' as AuthStatus,
  errorKey: null,
  initialized: false,
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...ESTADO_INICIAL,

  setSession: (session) =>
    set({ session, user: session?.user ?? null, initialized: true }),

  initialize: async () => {
    if (get().initialized) return;
    const session = await getSession();
    set({ session, user: session?.user ?? null, initialized: true });
  },

  signIn: async (values) => {
    set({ status: 'loading', errorKey: null });
    const resultado = await signInRemoto(values);
    if (!resultado.ok) {
      set({ status: 'error', errorKey: AUTH_ERROR_KEYS[resultado.code] });
      return false;
    }
    set({
      session: resultado.data,
      user: resultado.data.user,
      status: 'success',
      errorKey: null,
      initialized: true,
    });
    return true;
  },

  signUp: async (values) => {
    set({ status: 'loading', errorKey: null });
    const resultado = await signUpRemoto(values);
    if (!resultado.ok) {
      set({ status: 'error', errorKey: AUTH_ERROR_KEYS[resultado.code] });
      return false;
    }
    // Sin sesión = la cuenta existe pero falta confirmar el email. Sigue siendo éxito.
    set({
      session: resultado.data,
      user: resultado.data?.user ?? null,
      status: 'success',
      errorKey: null,
      initialized: true,
    });
    return true;
  },

  signOut: async () => {
    set({ status: 'loading', errorKey: null });
    const resultado = await signOutRemoto();
    if (!resultado.ok) {
      set({ status: 'error', errorKey: AUTH_ERROR_KEYS[resultado.code] });
      return false;
    }
    set({ session: null, user: null, status: 'idle', errorKey: null, initialized: true });
    return true;
  },

  resetPassword: async (email) => {
    set({ status: 'loading', errorKey: null });
    const resultado = await resetPasswordRemoto(email);
    if (!resultado.ok) {
      set({ status: 'error', errorKey: AUTH_ERROR_KEYS[resultado.code] });
      return false;
    }
    set({ status: 'success', errorKey: null });
    return true;
  },

  deleteAccount: async ({ confirmed }) => {
    if (!confirmed) {
      logger.warn('auth: eliminación de cuenta sin confirmar, se ignora');
      return false;
    }
    set({ status: 'loading', errorKey: null });
    const resultado = await deleteAccountRemoto();
    if (!resultado.ok) {
      set({ status: 'error', errorKey: AUTH_ERROR_KEYS[resultado.code] });
      return false;
    }
    set({ session: null, user: null, status: 'idle', errorKey: null, initialized: true });
    return true;
  },

  clearError: () => set((estado) => ({
    errorKey: null,
    status: estado.status === 'error' ? 'idle' : estado.status,
  })),

  reset: () => set({ ...ESTADO_INICIAL }),
}));

/* ------------------------------------------------------------ selectores */

export const selectIsLoading = (estado: AuthStore): boolean => estado.status === 'loading';
export const selectIsAuthenticated = (estado: AuthStore): boolean => estado.session !== null;
export const selectIsDemoSession = (estado: AuthStore): boolean =>
  estado.session?.isDemo === true;
