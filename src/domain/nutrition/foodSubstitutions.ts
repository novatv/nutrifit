/**
 * Sustituciones de alimentos.
 *
 * Filtra el catálogo por patrón dietético, alérgenos y alimentos excluidos, y
 * ordena por parecido nutricional. Los alérgenos son un filtro DURO: un
 * alimento con un alérgeno declarado nunca se propone, pase lo que pase con el
 * resto de criterios.
 */

import type { Allergen, DietPattern, Food } from '@/types/domain';
import { clamp, roundTo, safeNumber } from '@/utils/units';

/* ------------------------------------------------------------ constantes */

/** Peso de cada criterio de similitud. Suman 1. */
export const SIMILARITY_WEIGHTS = {
  /** Densidad energética por 100 g. */
  kcalDensity: 0.4,
  /** Proteína por 100 g: lo que más cambia el plan si falla. */
  protein: 0.4,
  /** Etiquetas/tipo de alimento (que un arroz no sustituya a un yogur). */
  type: 0.2,
} as const;

/** Desvío relativo a partir del cual el criterio puntúa 0. */
export const SIMILARITY_TOLERANCE = 1;

/** Nº de sugerencias por defecto. */
export const DEFAULT_SUBSTITUTE_LIMIT = 5;

/* --------------------------------------------------------------- tipos */

export interface SubstitutionConstraints {
  diet: DietPattern;
  allergens: Allergen[];
  dislikedFoods?: string[];
  /** Ids que no deben aparecer (ya usados hoy, por ejemplo). */
  excludedFoodIds?: string[];
  /** Máximo de sugerencias. */
  limit?: number;
}

export interface SubstituteSuggestion {
  food: Food;
  /** Gramos necesarios para igualar las kcal del alimento original. */
  grams: number;
  /** Parecido 0..1 respecto al original. */
  similarity: number;
}

/* --------------------------------------------------------------- helpers */

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/** Cercanía relativa entre dos valores, acotada a 0..1. */
function closeness(a: number, b: number): number {
  const base = Math.max(safeNumber(a), safeNumber(b));
  if (base <= 0) return 1; // ambos a cero: no hay diferencia que medir
  const error = Math.abs(safeNumber(a) - safeNumber(b)) / base;
  return clamp(1 - error / SIMILARITY_TOLERANCE, 0, 1);
}

/**
 * Gramos del alimento necesarios para aportar `targetKcal`.
 * Si el alimento no aporta energía (agua, especias) devuelve 0 en lugar de
 * dividir entre cero.
 */
export function scaleToMatchKcal(food: Food, targetKcal: number): number {
  const per100 = safeNumber(food.per100g?.kcal);
  const target = Math.max(0, safeNumber(targetKcal));
  if (per100 <= 0) return 0;
  return roundTo((target / per100) * 100, 0);
}

/** kcal que aportan `grams` de un alimento. */
export function kcalForGrams(food: Food, grams: number): number {
  return roundTo((safeNumber(food.per100g?.kcal) * Math.max(0, safeNumber(grams))) / 100, 0);
}

/** true si el alimento encaja con el patrón dietético declarado. */
export function matchesDiet(food: Food, diet: DietPattern): boolean {
  // Sin metadatos de dieta no se puede afirmar que encaje: para omnívoro se
  // acepta, para el resto se descarta (mejor sugerir de menos que de más).
  if (!food.dietPatterns || food.dietPatterns.length === 0) {
    return diet === 'omnivore';
  }
  return food.dietPatterns.includes(diet);
}

/** true si el alimento contiene alguno de los alérgenos a evitar. */
export function hasAllergen(food: Food, allergens: Allergen[]): boolean {
  if (!allergens || allergens.length === 0) return false;
  const declared = food.allergens ?? [];
  return declared.some((a) => allergens.includes(a));
}

/** true si el alimento coincide con algo de la lista de rechazados. */
export function isDisliked(food: Food, disliked: string[] = []): boolean {
  if (disliked.length === 0) return false;
  const name = normalize(food.name);
  return disliked
    .map(normalize)
    .filter((d) => d.length > 0)
    .some((d) => name.includes(d));
}

/** Parecido 0..1 entre dos alimentos (energía, proteína y tipo). */
export function similarityScore(original: Food, candidate: Food): number {
  const kcalScore = closeness(original.per100g?.kcal, candidate.per100g?.kcal);
  const proteinScore = closeness(original.per100g?.proteinG, candidate.per100g?.proteinG);

  const originalTags = new Set((original.tags ?? []).map(normalize));
  const candidateTags = (candidate.tags ?? []).map(normalize);
  const shared = candidateTags.filter((t) => originalTags.has(t)).length;
  const union = new Set([...originalTags, ...candidateTags]).size;
  const typeScore = union === 0 ? 0.5 : shared / union;

  return clamp(
    kcalScore * SIMILARITY_WEIGHTS.kcalDensity +
      proteinScore * SIMILARITY_WEIGHTS.protein +
      typeScore * SIMILARITY_WEIGHTS.type,
    0,
    1,
  );
}

/* ---------------------------------------------------------- sustituciones */

/**
 * Busca sustitutos para `food` dentro de `catalog`.
 *
 * Los gramos devueltos están recalculados para igualar las kcal de una ración
 * del alimento original (`servingGrams`).
 */
export function findSubstitutes(
  food: Food,
  catalog: Food[],
  constraints: SubstitutionConstraints,
): SubstituteSuggestion[] {
  if (!Array.isArray(catalog) || catalog.length === 0) return [];

  const excluded = new Set(constraints.excludedFoodIds ?? []);
  const targetKcal = kcalForGrams(food, food.servingGrams);
  const limit = Math.max(1, Math.trunc(constraints.limit ?? DEFAULT_SUBSTITUTE_LIMIT));

  return catalog
    .filter((candidate) => candidate.id !== food.id)
    .filter((candidate) => !excluded.has(candidate.id))
    .filter((candidate) => !hasAllergen(candidate, constraints.allergens))
    .filter((candidate) => matchesDiet(candidate, constraints.diet))
    .filter((candidate) => !isDisliked(candidate, constraints.dislikedFoods))
    .map((candidate) => ({
      food: candidate,
      grams: scaleToMatchKcal(candidate, targetKcal),
      similarity: similarityScore(food, candidate),
    }))
    // Un sustituto que necesitaría 0 g no sirve para nada.
    .filter((s) => s.grams > 0)
    .sort((a, b) => b.similarity - a.similarity || a.food.name.localeCompare(b.food.name))
    .slice(0, limit);
}
