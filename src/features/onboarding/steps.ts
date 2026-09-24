/**
 * Definición declarativa del onboarding.
 *
 * Toda la forma del cuestionario vive aquí: orden, título, tipo de control,
 * campo del perfil que rellena y esquema que lo valida. Las pantallas solo
 * saben pintar tipos de control; añadir o mover un paso es tocar esta tabla,
 * no la interfaz.
 *
 * Los valores de las opciones son strings porque eso es lo que maneja la UI;
 * `choicePatch` es la única puerta que los convierte en tipos de dominio, y lo
 * hace con los esquemas Zod, nunca con castings.
 */

import { z } from 'zod';

import {
  activityLevelSchema,
  allergenSchema,
  budgetSchema,
  cookingTimeSchema,
  daysPerWeekSchema,
  dietSchema,
  equipmentSchema,
  experienceSchema,
  goalSchema,
  locationSchema,
  mealsPerDaySchema,
  sessionMinutesSchema,
  sexSchema,
  stepSchemas,
  type DraftField,
  type OnboardingDraft,
  type OnboardingStepId,
} from './onboarding-schema';

/* ------------------------------------------------------------- constantes */

/** Pasos totales, incluidos bienvenida (1) y resumen (16). */
export const TOTAL_STEPS = 16;

/** Orden del primer paso con preguntas y del resumen. */
export const FIRST_QUESTION_ORDER = 2;
export const SUMMARY_ORDER = 16;

/**
 * Símbolos de unidad. No son prosa traducible (kg y cm se escriben igual en
 * español y en inglés), por eso viven aquí y no en el diccionario.
 */
export const UNIT_SYMBOL = {
  cm: 'cm',
  kg: 'kg',
  lb: 'lb',
  ft: 'ft',
  in: 'in',
} as const;

/** Máscara de la fecha de nacimiento; es un formato, no un texto de interfaz. */
export const BIRTH_DATE_MASK = 'AAAA-MM-DD';

/* ----------------------------------------------------------------- tipos */

export interface ChoiceOption {
  /** Valor tal y como lo maneja la interfaz: siempre string. */
  readonly value: string;
  /** Clave i18n de la etiqueta. */
  readonly labelKey?: string;
  readonly labelParams?: Readonly<Record<string, string | number>>;
  /** Etiqueta literal para opciones puramente numéricas (2, 3, 4…). */
  readonly label?: string;
}

/** Cómo se pinta el paso. La pantalla hace un switch sobre esto. */
export type StepControl =
  | 'intro'
  | 'single'
  | 'multi'
  | 'measurements'
  | 'availability'
  | 'tags'
  | 'screening'
  | 'summary';

export interface StepDefinition {
  readonly id: OnboardingStepId;
  /** Posición 1..16, la que se muestra en "Paso X de 16". */
  readonly order: number;
  readonly titleKey: string;
  readonly hintKey?: string;
  readonly control: StepControl;
  /** Campos del perfil que rellena este paso. */
  readonly fields: readonly DraftField[];
  readonly options?: readonly ChoiceOption[];
  /** Segunda rejilla (paso de disponibilidad: minutos por sesión). */
  readonly secondaryTitleKey?: string;
  readonly secondaryOptions?: readonly ChoiceOption[];
  /** Opción excluyente en pasos de selección múltiple ("ninguna"). */
  readonly exclusiveValue?: string;
  /** Esquema que debe cumplir el borrador para poder avanzar. */
  readonly schema: z.ZodType<unknown>;
}

/* --------------------------------------------------------------- opciones */

const optionsFrom = (
  values: readonly string[],
  prefix: string,
): readonly ChoiceOption[] =>
  values.map((value) => ({ value, labelKey: `${prefix}.${value}` }));

const numericOptions = (values: readonly number[]): readonly ChoiceOption[] =>
  values.map((value) => ({ value: String(value), label: String(value) }));

const minuteOptions = (values: readonly number[]): readonly ChoiceOption[] =>
  values.map((value) => ({
    value: String(value),
    labelKey: 'onboarding.minutes',
    labelParams: { n: value },
  }));

export const GOAL_OPTIONS = optionsFrom(goalSchema.options, 'onboarding.goal');
export const SEX_OPTIONS = optionsFrom(sexSchema.options, 'onboarding.sex');
export const ACTIVITY_OPTIONS = optionsFrom(
  activityLevelSchema.options,
  'onboarding.activity',
);
export const EXPERIENCE_OPTIONS = optionsFrom(
  experienceSchema.options,
  'onboarding.experience',
);
export const DAYS_OPTIONS = numericOptions([2, 3, 4, 5, 6]);
export const SESSION_OPTIONS = minuteOptions([20, 30, 45, 60, 75]);
export const LOCATION_OPTIONS = optionsFrom(
  locationSchema.options,
  'onboarding.location',
);
export const EQUIPMENT_OPTIONS = optionsFrom(
  equipmentSchema.options,
  'onboarding.equipment',
);
export const DIET_OPTIONS = optionsFrom(dietSchema.options, 'onboarding.diet');
export const ALLERGEN_OPTIONS = optionsFrom(
  allergenSchema.options,
  'onboarding.allergen',
);
export const MEALS_OPTIONS = numericOptions([3, 4, 5]);
export const BUDGET_OPTIONS = optionsFrom(budgetSchema.options, 'onboarding.budget');
export const COOKING_OPTIONS = optionsFrom(
  cookingTimeSchema.options,
  'onboarding.cooking',
);

/** Preguntas del cribado, en el orden en que se leen. */
export const SCREENING_ITEMS = [
  'pregnantOrBreastfeeding',
  'eatingDisorderCurrent',
  'majorInjury',
  'medicalNutritionTherapy',
  'exerciseContraindicated',
] as const;

export type ScreeningItem = (typeof SCREENING_ITEMS)[number];

/** Valor reservado de "Ninguno"/"Ninguna de las anteriores". */
export const NONE_VALUE = 'none';

/* ------------------------------------------------------------------ tabla */

export const ONBOARDING_STEPS: readonly StepDefinition[] = [
  {
    id: 'welcome',
    order: 1,
    titleKey: 'onboarding.welcomeTitle',
    hintKey: 'onboarding.welcomeBody',
    control: 'intro',
    fields: [],
    schema: stepSchemas.welcome,
  },
  {
    id: 'goal',
    order: 2,
    titleKey: 'onboarding.goalTitle',
    control: 'single',
    fields: ['goal'],
    options: GOAL_OPTIONS,
    schema: stepSchemas.goal,
  },
  {
    id: 'data',
    order: 3,
    titleKey: 'onboarding.dataTitle',
    control: 'measurements',
    fields: ['birthDate', 'sex', 'heightCm', 'weightKg', 'targetWeightKg'],
    options: SEX_OPTIONS,
    schema: stepSchemas.data,
  },
  {
    id: 'activity',
    order: 4,
    titleKey: 'onboarding.activityTitle',
    control: 'single',
    fields: ['activityLevel'],
    options: ACTIVITY_OPTIONS,
    schema: stepSchemas.activity,
  },
  {
    id: 'experience',
    order: 5,
    titleKey: 'onboarding.experienceTitle',
    control: 'single',
    fields: ['experience'],
    options: EXPERIENCE_OPTIONS,
    schema: stepSchemas.experience,
  },
  {
    id: 'availability',
    order: 6,
    titleKey: 'onboarding.availabilityTitle',
    control: 'availability',
    fields: ['daysPerWeek', 'sessionMinutes'],
    options: DAYS_OPTIONS,
    secondaryTitleKey: 'onboarding.sessionTitle',
    secondaryOptions: SESSION_OPTIONS,
    schema: stepSchemas.availability,
  },
  {
    id: 'location',
    order: 7,
    titleKey: 'onboarding.locationTitle',
    control: 'single',
    fields: ['location'],
    options: LOCATION_OPTIONS,
    schema: stepSchemas.location,
  },
  {
    id: 'equipment',
    order: 8,
    titleKey: 'onboarding.equipmentTitle',
    control: 'multi',
    fields: ['equipment'],
    options: EQUIPMENT_OPTIONS,
    exclusiveValue: NONE_VALUE,
    schema: stepSchemas.equipment,
  },
  {
    id: 'diet',
    order: 9,
    titleKey: 'onboarding.dietTitle',
    control: 'single',
    fields: ['diet'],
    options: DIET_OPTIONS,
    schema: stepSchemas.diet,
  },
  {
    id: 'allergens',
    order: 10,
    titleKey: 'onboarding.allergensTitle',
    control: 'multi',
    fields: ['allergens'],
    options: ALLERGEN_OPTIONS,
    schema: stepSchemas.allergens,
  },
  {
    id: 'dislikes',
    order: 11,
    titleKey: 'onboarding.dislikesTitle',
    hintKey: 'onboarding.dislikesHint',
    control: 'tags',
    fields: ['dislikedFoods'],
    schema: stepSchemas.dislikes,
  },
  {
    id: 'meals',
    order: 12,
    titleKey: 'onboarding.mealsTitle',
    control: 'single',
    fields: ['mealsPerDay'],
    options: MEALS_OPTIONS,
    schema: stepSchemas.meals,
  },
  {
    id: 'budget',
    order: 13,
    titleKey: 'onboarding.budgetTitle',
    control: 'single',
    fields: ['budget'],
    options: BUDGET_OPTIONS,
    schema: stepSchemas.budget,
  },
  {
    id: 'cooking',
    order: 14,
    titleKey: 'onboarding.cookingTitle',
    control: 'single',
    fields: ['cookingTime'],
    options: COOKING_OPTIONS,
    schema: stepSchemas.cooking,
  },
  {
    id: 'screening',
    order: 15,
    titleKey: 'onboarding.screeningTitle',
    hintKey: 'onboarding.screeningHint',
    control: 'screening',
    fields: ['screening'],
    schema: stepSchemas.screening,
  },
  {
    id: 'summary',
    order: SUMMARY_ORDER,
    titleKey: 'onboarding.summaryTitle',
    control: 'summary',
    fields: [],
    schema: stepSchemas.summary,
  },
];

/* --------------------------------------------------------------- búsqueda */

export function stepByOrder(order: number): StepDefinition | undefined {
  return ONBOARDING_STEPS.find((step) => step.order === order);
}

export function stepById(id: OnboardingStepId): StepDefinition {
  const step = ONBOARDING_STEPS.find((definition) => definition.id === id);
  // La tabla cubre los 16 ids del tipo; si falla es un error de programación.
  if (!step) throw new Error(`Paso de onboarding desconocido: ${id}`);
  return step;
}

/**
 * Resuelve el parámetro de la ruta dinámica. Acepta el número de paso
 * ("/3") y también el identificador ("/data"), que es más legible al enlazar.
 */
export function findStepByParam(param: string | string[] | undefined): StepDefinition | undefined {
  const raw = Array.isArray(param) ? param[0] : param;
  if (!raw) return undefined;
  const asNumber = Number(raw);
  if (Number.isInteger(asNumber)) return stepByOrder(asNumber);
  return ONBOARDING_STEPS.find((step) => step.id === raw);
}

/* ------------------------------------------- lectura y escritura del draft */

/** Selección actual del paso, en el formato de strings que usa la interfaz. */
export function readChoice(field: DraftField, draft: OnboardingDraft): string[] {
  const value = draft[field];
  if (value === undefined) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'object') return [];
  return [String(value)];
}

/**
 * Convierte la selección de la interfaz en un trozo de borrador tipado.
 * Si el valor no pasa el esquema no se escribe nada: es preferible un paso
 * incompleto a un perfil con basura dentro.
 */
export function choicePatch(
  field: DraftField,
  values: readonly string[],
): Partial<OnboardingDraft> {
  const first = values[0];

  switch (field) {
    case 'goal': {
      const parsed = goalSchema.safeParse(first);
      return parsed.success ? { goal: parsed.data } : {};
    }
    case 'sex': {
      const parsed = sexSchema.safeParse(first);
      return parsed.success ? { sex: parsed.data } : {};
    }
    case 'activityLevel': {
      const parsed = activityLevelSchema.safeParse(first);
      return parsed.success ? { activityLevel: parsed.data } : {};
    }
    case 'experience': {
      const parsed = experienceSchema.safeParse(first);
      return parsed.success ? { experience: parsed.data } : {};
    }
    case 'location': {
      const parsed = locationSchema.safeParse(first);
      return parsed.success ? { location: parsed.data } : {};
    }
    case 'diet': {
      const parsed = dietSchema.safeParse(first);
      return parsed.success ? { diet: parsed.data } : {};
    }
    case 'budget': {
      const parsed = budgetSchema.safeParse(first);
      return parsed.success ? { budget: parsed.data } : {};
    }
    case 'cookingTime': {
      const parsed = cookingTimeSchema.safeParse(first);
      return parsed.success ? { cookingTime: parsed.data } : {};
    }
    case 'daysPerWeek': {
      const parsed = daysPerWeekSchema.safeParse(Number(first));
      return parsed.success ? { daysPerWeek: parsed.data } : {};
    }
    case 'sessionMinutes': {
      const parsed = sessionMinutesSchema.safeParse(Number(first));
      return parsed.success ? { sessionMinutes: parsed.data } : {};
    }
    case 'mealsPerDay': {
      const parsed = mealsPerDaySchema.safeParse(Number(first));
      return parsed.success ? { mealsPerDay: parsed.data } : {};
    }
    case 'equipment': {
      const parsed = z.array(equipmentSchema).safeParse(values);
      return parsed.success ? { equipment: parsed.data } : {};
    }
    case 'allergens': {
      const parsed = z.array(allergenSchema).safeParse(values);
      return parsed.success ? { allergens: parsed.data } : {};
    }
    default:
      // Los campos numéricos libres, la fecha, los disgustos y el cribado
      // tienen su propio control y no pasan por aquí.
      return {};
  }
}

/**
 * Aplica una selección múltiple respetando la opción excluyente:
 * marcar "ninguna" borra el resto, y marcar cualquier otra borra "ninguna".
 */
export function toggleMultiValue(
  current: readonly string[],
  value: string,
  exclusiveValue?: string,
): string[] {
  if (exclusiveValue && value === exclusiveValue) {
    return current.includes(value) ? [] : [value];
  }
  const withoutExclusive = current.filter((item) => item !== exclusiveValue);
  return withoutExclusive.includes(value)
    ? withoutExclusive.filter((item) => item !== value)
    : [...withoutExclusive, value];
}

/** Clave i18n de la etiqueta de un valor ya elegido, para el resumen. */
export function optionLabelKey(
  options: readonly ChoiceOption[] | undefined,
  value: string | undefined,
): ChoiceOption | undefined {
  if (!options || value === undefined) return undefined;
  return options.find((option) => option.value === value);
}
