import { canPerform, getExerciseOrThrow } from '@/domain/training/exerciseLibrary';
import {
  DELOAD_WEEK,
  PROGRAM_WEEKS,
  dayIndexesFor,
  determineTrainingSplit,
  generate12WeekProgram,
  phaseForWeek,
  setsForWeek,
  stepTargetForWeek,
  targetRirForWeek,
  weeklySetVolume,
} from '@/domain/training/programGenerator';

import { FULL_GYM, NO_EQUIPMENT, makeProfile } from './factories';

const avgRir = (week: { workouts: { exercises: { targetRir: number }[] }[] }): number => {
  const all = week.workouts.flatMap((w) => w.exercises.map((e) => e.targetRir));
  return all.reduce((a, b) => a + b, 0) / all.length;
};

describe('reparto semanal', () => {
  it('2 días siempre es cuerpo completo', () => {
    expect(determineTrainingSplit(makeProfile({ daysPerWeek: 2, experience: 'beginner' }))).toBe('full_body');
    expect(determineTrainingSplit(makeProfile({ daysPerWeek: 2, experience: 'advanced' }))).toBe('full_body');
  });

  it('3 días es cuerpo completo salvo para avanzados', () => {
    expect(determineTrainingSplit(makeProfile({ daysPerWeek: 3, experience: 'beginner' }))).toBe('full_body');
    expect(determineTrainingSplit(makeProfile({ daysPerWeek: 3, experience: 'advanced' }))).toBe('ppl');
  });

  it('4 y 5 días reparten torso/pierna según experiencia', () => {
    expect(determineTrainingSplit(makeProfile({ daysPerWeek: 4, experience: 'intermediate' }))).toBe('upper_lower');
    expect(determineTrainingSplit(makeProfile({ daysPerWeek: 4, experience: 'beginner' }))).toBe('full_body');
    expect(determineTrainingSplit(makeProfile({ daysPerWeek: 5, experience: 'intermediate' }))).toBe('upper_lower_plus');
    expect(determineTrainingSplit(makeProfile({ daysPerWeek: 5, experience: 'beginner' }))).toBe('upper_lower');
  });

  it('6 días es PPL, pero no para quien empieza', () => {
    expect(determineTrainingSplit(makeProfile({ daysPerWeek: 6, experience: 'advanced' }))).toBe('ppl');
    expect(determineTrainingSplit(makeProfile({ daysPerWeek: 6, experience: 'intermediate' }))).toBe('ppl');
    expect(determineTrainingSplit(makeProfile({ daysPerWeek: 6, experience: 'beginner' }))).toBe('upper_lower_plus');
  });

  it('reparte los días dejando descansos', () => {
    expect(dayIndexesFor(2)).toEqual([0, 3]);
    expect(dayIndexesFor(3)).toEqual([0, 2, 4]);
    [2, 3, 4, 5, 6].forEach((n) => {
      const days = dayIndexesFor(n);
      expect(days).toHaveLength(n);
      expect(new Set(days).size).toBe(n);
      days.forEach((d) => expect(d).toBeGreaterThanOrEqual(0));
      days.forEach((d) => expect(d).toBeLessThanOrEqual(6));
    });
  });
});

describe('fases y parámetros por semana', () => {
  it('asigna adaptación, progresión, descarga y consolidación', () => {
    expect([1, 2, 3, 4].map(phaseForWeek)).toEqual(['adaptation', 'adaptation', 'adaptation', 'adaptation']);
    expect([5, 6, 7].map(phaseForWeek)).toEqual(['progression', 'progression', 'progression']);
    expect(phaseForWeek(DELOAD_WEEK)).toBe('deload');
    expect([9, 10, 11, 12].map(phaseForWeek)).toEqual(['consolidation', 'consolidation', 'consolidation', 'consolidation']);
  });

  it('las series suben y caen en la semana de descarga', () => {
    expect(setsForWeek(12, 'intermediate')).toBeGreaterThan(setsForWeek(1, 'intermediate'));
    expect(setsForWeek(DELOAD_WEEK, 'intermediate')).toBeLessThan(setsForWeek(7, 'intermediate'));
  });

  it('el RIR objetivo baja (más intensidad) y sube en la descarga', () => {
    expect(targetRirForWeek(12, 'intermediate')).toBeLessThan(targetRirForWeek(1, 'intermediate'));
    expect(targetRirForWeek(DELOAD_WEEK, 'intermediate')).toBeGreaterThan(targetRirForWeek(7, 'intermediate'));
  });

  it('el principiante trabaja más lejos del fallo que el avanzado', () => {
    expect(targetRirForWeek(6, 'beginner')).toBeGreaterThan(targetRirForWeek(6, 'advanced'));
  });

  it('los pasos suben con las semanas y bajan en la descarga', () => {
    expect(stepTargetForWeek(5, 'moderate')).toBeGreaterThan(stepTargetForWeek(1, 'moderate'));
    expect(stepTargetForWeek(DELOAD_WEEK, 'moderate')).toBeLessThan(stepTargetForWeek(7, 'moderate'));
    expect(stepTargetForWeek(1, 'sedentary')).toBeLessThan(stepTargetForWeek(1, 'very_high'));
  });
});

describe('programa de 12 semanas', () => {
  it('tiene exactamente 12 semanas numeradas del 1 al 12', () => {
    const program = generate12WeekProgram(makeProfile());
    expect(program.weeks).toHaveLength(PROGRAM_WEEKS);
    expect(program.weeks.map((w) => w.weekNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('coloca una única semana de descarga, y es la 8', () => {
    const program = generate12WeekProgram(makeProfile());
    const deloads = program.weeks.filter((w) => w.phase === 'deload');
    expect(deloads).toHaveLength(1);
    expect(deloads[0].weekNumber).toBe(DELOAD_WEEK);
    expect(deloads[0].focusKey).toBe('program.focus.deload');
    deloads[0].workouts.forEach((w) =>
      w.exercises.forEach((e) => expect(e.notesKey).toBe('workout.note.deload_week')),
    );
  });

  it('es determinista: el mismo perfil da el mismo programa', () => {
    const profile = makeProfile();
    expect(generate12WeekProgram(profile)).toEqual(generate12WeekProgram(profile));
  });

  it('perfiles distintos producen programas distintos', () => {
    const a = generate12WeekProgram(makeProfile({ id: 'a' }));
    const b = generate12WeekProgram(makeProfile({ id: 'b' }));
    expect(a.weeks[0].workouts[0].exercises).not.toEqual(b.weeks[0].workouts[0].exercises);
  });

  it('el volumen progresa y no es plano', () => {
    const program = generate12WeekProgram(makeProfile());
    const volumes = program.weeks.map(weeklySetVolume);

    // Sube de principio a fin.
    expect(volumes[11]).toBeGreaterThan(volumes[0]);
    // La descarga baja respecto a la semana anterior.
    expect(volumes[DELOAD_WEEK - 1]).toBeLessThan(volumes[DELOAD_WEEK - 2]);
    // Dentro de cada bloque nunca retrocede.
    [[0, 3], [4, 6], [8, 11]].forEach(([from, to]) => {
      for (let i = from + 1; i <= to; i += 1) {
        expect(volumes[i]).toBeGreaterThanOrEqual(volumes[i - 1]);
      }
    });
    // La consolidación acumula más que la adaptación.
    const media = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    expect(media(volumes.slice(8, 12))).toBeGreaterThan(media(volumes.slice(0, 4)));
  });

  it('la intensidad también progresa: menos repeticiones en reserva', () => {
    const program = generate12WeekProgram(makeProfile());
    expect(avgRir(program.weeks[11])).toBeLessThan(avgRir(program.weeks[0]));
    expect(avgRir(program.weeks[DELOAD_WEEK - 1])).toBeGreaterThan(avgRir(program.weeks[DELOAD_WEEK - 2]));
  });

  it('usuario con 2 días: cuerpo completo, dos sesiones por semana', () => {
    const program = generate12WeekProgram(
      makeProfile({ daysPerWeek: 2, sessionMinutes: 45, experience: 'beginner' }),
    );
    expect(program.split).toBe('full_body');
    program.weeks.forEach((week) => {
      expect(week.workouts).toHaveLength(2);
      expect(week.workouts.map((w) => w.dayIndex)).toEqual([0, 3]);
    });
  });

  it('usuario con 6 días: seis sesiones y reparto PPL', () => {
    const program = generate12WeekProgram(
      makeProfile({ daysPerWeek: 6, sessionMinutes: 60, experience: 'advanced' }),
    );
    expect(program.split).toBe('ppl');
    program.weeks.forEach((week) => expect(week.workouts).toHaveLength(6));
    expect(program.weeks[0].workouts.map((w) => w.nameKey)).toEqual([
      'workout.day.push', 'workout.day.pull', 'workout.day.legs',
      'workout.day.push', 'workout.day.pull', 'workout.day.legs',
    ]);
  });

  it('en casa sin equipamiento ningún ejercicio del programa exige material', () => {
    const program = generate12WeekProgram(
      makeProfile({ daysPerWeek: 3, sessionMinutes: 30, location: 'home', equipment: NO_EQUIPMENT }),
    );
    let total = 0;
    program.weeks.forEach((week) =>
      week.workouts.forEach((workout) => {
        expect(workout.exercises.length).toBeGreaterThan(0);
        workout.exercises.forEach((we) => {
          total += 1;
          const exercise = getExerciseOrThrow(we.exerciseSlug);
          expect(canPerform(exercise, NO_EQUIPMENT)).toBe(true);
          expect(exercise.equipment).toEqual(['none']);
        });
      }),
    );
    expect(total).toBeGreaterThan(0);
  });

  it('en gimnasio completo aprovecha el material disponible', () => {
    const program = generate12WeekProgram(makeProfile({ equipment: FULL_GYM }));
    const slugs = program.weeks.flatMap((w) => w.workouts.flatMap((s) => s.exercises.map((e) => e.exerciseSlug)));
    const conMaterial = slugs.filter((s) => getExerciseOrThrow(s).equipment[0] !== 'none');
    expect(conMaterial.length).toBeGreaterThan(slugs.length / 2);
  });

  it('principiante y avanzado reciben programas distintos con los mismos días', () => {
    const base = { daysPerWeek: 4, sessionMinutes: 60 } as const;
    const novato = generate12WeekProgram(makeProfile({ ...base, experience: 'beginner' }));
    const experto = generate12WeekProgram(makeProfile({ ...base, experience: 'advanced' }));

    expect(novato.split).toBe('full_body');
    expect(experto.split).toBe('upper_lower');
    expect(weeklySetVolume(experto.weeks[0])).toBeGreaterThan(weeklySetVolume(novato.weeks[0]));
    expect(avgRir(experto.weeks[0])).toBeLessThan(avgRir(novato.weeks[0]));

    novato.weeks.forEach((week) =>
      week.workouts.forEach((workout) =>
        workout.exercises.forEach((we) =>
          expect(getExerciseOrThrow(we.exerciseSlug).difficulty).not.toBe('advanced'),
        ),
      ),
    );
  });

  it('cada sesión cabe en los minutos declarados', () => {
    ([20, 30, 45, 60, 75] as const).forEach((sessionMinutes) => {
      const program = generate12WeekProgram(makeProfile({ sessionMinutes }));
      program.weeks.forEach((week) =>
        week.workouts.forEach((workout) =>
          expect(workout.estimatedMinutes).toBeLessThanOrEqual(sessionMinutes),
        ),
      );
    });
  });

  it('los identificadores de sesión son únicos en todo el programa', () => {
    const program = generate12WeekProgram(makeProfile({ daysPerWeek: 5 }));
    const ids = program.weeks.flatMap((w) => w.workouts.map((s) => s.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
