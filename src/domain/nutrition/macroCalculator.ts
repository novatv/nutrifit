/**
 * Reparto de macronutrientes.
 *
 * TODOS los coeficientes viven en MACRO_RULES, documentados con su
 * fundamento. Si hay que discutir un número, se discute ahí, no buscándolo
 * por el código.
 */

import type { Goal, MacroTargets, TrainingExperience, UserProfile } from '@/types/domain';
import { clamp, roundTo, safeNumber } from '@/utils/units';

/* ------------------------------------------------------------ constantes */

export const MACRO_RULES = {
  /** kcal por gramo de cada macro (factores de Atwater). */
  kcalPerGram: {
    protein: 4,
    carbs: 4,
    fat: 9,
  },

  protein: {
    /**
     * Gramos de proteína por kg de PESO CORPORAL según objetivo.
     * Fundamento: 1,6 g/kg cubre la síntesis proteica en la mayoría; se sube
     * en déficit (proteger masa magra con menos energía) y en recomposición
     * (construir y perder a la vez es el escenario más exigente).
     */
    perKgByGoal: {
      lose_fat: 1.9,
      gain_muscle: 1.8,
      recomp: 2.0,
      maintain: 1.6,
      fitness: 1.6,
      habits: 1.4,
    } as Record<Goal, number>,

    /**
     * Ajuste por experiencia. El avanzado aprovecha algo más de proteína y
     * suele tener más masa magra; el principiante no necesita apurar.
     */
    experienceModifier: {
      beginner: -0.1,
      intermediate: 0,
      advanced: 0.1,
    } as Record<TrainingExperience, number>,

    /** Límites duros: por debajo no protege, por encima no aporta más. */
    minPerKg: 1.2,
    maxPerKg: 2.4,
  },

  fat: {
    /**
     * Mínimo por kg de peso corporal. Fundamento: la grasa es necesaria para
     * hormonas y vitaminas liposolubles; 0,6 g/kg es el suelo habitual para
     * no comprometer esa función.
     */
    minPerKg: 0.6,
    /**
     * Objetivo como fracción de las kcal del día. En déficit se baja algo
     * para dejar sitio a los carbohidratos que sostienen el entrenamiento.
     */
    pctOfKcalByGoal: {
      lose_fat: 0.27,
      gain_muscle: 0.25,
      recomp: 0.27,
      maintain: 0.3,
      fitness: 0.25,
      habits: 0.3,
    } as Record<Goal, number>,
    /** Nunca por debajo del 20% de la energía del día. */
    minPctOfKcal: 0.2,
  },

  carbs: {
    /**
     * Los carbohidratos son el RESTO de la energía. Suelo de 50 g/día para
     * no empujar sin querer a una dieta cetogénica que nadie ha pedido.
     */
    minGrams: 50,
  },

  fiber: {
    /**
     * Fibra escalada por energía: 14 g por cada 1.000 kcal es la referencia
     * dietética habitual. Se acota para que no salga un número irreal.
     */
    gramsPer1000Kcal: 14,
    minGrams: 20,
    maxGrams: 45,
  },
} as const;

/* ------------------------------------------------------------- funciones */

/** Gramos de proteína objetivo según perfil (peso, objetivo y experiencia). */
export function proteinTargetG(profile: UserProfile): number {
  const { perKgByGoal, experienceModifier, minPerKg, maxPerKg } = MACRO_RULES.protein;
  const base = perKgByGoal[profile.goal] ?? perKgByGoal.maintain;
  const modifier = experienceModifier[profile.experience] ?? 0;
  const perKg = clamp(base + modifier, minPerKg, maxPerKg);
  return Math.max(0, roundTo(perKg * Math.max(0, safeNumber(profile.weightKg)), 0));
}

/** Gramos de fibra objetivo, escalados por las kcal del día. */
export function fiberTargetG(targetKcal: number): number {
  const { gramsPer1000Kcal, minGrams, maxGrams } = MACRO_RULES.fiber;
  const raw = (Math.max(0, safeNumber(targetKcal)) / 1000) * gramsPer1000Kcal;
  return Math.round(clamp(raw, minGrams, maxGrams));
}

/**
 * Reparte las kcal del día en proteína, grasa, carbohidratos y fibra.
 *
 * Orden: primero proteína (por kg de peso), después grasa (mínimo por kg y
 * porcentaje de la energía), y los carbohidratos son el resto. Si el resto no
 * llega al suelo de carbohidratos se recortan grasa y proteína en ese orden,
 * siempre respetando sus mínimos.
 */
export function calculateMacros(profile: UserProfile, targetKcal: number): MacroTargets {
  const kcal = Math.max(0, safeNumber(targetKcal));
  const weightKg = Math.max(0, safeNumber(profile.weightKg));
  const { kcalPerGram } = MACRO_RULES;

  // --- proteína
  let proteinG = proteinTargetG(profile);
  const minProteinG = Math.round(MACRO_RULES.protein.minPerKg * weightKg);

  // --- grasa
  const fatPct =
    MACRO_RULES.fat.pctOfKcalByGoal[profile.goal] ?? MACRO_RULES.fat.pctOfKcalByGoal.maintain;
  const fatFromPct = (kcal * fatPct) / kcalPerGram.fat;
  const fatFromWeight = MACRO_RULES.fat.minPerKg * weightKg;
  let fatG = Math.round(Math.max(fatFromPct, fatFromWeight));
  const minFatG = Math.round(
    Math.max(
      (kcal * MACRO_RULES.fat.minPctOfKcal) / kcalPerGram.fat,
      MACRO_RULES.fat.minPerKg * weightKg,
    ),
  );

  // --- carbohidratos: el resto
  const kcalFromProteinAndFat = () =>
    proteinG * kcalPerGram.protein + fatG * kcalPerGram.fat;
  let carbsG = Math.round((kcal - kcalFromProteinAndFat()) / kcalPerGram.carbs);

  // Si no queda sitio para los carbohidratos mínimos, se recorta grasa y
  // luego proteína, nunca por debajo de sus mínimos.
  const minCarbsG = Math.min(MACRO_RULES.carbs.minGrams, Math.floor(kcal / kcalPerGram.carbs));

  if (carbsG < minCarbsG) {
    const deficitKcal = (minCarbsG - carbsG) * kcalPerGram.carbs;
    const fatCutG = Math.min(fatG - minFatG, Math.ceil(deficitKcal / kcalPerGram.fat));
    if (fatCutG > 0) fatG -= fatCutG;

    carbsG = Math.round((kcal - kcalFromProteinAndFat()) / kcalPerGram.carbs);
  }

  if (carbsG < minCarbsG) {
    const deficitKcal = (minCarbsG - carbsG) * kcalPerGram.carbs;
    const proteinCutG = Math.min(
      Math.max(0, proteinG - minProteinG),
      Math.ceil(deficitKcal / kcalPerGram.protein),
    );
    if (proteinCutG > 0) proteinG -= proteinCutG;

    carbsG = Math.round((kcal - kcalFromProteinAndFat()) / kcalPerGram.carbs);
  }

  return {
    proteinG: Math.max(0, proteinG),
    carbsG: Math.max(0, carbsG),
    fatG: Math.max(0, fatG),
    fiberG: fiberTargetG(kcal),
  };
}

/** kcal que suman unos macros. Útil para comprobar coherencia en tests. */
export function macrosToKcal(macros: MacroTargets): number {
  const { kcalPerGram } = MACRO_RULES;
  return roundTo(
    macros.proteinG * kcalPerGram.protein +
      macros.carbsG * kcalPerGram.carbs +
      macros.fatG * kcalPerGram.fat,
    0,
  );
}
