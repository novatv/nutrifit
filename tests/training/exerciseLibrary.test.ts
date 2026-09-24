import type { MovementPattern } from '@/types/domain';
import {
  EXERCISES,
  availableWith,
  byMuscle,
  byPattern,
  canPerform,
  getExercise,
  getExerciseOrThrow,
} from '@/domain/training/exerciseLibrary';

import { FULL_GYM, NO_EQUIPMENT } from './factories';

const ALL_PATTERNS: MovementPattern[] = [
  'squat', 'hinge', 'horizontal_push', 'vertical_push', 'horizontal_pull',
  'vertical_pull', 'lunge', 'carry', 'core', 'isolation', 'cardio',
];

describe('biblioteca de ejercicios', () => {
  it('incluye al menos 80 ejercicios', () => {
    expect(EXERCISES.length).toBeGreaterThanOrEqual(80);
  });

  it('no repite slugs ni ids', () => {
    const slugs = EXERCISES.map((e) => e.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const ids = EXERCISES.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cubre todos los patrones de movimiento del contrato', () => {
    ALL_PATTERNS.forEach((pattern) => {
      expect(byPattern(pattern).length).toBeGreaterThan(0);
    });
  });

  it('usa claves i18n coherentes con el slug', () => {
    EXERCISES.forEach((e) => {
      expect(e.nameKey).toBe(`exercise.${e.slug.replace(/-/g, '_')}`);
      e.instructionKeys.forEach((k) => expect(k.startsWith(`${e.nameKey}.cue.`)).toBe(true));
      e.commonMistakeKeys.forEach((k) => expect(k.startsWith(`${e.nameKey}.mistake.`)).toBe(true));
      e.safetyNoteKeys.forEach((k) => expect(k.startsWith(`${e.nameKey}.safety.`)).toBe(true));
    });
  });

  it('respeta el número mínimo y máximo de claves de cada bloque', () => {
    EXERCISES.forEach((e) => {
      expect(e.instructionKeys.length).toBeGreaterThanOrEqual(2);
      expect(e.instructionKeys.length).toBeLessThanOrEqual(4);
      expect(e.commonMistakeKeys.length).toBeGreaterThanOrEqual(1);
      expect(e.commonMistakeKeys.length).toBeLessThanOrEqual(3);
      expect(e.safetyNoteKeys.length).toBeGreaterThanOrEqual(1);
      expect(e.safetyNoteKeys.length).toBeLessThanOrEqual(2);
      expect(e.primaryMuscles.length).toBeGreaterThan(0);
      expect(e.equipment.length).toBeGreaterThan(0);
    });
  });

  it('todas las alternativas apuntan a ejercicios que existen', () => {
    EXERCISES.forEach((e) => {
      expect(e.alternatives.length).toBeGreaterThan(0);
      e.alternatives.forEach((slug) => {
        expect(getExercise(slug)).toBeDefined();
        expect(slug).not.toBe(e.slug);
      });
    });
  });

  it('ofrece variantes sin equipamiento en los patrones entrenables en casa', () => {
    const homePatterns: MovementPattern[] = [
      'squat', 'hinge', 'horizontal_push', 'vertical_push',
      'horizontal_pull', 'lunge', 'carry', 'core', 'isolation', 'cardio',
    ];
    const home = availableWith(NO_EQUIPMENT);
    homePatterns.forEach((pattern) => {
      expect(home.filter((e) => e.pattern === pattern).length).toBeGreaterThan(0);
    });
  });

  it('availableWith solo devuelve ejercicios realizables con ese material', () => {
    const owned = new Set<string>(['dumbbells']);
    availableWith(['dumbbells']).forEach((e) => {
      e.equipment.forEach((needed) => {
        expect(needed === 'none' || owned.has(needed)).toBe(true);
      });
    });
  });

  it('el gimnasio completo desbloquea más ejercicios que el peso corporal', () => {
    expect(availableWith(FULL_GYM).length).toBeGreaterThan(availableWith(NO_EQUIPMENT).length);
    expect(availableWith(FULL_GYM).length).toBe(EXERCISES.length);
  });

  it('canPerform exige TODO el material del ejercicio', () => {
    const bench = getExerciseOrThrow('barbell-bench-press');
    expect(canPerform(bench, ['barbell', 'plates'])).toBe(false);
    expect(canPerform(bench, ['barbell', 'plates', 'bench', 'rack'])).toBe(true);
  });

  it('getExercise devuelve undefined si el slug no existe y getExerciseOrThrow lanza', () => {
    expect(getExercise('no-existe')).toBeUndefined();
    expect(() => getExerciseOrThrow('no-existe')).toThrow();
  });

  it('byMuscle encuentra ejercicios por músculo primario o secundario', () => {
    expect(byMuscle('glutes').length).toBeGreaterThan(5);
    byMuscle('lats').forEach((e) => {
      expect([...e.primaryMuscles, ...e.secondaryMuscles]).toContain('lats');
    });
  });
});
