/**
 * Inglés. El español (es.ts) es el idioma de referencia: este archivo replica
 * exactamente su árbol de claves, solo que con los textos traducidos. Si alguna
 * clave faltara, la app cae de vuelta al español clave a clave.
 */
import type { TranslationSchema } from './es';

/**
 * El mismo árbol que el español pero con los textos ensanchados a `string`.
 * `es.ts` usa `as const`, así que su esquema fija cada texto como literal
 * ('Continuar', 'Atrás', …) y ninguna traducción real encajaría en él. Con este
 * tipo comprobamos lo que de verdad importa: que no sobre ni falte ninguna clave.
 */
type Translations<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : Translations<T[K]>;
};

const dictionary = {
  common: {
    continue: 'Continue',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    done: 'Done',
    retry: 'Try again',
    loading: 'Loading…',
    search: 'Search',
    add: 'Add',
    skip: 'Skip',
    today: 'Today',
    week: 'Week',
    day: 'Day',
    of: 'of',
    optional: 'optional',
    why: 'Why?',
  },

  disclaimer: {
    general:
      'This app provides general information about nutrition and physical activity and is not a substitute for advice from a healthcare professional.',
    estimate: "It's a starting estimate, not an exact figure. We adjust it as you progress.",
  },

  tabs: {
    today: 'Today',
    plan: 'Plan',
    log: 'Log',
    progress: 'Progress',
    profile: 'Profile',
  },

  auth: {
    signInTitle: 'Welcome back',
    signUpTitle: 'Create your account',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    signUp: 'Create account',
    signOut: 'Sign out',
    forgot: 'Forgotten your password?',
    resetSent: "We've sent you an email to reset it.",
    noAccount: 'No account yet?',
    hasAccount: 'Already have an account?',
    deleteAccount: 'Delete account',
    deleteAccountWarning:
      'Your profile, your logs and your photos will be deleted. This cannot be undone.',
    errorInvalid: 'Incorrect email or password.',
    errorNetwork: "You're offline. Please try again.",
  },

  onboarding: {
    welcomeTitle: 'Your 12-week plan',
    welcomeBody:
      'A few quick questions and we build your nutrition and training around you.',
    stepOf: 'Step {{current}} of {{total}}',
    birthDateHint: 'Format YYYY-MM-DD',
    daysPerWeek: '{{n}} days',
    mealsPerDay: '{{n}} meals',
    errors: {
      required: 'Answer this to continue.',
      birthDate: 'Check the date — it does not look right.',
    },

    goalTitle: "What's your goal?",
    goal: {
      lose_fat: 'Lose fat',
      gain_muscle: 'Build muscle',
      recomp: 'Body recomposition',
      maintain: 'Maintain weight',
      fitness: 'Improve fitness',
      habits: 'Build healthy habits',
    },

    dataTitle: 'Your details',
    birthDate: 'Date of birth',
    sexTitle: 'Sex',
    sexWhy:
      'We use it only to estimate your energy expenditure, because the formulas need it. It appears nowhere else.',
    sex: { male: 'Male', female: 'Female', unspecified: 'Prefer not to say' },
    height: 'Height',
    weight: 'Current weight',
    targetWeight: 'Target weight',

    activityTitle: 'How much do you usually move?',
    activity: {
      sedentary: 'Sedentary',
      light: 'Light',
      moderate: 'Moderate',
      high: 'High',
      very_high: 'Very high',
    },

    experienceTitle: 'How much training experience do you have?',
    experience: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },

    availabilityTitle: 'How many days a week?',
    sessionTitle: 'How long per session?',
    minutes: '{{n}} min',

    locationTitle: 'Where will you train?',
    location: { gym: 'Gym', home: 'Home', both: 'Both', outdoor: 'Outdoors' },

    equipmentTitle: 'What equipment do you have?',
    equipment: {
      none: 'None',
      dumbbells: 'Dumbbells',
      bands: 'Resistance bands',
      barbell: 'Barbell',
      plates: 'Weight plates',
      bench: 'Bench',
      rack: 'Rack',
      cables: 'Cables',
      machines: 'Machines',
      kettlebell: 'Kettlebell',
      bike: 'Exercise bike',
      treadmill: 'Treadmill',
      rower: 'Rowing machine',
    },

    dietTitle: 'How do you eat?',
    diet: {
      omnivore: 'Omnivore',
      vegetarian: 'Vegetarian',
      vegan: 'Vegan',
      pescatarian: 'Pescatarian',
    },

    allergensTitle: 'Allergies and intolerances',
    allergen: {
      gluten: 'Gluten',
      lactose: 'Lactose',
      tree_nuts: 'Tree nuts',
      peanut: 'Peanut',
      egg: 'Egg',
      fish: 'Fish',
      shellfish: 'Shellfish',
      soy: 'Soya',
    },

    dislikesTitle: 'Anything you would rather avoid?',
    dislikesHint: "We'll leave it out when we put your meals together.",

    mealsTitle: 'How many meals a day?',
    budgetTitle: 'Budget',
    budget: { low: 'Low-cost', medium: 'Mid-range', flexible: 'Flexible' },

    cookingTitle: 'How much time for cooking?',
    cooking: { minimal: 'As little as possible', normal: 'Normal', enjoys: 'I enjoy cooking' },

    screeningTitle: 'Before you start',
    screeningHint: "This helps us avoid suggesting something that isn't right for you.",
    screening: {
      pregnantOrBreastfeeding: "I'm pregnant or breastfeeding",
      eatingDisorderCurrent: 'I currently have an eating disorder',
      majorInjury: 'I have a significant injury that limits my training',
      medicalNutritionTherapy: "I'm following a nutrition plan prescribed by a healthcare professional",
      exerciseContraindicated: 'A healthcare professional has advised me not to exercise',
      none: 'None of the above',
    },

    summaryTitle: 'Summary',
    createPlan: 'Create my 12-week plan',

    generating: {
      analyzing: 'Analysing your goal…',
      targets: 'Working out your starting targets…',
      training: 'Preparing your workouts…',
      nutrition: 'Organising your nutrition…',
      weeks: 'Building your first weeks…',
    },
    ready: {
      title: 'Your plan is ready',
      weeks: '12 weeks',
      sessions: '{{n}} workouts/week',
      kcal: '~{{n}} kcal starting target',
      protein: '{{n}} g protein',
      steps: '{{n}} steps',
      cta: 'See my week',
    },
  },

  safety: {
    under18:
      'This version is designed for people aged 18 or over, so we will not generate an automated plan.',
    pregnancy:
      'During pregnancy and breastfeeding your needs change considerably. Speak to a healthcare professional before following an automated plan.',
    eatingDisorder:
      'An automated calorie plan is not the right thing right now. Please seek support from a qualified professional.',
    medicalNutrition:
      "You're already following a plan prescribed by a professional. We are not going to replace it with an automated one.",
    exerciseContraindicated:
      "If you've been advised not to exercise, check with a professional before using an automated plan.",
    majorInjury:
      'With a significant injury, adapt or seek advice first. We will avoid suggesting aggressive progressions.',
    implausibleInput: 'Please check your details: the height or weight entered does not look right.',
    aggressiveRate:
      'That goal would require a more aggressive rate than this app generates automatically. We will keep a gradual pace, so it will take a little longer.',
    energyFloor:
      'We have set your calories at the lowest level we consider safe rather than going lower.',
    seeProfessional: 'Speak to a professional',
    continueAnyway: 'Understood, continue',
  },

  today: {
    greetingMorning: 'Good morning, {{name}}',
    greetingAfternoon: 'Good afternoon, {{name}}',
    greetingEvening: 'Good evening, {{name}}',
    weekDay: 'Week {{week}} · Day {{day}}',
    dailyGoal: "Today's target",
    calories: 'Calories',
    protein: 'Protein',
    carbs: 'Carbohydrates',
    fat: 'Fat',
    fiber: 'Fibre',
    steps: 'Steps',
    water: 'Water',
    todayWorkout: "Today's workout",
    startWorkout: 'Start',
    restDay: "Today's a rest day",
    nextMeal: 'Next meal',
    logBreakfast: 'Log breakfast',
    habits: 'Habits',
    streak: '{{n}} days in a row',
    adherenceWeek: 'Adherence this week',
  },

  plan: {
    title: 'Your plan',
    month: 'Month {{n}}',
    weekN: 'Week {{n}}',
    phase: {
      adaptation: 'Adaptation and technique',
      progression: 'Progression',
      consolidation: 'Consolidation',
      deload: 'Deload',
    },
    status: { pending: 'Pending', current: 'In progress', completed: 'Completed' },
    rest: 'Rest',
    checkin: 'Check-in',
  },

  log: {
    title: 'Log',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snacks: 'Snacks',
    addFood: 'Add food',
    searchFood: 'Search for food',
    recent: 'Recent',
    favorites: 'Favourites',
    recipes: 'Recipes',
    savedMeals: 'Saved meals',
    manual: 'Enter manually',
    barcode: 'Barcode',
    repeatYesterday: "Repeat yesterday's {{meal}}",
    copyMeal: 'Copy meal',
    saveAsMeal: 'Save as a meal',
    grams: 'grams',
    servings: 'servings',
    swap: 'Swap',
    foodName: 'Food name',
    noResults: 'No food matches that search.',
    remaining: 'left',
    sugar: 'Sugar',
    sodium: 'Sodium',
    perHundredGrams: 'per 100 g',
    copyMealTo: 'Which meal?',
    orientativeHint: 'Fibre, sugar and sodium are indicative, not a precise measurement.',
  },

  workout: {
    exerciseOf: 'Exercise {{current}}/{{total}}',
    target: 'Target',
    lastTime: 'Last time',
    set: 'Set',
    weight: 'Weight',
    reps: 'Reps',
    rir: 'RIR',
    rest: 'Rest',
    nextExercise: 'Next exercise',
    swapExercise: 'Swap exercise',
    finish: 'Finish',
    notes: 'Notes',
    completed: 'Workout completed',
    duration: 'Duration',
    volume: 'Volume',
    exercises: 'Exercises',
    prs: 'PR',
    howWasIt: 'How did it feel?',
    difficulty: {
      very_easy: 'Very easy',
      good: 'Good',
      hard: 'Hard',
      too_hard: 'Too hard',
    },
    painQuestion: 'Did you feel any pain or discomfort?',
    painFollowUp:
      'If the pain is sharp or persists, it should be assessed by a professional before you carry on progressing.',
    offlineSaved: "You're offline: we've saved your sets and will sync them later.",
  },

  progress: {
    title: 'Progress',
    tabs: {
      general: 'Overview',
      weight: 'Weight',
      measurements: 'Measurements',
      strength: 'Strength',
      nutrition: 'Nutrition',
      activity: 'Activity',
    },
    trend: 'Trend',
    dailyPoints: 'Daily entries',
    noData: "There isn't enough data yet to show a trend.",
    addWeight: 'Add weight',
    measurement: {
      weight: 'Weight',
      waist: 'Waist',
      hip: 'Hips',
      chest: 'Chest',
      arm: 'Arm',
      thigh: 'Thigh',
      bodyFat: 'Body fat',
    },
    bodyFatHint: 'The percentage you enter is an estimate, not a clinical measurement.',
    photos: 'Progress photos',
    photosPrivate: 'Your photos are kept in private storage. You can delete them whenever you like.',
  },

  checkin: {
    title: 'Weekly check-in',
    subtitle: 'Once a week we look at how it went and adjust if needed.',
    weight: 'Current weight',
    adherence: 'How did the nutrition go?',
    workouts: 'Workouts completed',
    hunger: 'Hunger',
    energy: 'Energy',
    sleep: 'Sleep',
    difficulty: 'Difficulty',
    perceivedProgress: 'Are you noticing progress?',
    submit: 'Send check-in',
    decision: {
      KEEP: "We're keeping the plan as it is",
      ADJUST_NUTRITION: "We're adjusting your nutrition",
      ADJUST_TRAINING: "We're adjusting your training",
      RECOVERY_WEEK: 'Time for a recovery week',
      NEEDS_REVIEW: 'This is worth looking at properly',
    },
    before: 'Before',
    after: 'Now',
    reason: 'Reason',
    confirmChange: 'Apply the change',
    keepAsIs: 'Leave it as it is',
    explain: {
      keepOnTrack:
        'Your performance is improving and your trend is within the expected range. This week we keep the plan as it is.',
      singleDataPoint:
        'A single weight reading is not enough to change the plan. We carry on and review it next week.',
      lowAdherence:
        "Adherence was low this week. Before we touch the numbers, let's give the current plan another week.",
      trendStalled:
        'Your trend has been flat for several weeks, so we are lowering your calories slightly.',
      trendTooFast:
        'You are losing faster than is advisable, so we are raising your calories a little.',
      fatigueHigh:
        'Your energy has been low and your sessions very hard. This week we reduce the volume so you can recover.',
    },
  },

  shopping: {
    title: 'Shopping list',
    regenerate: 'Regenerate',
    addItem: 'Add item',
    categories: {
      fruit: 'Fruit',
      vegetables: 'Vegetables',
      meatFish: 'Meat and fish',
      plantProtein: 'Plant proteins',
      dairy: 'Dairy',
      grains: 'Grains',
      pantry: 'Store cupboard',
      frozen: 'Frozen',
      other: 'Other',
    },
  },

  settings: {
    title: 'Profile',
    account: 'Account',
    units: 'Units',
    metric: 'Metric (kg, cm)',
    imperial: 'Imperial (lb, ft)',
    language: 'Language',
    appearance: 'Appearance',
    appearanceSystem: 'System',
    appearanceLight: 'Light',
    appearanceDark: 'Dark',
    notifications: 'Notifications',
    privacy: 'Privacy and data',
    privacyBody:
      'Your health data is sensitive. We store only what we need and you can delete it whenever you like.',
    exportData: 'Export my data',
    viewData: 'View my data',
    about: 'About',
  },

  notifications: {
    workoutReady: 'Your workout is ready.',
    logDinner: 'You still have your dinner to log.',
    newWeek: 'Week {{n}} starts tomorrow.',
    checkinTime: "It's time for your weekly check-in.",
  },

  states: {
    emptyTitle: 'Nothing here yet',
    emptyBody: "Once you start logging, you'll see it on this screen.",
    errorTitle: 'Something went wrong',
    errorBody: "We couldn't load this information.",
    offlineTitle: 'Offline',
    offlineBody: "We'll keep saving what you do and sync it when you're back.",
  },
} as const satisfies Translations<TranslationSchema>;

/**
 * Se expone con el tipo del esquema porque los literales del español no admiten
 * otro texto; el `satisfies` de arriba es quien garantiza que las claves cuadran.
 */
export const en = dictionary as unknown as TranslationSchema;
