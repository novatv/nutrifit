/**
 * Esquemas Zod del onboarding.
 *
 * Dos responsabilidades:
 * 1. Convertir lo que el usuario toca en la pantalla (siempre strings) en los
 *    tipos del dominio, sin castings ni `any`: el parseo es la única puerta.
 * 2. Decidir si un paso está completo y correcto antes de dejar avanzar.
 *
 * Los mensajes de error NO son texto: son claves i18n que la pantalla traduce
 * con `t()`, igual que hace `SafetyFinding.messageKey` en el dominio.
 */

import { z } from 'zod';

import type { Locale, UserProfile } from '@/types/domain';

/* ------------------------------------------------------------- constantes */

/** Rangos humanos plausibles; fuera de aquí el dato es un error de tecleo. */
export const PLAUSIBLE = {
  heightCm: { min: 120, max: 250 },
  weightKg: { min: 30, max: 300 },
  ageYears: { min: 10, max: 100 },
} as const;

/** Edad mínima para generar un plan automático. */
export const MIN_AGE_YEARS = 18;

/** Formato ISO corto que guarda el perfil (`birthDate`). */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Clave i18n reutilizada para cualquier dato fuera de rango.
 * Es el único mensaje de validación que existe hoy en `es.ts`.
 */
const INVALID_INPUT_KEY = 'safety.implausibleInput';

/* ----------------------------------------------------------------- fechas */

/** true si la cadena es una fecha real del calendario (rechaza 2026-02-31). */
export function isRealDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Edad en años cumplidos. Devuelve -1 si la fecha no sirve. */
export function calculateAgeYears(birthDate: string, now: Date = new Date()): number {
  if (!isRealDate(birthDate)) return -1;
  const birth = new Date(`${birthDate}T00:00:00Z`);
  if (birth.getTime() > now.getTime()) return -1;

  let age = now.getFullYear() - birth.getUTCFullYear();
  const monthDiff = now.getMonth() - birth.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getUTCDate())) age -= 1;
  return age;
}

/* -------------------------------------------------- esquemas de cada campo */

export const goalSchema = z.enum([
  'lose_fat',
  'gain_muscle',
  'recomp',
  'maintain',
  'fitness',
  'habits',
]);

export const sexSchema = z.enum(['male', 'female', 'unspecified']);

export const activityLevelSchema = z.enum([
  'sedentary',
  'light',
  'moderate',
  'high',
  'very_high',
]);

export const experienceSchema = z.enum(['beginner', 'intermediate', 'advanced']);

export const locationSchema = z.enum(['gym', 'home', 'both', 'outdoor']);

export const equipmentSchema = z.enum([
  'none',
  'dumbbells',
  'bands',
  'barbell',
  'plates',
  'bench',
  'rack',
  'cables',
  'machines',
  'kettlebell',
  'bike',
  'treadmill',
  'rower',
]);

export const dietSchema = z.enum(['omnivore', 'vegetarian', 'vegan', 'pescatarian']);

export const allergenSchema = z.enum([
  'gluten',
  'lactose',
  'tree_nuts',
  'peanut',
  'egg',
  'fish',
  'shellfish',
  'soy',
]);

export const budgetSchema = z.enum(['low', 'medium', 'flexible']);

export const cookingTimeSchema = z.enum(['minimal', 'normal', 'enjoys']);

export const unitSystemSchema = z.enum(['metric', 'imperial']);

export const localeSchema = z.enum(['es', 'en']);

export const daysPerWeekSchema = z.union([
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

export const sessionMinutesSchema = z.union([
  z.literal(20),
  z.literal(30),
  z.literal(45),
  z.literal(60),
  z.literal(75),
]);

export const mealsPerDaySchema = z.union([z.literal(3), z.literal(4), z.literal(5)]);

export const birthDateSchema = z
  .string()
  .regex(ISO_DATE, { message: INVALID_INPUT_KEY })
  .refine(isRealDate, { message: INVALID_INPUT_KEY })
  .refine(
    (value) => {
      const age = calculateAgeYears(value);
      return age >= PLAUSIBLE.ageYears.min && age <= PLAUSIBLE.ageYears.max;
    },
    { message: INVALID_INPUT_KEY },
  );

export const heightCmSchema = z
  .number()
  .min(PLAUSIBLE.heightCm.min, { message: INVALID_INPUT_KEY })
  .max(PLAUSIBLE.heightCm.max, { message: INVALID_INPUT_KEY });

export const weightKgSchema = z
  .number()
  .min(PLAUSIBLE.weightKg.min, { message: INVALID_INPUT_KEY })
  .max(PLAUSIBLE.weightKg.max, { message: INVALID_INPUT_KEY });

export const screeningSchema = z.object({
  pregnantOrBreastfeeding: z.boolean(),
  eatingDisorderCurrent: z.boolean(),
  majorInjury: z.boolean(),
  medicalNutritionTherapy: z.boolean(),
  exerciseContraindicated: z.boolean(),
});

/* -------------------------------------------------------------- borrador */

/**
 * Borrador: todo opcional, porque durante el onboarding el perfil está a
 * medias por definición. Los tipos salen de los mismos esquemas, así que
 * hablan el idioma de `@/types/domain` sin duplicar uniones a mano.
 */
export const draftSchema = z.object({
  goal: goalSchema.optional(),
  birthDate: birthDateSchema.optional(),
  sex: sexSchema.optional(),
  heightCm: heightCmSchema.optional(),
  weightKg: weightKgSchema.optional(),
  targetWeightKg: weightKgSchema.optional(),
  activityLevel: activityLevelSchema.optional(),
  experience: experienceSchema.optional(),
  daysPerWeek: daysPerWeekSchema.optional(),
  sessionMinutes: sessionMinutesSchema.optional(),
  location: locationSchema.optional(),
  equipment: z.array(equipmentSchema).optional(),
  diet: dietSchema.optional(),
  allergens: z.array(allergenSchema).optional(),
  dislikedFoods: z.array(z.string().min(1)).optional(),
  mealsPerDay: mealsPerDaySchema.optional(),
  budget: budgetSchema.optional(),
  cookingTime: cookingTimeSchema.optional(),
  screening: screeningSchema.optional(),
  unitSystem: unitSystemSchema.optional(),
});

export type OnboardingDraft = z.infer<typeof draftSchema>;

/** Campos del perfil que el onboarding puede rellenar. */
export type DraftField = keyof OnboardingDraft;

/* ---------------------------------------------- pasos y perfil completo */

/** Identificadores de los 16 pasos, en el mismo orden en que se recorren. */
export type OnboardingStepId =
  | 'welcome'
  | 'goal'
  | 'data'
  | 'activity'
  | 'experience'
  | 'availability'
  | 'location'
  | 'equipment'
  | 'diet'
  | 'allergens'
  | 'dislikes'
  | 'meals'
  | 'budget'
  | 'cooking'
  | 'screening'
  | 'summary';

/**
 * Respuestas completas del onboarding. Es el mismo objeto que el borrador,
 * pero con todo lo obligatorio presente: solo se cumple al final.
 */
export const onboardingAnswersSchema = z.object({
  goal: goalSchema,
  birthDate: birthDateSchema,
  sex: sexSchema,
  heightCm: heightCmSchema,
  weightKg: weightKgSchema,
  targetWeightKg: weightKgSchema.optional(),
  activityLevel: activityLevelSchema,
  experience: experienceSchema,
  daysPerWeek: daysPerWeekSchema,
  sessionMinutes: sessionMinutesSchema,
  location: locationSchema,
  equipment: z.array(equipmentSchema),
  diet: dietSchema,
  allergens: z.array(allergenSchema),
  dislikedFoods: z.array(z.string().min(1)),
  mealsPerDay: mealsPerDaySchema,
  budget: budgetSchema,
  cookingTime: cookingTimeSchema,
  screening: screeningSchema,
  unitSystem: unitSystemSchema,
});

export type OnboardingAnswers = z.infer<typeof onboardingAnswersSchema>;

/** Perfil completo: respuestas del onboarding + identidad de la cuenta. */
export const completeProfileSchema = onboardingAnswersSchema.extend({
  id: z.string().min(1),
  displayName: z.string().min(1),
  locale: localeSchema,
});

export interface ProfileIdentity {
  id: string;
  displayName: string;
  locale: Locale;
}

/**
 * Convierte el borrador en un `UserProfile` de dominio, o `null` si todavía
 * falta algo. El tipo de retorno es la comprobación de que los esquemas y el
 * contrato de `@/types/domain` no se han separado.
 */
export function toUserProfile(
  draft: OnboardingDraft,
  identity: ProfileIdentity,
): UserProfile | null {
  const parsed = onboardingAnswersSchema.safeParse(draft);
  if (!parsed.success) return null;
  return { ...parsed.data, ...identity };
}

/* ------------------------------------------------- validación por paso */

/** Trozo del borrador que valida cada paso. */
export const stepSchemas: Record<OnboardingStepId, z.ZodType<unknown>> = {
  welcome: z.object({}),
  goal: z.object({ goal: goalSchema }),
  data: z.object({
    birthDate: birthDateSchema,
    sex: sexSchema,
    heightCm: heightCmSchema,
    weightKg: weightKgSchema,
    targetWeightKg: weightKgSchema.optional(),
  }),
  activity: z.object({ activityLevel: activityLevelSchema }),
  experience: z.object({ experience: experienceSchema }),
  availability: z.object({
    daysPerWeek: daysPerWeekSchema,
    sessionMinutes: sessionMinutesSchema,
  }),
  location: z.object({ location: locationSchema }),
  // El equipo puede quedarse vacío solo si se marca "Ninguno" explícitamente.
  equipment: z.object({ equipment: z.array(equipmentSchema).min(1) }),
  diet: z.object({ diet: dietSchema }),
  // Las alergias sí pueden estar vacías: no tener ninguna es la respuesta normal.
  allergens: z.object({ allergens: z.array(allergenSchema) }),
  dislikes: z.object({ dislikedFoods: z.array(z.string().min(1)) }),
  meals: z.object({ mealsPerDay: mealsPerDaySchema }),
  budget: z.object({ budget: budgetSchema }),
  cooking: z.object({ cookingTime: cookingTimeSchema }),
  screening: z.object({ screening: screeningSchema }),
  summary: onboardingAnswersSchema,
};

export interface StepValidation {
  /** true si el paso puede avanzar. */
  ok: boolean;
  /** Clave i18n del error por campo; solo para datos presentes pero inválidos. */
  errors: Partial<Record<DraftField, string>>;
}

/**
 * Valida el paso contra el borrador.
 *
 * Distingue dos situaciones que la interfaz trata distinto:
 * - falta el dato -> el paso no avanza, pero no se grita nada (aún no ha
 *   contestado);
 * - el dato está pero es imposible -> mensaje bajo el campo.
 */
export function validateStep(
  stepId: OnboardingStepId,
  draft: OnboardingDraft,
): StepValidation {
  const result = stepSchemas[stepId].safeParse(draft);
  if (result.success) return { ok: true, errors: {} };

  const errors: Partial<Record<DraftField, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field !== 'string') continue;
    // Sin valor todavía: es un paso incompleto, no un error que mostrar.
    if (!(field in draft) || draft[field as DraftField] === undefined) continue;
    errors[field as DraftField] = issue.message;
  }
  return { ok: false, errors };
}

/* -------------------------------------------------------- cribado final */

export interface SafetyGate {
  /** true si no se puede generar un plan automático. */
  blocked: boolean;
  /** Claves i18n de `safety.*` que hay que mostrar, en orden. */
  messageKeys: string[];
}

/**
 * Puerta de seguridad del final del onboarding.
 *
 * Es deliberadamente conservadora y trabaja solo con lo que el onboarding
 * sabe. El motor completo (`@/domain/safety`) vuelve a pasar el perfil entero
 * antes de entregar objetivos; esto es la barrera de la interfaz, no la única.
 */
export function evaluateOnboardingSafety(
  draft: OnboardingDraft,
  now: Date = new Date(),
): SafetyGate {
  const messageKeys: string[] = [];

  if (draft.birthDate) {
    const age = calculateAgeYears(draft.birthDate, now);
    if (age >= 0 && age < MIN_AGE_YEARS) messageKeys.push('safety.under18');
  }

  const screening = draft.screening;
  if (screening?.pregnantOrBreastfeeding) messageKeys.push('safety.pregnancy');
  if (screening?.eatingDisorderCurrent) messageKeys.push('safety.eatingDisorder');
  if (screening?.medicalNutritionTherapy) messageKeys.push('safety.medicalNutrition');
  if (screening?.exerciseContraindicated) messageKeys.push('safety.exerciseContraindicated');

  return { blocked: messageKeys.length > 0, messageKeys };
}

/**
 * Una lesión importante no bloquea el plan, pero sí obliga a avisar:
 * se muestra en el resumen antes de generar nada.
 */
export function cautionKeys(draft: OnboardingDraft): string[] {
  return draft.screening?.majorInjury ? ['safety.majorInjury'] : [];
}
