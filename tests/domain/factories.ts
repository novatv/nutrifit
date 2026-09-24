/** Factorías compartidas por los tests de dominio (no es un test en sí). */

import type {
  DayPlan,
  Food,
  MealItem,
  Nutrients,
  PlannedMeal,
  UserProfile,
} from '@/types/domain';

/** Fecha fija para que las edades no cambien con el calendario real. */
export const NOW = new Date('2026-09-24T12:00:00Z');

export function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'user-1',
    displayName: 'Prueba',
    birthDate: '1996-01-15', // 30 años el 24-09-2026
    sex: 'male',
    heightCm: 180,
    weightKg: 80,
    goal: 'maintain',
    activityLevel: 'sedentary',
    experience: 'beginner',
    daysPerWeek: 3,
    sessionMinutes: 45,
    location: 'gym',
    equipment: ['dumbbells'],
    diet: 'omnivore',
    allergens: [],
    dislikedFoods: [],
    mealsPerDay: 3,
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
    ...overrides,
  };
}

export function makeNutrients(overrides: Partial<Nutrients> = {}): Nutrients {
  return { kcal: 500, proteinG: 30, carbsG: 50, fatG: 18, ...overrides };
}

export function makeFood(overrides: Partial<Food> = {}): Food {
  return {
    id: 'food-1',
    name: 'Pechuga de pollo',
    servingLabel: '1 filete',
    servingGrams: 150,
    per100g: { kcal: 165, proteinG: 31, carbsG: 0, fatG: 3.6 },
    source: 'usda',
    tags: ['carne', 'proteina'],
    allergens: [],
    dietPatterns: ['omnivore', 'pescatarian'],
    ...overrides,
  };
}

export function makeMealItem(overrides: Partial<MealItem> = {}): MealItem {
  return {
    foodId: 'food-1',
    name: 'Pechuga de pollo',
    grams: 150,
    nutrients: makeNutrients({ kcal: 248, proteinG: 46, carbsG: 0, fatG: 5 }),
    ...overrides,
  };
}

export function makeMeal(overrides: Partial<PlannedMeal> = {}): PlannedMeal {
  return {
    id: 'meal-1',
    type: 'lunch',
    name: 'Pollo con arroz',
    items: [makeMealItem()],
    nutrients: makeNutrients({ kcal: 600, proteinG: 45, carbsG: 60, fatG: 15 }),
    prepMinutes: 25,
    ...overrides,
  };
}

export function makeDay(overrides: Partial<DayPlan> = {}): DayPlan {
  return {
    dayIndex: 0,
    meals: [makeMeal()],
    nutrients: makeNutrients({ kcal: 1800, proteinG: 140, carbsG: 180, fatG: 55 }),
    ...overrides,
  };
}
