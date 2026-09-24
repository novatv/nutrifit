/**
 * Store de sesión en modo demostración.
 *
 * Se anula `@/services/supabase` en vez de la capa de auth entera: así se
 * prueba de verdad el envoltorio (validación, clasificación de errores,
 * sesión simulada) y no un doble que siempre dice que sí.
 */

jest.mock('@/services/supabase', () => ({
  supabase: null,
  isDemoMode: true,
  requireSupabase: () => {
    throw new Error('Supabase no está configurado.');
  },
}));

import {
  AUTH_ERROR_KEYS,
  MIN_PASSWORD_LENGTH,
  classifyAuthError,
  onAuthStateChange,
  signInSchema,
  signUpSchema,
  __resetDemoAuth,
  type AuthSession,
} from '@/services/auth';
import {
  selectIsAuthenticated,
  selectIsDemoSession,
  selectIsLoading,
  useAuthStore,
} from '@/stores/auth-store';

const EMAIL = 'ana@ejemplo.com';
const PASSWORD = 'contrasena-larga';

const estado = () => useAuthStore.getState();

beforeEach(() => {
  __resetDemoAuth();
  estado().reset();
});

describe('estado inicial', () => {
  it('arranca sin sesión, sin error y sin inicializar', () => {
    expect(estado().session).toBeNull();
    expect(estado().user).toBeNull();
    expect(estado().status).toBe('idle');
    expect(estado().errorKey).toBeNull();
    expect(estado().initialized).toBe(false);
  });

  it('initialize marca inicializado aunque no haya sesión guardada', async () => {
    await estado().initialize();
    expect(estado().initialized).toBe(true);
    expect(estado().session).toBeNull();
  });
});

describe('entrar', () => {
  it('crea una sesión local simulada y la marca como demostración', async () => {
    const ok = await estado().signIn({ email: EMAIL, password: PASSWORD });

    expect(ok).toBe(true);
    expect(estado().status).toBe('success');
    expect(estado().errorKey).toBeNull();
    expect(estado().user?.email).toBe(EMAIL);
    expect(selectIsAuthenticated(estado())).toBe(true);
    expect(selectIsDemoSession(estado())).toBe(true);
  });

  it('normaliza el email a minúsculas y sin espacios', async () => {
    await estado().signIn({ email: '  ANA@Ejemplo.com ', password: PASSWORD });
    expect(estado().user?.email).toBe(EMAIL);
  });

  it('rechaza un email mal formado sin tocar la sesión', async () => {
    const ok = await estado().signIn({ email: 'ana-arroba-nada', password: PASSWORD });

    expect(ok).toBe(false);
    expect(estado().status).toBe('error');
    expect(estado().errorKey).toBe(AUTH_ERROR_KEYS.invalid);
    expect(estado().session).toBeNull();
  });

  it('deja el estado en carga mientras la promesa está viva', async () => {
    const promesa = estado().signIn({ email: EMAIL, password: PASSWORD });
    expect(selectIsLoading(estado())).toBe(true);
    await promesa;
    expect(selectIsLoading(estado())).toBe(false);
  });
});

describe('crear cuenta', () => {
  it('acepta una contraseña de la longitud mínima', async () => {
    const ok = await estado().signUp({ email: EMAIL, password: 'a'.repeat(MIN_PASSWORD_LENGTH) });
    expect(ok).toBe(true);
    expect(estado().session).not.toBeNull();
  });

  it('rechaza una contraseña demasiado corta antes de salir a red', async () => {
    const ok = await estado().signUp({ email: EMAIL, password: 'corta' });
    expect(ok).toBe(false);
    expect(estado().errorKey).toBe(AUTH_ERROR_KEYS.invalid);
    expect(estado().session).toBeNull();
  });
});

describe('cerrar sesión', () => {
  it('limpia sesión y usuario pero deja el store inicializado', async () => {
    await estado().signIn({ email: EMAIL, password: PASSWORD });
    const ok = await estado().signOut();

    expect(ok).toBe(true);
    expect(estado().session).toBeNull();
    expect(estado().user).toBeNull();
    expect(estado().status).toBe('idle');
    expect(estado().initialized).toBe(true);
  });
});

describe('restablecer contraseña', () => {
  it('confirma el envío para cualquier email válido', async () => {
    const ok = await estado().resetPassword(EMAIL);
    expect(ok).toBe(true);
    expect(estado().status).toBe('success');
  });

  it('no acepta un email mal formado', async () => {
    const ok = await estado().resetPassword('sin-arroba');
    expect(ok).toBe(false);
    expect(estado().errorKey).toBe(AUTH_ERROR_KEYS.invalid);
  });
});

describe('eliminar cuenta', () => {
  it('no hace nada sin confirmación explícita', async () => {
    // El aviso del logger es el comportamiento esperado: se calla para no
    // ensuciar la salida de los tests.
    const aviso = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await estado().signIn({ email: EMAIL, password: PASSWORD });

    const ok = await estado().deleteAccount({ confirmed: false });
    aviso.mockRestore();

    expect(ok).toBe(false);
    expect(estado().session).not.toBeNull();
  });

  it('borra la sesión cuando se confirma', async () => {
    await estado().signIn({ email: EMAIL, password: PASSWORD });

    const ok = await estado().deleteAccount({ confirmed: true });

    expect(ok).toBe(true);
    expect(estado().session).toBeNull();
    expect(estado().user).toBeNull();
  });
});

describe('errores', () => {
  it('clearError devuelve el estado a reposo', async () => {
    await estado().signIn({ email: 'mal', password: PASSWORD });
    expect(estado().status).toBe('error');

    estado().clearError();

    expect(estado().errorKey).toBeNull();
    expect(estado().status).toBe('idle');
  });

  it('clearError no pisa un estado de éxito', async () => {
    await estado().signIn({ email: EMAIL, password: PASSWORD });
    estado().clearError();
    expect(estado().status).toBe('success');
  });

  it('la clave de error es siempre una clave i18n, nunca texto del proveedor', () => {
    Object.values(AUTH_ERROR_KEYS).forEach((clave) => {
      expect(clave).toMatch(/^[a-z]+\.[A-Za-z]+$/);
    });
  });
});

describe('clasificación de fallos del proveedor', () => {
  it('reconoce el fallo de red que lanza el cliente al no haber conexión', () => {
    expect(classifyAuthError({ name: 'AuthRetryableFetchError', message: 'Network request failed' }))
      .toBe('network');
    expect(classifyAuthError(new TypeError('Failed to fetch'))).toBe('network');
  });

  it('reconoce las credenciales incorrectas', () => {
    expect(classifyAuthError({ code: 'invalid_credentials', status: 400 })).toBe('invalid');
    expect(classifyAuthError({ status: 401, message: 'Unauthorized' })).toBe('invalid');
  });

  it('todo lo demás es desconocido y no se enseña en crudo', () => {
    expect(classifyAuthError({ status: 500, message: 'boom' })).toBe('unknown');
    expect(classifyAuthError(undefined)).toBe('unknown');
  });
});

describe('suscripción a cambios de sesión', () => {
  it('avisa al entrar y al salir, y deja de avisar tras darse de baja', async () => {
    const vistas: (AuthSession | null)[] = [];
    const baja = onAuthStateChange((session) => vistas.push(session));

    await estado().signIn({ email: EMAIL, password: PASSWORD });
    await estado().signOut();

    expect(vistas).toHaveLength(2);
    expect(vistas[0]?.user.email).toBe(EMAIL);
    expect(vistas[1]).toBeNull();

    baja();
    await estado().signIn({ email: EMAIL, password: PASSWORD });
    expect(vistas).toHaveLength(2);
  });
});

describe('esquemas de validación', () => {
  it('el email vacío y el email inválido dan un único mensaje cada uno', () => {
    const vacio = signInSchema.safeParse({ email: '', password: PASSWORD });
    const invalido = signInSchema.safeParse({ email: 'ana@', password: PASSWORD });

    expect(vacio.success).toBe(false);
    expect(invalido.success).toBe(false);
    expect(vacio.error?.issues.filter((i) => i.path[0] === 'email')).toHaveLength(1);
    expect(invalido.error?.issues.filter((i) => i.path[0] === 'email')).toHaveLength(1);
  });

  it('entrar no exige longitud mínima: la cuenta pudo crearse con otras reglas', () => {
    expect(signInSchema.safeParse({ email: EMAIL, password: 'abc' }).success).toBe(true);
    expect(signUpSchema.safeParse({ email: EMAIL, password: 'abc' }).success).toBe(false);
  });
});
