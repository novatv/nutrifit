import type {
  DayPlan,
  MacroTargets,
  MealItem,
  MealType,
  Nutrients,
  NutritionTargets,
  PlannedMeal,
  UserProfile,
} from '@/types/domain';

/**
 * Datos de demostración.
 *
 * Permiten abrir la app y ver el panel, el plan y el entrenamiento sin haber
 * configurado Supabase ni ninguna integración externa. En cuanto hay sesión
 * real, estos valores dejan de usarse.
 */

export const demoUser = {
  displayName: 'Casanova',
  weekNumber: 3,
  dayNumber: 17,
  streakDays: 9,
};

export const demoTargets: NutritionTargets = {
  kcal: 2200,
  proteinG: 150,
  carbsG: 230,
  fatG: 70,
  fiberG: 30,
  rationale: { bmrKcal: 1780, tdeeKcal: 2450, adjustmentKcal: -250, floorApplied: false },
};

export const demoConsumed: MacroTargets & { kcal: number } = {
  kcal: 1620,
  proteinG: 112,
  carbsG: 165,
  fatG: 52,
  fiberG: 21,
};

export const demoActivity = {
  steps: 6842,
  stepTarget: 8000,
  waterMl: 1600,
  waterTargetMl: 2300,
};

export const demoWorkout = {
  id: 'demo-upper-a',
  name: 'Upper A',
  estimatedMinutes: 45,
  exerciseCount: 6,
  isRestDay: false,
};

export const demoNextMeal = {
  type: 'lunch' as const,
  name: 'Pollo con arroz y verduras',
  kcal: 620,
  proteinG: 48,
  prepMinutes: 20,
};

export const demoHabits = [
  { id: 'water', labelKey: 'today.water', done: false },
  { id: 'steps', labelKey: 'today.steps', done: false },
  { id: 'training', labelKey: 'today.todayWorkout', done: false },
];

/** Adherencia de la semana en curso, 0..1. */
export const demoWeeklyAdherence = 0.82;

/* ------------------------------------------------------------------------ */
/* Datos de demostración ampliados: plan, progreso y lista de compra.        */
/*                                                                          */
/* Todo es determinista (nada de Math.random) para que la pantalla se vea    */
/* igual en cada arranque y los tests puedan apoyarse en ello.              */
/* ------------------------------------------------------------------------ */

/** Perfil ficticio con el que se genera el plan de 12 semanas sin Supabase. */
export const demoProfile: UserProfile = {
  id: 'demo-user',
  displayName: demoUser.displayName,
  birthDate: '1993-04-12',
  sex: 'male',
  heightCm: 178,
  weightKg: 82,
  targetWeightKg: 76,
  goal: 'lose_fat',
  activityLevel: 'moderate',
  experience: 'intermediate',
  daysPerWeek: 4,
  sessionMinutes: 45,
  location: 'gym',
  equipment: ['dumbbells', 'barbell', 'bench', 'rack', 'cables', 'machines'],
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
};

/** Día de la semana (0 = lunes) en el que cae el check-in semanal. */
export const DEMO_CHECKIN_DAY_INDEX = 6;

/* -------------------------------------------------------- utilidades demo */

/** Clave de fecha yyyy-mm-dd en horario local, `offsetDays` días atrás. */
function dayKeyAgo(offsetDays: number, from: Date = new Date()): string {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  date.setDate(date.getDate() - offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Ruido pseudoaleatorio reproducible en [-1, 1].
 *
 * Las oscilaciones diarias de peso (agua, glucógeno, sal) son reales y la
 * pantalla tiene que enseñarlas sin dramatizarlas: por eso se simulan en vez
 * de dibujar una recta perfecta que no existe en la vida real.
 */
function wobble(seed: number): number {
  const raw = Math.sin(seed * 12.9898) * 43758.5453;
  return (raw - Math.floor(raw)) * 2 - 1;
}

/* ------------------------------------------------------------------ peso */

/**
 * Serie de peso diaria. `days` puntos hasta hoy, con tendencia suave y ruido.
 * Faltan algunos días a propósito: nadie se pesa las 7 mañanas de la semana.
 */
export function buildDemoWeightSeries(
  days = 63,
  startKg = 84.4,
  kgPerWeek = -0.42,
): { date: string; weightKg: number }[] {
  const out: { date: string; weightKg: number }[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    // Dos huecos por semana: el sábado y el domingo no hay pesada.
    if (i % 7 === 2 || i % 7 === 5) continue;
    const elapsedWeeks = (days - 1 - i) / 7;
    const base = startKg + kgPerWeek * elapsedWeeks;
    const weightKg = Math.round((base + wobble(i + 1) * 0.55) * 10) / 10;
    out.push({ date: dayKeyAgo(i), weightKg });
  }
  return out;
}

export const demoWeights = buildDemoWeightSeries();

/* --------------------------------------------------------------- medidas */

export interface DemoMeasurement {
  date: string;
  waistCm: number;
  hipCm: number;
  chestCm: number;
  armCm: number;
  thighCm: number;
  /** Estimación introducida por el usuario, nunca una medición clínica. */
  bodyFatPct: number;
}

export const demoMeasurements: DemoMeasurement[] = [0, 14, 28, 42, 56].map((ago, index) => ({
  date: dayKeyAgo(ago),
  waistCm: Math.round((88 + index * 1.4) * 10) / 10,
  hipCm: Math.round((99 + index * 0.9) * 10) / 10,
  chestCm: Math.round((104 - index * 0.3) * 10) / 10,
  armCm: Math.round((36.4 - index * 0.2) * 10) / 10,
  thighCm: Math.round((58.2 + index * 0.4) * 10) / 10,
  bodyFatPct: Math.round((21.2 + index * 0.9) * 10) / 10,
}));

/* ---------------------------------------------------------------- fuerza */

export interface DemoStrengthPoint {
  date: string;
  /** Carga estimada para una repetición máxima, en kg. */
  estimated1RmKg: number;
}

export interface DemoStrengthSeries {
  exerciseSlug: string;
  /** Nombre visible del ejercicio; con datos reales sale de la biblioteca. */
  name: string;
  points: DemoStrengthPoint[];
}

const STRENGTH_SEED: { slug: string; name: string; start: number; gain: number }[] = [
  { slug: 'barbell-back-squat', name: 'Sentadilla', start: 92, gain: 2.4 },
  { slug: 'barbell-bench-press', name: 'Press banca', start: 74, gain: 1.6 },
  { slug: 'barbell-deadlift', name: 'Peso muerto', start: 118, gain: 3.1 },
  { slug: 'pull-up', name: 'Dominadas', start: 12, gain: 0.8 },
];

export const demoStrength: DemoStrengthSeries[] = STRENGTH_SEED.map((seed) => ({
  exerciseSlug: seed.slug,
  name: seed.name,
  points: [56, 42, 28, 14, 0].map((ago, index) => ({
    date: dayKeyAgo(ago),
    estimated1RmKg: Math.round((seed.start + seed.gain * index) * 2) / 2,
  })),
}));

/* ------------------------------------------------------- nutrición diaria */

export interface DemoNutritionDay {
  date: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  /** 0..1 */
  adherence: number;
}

export const demoNutritionDays: DemoNutritionDay[] = Array.from({ length: 28 }, (_, i) => {
  const ago = 27 - i;
  const drift = wobble(ago + 20) * 180;
  const kcal = Math.round(demoTargets.kcal + drift);
  return {
    date: dayKeyAgo(ago),
    kcal,
    proteinG: Math.round(demoTargets.proteinG + wobble(ago + 40) * 18),
    carbsG: Math.round(demoTargets.carbsG + wobble(ago + 60) * 30),
    fatG: Math.round(demoTargets.fatG + wobble(ago + 80) * 9),
    adherence: Math.min(1, Math.max(0, 1 - Math.abs(drift) / 900)),
  };
});

/* -------------------------------------------------------- actividad diaria */

export interface DemoActivityDay {
  date: string;
  steps: number;
  /** Minutos de entrenamiento registrados ese día. */
  trainingMinutes: number;
}

export const demoActivityDays: DemoActivityDay[] = Array.from({ length: 28 }, (_, i) => {
  const ago = 27 - i;
  const trains = ago % 7 === 0 || ago % 7 === 1 || ago % 7 === 3 || ago % 7 === 4;
  return {
    date: dayKeyAgo(ago),
    steps: Math.round(demoActivity.stepTarget + wobble(ago + 100) * 2600),
    trainingMinutes: trains ? 45 + Math.round(wobble(ago + 120) * 8) : 0,
  };
});

/** Fotos de progreso guardadas. En demostración no hay ninguna todavía. */
export const demoProgressPhotos: { id: string; date: string; uri: string }[] = [];

/* ------------------------------------------------- semana de comidas demo */

const MEAL_TEMPLATES: {
  type: MealType;
  name: string;
  prepMinutes: number;
  items: { foodId: string; name: string; grams: number }[];
}[] = [
  {
    type: 'breakfast',
    name: 'Avena con yogur y arándanos',
    prepMinutes: 8,
    items: [
      { foodId: 'demo-oats', name: 'Avena', grams: 70 },
      { foodId: 'demo-yogurt', name: 'Yogur griego', grams: 150 },
      { foodId: 'demo-blueberry', name: 'Arándanos', grams: 80 },
      { foodId: 'demo-milk', name: 'Leche semidesnatada', grams: 200 },
    ],
  },
  {
    type: 'lunch',
    name: 'Pollo con arroz y brócoli',
    prepMinutes: 25,
    items: [
      { foodId: 'demo-chicken', name: 'Pechuga de pollo', grams: 180 },
      { foodId: 'demo-rice', name: 'Arroz integral', grams: 90 },
      { foodId: 'demo-broccoli', name: 'Brócoli', grams: 150 },
      { foodId: 'demo-oil', name: 'Aceite de oliva', grams: 12 },
    ],
  },
  {
    type: 'dinner',
    name: 'Salmón con patata y ensalada',
    prepMinutes: 22,
    items: [
      { foodId: 'demo-salmon', name: 'Salmón', grams: 160 },
      { foodId: 'demo-potato', name: 'Patata', grams: 220 },
      { foodId: 'demo-lettuce', name: 'Lechuga', grams: 80 },
      { foodId: 'demo-tomato', name: 'Tomate', grams: 120 },
    ],
  },
  {
    type: 'lunch',
    name: 'Lentejas con verduras',
    prepMinutes: 30,
    items: [
      { foodId: 'demo-lentils', name: 'Lentejas', grams: 110 },
      { foodId: 'demo-carrot', name: 'Zanahoria', grams: 90 },
      { foodId: 'demo-onion', name: 'Cebolla', grams: 70 },
      { foodId: 'demo-oil', name: 'Aceite de oliva', grams: 10 },
    ],
  },
  {
    type: 'dinner',
    name: 'Tortilla de espinacas',
    prepMinutes: 15,
    items: [
      { foodId: 'demo-egg', name: 'Huevo', grams: 160 },
      { foodId: 'demo-spinach', name: 'Espinacas', grams: 120 },
      { foodId: 'demo-bread', name: 'Pan integral', grams: 60 },
      { foodId: 'demo-almonds', name: 'Almendras', grams: 25 },
    ],
  },
  {
    type: 'snack',
    name: 'Plátano y frutos secos',
    prepMinutes: 2,
    items: [
      { foodId: 'demo-banana', name: 'Plátano', grams: 120 },
      { foodId: 'demo-walnuts', name: 'Nueces', grams: 30 },
    ],
  },
];

/** Nutrientes aproximados de una línea; suficientes para la demostración. */
function demoNutrients(grams: number, seed: number): Nutrients {
  const per100 = 90 + Math.abs(wobble(seed)) * 120;
  return {
    kcal: Math.round((grams / 100) * per100),
    proteinG: Math.round((grams / 100) * (6 + Math.abs(wobble(seed + 1)) * 14)),
    carbsG: Math.round((grams / 100) * (8 + Math.abs(wobble(seed + 2)) * 16)),
    fatG: Math.round((grams / 100) * (2 + Math.abs(wobble(seed + 3)) * 8)),
    fiberG: Math.round((grams / 100) * 2),
  };
}

function sumDemoNutrients(list: Nutrients[]): Nutrients {
  return list.reduce<Nutrients>(
    (acc, n) => ({
      kcal: acc.kcal + n.kcal,
      proteinG: acc.proteinG + n.proteinG,
      carbsG: acc.carbsG + n.carbsG,
      fatG: acc.fatG + n.fatG,
      fiberG: (acc.fiberG ?? 0) + (n.fiberG ?? 0),
    }),
    { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 },
  );
}

/**
 * Semana de comidas planificada (7 días × 3 comidas).
 *
 * Es la entrada de `generateShoppingList`: la lista de la compra sale del
 * plan, nunca de una lista escrita a mano en la pantalla.
 */
export const demoWeekPlan: DayPlan[] = Array.from({ length: 7 }, (_, dayIndex) => {
  const picks = [
    MEAL_TEMPLATES[0],
    MEAL_TEMPLATES[dayIndex % 2 === 0 ? 1 : 3],
    MEAL_TEMPLATES[dayIndex % 3 === 0 ? 4 : 2],
    ...(dayIndex % 2 === 0 ? [MEAL_TEMPLATES[5]] : []),
  ];

  const meals: PlannedMeal[] = picks.map((template, mealIndex) => {
    const items: MealItem[] = template.items.map((item, itemIndex) => ({
      foodId: item.foodId,
      name: item.name,
      grams: item.grams,
      nutrients: demoNutrients(item.grams, dayIndex * 17 + mealIndex * 5 + itemIndex),
    }));
    return {
      id: `demo-d${dayIndex}-m${mealIndex}`,
      type: template.type,
      name: template.name,
      items,
      nutrients: sumDemoNutrients(items.map((i) => i.nutrients)),
      prepMinutes: template.prepMinutes,
    };
  });

  return {
    dayIndex,
    meals,
    nutrients: sumDemoNutrients(meals.map((m) => m.nutrients)),
  };
});
