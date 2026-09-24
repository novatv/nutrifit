/**
 * Temporizador de descanso entre series.
 *
 * Lógica pura: sin React, sin `setInterval`, sin estado global. Aquí solo se
 * calcula; quien pinta decide cada cuánto vuelve a preguntar.
 *
 * Decisión central: el estado guarda MARCAS DE TIEMPO, no una cuenta atrás que
 * haya que ir restando. Un contador que se decrementa se queda congelado en
 * cuanto el móvil bloquea la pantalla o la app pasa a segundo plano —
 * justamente lo que hace cualquiera entre serie y serie. Con marcas de tiempo
 * el descanso sigue corriendo aunque nadie mire, y al volver el número es el
 * correcto sin tener que "recuperar" nada.
 */

/** Estado del temporizador. Serializable: se puede guardar y restaurar tal cual. */
export interface RestTimerState {
  /** Segundos prescritos para el ejercicio en curso. */
  durationSeconds: number;
  /** Instante (ms) del último arranque o reanudación. `null` si no corre. */
  startedAtMs: number | null;
  /** Milisegundos ya consumidos en tramos anteriores (por pausas). */
  elapsedBeforeMs: number;
  running: boolean;
}

const MS = 1000;

/** Evita NaN, negativos e infinitos entrando en el estado. */
function safeSeconds(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0;
  return Math.round(seconds);
}

/** Temporizador parado y a cero, listo para arrancar. */
export function createRestTimer(durationSeconds: number): RestTimerState {
  return {
    durationSeconds: safeSeconds(durationSeconds),
    startedAtMs: null,
    elapsedBeforeMs: 0,
    running: false,
  };
}

/**
 * Arranca un descanso nuevo. Se llama al completar una serie: descarta
 * cualquier resto anterior en lugar de acumularlo.
 */
export function startRestTimer(durationSeconds: number, nowMs: number): RestTimerState {
  return {
    durationSeconds: safeSeconds(durationSeconds),
    startedAtMs: nowMs,
    elapsedBeforeMs: 0,
    running: true,
  };
}

/** Pausa conservando lo consumido. Si ya estaba parado no cambia nada. */
export function pauseRestTimer(state: RestTimerState, nowMs: number): RestTimerState {
  if (!state.running || state.startedAtMs === null) return state;
  return {
    ...state,
    elapsedBeforeMs: elapsedMs(state, nowMs),
    startedAtMs: null,
    running: false,
  };
}

/** Reanuda desde donde se quedó. */
export function resumeRestTimer(state: RestTimerState, nowMs: number): RestTimerState {
  if (state.running) return state;
  return { ...state, startedAtMs: nowMs, running: true };
}

/** Vuelve al principio del mismo descanso, sin arrancarlo. */
export function resetRestTimer(state: RestTimerState): RestTimerState {
  return { ...state, startedAtMs: null, elapsedBeforeMs: 0, running: false };
}

/**
 * Da el descanso por terminado (botón de saltar).
 * Queda parado y completo, no a cero: el resumen debe poder distinguirlo.
 */
export function skipRestTimer(state: RestTimerState): RestTimerState {
  return {
    ...state,
    startedAtMs: null,
    elapsedBeforeMs: state.durationSeconds * MS,
    running: false,
  };
}

/**
 * Alarga o acorta el descanso en curso sin reiniciarlo.
 * Nunca baja de cero: un descanso negativo no significa nada.
 */
export function extendRestTimer(state: RestTimerState, seconds: number): RestTimerState {
  if (!Number.isFinite(seconds)) return state;
  const next = Math.max(0, state.durationSeconds + Math.round(seconds));
  return { ...state, durationSeconds: next };
}

/** Milisegundos consumidos hasta `nowMs`, contando pausas. */
export function elapsedMs(state: RestTimerState, nowMs: number): number {
  const live = state.running && state.startedAtMs !== null ? nowMs - state.startedAtMs : 0;
  // Un reloj que retrocede (cambio de hora, husos) no debe restar tiempo.
  return state.elapsedBeforeMs + Math.max(0, live);
}

/** Segundos que faltan, redondeados hacia arriba y nunca por debajo de cero. */
export function remainingSeconds(state: RestTimerState, nowMs: number): number {
  const remaining = state.durationSeconds * MS - elapsedMs(state, nowMs);
  return Math.max(0, Math.ceil(remaining / MS));
}

/** Avance del descanso de 0 a 1, para la barra de progreso. */
export function restProgress(state: RestTimerState, nowMs: number): number {
  if (state.durationSeconds <= 0) return 1;
  const ratio = elapsedMs(state, nowMs) / (state.durationSeconds * MS);
  return Math.min(1, Math.max(0, ratio));
}

/** true cuando ya no queda descanso pendiente. */
export function isRestFinished(state: RestTimerState, nowMs: number): boolean {
  return remainingSeconds(state, nowMs) === 0;
}

/** true cuando el temporizador está corriendo y todavía queda tiempo. */
export function isRestActive(state: RestTimerState, nowMs: number): boolean {
  return state.running && !isRestFinished(state, nowMs);
}

/**
 * Formato `m:ss` (o `mm:ss`). Sin literales traducibles: solo cifras y dos
 * puntos, así que no necesita pasar por i18n.
 */
export function formatRestTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(Number.isFinite(totalSeconds) ? totalSeconds : 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
