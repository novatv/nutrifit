/**
 * Registro de eventos.
 *
 * En producción no se imprime nada por consola y los datos se redactan antes
 * de salir: tokens, JWT, contraseñas y emails nunca deben acabar en un log.
 */
const SENSITIVE = /(token|jwt|password|secret|authorization|email|api[-_]?key)/i;

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [
      k,
      SENSITIVE.test(k) ? '«redactado»' : redact(v, depth + 1),
    ]),
  );
}

type Meta = Record<string, unknown> | undefined;

export const logger = {
  debug(message: string, meta?: Meta) {
    if (__DEV__) console.log(`[debug] ${message}`, meta ? redact(meta) : '');
  },
  info(message: string, meta?: Meta) {
    if (__DEV__) console.info(`[info] ${message}`, meta ? redact(meta) : '');
  },
  warn(message: string, meta?: Meta) {
    if (__DEV__) console.warn(`[warn] ${message}`, meta ? redact(meta) : '');
  },
  error(message: string, error?: unknown, meta?: Meta) {
    if (__DEV__) {
      console.error(`[error] ${message}`, error, meta ? redact(meta) : '');
      return;
    }
    // En producción aquí iría el envío al servicio de observabilidad,
    // siempre con los datos ya redactados.
  },
};
