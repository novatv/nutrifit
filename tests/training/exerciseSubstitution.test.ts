import { canPerform, getExerciseOrThrow } from '@/domain/training/exerciseLibrary';
import {
  findAlternatives,
  substituteExercise,
  touchesMuscles,
} from '@/domain/training/exerciseSubstitution';

import { FULL_GYM, NO_EQUIPMENT } from './factories';

describe('sustitución de ejercicios', () => {
  it('devuelve alternativas ordenadas por parecido y sin el original', () => {
    const alts = findAlternatives('barbell-back-squat');
    expect(alts.length).toBeGreaterThan(0);
    expect(alts.map((a) => a.slug)).not.toContain('barbell-back-squat');
    // Las alternativas declaradas en la ficha van primero.
    const declaradas = getExerciseOrThrow('barbell-back-squat').alternatives;
    expect(declaradas).toContain(alts[0].slug);
  });

  it('respeta el material disponible', () => {
    const alts = findAlternatives('barbell-back-squat', { equipment: NO_EQUIPMENT });
    expect(alts.length).toBeGreaterThan(0);
    alts.forEach((a) => {
      expect(canPerform(a, NO_EQUIPMENT)).toBe(true);
      expect(a.equipment).toEqual(['none']);
    });
  });

  it('respeta el tope de dificultad', () => {
    const alts = findAlternatives('barbell-front-squat', {
      equipment: FULL_GYM,
      difficulty: 'beginner',
    });
    expect(alts.length).toBeGreaterThan(0);
    alts.forEach((a) => expect(a.difficulty).toBe('beginner'));
  });

  it('evita la musculatura con molestias declaradas', () => {
    const alts = findAlternatives('conventional-deadlift', {
      equipment: FULL_GYM,
      avoidMuscles: ['lower_back'],
    });
    expect(alts.length).toBeGreaterThan(0);
    alts.forEach((a) => {
      expect(a.primaryMuscles).not.toContain('lower_back');
      expect(a.secondaryMuscles).not.toContain('lower_back');
    });
  });

  it('combina los tres filtros a la vez', () => {
    const alts = findAlternatives('barbell-bench-press', {
      equipment: NO_EQUIPMENT,
      difficulty: 'beginner',
      avoidMuscles: ['shoulders'],
    });
    alts.forEach((a) => {
      expect(a.equipment).toEqual(['none']);
      expect(a.difficulty).toBe('beginner');
      expect(touchesMuscles(a, ['shoulders'])).toBe(false);
    });
  });

  it('mantiene el patrón de movimiento o al menos la musculatura', () => {
    const original = getExerciseOrThrow('lat-pulldown-cable');
    findAlternatives('lat-pulldown-cable', { equipment: FULL_GYM }).forEach((a) => {
      const mismoPatron = a.pattern === original.pattern;
      const mismoMusculo = original.primaryMuscles.some(
        (m) => a.primaryMuscles.includes(m) || a.secondaryMuscles.includes(m),
      );
      expect(mismoPatron || mismoMusculo).toBe(true);
    });
  });

  it('limita el número de resultados', () => {
    expect(findAlternatives('push-up', { limit: 2 })).toHaveLength(2);
    expect(substituteExercise('push-up')).toBeDefined();
  });

  it('prefiere no proponer nada antes que proponer algo imposible', () => {
    expect(findAlternatives('slug-inexistente')).toEqual([]);
    const imposible = findAlternatives('barbell-back-squat', {
      equipment: NO_EQUIPMENT,
      avoidMuscles: ['quads', 'glutes', 'hamstrings', 'calves', 'abs', 'lower_back', 'full_body'],
    });
    expect(imposible).toEqual([]);
    expect(substituteExercise('slug-inexistente')).toBeUndefined();
  });

  it('es determinista', () => {
    const uno = findAlternatives('goblet-squat', { equipment: FULL_GYM });
    const dos = findAlternatives('goblet-squat', { equipment: FULL_GYM });
    expect(uno.map((a) => a.slug)).toEqual(dos.map((a) => a.slug));
  });

  it('touchesMuscles mira primarios y secundarios', () => {
    const squat = getExerciseOrThrow('barbell-back-squat');
    expect(touchesMuscles(squat, [])).toBe(false);
    expect(touchesMuscles(squat, ['quads'])).toBe(true);
    expect(touchesMuscles(squat, ['lower_back'])).toBe(true);
    expect(touchesMuscles(squat, ['biceps'])).toBe(false);
  });
});
