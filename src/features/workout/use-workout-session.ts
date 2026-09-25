/**
 * Hook que gobierna la sesión en vivo.
 *
 * Junta tres cosas que la pantalla no debería tener que coordinar: la
 * prescripción del día (dominio), lo que se va registrando (store) y el
 * temporizador de descanso (lógica pura). La pantalla solo pinta lo que este
 * hook devuelve y llama a sus manejadores.
 *
 * Reglas que se respetan aquí y no en la vista:
 * - La carga NUNCA sube sola. `suggestNextLoad` devuelve una propuesta con
 *   `requiresConfirmation`; se muestra y solo se aplica si alguien la toca.
 * - Con dolor declarado o semana de descarga no se propone subir carga.
 * - Cada cambio se guarda en local al instante; el store se encarga.
 */

import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  canProposeLoadIncrease,
  findAlternatives,
  generate12WeekProgram,
  getExercise,
  isLowerBody,
  roundLoad,
  stableHash,
  suggestNextLoad,
  type LoadSuggestion,
} from '@/domain/training';
import { t } from '@/i18n';
import { demoUser } from '@/services/demo-data';
import {
  countCompletedSets,
  selectExerciseHistory,
  selectLastTimeSets,
  useWorkoutStore,
} from '@/stores/workout-store';
import type {
  Exercise,
  ExerciseLog,
  SetLog,
  UserProfile,
  Workout,
  WorkoutExercise,
  WorkoutSession,
} from '@/types/domain';

import {
  createRestTimer,
  formatRestTime,
  isRestFinished,
  remainingSeconds,
  restProgress,
  skipRestTimer,
  startRestTimer,
  type RestTimerState,
} from './rest-timer';

/* --------------------------------------------------------- datos de demo */

/**
 * Perfil de demostración. Existe para que la pantalla funcione sin Supabase
 * ni onboarding completado: en cuanto haya perfil real, entra por aquí.
 */
export const DEMO_PROFILE: UserProfile = {
  id: 'demo-user',
  displayName: demoUser.displayName,
  birthDate: '1992-04-18',
  sex: 'male',
  heightCm: 178,
  weightKg: 80,
  targetWeightKg: 75,
  goal: 'recomp',
  activityLevel: 'moderate',
  experience: 'intermediate',
  daysPerWeek: 4,
  sessionMinutes: 60,
  location: 'gym',
  equipment: [
    'dumbbells',
    'barbell',
    'plates',
    'bench',
    'rack',
    'cables',
    'machines',
    'bands',
    'kettlebell',
  ],
  diet: 'omnivore',
  allergens: [],
  dislikedFoods: [],
  mealsPerDay: 4,
  budget: 'medium',
  cookingTime: 'normal',
  screening: {
    pregnantOrBreastfeeding: false,
    eatingDisorderCurrent: false,
    majorInjury: false,
    medicalNutritionTherapy: false,
    exerciseContraindicated: false,
  },
  unitSystem: 'metric',
  locale: 'es',
};

/** Entrenamiento del día: semana en curso del programa, primer día. */
export function plannedWorkout(profile: UserProfile = DEMO_PROFILE): Workout | null {
  const program = generate12WeekProgram(profile);
  const week =
    program.weeks.find((w) => w.weekNumber === demoUser.weekNumber) ?? program.weeks[0];
  return week?.workouts[0] ?? null;
}

/**
 * Sesión anterior de demostración.
 *
 * Sin historial no hay "última vez" contra la que competir ni progresión que
 * proponer, así que se siembra una sesión plausible y determinista. En cuanto
 * exista historial real (`seedHistory` no pisa nada) deja de usarse.
 */
export function demoPreviousSession(workout: Workout, now: Date = new Date()): WorkoutSession {
  const startedAt = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const logs: ExerciseLog[] = workout.exercises.map((exercise) => {
    const base = isLowerBody(exercise.exerciseSlug) ? 40 : 20;
    const weightKg = roundLoad(base + (stableHash(exercise.exerciseSlug) % 6) * 2.5);
    return {
      exerciseSlug: exercise.exerciseSlug,
      sets: Array.from({ length: exercise.sets }, (_, setIndex) => ({
        setIndex,
        weightKg,
        reps: exercise.repMin,
        rir: exercise.targetRir,
        completed: true,
      })),
    };
  });

  return {
    id: `demo-session-${workout.id}`,
    workoutId: workout.id,
    startedAt: startedAt.toISOString(),
    finishedAt: new Date(startedAt.getTime() + 55 * 60 * 1000).toISOString(),
    logs,
  };
}

/* ------------------------------------------------------------- etiquetas */

/** 'barbell-back-squat' -> 'Barbell back squat'. Dato, no copia de interfaz. */
function humanize(slug: string): string {
  const words = slug.replace(/[-_]/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Clave i18n del nombre visible de un ejercicio.
 *
 * `nameKey` (`exercise.<slug_snake>`) es la raíz del bloque del ejercicio en
 * el diccionario: cuelga `name`, `cue.*`, `mistake.*` y `safety.*`. El nombre
 * vive en `<nameKey>.name`.
 */
export function exerciseNameKey(slugOrExercise: string | Pick<Exercise, 'nameKey'>): string {
  const base =
    typeof slugOrExercise === 'string'
      ? (getExercise(slugOrExercise)?.nameKey ?? `exercise.${slugOrExercise.replace(/-/g, '_')}`)
      : slugOrExercise.nameKey;
  return `${base}.name`;
}

/**
 * Nombre visible de un ejercicio. Si el slug no está en el diccionario (por
 * ejemplo un ejercicio retirado que sigue en un histórico), se compone un
 * nombre legible desde el propio slug en vez de mostrar la clave en crudo.
 */
export function exerciseLabel(slug: string): string {
  const key = exerciseNameKey(slug);
  const translated = t(key);
  return translated === key ? humanize(slug) : translated;
}

/** Nombre visible del entrenamiento. Mismo apaño que arriba con `workout.day.*`. */
export function workoutLabel(nameKey: string): string {
  const translated = t(nameKey);
  return translated === nameKey ? humanize(nameKey.split('.').pop() ?? nameKey) : translated;
}

/* ------------------------------------------------------------------ hook */

export interface RestView {
  state: RestTimerState;
  /** Segundos que quedan. */
  seconds: number;
  /** `m:ss`, ya formateado. */
  label: string;
  /** Avance de 0 a 1. */
  progress: number;
  visible: boolean;
}

export interface WorkoutSessionView {
  status: 'loading' | 'error' | 'empty' | 'ready';
  errorKey: string | null;
  /** true si la sesión se recuperó del disco tras cerrarse la app. */
  restored: boolean;
  /** true si hay cambios guardados en local sin sincronizar. */
  offlineSaved: boolean;

  workoutName: string;
  exercise: WorkoutExercise | null;
  exerciseName: string;
  exerciseIndex: number;
  exerciseTotal: number;

  sets: SetLog[];
  lastTimeSets: SetLog[];
  notes: string;

  /** Propuesta de progresión. Nunca se aplica sola. */
  suggestion: LoadSuggestion | null;
  /** false con dolor declarado o descarga: no se propone subir carga. */
  canIncreaseLoad: boolean;
  alternatives: Exercise[];

  rest: RestView;
  completedSets: number;

  /* -------------------------------------------------------- manejadores */
  changeSet(setIndex: number, patch: Partial<SetLog>): void;
  toggleSet(setIndex: number): void;
  addSet(): void;
  removeLastSet(): void;
  nextExercise(): void;
  previousExercise(): void;
  goToExercise(index: number): void;
  swapExercise(toSlug: string): void;
  saveNotes(text: string): void;
  /** Aplica la carga propuesta a las series pendientes. Solo bajo demanda. */
  applySuggestion(): void;
  skipRest(): void;
  finish(): WorkoutSession | null;
  retry(): void;
}

export function useWorkoutSession(): WorkoutSessionView {
  const store = useWorkoutStore();
  const {
    hydrate,
    startSession,
    seedHistory,
    updateSet,
    toggleSetCompleted,
    goToExercise,
    swapExercise: swapInStore,
    setNotes,
    finishSession,
  } = store;

  const planned = useMemo(() => plannedWorkout(), []);

  // Una sola siembra por montaje: sin esto, al cerrar la sesión el efecto
  // arrancaría otra inmediatamente y el resumen nunca llegaría a verse.
  const booted = useRef(false);

  const [rest, setRest] = useState<RestTimerState>(() => createRestTimer(0));
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (booted.current) return;
    if (store.status !== 'ready') return;
    if (!planned) return;
    booted.current = true;
    if (!store.session) startSession(planned);
    seedHistory([demoPreviousSession(store.workout ?? planned)]);
  }, [planned, seedHistory, startSession, store.session, store.status, store.workout]);

  // El reloj solo corre mientras hay descanso activo: ni un render de más.
  /*
   * Un solo intervalo: avanza el reloj y, cuando el descanso termina, lo cierra
   * ahí mismo. Separarlo en dos efectos hacía que el segundo llamara a setState
   * en cada render del primero, encadenando renders sin necesidad.
   */
  useEffect(() => {
    if (!rest.running) return;
    const id = setInterval(() => {
      const now = Date.now();
      setNowMs(now);
      if (isRestFinished(rest, now)) {
        setRest((current) => skipRestTimer(current));
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 500);
    return () => clearInterval(id);
  }, [rest]);

  const workout = store.workout ?? planned;
  const exercises = workout?.exercises ?? [];
  const index = Math.min(store.currentExerciseIndex, Math.max(0, exercises.length - 1));
  const exercise = exercises[index] ?? null;
  const slug = exercise?.exerciseSlug ?? '';

  const log = store.session?.logs.find((l) => l.exerciseSlug === slug);
  const lastTimeSets = useMemo(
    () => (slug ? selectLastTimeSets(store, slug) : []),
    [slug, store],
  );

  const exerciseHistory = useMemo(
    () => (slug ? selectExerciseHistory(store, slug) : []),
    [slug, store],
  );

  const painInHistory = store.history.some((s) => s.painReported === true);

  const canIncreaseLoad = useMemo(
    () =>
      canProposeLoadIncrease({
        weekNumber: demoUser.weekNumber,
        recentSessions: store.history,
      }),
    [store.history],
  );

  const suggestion = useMemo(() => {
    if (!exercise) return null;
    return suggestNextLoad(
      exerciseHistory,
      {
        exerciseSlug: exercise.exerciseSlug,
        sets: exercise.sets,
        repMin: exercise.repMin,
        repMax: exercise.repMax,
        targetRir: exercise.targetRir,
      },
      { painReported: painInHistory },
    );
  }, [exercise, exerciseHistory, painInHistory]);

  const alternatives = useMemo(
    () =>
      slug
        ? findAlternatives(slug, {
            equipment: DEMO_PROFILE.equipment,
            difficulty: DEMO_PROFILE.experience,
            limit: 6,
          })
        : [],
    [slug],
  );

  /* -------------------------------------------------------- manejadores */

  const changeSet = useCallback(
    (setIndex: number, patch: Partial<SetLog>) => {
      if (!slug) return;
      updateSet(slug, setIndex, patch);
    },
    [slug, updateSet],
  );

  const toggleSet = useCallback(
    (setIndex: number) => {
      if (!slug || !exercise) return;
      const completed = toggleSetCompleted(slug, setIndex);
      void Haptics.selectionAsync();
      // El descanso arranca solo al COMPLETAR, con el tiempo del ejercicio.
      // Al desmarcar no se toca: desmarcar es corregir, no descansar.
      if (completed) setRest(startRestTimer(exercise.restSeconds, Date.now()));
    },
    [exercise, slug, toggleSetCompleted],
  );

  const applySuggestion = useCallback(() => {
    if (!slug || !suggestion || suggestion.suggestedWeightKg === null) return;
    if (suggestion.action === 'increase_load' && !canIncreaseLoad) return;
    const weightKg = suggestion.suggestedWeightKg;
    (log?.sets ?? [])
      .filter((s) => !s.completed)
      .forEach((s) => updateSet(slug, s.setIndex, { weightKg }));
  }, [canIncreaseLoad, log, slug, suggestion, updateSet]);

  const status: WorkoutSessionView['status'] =
    store.status === 'loading' || store.status === 'idle'
      ? 'loading'
      : store.status === 'error'
        ? 'error'
        : exercises.length === 0
          ? 'empty'
          : 'ready';

  return {
    status,
    errorKey: store.errorKey,
    restored: store.restoredFromStorage,
    offlineSaved: store.pendingSync && store.session !== null,

    workoutName: workout ? workoutLabel(workout.nameKey) : '',
    exercise,
    exerciseName: slug ? exerciseLabel(slug) : '',
    exerciseIndex: index,
    exerciseTotal: exercises.length,

    sets: log?.sets ?? [],
    lastTimeSets,
    notes: store.notes[slug] ?? '',

    suggestion,
    canIncreaseLoad,
    alternatives,

    rest: {
      state: rest,
      seconds: remainingSeconds(rest, nowMs),
      label: formatRestTime(remainingSeconds(rest, nowMs)),
      progress: restProgress(rest, nowMs),
      visible: rest.running && !isRestFinished(rest, nowMs),
    },
    completedSets: store.session ? countCompletedSets(store.session) : 0,

    changeSet,
    toggleSet,
    addSet: () => slug && store.addSet(slug),
    removeLastSet: () => slug && store.removeLastSet(slug),
    nextExercise: () => goToExercise(index + 1),
    previousExercise: () => goToExercise(index - 1),
    goToExercise,
    swapExercise: (toSlug: string) => slug && swapInStore(slug, toSlug),
    saveNotes: (text: string) => slug && setNotes(slug, text),
    applySuggestion,
    skipRest: () => setRest((current) => skipRestTimer(current)),
    finish: () => finishSession(),
    retry: () => {
      booted.current = false;
      void hydrate();
    },
  };
}
