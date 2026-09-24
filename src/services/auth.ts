/**
 * Envoltorio sobre Supabase Auth.
 *
 * Todo lo que sale de aquí está ya traducido a vocabulario de la app: una
 * sesión mínima y un código de error acotado. El mensaje crudo de Supabase
 * ("Invalid login credentials", "AuthApiError: ...") nunca cruza esta
 * frontera, porque delata si un email existe y además está sin traducir.
 *
 * Sin credenciales configuradas (`isDemoMode`) funciona con una sesión local
 * simulada en memoria: sirve para recorrer la app entera sin montar servidor,
 * y se pierde al recargar el bundle a propósito, para que nadie la confunda
 * con una sesión de verdad.
 */

import type { Session } from '@supabase/supabase-js';
import { z } from 'zod';

import { logger } from './logger';
import { supabase } from './supabase';

/* ------------------------------------------------------------------ tipos */

/** Familias de fallo que la interfaz sabe contar. Nada más sale de aquí. */
export type AuthErrorCode = 'invalid' | 'network' | 'unknown';

/**
 * Clave i18n de cada fallo.
 *
 * `unknown` cae en `states.errorTitle` porque hoy no existe `auth.errorUnknown`;
 * cuando exista basta cambiar esta línea.
 */
export const AUTH_ERROR_KEYS: Record<AuthErrorCode, string> = {
  invalid: 'auth.errorInvalid',
  network: 'auth.errorNetwork',
  unknown: 'states.errorTitle',
};

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthSession {
  user: AuthUser;
  /** `true` si es la sesión simulada del modo demostración. */
  isDemo: boolean;
}

/**
 * Resultado de una operación de autenticación.
 *
 * Se devuelve en vez de lanzar: cada pantalla tiene que pintar un estado de
 * error, no capturar excepciones.
 */
export type AuthResult<T> = { ok: true; data: T } | { ok: false; code: AuthErrorCode };

const fallo = (code: AuthErrorCode): AuthResult<never> => ({ ok: false, code });

/* ----------------------------------------------------------- validaciones */

/** Longitud mínima de contraseña al crear cuenta. Supabase exige 6; pedimos 8. */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Claves i18n de los mensajes de validación.
 *
 * Se guarda la clave, no el texto: el idioma puede cambiar después de
 * construir el esquema. Las marcadas como prestadas usan la clave más cercana
 * que existe hoy en `es.ts` (ver informe de claves pendientes).
 */
const MENSAJES = {
  requerido: 'onboarding.errors.required',
  /** Prestada de `auth.errorInvalid` hasta que exista `auth.errorEmailInvalid`. */
  emailInvalido: 'auth.errorInvalid',
  /** Prestada de `auth.errorInvalid` hasta que exista `auth.errorPasswordShort`. */
  passwordCorta: 'auth.errorInvalid',
} as const;

/** Comprobación deliberadamente laxa: el servidor tiene la última palabra. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const campoEmail = z
  .string()
  .trim()
  .min(1, { message: MENSAJES.requerido })
  // El `length === 0` evita que un campo vacío dispare dos errores a la vez.
  .refine((valor) => valor.length === 0 || EMAIL_RE.test(valor), {
    message: MENSAJES.emailInvalido,
  });

const campoPasswordExistente = z.string().min(1, { message: MENSAJES.requerido });

const campoPasswordNueva = z
  .string()
  .min(1, { message: MENSAJES.requerido })
  .refine((valor) => valor.length === 0 || valor.length >= MIN_PASSWORD_LENGTH, {
    message: MENSAJES.passwordCorta,
  });

export const signInSchema = z.object({
  email: campoEmail,
  password: campoPasswordExistente,
});

export const signUpSchema = z.object({
  email: campoEmail,
  password: campoPasswordNueva,
});

export const resetPasswordSchema = z.object({ email: campoEmail });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

/* ------------------------------------------------- clasificación de fallos */

/** Códigos de Supabase que para el usuario significan "revisa lo que pusiste". */
const CODIGOS_INVALIDOS = new Set([
  'invalid_credentials',
  'email_not_confirmed',
  'email_address_invalid',
  'user_already_exists',
  'weak_password',
  'validation_failed',
  'same_password',
]);

interface FalloDesconocido {
  name?: string;
  message?: string;
  status?: number;
  code?: string;
}

/**
 * Traduce cualquier fallo a una de las tres familias.
 *
 * Se mira el nombre y el código antes que el texto: el texto cambia entre
 * versiones de Supabase y entre plataformas.
 */
export function classifyAuthError(error: unknown): AuthErrorCode {
  const e = (error ?? {}) as FalloDesconocido;
  const mensaje = typeof e.message === 'string' ? e.message : '';

  if (e.name === 'AuthRetryableFetchError' || e.name === 'TypeError') return 'network';
  if (/network|fetch|timeout|offline|econnrefused/i.test(mensaje)) return 'network';

  if (typeof e.code === 'string' && CODIGOS_INVALIDOS.has(e.code)) return 'invalid';
  if (e.status === 400 || e.status === 401 || e.status === 422) return 'invalid';

  return 'unknown';
}

/**
 * Registra el fallo sin filtrar nada.
 *
 * Se pasan solo el código y el estado HTTP: ni contraseñas, ni tokens, ni el
 * email, ni el mensaje original (que puede llevar dentro el identificador).
 */
function registrar(operacion: string, error: unknown, code: AuthErrorCode): void {
  const e = (error ?? {}) as FalloDesconocido;
  logger.error(`auth: ${operacion} ha fallado`, undefined, {
    operacion,
    clasificacion: code,
    estado: typeof e.status === 'number' ? e.status : undefined,
    codigoProveedor: typeof e.code === 'string' ? e.code : undefined,
  });
}

/* --------------------------------------------------- modo de demostración */

/** Identificador estable para que los datos de demostración sean coherentes. */
const DEMO_USER_ID = '00000000-0000-4000-8000-000000000001';

let sesionDemo: AuthSession | null = null;
const oyentes = new Set<(session: AuthSession | null) => void>();

function publicarDemo(session: AuthSession | null): void {
  sesionDemo = session;
  oyentes.forEach((oyente) => oyente(session));
}

function crearSesionDemo(email: string): AuthSession {
  return { user: { id: DEMO_USER_ID, email: email.trim().toLowerCase() }, isDemo: true };
}

/** Solo para los tests: deja el módulo como recién cargado. */
export function __resetDemoAuth(): void {
  sesionDemo = null;
  oyentes.clear();
}

/* ------------------------------------------------------------ conversión */

function aSesion(session: Session | null): AuthSession | null {
  if (!session?.user) return null;
  return { user: { id: session.user.id, email: session.user.email ?? '' }, isDemo: false };
}

/* ----------------------------------------------------------- operaciones */

/** Inicia sesión. Valida antes de salir a red para no gastar un viaje. */
export async function signIn(values: SignInValues): Promise<AuthResult<AuthSession>> {
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) return fallo('invalid');

  const { email, password } = parsed.data;

  if (!supabase) {
    const session = crearSesionDemo(email);
    publicarDemo(session);
    return { ok: true, data: session };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const code = classifyAuthError(error);
      registrar('signIn', error, code);
      return fallo(code);
    }
    const session = aSesion(data.session);
    if (!session) return fallo('unknown');
    return { ok: true, data: session };
  } catch (error) {
    const code = classifyAuthError(error);
    registrar('signIn', error, code);
    return fallo(code);
  }
}

/**
 * Crea una cuenta.
 *
 * Si el proyecto exige confirmar el email, Supabase no devuelve sesión: el
 * resultado es `ok` con `data: null` y la pantalla lo cuenta como éxito
 * pendiente de confirmación, no como error.
 */
export async function signUp(values: SignUpValues): Promise<AuthResult<AuthSession | null>> {
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) return fallo('invalid');

  const { email, password } = parsed.data;

  if (!supabase) {
    const session = crearSesionDemo(email);
    publicarDemo(session);
    return { ok: true, data: session };
  }

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      const code = classifyAuthError(error);
      registrar('signUp', error, code);
      return fallo(code);
    }
    return { ok: true, data: aSesion(data.session) };
  } catch (error) {
    const code = classifyAuthError(error);
    registrar('signUp', error, code);
    return fallo(code);
  }
}

/** Cierra la sesión. Localmente siempre se considera cerrada. */
export async function signOut(): Promise<AuthResult<null>> {
  if (!supabase) {
    publicarDemo(null);
    return { ok: true, data: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      const code = classifyAuthError(error);
      registrar('signOut', error, code);
      return fallo(code);
    }
    return { ok: true, data: null };
  } catch (error) {
    const code = classifyAuthError(error);
    registrar('signOut', error, code);
    return fallo(code);
  }
}

/**
 * Pide el correo de restablecimiento.
 *
 * Responde `ok` aunque el email no exista: decir lo contrario permitiría
 * averiguar quién tiene cuenta en la app.
 */
export async function resetPassword(email: string): Promise<AuthResult<null>> {
  const parsed = resetPasswordSchema.safeParse({ email });
  if (!parsed.success) return fallo('invalid');

  if (!supabase) return { ok: true, data: null };

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email);
    if (error) {
      const code = classifyAuthError(error);
      registrar('resetPassword', error, code);
      // Un 400 aquí suele ser "ese email no está": no se delata, se dice que sí.
      return code === 'invalid' ? { ok: true, data: null } : fallo(code);
    }
    return { ok: true, data: null };
  } catch (error) {
    const code = classifyAuthError(error);
    registrar('resetPassword', error, code);
    return fallo(code);
  }
}

/**
 * Elimina la cuenta y todos sus datos.
 *
 * El borrado real lo hace una función `delete_account` en el servidor
 * (SECURITY DEFINER): la clave publicable no puede —ni debe— tocar
 * `auth.users`. Después se cierra la sesión local pase lo que pase.
 */
export async function deleteAccount(): Promise<AuthResult<null>> {
  if (!supabase) {
    publicarDemo(null);
    return { ok: true, data: null };
  }

  try {
    const { error } = await supabase.rpc('delete_account');
    if (error) {
      const code = classifyAuthError(error);
      registrar('deleteAccount', error, code);
      return fallo(code);
    }
    await supabase.auth.signOut();
    return { ok: true, data: null };
  } catch (error) {
    const code = classifyAuthError(error);
    registrar('deleteAccount', error, code);
    return fallo(code);
  }
}

/** Sesión actual, ya restaurada del almacenamiento por Supabase. */
export async function getSession(): Promise<AuthSession | null> {
  if (!supabase) return sesionDemo;

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      registrar('getSession', error, classifyAuthError(error));
      return null;
    }
    return aSesion(data.session);
  } catch (error) {
    registrar('getSession', error, classifyAuthError(error));
    return null;
  }
}

/**
 * Escucha los cambios de sesión (login, logout, refresco de token).
 * Devuelve la función para dejar de escuchar.
 */
export function onAuthStateChange(
  listener: (session: AuthSession | null) => void,
): () => void {
  if (!supabase) {
    oyentes.add(listener);
    return () => {
      oyentes.delete(listener);
    };
  }

  const { data } = supabase.auth.onAuthStateChange((_evento, session) => {
    listener(aSesion(session));
  });

  return () => data.subscription.unsubscribe();
}
