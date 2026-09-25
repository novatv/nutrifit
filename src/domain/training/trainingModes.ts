import type { Equipment, UserProfile } from '@/types/domain';

/**
 * Modos de entrenamiento.
 *
 * Un modo es un atajo sobre el equipo disponible. Cambiarlo no toca el
 * programa: el mismo plan de 12 semanas se sirve con ejercicios que caben en
 * el material del modo, vía sustitución. Así alguien que hoy no puede ir al
 * gimnasio entrena igual en casa y vuelve mañana sin perder el hilo.
 */
export type TrainingMode = 'gym' | 'weights' | 'home';

export const TRAINING_MODES: TrainingMode[] = ['gym', 'weights', 'home'];

/** Equipo que da por hecho cada modo. */
export const MODE_EQUIPMENT: Record<TrainingMode, Equipment[]> = {
  // Gimnasio completo: pesas libres más máquinas y poleas.
  gym: ['barbell', 'plates', 'dumbbells', 'bench', 'rack', 'cables', 'machines', 'kettlebell', 'bands'],
  // Pesas libres: lo que cabe en un garaje o una sala pequeña, sin máquinas.
  weights: ['barbell', 'plates', 'dumbbells', 'bench', 'rack', 'kettlebell', 'bands'],
  // Casa sin material: solo el cuerpo.
  home: [],
};

/**
 * Perfil con el equipo del modo aplicado. Si el modo es `gym` y el usuario ya
 * declaró equipo, se respeta lo suyo: el modo amplía, nunca quita lo que tiene.
 */
export function applyTrainingMode(profile: UserProfile, mode: TrainingMode): UserProfile {
  const preset = MODE_EQUIPMENT[mode];
  if (mode === 'home') return { ...profile, equipment: [], location: 'home' };
  const merged = [...new Set([...profile.equipment, ...preset])];
  return { ...profile, equipment: merged, location: mode === 'gym' ? 'gym' : profile.location };
}

/** Modo que mejor describe el equipo que alguien declaró en el alta. */
export function inferTrainingMode(equipment: Equipment[]): TrainingMode {
  if (equipment.length === 0 || (equipment.length === 1 && equipment[0] === 'none')) return 'home';
  if (equipment.includes('machines') || equipment.includes('cables')) return 'gym';
  return 'weights';
}
