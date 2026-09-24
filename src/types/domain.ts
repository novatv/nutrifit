/**
 * Tipos de dominio. Independientes de React y de la base de datos:
 * los motores puros (nutrition, training, safety) solo hablan este idioma.
 */

/* ------------------------------------------------------------------ perfil */

export type Goal =
  | 'lose_fat'
  | 'gain_muscle'
  | 'recomp'
  | 'maintain'
  | 'fitness'
  | 'habits';

/** Sexo usado por las fórmulas de gasto energético, no identidad de género. */
export type BiologicalSex = 'male' | 'female' | 'unspecified';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high' | 'very_high';

export type TrainingExperience = 'beginner' | 'intermediate' | 'advanced';

export type TrainingLocation = 'gym' | 'home' | 'both' | 'outdoor';

export type Equipment =
  | 'none' | 'dumbbells' | 'bands' | 'barbell' | 'plates' | 'bench'
  | 'rack' | 'cables' | 'machines' | 'kettlebell' | 'bike' | 'treadmill' | 'rower';

export type DietPattern = 'omnivore' | 'vegetarian' | 'vegan' | 'pescatarian';

export type Allergen =
  | 'gluten' | 'lactose' | 'tree_nuts' | 'peanut' | 'egg'
  | 'fish' | 'shellfish' | 'soy';

export type Budget = 'low' | 'medium' | 'flexible';

export type CookingTime = 'minimal' | 'normal' | 'enjoys';

export type UnitSystem = 'metric' | 'imperial';

export type Locale = 'es' | 'en';

/** Respuestas del cribado de seguridad del onboarding (paso 15). */
export interface HealthScreening {
  pregnantOrBreastfeeding: boolean;
  eatingDisorderCurrent: boolean;
  majorInjury: boolean;
  medicalNutritionTherapy: boolean;
  exerciseContraindicated: boolean;
}

export interface UserProfile {
  id: string;
  displayName: string;
  birthDate: string;          // ISO yyyy-mm-dd
  sex: BiologicalSex;
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number;
  goal: Goal;
  activityLevel: ActivityLevel;
  experience: TrainingExperience;
  daysPerWeek: 2 | 3 | 4 | 5 | 6;
  sessionMinutes: 20 | 30 | 45 | 60 | 75;
  location: TrainingLocation;
  equipment: Equipment[];
  diet: DietPattern;
  allergens: Allergen[];
  dislikedFoods: string[];
  mealsPerDay: 3 | 4 | 5;
  budget: Budget;
  cookingTime: CookingTime;
  screening: HealthScreening;
  unitSystem: UnitSystem;
  locale: Locale;
}

/* ---------------------------------------------------------------- seguridad */

export type SafetyVerdict =
  | 'ALLOW'
  | 'ALLOW_WITH_CAUTION'
  | 'REQUIRES_PROFESSIONAL_REVIEW'
  | 'BLOCK_AUTOMATED_PLAN';

export type SafetyReasonCode =
  | 'UNDER_18'
  | 'PREGNANCY_OR_BREASTFEEDING'
  | 'EATING_DISORDER'
  | 'MAJOR_INJURY'
  | 'MEDICAL_NUTRITION_THERAPY'
  | 'EXERCISE_CONTRAINDICATED'
  | 'AGGRESSIVE_RATE_REQUESTED'
  | 'ENERGY_FLOOR_APPLIED'
  | 'IMPLAUSIBLE_INPUT';

export interface SafetyFinding {
  code: SafetyReasonCode;
  verdict: SafetyVerdict;
  /** Clave i18n del mensaje; nunca texto suelto. */
  messageKey: string;
}

export interface SafetyResult {
  verdict: SafetyVerdict;
  findings: SafetyFinding[];
}

/* ---------------------------------------------------------------- nutrición */

export interface EnergyEstimate {
  /** Metabolismo basal estimado (Mifflin-St Jeor). */
  bmrKcal: number;
  /** Gasto total estimado. */
  tdeeKcal: number;
  /** Objetivo diario tras aplicar objetivo y suelos de seguridad. */
  targetKcal: number;
  /** true si un suelo de seguridad recortó el déficit pedido. */
  floorApplied: boolean;
}

export interface MacroTargets {
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface NutritionTargets extends MacroTargets {
  kcal: number;
  /** Trazabilidad: por qué salieron estos números. */
  rationale: {
    bmrKcal: number;
    tdeeKcal: number;
    adjustmentKcal: number;
    floorApplied: boolean;
  };
}

export interface Nutrients {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Food {
  id: string;
  name: string;
  brand?: string;
  servingLabel: string;
  servingGrams: number;
  per100g: Nutrients;
  source: 'usda' | 'manual' | 'recipe';
  externalId?: string;
  barcode?: string;
  tags?: string[];
  allergens?: Allergen[];
  dietPatterns?: DietPattern[];
}

export interface MealItem {
  foodId: string;
  name: string;
  grams: number;
  nutrients: Nutrients;
}

export interface PlannedMeal {
  id: string;
  type: MealType;
  name: string;
  items: MealItem[];
  nutrients: Nutrients;
  prepMinutes: number;
  instructions?: string[];
}

export interface DayPlan {
  dayIndex: number;            // 0..6 dentro de la semana
  meals: PlannedMeal[];
  nutrients: Nutrients;
}

/* ------------------------------------------------------------ entrenamiento */

export type MovementPattern =
  | 'squat' | 'hinge' | 'horizontal_push' | 'vertical_push'
  | 'horizontal_pull' | 'vertical_pull' | 'lunge' | 'carry'
  | 'core' | 'isolation' | 'cardio';

export type MuscleGroup =
  | 'quads' | 'hamstrings' | 'glutes' | 'calves' | 'chest' | 'back'
  | 'lats' | 'traps' | 'shoulders' | 'biceps' | 'triceps' | 'forearms'
  | 'abs' | 'obliques' | 'lower_back' | 'full_body';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  slug: string;
  nameKey: string;             // clave i18n
  pattern: MovementPattern;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment[];
  difficulty: Difficulty;
  instructionKeys: string[];
  commonMistakeKeys: string[];
  safetyNoteKeys: string[];
  alternatives: string[];      // slugs
  videoUrl?: string;
  imageUrl?: string;
}

export type SplitType =
  | 'full_body' | 'upper_lower' | 'ppl' | 'upper_lower_plus';

export interface WorkoutExercise {
  exerciseSlug: string;
  sets: number;
  repMin: number;
  repMax: number;
  restSeconds: number;
  targetRir: number;
  notesKey?: string;
}

export interface Workout {
  id: string;
  nameKey: string;
  dayIndex: number;            // 0..6
  estimatedMinutes: number;
  warmupKeys: string[];
  exercises: WorkoutExercise[];
  cooldownKeys: string[];
}

export type WeekPhase = 'adaptation' | 'progression' | 'consolidation' | 'deload';

export interface ProgramWeek {
  weekNumber: number;          // 1..12
  phase: WeekPhase;
  workouts: Workout[];
  stepTarget: number;
  focusKey: string;
}

export interface TrainingProgram {
  id: string;
  split: SplitType;
  weeks: ProgramWeek[];
}

/* --------------------------------------------------------- registro y logs */

export interface SetLog {
  setIndex: number;
  weightKg: number | null;
  reps: number | null;
  rir: number | null;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseSlug: string;
  sets: SetLog[];
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  startedAt: string;
  finishedAt?: string;
  logs: ExerciseLog[];
  /** Feedback posterior, opcional. */
  perceivedDifficulty?: 'very_easy' | 'good' | 'hard' | 'too_hard';
  soreness?: 1 | 2 | 3 | 4 | 5;
  energy?: 1 | 2 | 3 | 4 | 5;
  painReported?: boolean;
}

/* -------------------------------------------------------------- check-in */

export interface WeeklyCheckin {
  weekNumber: number;
  date: string;
  weightKg?: number;
  nutritionAdherence: number;  // 0..1
  workoutsCompleted: number;
  workoutsPlanned: number;
  hunger: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
  sleep: 1 | 2 | 3 | 4 | 5;
  difficulty: 1 | 2 | 3 | 4 | 5;
  perceivedProgress: 1 | 2 | 3 | 4 | 5;
}

export type AdjustmentDecision =
  | 'KEEP'
  | 'ADJUST_NUTRITION'
  | 'ADJUST_TRAINING'
  | 'RECOVERY_WEEK'
  | 'NEEDS_REVIEW';

export interface PlanAdjustment {
  decision: AdjustmentDecision;
  /** Clave i18n de la explicación al usuario. */
  explanationKey: string;
  explanationParams?: Record<string, string | number>;
  before?: Partial<NutritionTargets>;
  after?: Partial<NutritionTargets>;
  /** Un cambio de objetivos nunca se aplica en silencio. */
  requiresConfirmation: boolean;
}
