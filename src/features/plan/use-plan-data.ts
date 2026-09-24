/**
 * Datos del calendario de 12 semanas.
 *
 * El plan no se escribe a mano en la pantalla: sale de `generatePlan`, que es
 * quien pasa el cribado de seguridad. Si el cribado bloquea, aquí se devuelve
 * `blocked` y la pantalla enseña el motivo en vez de un calendario.
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { generatePlan, type GeneratedPlan } from '@/domain/planPipeline';
import { DEMO_CHECKIN_DAY_INDEX, demoProfile, demoUser } from '@/services/demo-data';
import type { ProgramWeek, SafetyResult, Workout } from '@/types/domain';

/* ------------------------------------------------------------------ tipos */

export type PlanStatus = 'loading' | 'error' | 'empty' | 'blocked' | 'success';

/** Estado de una semana respecto a la semana en curso. */
export type WeekStatus = 'pending' | 'current' | 'completed';

export type PlanDayKind = 'workout' | 'rest' | 'checkin';

export interface PlanDay {
  /** 0 = lunes … 6 = domingo. */
  dayIndex: number;
  kind: PlanDayKind;
  workout: Workout | null;
}

export interface PlanWeek {
  weekNumber: number;
  /** 1, 2 o 3. */
  month: number;
  phase: ProgramWeek['phase'];
  status: WeekStatus;
  days: PlanDay[];
  workoutCount: number;
  stepTarget: number;
}

/** Fila de la lista: cabecera de mes o semana. Permite virtualizar en plano. */
export type PlanRow =
  | { type: 'month'; key: string; month: number }
  | { type: 'week'; key: string; week: PlanWeek };

export interface PlanCalendar {
  weeks: PlanWeek[];
  rows: PlanRow[];
  currentWeekNumber: number;
  sessionsPerWeek: number;
}

export interface UsePlanDataResult {
  status: PlanStatus;
  calendar: PlanCalendar | null;
  plan: GeneratedPlan | null;
  safety: SafetyResult | null;
  error: Error | null;
  retry: () => void;
}

export const DAYS_PER_WEEK = 7;
export const WEEKS_PER_MONTH = 4;

/* -------------------------------------------------------- funciones puras */

export function monthForWeek(weekNumber: number): number {
  return Math.max(1, Math.ceil(weekNumber / WEEKS_PER_MONTH));
}

export function statusForWeek(weekNumber: number, currentWeek: number): WeekStatus {
  if (weekNumber < currentWeek) return 'completed';
  if (weekNumber === currentWeek) return 'current';
  return 'pending';
}

/**
 * Los siete días de una semana. Donde no hay sesión hay descanso, y el día
 * del check-in se marca como tal aunque también toque entrenar ese día: el
 * check-in es lo que el usuario tiene que recordar.
 */
export function buildWeekDays(
  week: ProgramWeek,
  checkinDayIndex: number = DEMO_CHECKIN_DAY_INDEX,
): PlanDay[] {
  const byDay = new Map<number, Workout>();
  for (const workout of week.workouts) byDay.set(workout.dayIndex, workout);

  return Array.from({ length: DAYS_PER_WEEK }, (_, dayIndex) => {
    const workout = byDay.get(dayIndex) ?? null;
    const kind: PlanDayKind =
      dayIndex === checkinDayIndex && !workout ? 'checkin' : workout ? 'workout' : 'rest';
    return { dayIndex, kind, workout };
  });
}

/** Convierte el programa del dominio en el calendario que pinta la pantalla. */
export function buildCalendar(
  plan: GeneratedPlan,
  currentWeekNumber: number,
): PlanCalendar {
  const weeks: PlanWeek[] = plan.program.weeks.map((week) => ({
    weekNumber: week.weekNumber,
    month: monthForWeek(week.weekNumber),
    phase: week.phase,
    status: statusForWeek(week.weekNumber, currentWeekNumber),
    days: buildWeekDays(week),
    workoutCount: week.workouts.length,
    stepTarget: week.stepTarget,
  }));

  const rows: PlanRow[] = [];
  let lastMonth = 0;
  for (const week of weeks) {
    if (week.month !== lastMonth) {
      rows.push({ type: 'month', key: `month-${week.month}`, month: week.month });
      lastMonth = week.month;
    }
    rows.push({ type: 'week', key: `week-${week.weekNumber}`, week });
  }

  return {
    weeks,
    rows,
    currentWeekNumber,
    sessionsPerWeek: plan.summary.sessionsPerWeek,
  };
}

/* ------------------------------------------------------------- obtención */

export type PlanFetchResult =
  | { kind: 'generated'; plan: GeneratedPlan }
  | { kind: 'blocked'; safety: SafetyResult };

/** Genera el plan del perfil de demostración. Con sesión real, del perfil real. */
export async function fetchPlan(): Promise<PlanFetchResult> {
  const result = generatePlan(demoProfile);
  return result.status === 'generated'
    ? { kind: 'generated', plan: result.plan }
    : { kind: 'blocked', safety: result.safety };
}

/* ------------------------------------------------------------------- hook */

export function usePlanData(): UsePlanDataResult {
  const query = useQuery<PlanFetchResult, Error>({
    queryKey: ['plan-calendar', demoProfile.id],
    queryFn: fetchPlan,
    // El plan es determinista: regenerarlo al volver a la pestaña no aporta.
    staleTime: 10 * 60_000,
  });

  const calendar = useMemo(() => {
    if (query.data?.kind !== 'generated') return null;
    return buildCalendar(query.data.plan, demoUser.weekNumber);
  }, [query.data]);

  const status: PlanStatus = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : query.data?.kind === 'blocked'
        ? 'blocked'
        : !calendar || calendar.weeks.length === 0
          ? 'empty'
          : 'success';

  return {
    status,
    calendar,
    plan: query.data?.kind === 'generated' ? query.data.plan : null,
    safety: query.data?.kind === 'blocked' ? query.data.safety : null,
    error: query.error ?? null,
    retry: () => void query.refetch(),
  };
}
