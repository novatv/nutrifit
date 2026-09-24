/**
 * Sesión de entrenamiento en curso.
 *
 * Decisiones:
 *
 * - **Se guarda en local en cuanto se toca algo.** Cada acción que modifica la
 *   sesión vuelca el estado al almacenamiento del dispositivo. No se espera al
 *   final ni a que haya red: si la app muere en mitad de una serie, al volver
 *   sigue ahí. Nadie pierde una serie por meterse en un ascensor.
 * - **El almacenamiento es un puerto, no una dependencia dura.** Por defecto
 *   AsyncStorage; si no está disponible (tests, web sin módulo nativo) cae a
 *   memoria en lugar de reventar el import.
 * - **`pendingSync` no miente.** Se pone a true con cada guardado local y solo
 *   lo baja quien consiga sincronizar de verdad. Mientras esté a true la
 *   pantalla enseña `workout.offlineSaved`.
 * - **Los totales no se almacenan.** Volumen, duración y series hechas se
 *   derivan con selectores: un total guardado se desincroniza en cuanto se
 *   edita un peso.
 */

import { create } from 'zustand';

import type { ExerciseLog, SetLog, Workout, WorkoutSession } from '@/types/domain';

/* ---------------------------------------------------------- almacenamiento */

/** Puerto mínimo de persistencia. Lo cumple AsyncStorage y cualquier doble. */
export interface WorkoutStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** Respaldo en memoria: mantiene la app viva donde no hay módulo nativo. */
function createMemoryStorage(): WorkoutStorage {
  const map = new Map<string, string>();
  return {
    async getItem(key) {
      return map.get(key) ?? null;
    },
    async setItem(key, value) {
      map.set(key, value);
    },
    async removeItem(key) {
      map.delete(key);
    },
  };
}

/**
 * Carga AsyncStorage de forma diferida. El `require` va dentro de un try
 * porque en entorno de test el módulo nativo no existe y su carga lanza:
 * importar este store nunca debe poder tumbar un test de lógica.
 */
function resolveDefaultStorage(): WorkoutStorage {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-async-storage/async-storage') as {
      default?: WorkoutStorage;
    };
    if (mod.default) return mod.default;
  } catch {
    // Sin módulo nativo: se sigue con memoria.
  }
  return createMemoryStorage();
}

let storage: WorkoutStorage | null = null;

function getStorage(): WorkoutStorage {
  storage ??= resolveDefaultStorage();
  return storage;
}

/** Inyecta otro almacenamiento (tests). */
export function setWorkoutStorage(next: WorkoutStorage | null): void {
  storage = next;
}

/** Clave de almacenamiento. Lleva versión para poder migrar sin romper. */
export const WORKOUT_STORAGE_KEY = 'nutrifit.workout.session.v1';

/** Instantánea que se guarda en disco. */
export interface WorkoutSnapshot {
  version: 1;
  workout: Workout;
  session: WorkoutSession;
  currentExerciseIndex: number;
  notes: Record<string, string>;
  savedAt: string;
}

/* ------------------------------------------------------------- utilidades */

/** Registro vacío de un ejercicio: tantas series como prescriba el plan. */
export function emptyLog(exerciseSlug: string, sets: number): ExerciseLog {
  const total = Math.max(1, Math.round(sets));
  return {
    exerciseSlug,
    sets: Array.from({ length: total }, (_, setIndex) => ({
      setIndex,
      weightKg: null,
      reps: null,
      rir: null,
      completed: false,
    })),
  };
}

/** Sesión en blanco a partir de la prescripción del día. */
export function buildSession(workout: Workout, now: Date = new Date()): WorkoutSession {
  return {
    id: `session-${workout.id}-${now.getTime().toString(36)}`,
    workoutId: workout.id,
    startedAt: now.toISOString(),
    logs: workout.exercises.map((e) => emptyLog(e.exerciseSlug, e.sets)),
  };
}

/** Sustituye el registro de un ejercicio conservando el orden del resto. */
function replaceLog(
  logs: ExerciseLog[],
  slug: string,
  next: (log: ExerciseLog) => ExerciseLog,
): ExerciseLog[] {
  return logs.map((log) => (log.exerciseSlug === slug ? next(log) : log));
}

/** Normaliza un número que llega de un campo de texto. */
function cleanNumber(value: number | null): number | null {
  if (value === null || !Number.isFinite(value) || value < 0) return null;
  return value;
}

/* ------------------------------------------------------------------ store */

export type WorkoutStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface WorkoutState {
  status: WorkoutStatus;
  /** Clave i18n del error, nunca un mensaje suelto. */
  errorKey: string | null;
  /** Prescripción del día, ya con las sustituciones aplicadas. */
  workout: Workout | null;
  session: WorkoutSession | null;
  currentExerciseIndex: number;
  /** Notas por ejercicio, en texto libre del usuario. */
  notes: Record<string, string>;
  /** Sesiones terminadas, de la más antigua a la más reciente. */
  history: WorkoutSession[];
  /** Última sesión cerrada: es la que lee el resumen. */
  lastSession: WorkoutSession | null;
  /** true si hay cambios guardados en local que nadie ha sincronizado aún. */
  pendingSync: boolean;
  /** true si la sesión actual se recuperó del disco en vez de empezarse ahora. */
  restoredFromStorage: boolean;

  /* ------------------------------------------------------------- acciones */
  /** Lee el disco y recupera la sesión a medias si la hay. */
  hydrate(): Promise<void>;
  startSession(workout: Workout, now?: Date): void;
  updateSet(slug: string, setIndex: number, patch: Partial<SetLog>): void;
  toggleSetCompleted(slug: string, setIndex: number): boolean;
  addSet(slug: string): void;
  removeLastSet(slug: string): void;
  goToExercise(index: number): void;
  nextExercise(): void;
  previousExercise(): void;
  /** Cambia un ejercicio por otro conservando su sitio en la sesión. */
  swapExercise(fromSlug: string, toSlug: string): void;
  setNotes(slug: string, text: string): void;
  /** Cierra la sesión y la pasa al historial. Devuelve la sesión cerrada. */
  finishSession(now?: Date): WorkoutSession | null;
  /** Feedback posterior del resumen: dificultad percibida y dolor. */
  submitFeedback(feedback: {
    perceivedDifficulty?: WorkoutSession['perceivedDifficulty'];
    painReported?: boolean;
  }): void;
  /** Descarta la sesión en curso y borra lo guardado. */
  discardSession(): void;
  /** Historial de demostración; solo se usa si no hay historial real. */
  seedHistory(sessions: WorkoutSession[]): void;
  /** La sincronización remota la confirma quien la hace, no este store. */
  markSynced(): void;
  reset(): void;
}

const initialState = {
  status: 'idle' as WorkoutStatus,
  errorKey: null as string | null,
  workout: null as Workout | null,
  session: null as WorkoutSession | null,
  currentExerciseIndex: 0,
  notes: {} as Record<string, string>,
  history: [] as WorkoutSession[],
  lastSession: null as WorkoutSession | null,
  pendingSync: false,
  restoredFromStorage: false,
};

export const useWorkoutStore = create<WorkoutState>((set, get) => {
  /**
   * Vuelca la sesión a disco. Se llama tras cada cambio y no se espera:
   * bloquear el hilo de la interfaz por un guardado dejaría la pantalla
   * pegajosa justo cuando la persona está sudando.
   */
  const persist = (): void => {
    const { workout, session, currentExerciseIndex, notes } = get();
    if (!workout || !session) return;
    const snapshot: WorkoutSnapshot = {
      version: 1,
      workout,
      session,
      currentExerciseIndex,
      notes,
      savedAt: new Date().toISOString(),
    };
    set({ pendingSync: true });
    void getStorage()
      .setItem(WORKOUT_STORAGE_KEY, JSON.stringify(snapshot))
      .catch(() => {
        // Guardar en local es el último recurso: si falla, al menos la
        // sesión sigue viva en memoria y la bandera avisa de que no está a salvo.
      });
  };

  const clearStored = (): void => {
    void getStorage().removeItem(WORKOUT_STORAGE_KEY).catch(() => undefined);
  };

  return {
    ...initialState,

    async hydrate() {
      set({ status: 'loading', errorKey: null });
      try {
        const raw = await getStorage().getItem(WORKOUT_STORAGE_KEY);
        if (!raw) {
          set({ status: 'ready', restoredFromStorage: false });
          return;
        }
        const snapshot = JSON.parse(raw) as WorkoutSnapshot;
        // Una sesión ya cerrada no se reabre: se limpia y se empieza de nuevo.
        if (snapshot.version !== 1 || !snapshot.session || snapshot.session.finishedAt) {
          clearStored();
          set({ status: 'ready', restoredFromStorage: false });
          return;
        }
        set({
          status: 'ready',
          workout: snapshot.workout,
          session: snapshot.session,
          currentExerciseIndex: snapshot.currentExerciseIndex ?? 0,
          notes: snapshot.notes ?? {},
          restoredFromStorage: true,
          pendingSync: true,
        });
      } catch {
        // Un JSON corrupto no debe dejar la pantalla inservible: se avisa y
        // se permite empezar una sesión limpia.
        clearStored();
        set({ status: 'error', errorKey: 'states.errorBody' });
      }
    },

    startSession(workout, now = new Date()) {
      set({
        status: 'ready',
        errorKey: null,
        workout,
        session: buildSession(workout, now),
        currentExerciseIndex: 0,
        notes: {},
        restoredFromStorage: false,
      });
      persist();
    },

    updateSet(slug, setIndex, patch) {
      const session = get().session;
      if (!session) return;
      set({
        session: {
          ...session,
          logs: replaceLog(session.logs, slug, (log) => ({
            ...log,
            sets: log.sets.map((s) =>
              s.setIndex === setIndex
                ? {
                    ...s,
                    ...patch,
                    weightKg:
                      'weightKg' in patch ? cleanNumber(patch.weightKg ?? null) : s.weightKg,
                    reps: 'reps' in patch ? cleanNumber(patch.reps ?? null) : s.reps,
                    rir: 'rir' in patch ? cleanNumber(patch.rir ?? null) : s.rir,
                  }
                : s,
            ),
          })),
        },
      });
      persist();
    },

    toggleSetCompleted(slug, setIndex) {
      const session = get().session;
      if (!session) return false;
      let completed = false;
      set({
        session: {
          ...session,
          logs: replaceLog(session.logs, slug, (log) => ({
            ...log,
            sets: log.sets.map((s) => {
              if (s.setIndex !== setIndex) return s;
              completed = !s.completed;
              return { ...s, completed };
            }),
          })),
        },
      });
      persist();
      return completed;
    },

    addSet(slug) {
      const session = get().session;
      if (!session) return;
      set({
        session: {
          ...session,
          logs: replaceLog(session.logs, slug, (log) => ({
            ...log,
            sets: [
              ...log.sets,
              {
                setIndex: log.sets.length,
                weightKg: null,
                reps: null,
                rir: null,
                completed: false,
              },
            ],
          })),
        },
      });
      persist();
    },

    removeLastSet(slug) {
      const session = get().session;
      if (!session) return;
      set({
        session: {
          ...session,
          logs: replaceLog(session.logs, slug, (log) =>
            // Nunca se queda un ejercicio sin ninguna serie que registrar.
            log.sets.length <= 1 ? log : { ...log, sets: log.sets.slice(0, -1) },
          ),
        },
      });
      persist();
    },

    goToExercise(index) {
      const total = get().workout?.exercises.length ?? 0;
      if (total === 0) return;
      const next = Math.min(Math.max(0, index), total - 1);
      set({ currentExerciseIndex: next });
      persist();
    },

    nextExercise() {
      get().goToExercise(get().currentExerciseIndex + 1);
    },

    previousExercise() {
      get().goToExercise(get().currentExerciseIndex - 1);
    },

    swapExercise(fromSlug, toSlug) {
      const { workout, session } = get();
      if (!workout || !session || fromSlug === toSlug) return;
      // Cambiar de ejercicio no cambia la prescripción: mismas series, mismo
      // rango y mismo descanso. Solo cambia el movimiento.
      const exercises = workout.exercises.map((e) =>
        e.exerciseSlug === fromSlug ? { ...e, exerciseSlug: toSlug } : e,
      );
      const prescribed = workout.exercises.find((e) => e.exerciseSlug === fromSlug);
      set({
        workout: { ...workout, exercises },
        session: {
          ...session,
          logs: session.logs.map((log) =>
            log.exerciseSlug === fromSlug
              ? // Las series registradas con el otro ejercicio no se arrastran:
                // ni el peso ni las repeticiones son comparables.
                emptyLog(toSlug, prescribed?.sets ?? log.sets.length)
              : log,
          ),
        },
      });
      persist();
    },

    setNotes(slug, text) {
      set({ notes: { ...get().notes, [slug]: text } });
      persist();
    },

    finishSession(now = new Date()) {
      const session = get().session;
      if (!session) return null;
      const finished: WorkoutSession = { ...session, finishedAt: now.toISOString() };
      set({
        session: null,
        workout: get().workout,
        lastSession: finished,
        history: [...get().history, finished],
        currentExerciseIndex: 0,
        restoredFromStorage: false,
      });
      // La sesión cerrada ya no es "a medias": se retira del disco para no
      // recuperarla la próxima vez.
      clearStored();
      return finished;
    },

    submitFeedback(feedback) {
      const last = get().lastSession;
      if (!last) return;
      const updated: WorkoutSession = {
        ...last,
        ...(feedback.perceivedDifficulty !== undefined
          ? { perceivedDifficulty: feedback.perceivedDifficulty }
          : {}),
        ...(feedback.painReported !== undefined
          ? { painReported: feedback.painReported }
          : {}),
      };
      set({
        lastSession: updated,
        history: get().history.map((s) => (s.id === updated.id ? updated : s)),
      });
    },

    discardSession() {
      set({
        session: null,
        workout: null,
        currentExerciseIndex: 0,
        notes: {},
        restoredFromStorage: false,
        pendingSync: false,
      });
      clearStored();
    },

    seedHistory(sessions) {
      if (get().history.length > 0) return;
      set({ history: sessions });
    },

    markSynced() {
      set({ pendingSync: false });
    },

    reset() {
      set({ ...initialState });
      clearStored();
    },
  };
});

/* -------------------------------------------------------------- selectores */

/** Ejercicio prescrito que toca ahora, o null si no hay sesión. */
export function selectCurrentExercise(state: WorkoutState) {
  const exercises = state.workout?.exercises ?? [];
  return exercises[state.currentExerciseIndex] ?? null;
}

/** Registro del ejercicio pedido dentro de la sesión en curso. */
export function selectLog(state: WorkoutState, slug: string): ExerciseLog | undefined {
  return state.session?.logs.find((log) => log.exerciseSlug === slug);
}

/** Series de ese ejercicio en la última sesión terminada que lo incluyó. */
export function selectLastTimeSets(state: WorkoutState, slug: string): SetLog[] {
  for (let i = state.history.length - 1; i >= 0; i -= 1) {
    const log = state.history[i].logs.find((l) => l.exerciseSlug === slug);
    if (log && log.sets.some((s) => s.completed)) return log.sets.filter((s) => s.completed);
  }
  return [];
}

/** Registros previos de ese ejercicio, de más antiguo a más reciente. */
export function selectExerciseHistory(state: WorkoutState, slug: string): ExerciseLog[] {
  return state.history.flatMap((s) => s.logs.filter((l) => l.exerciseSlug === slug));
}

/** Series completadas de la sesión. */
export function countCompletedSets(session: WorkoutSession): number {
  return session.logs.reduce(
    (total, log) => total + log.sets.filter((s) => s.completed).length,
    0,
  );
}

/** Volumen de carga: suma de peso x repeticiones de las series completadas. */
export function sessionVolumeKg(session: WorkoutSession): number {
  const total = session.logs.reduce(
    (sum, log) =>
      sum +
      log.sets
        .filter((s) => s.completed)
        .reduce((acc, s) => acc + (s.weightKg ?? 0) * (s.reps ?? 0), 0),
    0,
  );
  return Math.round(total);
}

/** Ejercicios con al menos una serie completada. */
export function sessionExerciseCount(session: WorkoutSession): number {
  return session.logs.filter((log) => log.sets.some((s) => s.completed)).length;
}

/** Duración en minutos, redondeada hacia arriba y nunca negativa. */
export function sessionDurationMinutes(session: WorkoutSession, now: Date = new Date()): number {
  const start = Date.parse(session.startedAt);
  const end = session.finishedAt ? Date.parse(session.finishedAt) : now.getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
  return Math.max(0, Math.ceil((end - start) / 60000));
}

/** true si en la sesión se declaró dolor. */
export function sessionHasPain(session: WorkoutSession | null): boolean {
  return session?.painReported === true;
}
