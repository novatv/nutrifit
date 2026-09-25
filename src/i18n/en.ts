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
    minutes: '{{n}} min',
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
    scanPhoto: 'Scan photo',
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
    showHowTo: 'See how to do it',
    hideHowTo: 'Hide how to do it',
    howTo: 'How to do it',
    mistakes: 'Common mistakes',
    safetyNotes: 'Safety',
    watchVideo: 'Watch demo video',
    mediaCredit: 'Photo/video: {{credit}}',
    day: {
      full_body_a: 'Full body A', full_body_b: 'Full body B', full_body_c: 'Full body C',
      upper: 'Upper', lower: 'Lower', push: 'Push', pull: 'Pull', legs: 'Legs',
    },
    note: { deload_week: 'Deload week: less volume so you arrive fresh to the next one.' },
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

  progression: {
    reason: {
      no_history: 'First time with this exercise: start comfortable and log what you lift.',
      top_of_range_increase: 'You finished every set at the top of the range. You can go up a little.',
      add_reps_first: 'Before adding weight, gain reps within the range.',
      missed_once_hold: 'You fell short once. Repeat the same weight before going up.',
      repeated_misses_reduce: 'Several sessions short of the range. Drop the weight a bit and rebuild.',
      pain_reported_hold: "You've reported discomfort, so we're not suggesting more load.",
    },
    pr: {
      max_load: 'Heaviest yet',
      max_reps_at_load: 'Most reps at that weight',
      session_volume: 'Your biggest session volume',
    },
  },

  training: {
    progression: { increase: 'Increase', hold: 'Hold', deload: 'Deload' },
    deload: { not_needed: 'No deload needed yet.' },
    pain: {
      consider_professional_review:
        'If the pain is sharp or persists, have a professional look at it before progressing further.',
    },
  },

  /**
   * Ejercicios de la biblioteca (clave = slug en snake_case). Cada entrada
   * tiene nombre, instrucciones (cue), errores comunes (mistake) y notas de
   * seguridad (safety); los tokens los genera exerciseLibrary.ts.
   */
  exercise: {
    barbell_back_squat: {
      name: 'Barbell back squat',
      cue: {
        brace_core: 'Take a breath and brace your abs as if you were about to take a punch.',
        sit_between_hips: 'Sit down between your hips with your knees out.',
        drive_midfoot: 'Push the floor away through the whole foot, weight over midfoot.',
      },
      mistake: {
        knees_cave_in: 'Letting your knees cave in.',
        heels_lift: 'Lifting your heels off the floor.',
      },
      safety: {
        set_safety_bars: 'Set the rack safeties just below your lowest position.',
      },
    },
    barbell_front_squat: {
      name: 'Barbell front squat',
      cue: {
        elbows_high: 'Elbows high and forward so the bar rests on your shoulders.',
        upright_torso: 'Torso as vertical as possible.',
        controlled_descent: 'Lower under control, taking about two seconds.',
      },
      mistake: {
        elbows_drop: 'Letting your elbows drop.',
        heels_lift: 'Lifting your heels off the floor.',
      },
      safety: {
        set_safety_bars: 'Set the rack safeties just below your lowest position.',
        release_bar_forward: 'If you cannot stand up, drop the bar forward and step away.',
      },
    },
    barbell_box_squat: {
      name: 'Barbell box squat',
      cue: {
        sit_back_to_box: 'Sit back until you touch the box.',
        pause_no_relax: 'Pause on the box without relaxing your torso.',
        drive_up: 'Drive up hard off the box without rocking.',
      },
      mistake: {
        bounce_off_box: 'Bouncing off the box.',
        round_lower_back: 'Rounding your lower back.',
      },
      safety: {
        set_safety_bars: 'Set the rack safeties just below your lowest position.',
      },
    },
    goblet_squat: {
      name: 'Goblet squat',
      cue: {
        hold_close_to_chest: 'Hold the weight tight to your chest, elbows down.',
        elbows_inside_knees: 'Elbows travel down inside your knees.',
        chest_tall: 'Chest tall, eyes forward.',
      },
      mistake: {
        rounding_back: 'Rounding your back.',
        partial_depth: 'Not going deep enough.',
      },
      safety: {
        start_light: 'Start light until you own the technique.',
      },
    },
    dumbbell_squat: {
      name: 'Dumbbell squat',
      cue: {
        weights_at_sides: 'Weights at your sides, arms straight.',
        knees_track_toes: 'Knees track in line with your toes.',
        full_range: 'Use the full range of motion; do not cut it short at either end.',
      },
      mistake: {
        leaning_forward: 'Leaning your torso too far forward.',
        partial_depth: 'Not going deep enough.',
      },
      safety: {
        start_light: 'Start light until you own the technique.',
      },
    },
    kettlebell_front_squat: {
      name: 'Kettlebell front squat',
      cue: {
        rack_position: 'Kettlebell resting on the forearm and tight to the chest, elbow down.',
        wrist_neutral: 'Wrist straight, in line with your forearm.',
        controlled_descent: 'Lower under control, taking about two seconds.',
      },
      mistake: {
        wrist_bent_back: 'Bending your wrist back.',
        torso_collapse: 'Letting your torso collapse forward.',
      },
      safety: {
        start_light: 'Start light until you own the technique.',
      },
    },
    bodyweight_squat: {
      name: 'Bodyweight squat',
      cue: {
        feet_shoulder_width: 'Feet shoulder-width apart, toes slightly out.',
        hips_back_first: 'Start the movement by pushing your hips back.',
        knees_track_toes: 'Knees track in line with your toes.',
      },
      mistake: {
        knees_cave_in: 'Letting your knees cave in.',
        heels_lift: 'Lifting your heels off the floor.',
      },
      safety: {
        stop_if_joint_pain: 'Stop if you feel pain in any joint. If it persists, check with a professional.',
      },
    },
    chair_squat: {
      name: 'Chair squat',
      cue: {
        touch_seat_lightly: 'Lightly touch the seat without sitting down.',
        stand_without_hands: 'Stand up without using your hands.',
        controlled_tempo: 'Controlled tempo in both directions, no jerking.',
      },
      mistake: {
        dropping_onto_seat: 'Dropping onto the seat.',
        knees_cave_in: 'Letting your knees cave in.',
      },
      safety: {
        use_stable_chair: 'Use a sturdy chair, backed against the wall.',
      },
    },
    jump_squat: {
      name: 'Jump squat',
      cue: {
        soft_landing: 'Land softly, toes to heels.',
        absorb_with_hips: 'Absorb the landing by bending hips and knees, not just the knees.',
        reset_each_rep: 'Reset your feet and posture after every jump before the next one.',
      },
      mistake: {
        landing_stiff_knees: 'Landing with stiff knees.',
        rushing_reps: 'Stringing reps together without control.',
      },
      safety: {
        avoid_if_joint_pain: 'If your knees or ankles bother you, swap it for a squat without the jump.',
        land_on_soft_surface: 'Do it on a surface with some give.',
      },
    },
    wall_sit: {
      name: 'Wall sit',
      cue: {
        back_flat_on_wall: 'Back fully flat against the wall.',
        thighs_parallel: 'Thighs parallel to the floor.',
        breathe_steadily: 'Keep breathing; do not hold your breath.',
      },
      mistake: {
        sliding_down: 'Sliding down the wall.',
        holding_breath: 'Holding your breath.',
      },
      safety: {
        stop_if_joint_pain: 'Stop if you feel pain in any joint. If it persists, check with a professional.',
      },
    },
    band_squat: {
      name: 'Band squat',
      cue: {
        band_under_midfoot: 'Stand on the band with the middle of your foot so it cannot move.',
        tension_all_range: 'Keep the band tight through the whole range.',
        chest_tall: 'Chest tall, eyes forward.',
      },
      mistake: {
        band_slipping: 'Letting the band shift or slip.',
        partial_depth: 'Not going deep enough.',
      },
      safety: {
        check_band_wear: 'Inspect the band: if it has cracks or nicks, do not use it.',
      },
    },
    leg_press: {
      name: 'Leg press',
      cue: {
        feet_mid_platform: 'Feet in the middle of the platform, hip-width apart.',
        knees_track_toes: 'Knees track in line with your toes.',
        no_lockout_slam: 'Do not slam the joint into lockout at the end of the rep.',
      },
      mistake: {
        lower_back_lifting: 'Lifting your lower back off the pad.',
        bouncing_bottom: 'Bouncing at the bottom of the range.',
      },
      safety: {
        engage_safety_latch: 'Engage the safety stops before releasing the sled.',
      },
    },
    hack_squat_machine: {
      name: 'Hack squat machine',
      cue: {
        back_flat_on_pad: 'Keep back and hips flat on the pad through the whole rep.',
        controlled_descent: 'Lower under control, taking about two seconds.',
        drive_through_heels: 'Push the platform through your heels.',
      },
      mistake: {
        knees_cave_in: 'Letting your knees cave in.',
        partial_depth: 'Not going deep enough.',
      },
      safety: {
        engage_safety_latch: 'Engage the safety stops before releasing the sled.',
      },
    },
    conventional_deadlift: {
      name: 'Conventional deadlift',
      cue: {
        bar_over_midfoot: 'Keep the bar over the middle of your foot at all times.',
        flat_back: 'Back flat and neutral, never rounded.',
        push_floor_away: 'Push the floor away with your legs instead of pulling with your back.',
      },
      mistake: {
        rounding_lower_back: 'Rounding your lower back.',
        hips_rise_first: 'Raising your hips before your chest.',
      },
      safety: {
        reset_each_rep: 'Rest the bar on the floor and reset your back before every rep.',
        stop_if_back_pain: 'Stop if you feel pain in your back. If it persists, check with a professional.',
      },
    },
    sumo_deadlift: {
      name: 'Sumo deadlift',
      cue: {
        wide_stance: 'Wide stance, toes pointing out.',
        knees_out: 'Knees out, in line with your toes.',
        chest_up: 'Chest up, eyes forward.',
      },
      mistake: {
        hips_rise_first: 'Raising your hips before your chest.',
        bar_drifting_forward: 'Letting the bar drift away from your body.',
      },
      safety: {
        stop_if_back_pain: 'Stop if you feel pain in your back. If it persists, check with a professional.',
      },
    },
    trap_bar_deadlift: {
      name: 'Trap bar deadlift',
      cue: {
        stand_centered: 'Stand in the centre of the trap bar.',
        flat_back: 'Back flat and neutral, never rounded.',
        drive_through_floor: 'Push the floor away with your legs.',
      },
      mistake: {
        rounding_lower_back: 'Rounding your lower back.',
        jerking_start: 'Yanking the bar off the floor.',
      },
      safety: {
        reset_each_rep: 'Rest the bar on the floor and reset your back before every rep.',
      },
    },
    romanian_deadlift: {
      name: 'Romanian deadlift',
      cue: {
        soft_knees: 'Knees slightly bent, never locked.',
        hips_travel_back: 'Hips travel back as the torso lowers.',
        bar_close_to_legs: 'The bar brushes your legs the whole way.',
      },
      mistake: {
        squatting_instead_of_hinging: 'Squatting instead of hinging at the hips.',
        rounding_back: 'Rounding your back.',
      },
      safety: {
        stop_before_back_rounds: 'Stop the descent before your back rounds.',
      },
    },
    dumbbell_romanian_deadlift: {
      name: 'Dumbbell Romanian deadlift',
      cue: {
        soft_knees: 'Knees slightly bent, never locked.',
        hips_back: 'Push your hips back as if closing a door with them.',
        feel_hamstring_stretch: 'Lower until you feel the stretch in the back of your thighs.',
      },
      mistake: {
        bending_knees_too_much: 'Bending your knees too much.',
        rounding_back: 'Rounding your back.',
      },
      safety: {
        stop_before_back_rounds: 'Stop the descent before your back rounds.',
      },
    },
    single_leg_rdl: {
      name: 'Single-leg Romanian deadlift',
      cue: {
        hips_square: 'Hips square and facing forward.',
        slow_tempo: 'Slow tempo through the whole range.',
        reach_toward_floor: 'Lower your torso by reaching your hand toward the floor.',
      },
      mistake: {
        hip_opening_up: 'Letting the hip open out to the side.',
        rushing_balance: 'Going fast and losing your balance.',
      },
      safety: {
        hold_support_if_needed: 'If you lose balance, hold on to something stable.',
      },
    },
    kettlebell_swing: {
      name: 'Kettlebell swing',
      cue: {
        hinge_not_squat: 'This is a hip hinge, not a squat: knees stay only slightly bent.',
        snap_hips: 'Snap your hips forward to launch the weight.',
        arms_stay_relaxed: 'Arms stay loose: they guide the weight, they do not lift it.',
      },
      mistake: {
        lifting_with_arms: 'Lifting the weight with your arms.',
        rounding_back: 'Rounding your back.',
      },
      safety: {
        clear_space_around: 'Clear the space around you before you start.',
        stop_if_back_pain: 'Stop if you feel pain in your back. If it persists, check with a professional.',
      },
    },
    barbell_hip_thrust: {
      name: 'Barbell hip thrust',
      cue: {
        chin_tucked: 'Chin slightly tucked, eyes forward.',
        ribs_down: 'Ribs down: no arching through the lower back.',
        full_hip_extension: 'Drive up until your hips are fully extended.',
      },
      mistake: {
        overarching_lower_back: 'Over-arching your lower back.',
        pushing_through_toes: 'Pushing through your toes.',
      },
      safety: {
        pad_the_bar: 'Put a pad between the bar and your hips.',
      },
    },
    glute_bridge: {
      name: 'Glute bridge',
      cue: {
        feet_flat_close: 'Feet flat and close to your glutes.',
        squeeze_at_top: 'Squeeze your glutes hard at the top.',
        ribs_down: 'Ribs down: no arching through the lower back.',
      },
      mistake: {
        overarching_lower_back: 'Over-arching your lower back.',
        pushing_through_toes: 'Pushing through your toes.',
      },
      safety: {
        stop_if_back_pain: 'Stop if you feel pain in your back. If it persists, check with a professional.',
      },
    },
    single_leg_glute_bridge: {
      name: 'Single-leg glute bridge',
      cue: {
        hips_level: 'Hips level, with neither side dropping.',
        squeeze_at_top: 'Squeeze your glutes hard at the top.',
        slow_lowering: 'Lower slowly, braking the weight.',
      },
      mistake: {
        hip_dropping: 'Letting one hip drop.',
        arching_back: 'Arching your back on the way up.',
      },
      safety: {
        stop_if_back_pain: 'Stop if you feel pain in your back. If it persists, check with a professional.',
      },
    },
    good_morning: {
      name: 'Good morning',
      cue: {
        light_load: 'Use a light load; this exercise works with little weight.',
        hips_back: 'Push your hips back as if closing a door with them.',
        flat_back: 'Back flat and neutral, never rounded.',
      },
      mistake: {
        rounding_back: 'Rounding your back.',
        going_too_heavy: 'Loading too much weight.',
      },
      safety: {
        use_light_load_first: 'Learn the movement with an empty bar or very little weight.',
        stop_if_back_pain: 'Stop if you feel pain in your back. If it persists, check with a professional.',
      },
    },
    band_good_morning: {
      name: 'Band good morning',
      cue: {
        band_under_feet: 'Stand on the band with both feet to pin it down.',
        hips_back: 'Push your hips back as if closing a door with them.',
        flat_back: 'Back flat and neutral, never rounded.',
      },
      mistake: {
        rounding_back: 'Rounding your back.',
        band_slipping: 'Letting the band shift or slip.',
      },
      safety: {
        check_band_wear: 'Inspect the band: if it has cracks or nicks, do not use it.',
      },
    },
    cable_pull_through: {
      name: 'Cable pull-through',
      cue: {
        face_away_from_stack: 'Face away from the stack with the rope between your legs.',
        hinge_at_hips: 'Bend at the hips, not the back.',
        squeeze_at_lockout: 'Squeeze your glutes as your hips lock out.',
      },
      mistake: {
        squatting_the_movement: 'Turning it into a squat.',
        overextending_at_top: 'Hyperextending your back at the end.',
      },
      safety: {
        keep_stable_stance: 'Plant your feet so the cable cannot pull you off balance.',
      },
    },
    back_extension: {
      name: 'Back extension',
      cue: {
        pads_below_hip_crease: 'Set the pad just below your hip crease.',
        neutral_spine: 'Neutral spine, neither arched nor rounded.',
        stop_at_straight: 'Come up until your body is straight.',
      },
      mistake: {
        hyperextending_at_top: 'Hyperextending your back at the top.',
        jerking_up: 'Jerking up.',
      },
      safety: {
        stop_if_back_pain: 'Stop if you feel pain in your back. If it persists, check with a professional.',
      },
    },
    barbell_bench_press: {
      name: 'Barbell bench press',
      cue: {
        shoulder_blades_retracted: 'Squeeze your shoulder blades together and pin them to the bench.',
        feet_planted: 'Feet planted firmly, pushing into the floor for the whole set.',
        bar_to_lower_chest: 'Lower the bar to your lower chest.',
      },
      mistake: {
        bouncing_off_chest: 'Bouncing the bar off your chest.',
        flaring_elbows: 'Flaring your elbows too wide.',
      },
      safety: {
        use_spotter_or_safeties: 'Use safety stops or ask someone to spot you.',
        no_thumbless_grip: 'Always wrap your thumb around the bar.',
      },
    },
    incline_barbell_bench_press: {
      name: 'Incline barbell bench press',
      cue: {
        bench_30_degrees: 'Set the bench to about 30 degrees.',
        blades_retracted: 'Squeeze your shoulder blades together and keep them there for the whole set.',
        bar_to_upper_chest: 'Lower the bar to your upper chest, just below the collarbone.',
      },
      mistake: {
        bench_too_steep: 'Setting the bench too steep.',
        bouncing_off_chest: 'Bouncing the bar off your chest.',
      },
      safety: {
        use_spotter_or_safeties: 'Use safety stops or ask someone to spot you.',
      },
    },
    dumbbell_bench_press: {
      name: 'Dumbbell bench press',
      cue: {
        blades_retracted: 'Squeeze your shoulder blades together and keep them there for the whole set.',
        wrists_stacked: 'Wrists straight and stacked over your elbows.',
        control_the_descent: 'Lower the weight slowly, counting two seconds.',
      },
      mistake: {
        flaring_elbows: 'Flaring your elbows too wide.',
        clanging_dumbbells: 'Clanging the dumbbells together at the top.',
      },
      safety: {
        set_down_safely: 'Lower the weight to the floor under control; do not drop it from height.',
      },
    },
    incline_dumbbell_press: {
      name: 'Incline dumbbell press',
      cue: {
        bench_30_degrees: 'Set the bench to about 30 degrees.',
        elbows_45_degrees: 'Elbows about 45 degrees from your body, neither tucked nor flared.',
        full_range: 'Use the full range of motion; do not cut it short at either end.',
      },
      mistake: {
        bench_too_steep: 'Setting the bench too steep.',
        short_range: 'Cutting the range short.',
      },
      safety: {
        set_down_safely: 'Lower the weight to the floor under control; do not drop it from height.',
      },
    },
    dumbbell_floor_press: {
      name: 'Dumbbell floor press',
      cue: {
        elbows_touch_floor: 'Lower until your elbows gently touch the floor.',
        pause_briefly: 'Pause briefly at the bottom before pressing.',
        press_straight_up: 'Press straight up over your chest.',
      },
      mistake: {
        bouncing_elbows: 'Bouncing your elbows off the floor.',
        flaring_elbows: 'Flaring your elbows too wide.',
      },
      safety: {
        set_down_safely: 'Lower the weight to the floor under control; do not drop it from height.',
      },
    },
    push_up: {
      name: 'Push-up',
      cue: {
        body_in_straight_line: 'Body in a straight line from head to heels.',
        elbows_45_degrees: 'Elbows about 45 degrees from your body, neither tucked nor flared.',
        full_range: 'Use the full range of motion; do not cut it short at either end.',
      },
      mistake: {
        sagging_hips: 'Letting your hips sag.',
        flaring_elbows: 'Flaring your elbows too wide.',
      },
      safety: {
        drop_to_knees_if_form_breaks: 'If your hips drop, go to your knees and carry on.',
      },
    },
    knee_push_up: {
      name: 'Knee push-up',
      cue: {
        knees_hips_shoulders_aligned: 'Knees, hips and shoulders in a straight line.',
        chest_to_floor: 'Lower until your chest almost brushes the floor.',
        controlled_tempo: 'Controlled tempo in both directions, no jerking.',
      },
      mistake: {
        sagging_hips: 'Letting your hips sag.',
        half_range: 'Doing only half the range.',
      },
      safety: {
        pad_the_knees: 'Rest your knees on a mat.',
      },
    },
    incline_push_up: {
      name: 'Incline push-up',
      cue: {
        hands_on_stable_surface: 'Hands on a solid surface that will not move.',
        straight_body: 'Body straight from head to feet.',
        chest_to_edge: 'Lower until your chest almost touches the edge of the support.',
      },
      mistake: {
        sagging_hips: 'Letting your hips sag.',
        unstable_surface: 'Using a surface that moves.',
      },
      safety: {
        use_stable_surface: 'Use a solid support that will not move or slip.',
      },
    },
    decline_push_up: {
      name: 'Decline push-up',
      cue: {
        feet_elevated: 'Rest your feet on a box or bench.',
        ribs_down: 'Ribs down: no arching through the lower back.',
        controlled_descent: 'Lower under control, taking about two seconds.',
      },
      mistake: {
        sagging_hips: 'Letting your hips sag.',
        neck_craning: 'Craning your neck forward.',
      },
      safety: {
        use_stable_surface: 'Use a solid support that will not move or slip.',
      },
    },
    diamond_push_up: {
      name: 'Diamond push-up',
      cue: {
        hands_form_triangle: 'Bring index fingers and thumbs together to form a triangle under your chest.',
        elbows_close: 'Elbows close to your body through the whole rep.',
        straight_body: 'Body straight from head to feet.',
      },
      mistake: {
        flaring_elbows: 'Flaring your elbows too wide.',
        sagging_hips: 'Letting your hips sag.',
      },
      safety: {
        stop_if_wrist_pain: 'Stop if you feel pain in your wrist. If it persists, check with a professional.',
      },
    },
    machine_chest_press: {
      name: 'Machine chest press',
      cue: {
        handles_at_chest_height: 'Set the seat so the handles sit at chest height.',
        blades_back: 'Pull your shoulder blades back and down before pressing.',
        no_lockout_slam: 'Do not slam the joint into lockout at the end of the rep.',
      },
      mistake: {
        seat_too_high: 'Seat too high.',
        partial_range: 'Cutting the range short.',
      },
      safety: {
        adjust_seat_first: 'Set the seat and supports before the first rep.',
      },
    },
    cable_chest_press: {
      name: 'Cable chest press',
      cue: {
        staggered_stance: 'One foot forward for a stable base.',
        press_and_squeeze: 'Press forward and squeeze your chest at the end.',
        control_the_return: 'Return to the start by braking the weight, not letting it pull you.',
      },
      mistake: {
        leaning_too_far: 'Leaning too far forward.',
        shrugging_shoulders: 'Raising your shoulders.',
      },
      safety: {
        check_pin_and_clips: 'Check the pin is fully in and the attachment is clipped on properly.',
      },
    },
    band_chest_press: {
      name: 'Band chest press',
      cue: {
        band_behind_back: 'Run the band behind your back at shoulder-blade height.',
        press_forward: 'Press forward until your arms are straight.',
        slow_return: 'Return slowly to the start position.',
      },
      mistake: {
        band_slipping: 'Letting the band shift or slip.',
        short_range: 'Cutting the range short.',
      },
      safety: {
        check_band_wear: 'Inspect the band: if it has cracks or nicks, do not use it.',
      },
    },
    bench_dip: {
      name: 'Bench dip',
      cue: {
        hands_at_bench_edge: 'Hands on the edge of the bench, fingers forward.',
        elbows_back: 'Elbows point back, not out to the sides.',
        stop_at_parallel: 'Lower until your upper arm is parallel to the floor.',
      },
      mistake: {
        going_too_deep: 'Going deeper than your shoulders tolerate.',
        shoulders_shrugging: 'Shrugging your shoulders.',
      },
      safety: {
        stop_if_shoulder_pain: 'Stop if you feel pain in your shoulder. If it persists, check with a professional.',
      },
    },
    parallel_bar_dip: {
      name: 'Parallel bar dip',
      cue: {
        slight_forward_lean: 'Lean your torso slightly forward.',
        elbows_back: 'Elbows point back, not out to the sides.',
        stop_at_shoulder_height: 'Lower until your shoulder is level with your elbow, no further.',
      },
      mistake: {
        going_too_deep: 'Going deeper than your shoulders tolerate.',
        swinging_legs: 'Swinging your legs.',
      },
      safety: {
        stop_if_shoulder_pain: 'Stop if you feel pain in your shoulder. If it persists, check with a professional.',
        use_assistance_if_needed: 'If you cannot control the descent, use a band or the assisted machine.',
      },
    },
    barbell_overhead_press: {
      name: 'Barbell overhead press',
      cue: {
        squeeze_glutes: 'Squeeze your glutes.',
        head_through_at_top: 'At lockout, push your head through in front of the bar.',
        bar_over_midfoot: 'Keep the bar over the middle of your foot at all times.',
      },
      mistake: {
        overarching_lower_back: 'Over-arching your lower back.',
        pressing_around_head: 'Pressing around your head instead of moving it out of the way.',
      },
      safety: {
        stop_if_shoulder_pain: 'Stop if you feel pain in your shoulder. If it persists, check with a professional.',
      },
    },
    push_press: {
      name: 'Push press',
      cue: {
        short_dip: 'Bend your knees slightly, well short of a half squat.',
        drive_with_legs: 'The drive comes from the legs, not the arms.',
        lock_out_overhead: 'Finish with the bar overhead and arms locked.',
      },
      mistake: {
        dipping_too_deep: 'Dipping too deep on the leg drive.',
        overarching_lower_back: 'Over-arching your lower back.',
      },
      safety: {
        clear_space_overhead: 'Check there is nothing above you.',
      },
    },
    dumbbell_shoulder_press: {
      name: 'Dumbbell shoulder press',
      cue: {
        ribs_down: 'Ribs down: no arching through the lower back.',
        press_slightly_forward: 'Press slightly forward, not just straight up.',
        full_lockout: 'Lock your arms out fully at the top.',
      },
      mistake: {
        overarching_lower_back: 'Over-arching your lower back.',
        half_range: 'Doing only half the range.',
      },
      safety: {
        stop_if_shoulder_pain: 'Stop if you feel pain in your shoulder. If it persists, check with a professional.',
      },
    },
    seated_dumbbell_shoulder_press: {
      name: 'Seated dumbbell shoulder press',
      cue: {
        back_against_pad: 'Keep your whole back against the pad.',
        wrists_stacked: 'Wrists straight and stacked over your elbows.',
        controlled_descent: 'Lower under control, taking about two seconds.',
      },
      mistake: {
        bouncing_off_shoulders: 'Bouncing the weight off your shoulders.',
        arching_off_pad: 'Arching your back off the pad.',
      },
      safety: {
        set_down_safely: 'Lower the weight to the floor under control; do not drop it from height.',
      },
    },
    arnold_press: {
      name: 'Arnold press',
      cue: {
        start_palms_in: 'Start with palms facing you at shoulder height.',
        rotate_as_you_press: 'Rotate your palms forward as you press.',
        controlled_tempo: 'Controlled tempo in both directions, no jerking.',
      },
      mistake: {
        rushing_the_rotation: 'Rotating too fast.',
        using_momentum: 'Using momentum.',
      },
      safety: {
        stop_if_shoulder_pain: 'Stop if you feel pain in your shoulder. If it persists, check with a professional.',
      },
    },
    kettlebell_overhead_press: {
      name: 'Kettlebell overhead press',
      cue: {
        rack_position: 'Kettlebell resting on the forearm and tight to the chest, elbow down.',
        wrist_neutral: 'Wrist straight, in line with your forearm.',
        press_and_lock: 'Press until your arm locks out overhead.',
      },
      mistake: {
        wrist_bent_back: 'Bending your wrist back.',
        leaning_sideways: 'Leaning to one side.',
      },
      safety: {
        stop_if_shoulder_pain: 'Stop if you feel pain in your shoulder. If it persists, check with a professional.',
      },
    },
    landmine_press: {
      name: 'Landmine press',
      cue: {
        staggered_stance: 'One foot forward for a stable base.',
        press_up_and_forward: 'Press up and forward, following the angle of the bar.',
        ribs_down: 'Ribs down: no arching through the lower back.',
      },
      mistake: {
        leaning_back: 'Leaning back.',
        shrugging_shoulders: 'Raising your shoulders.',
      },
      safety: {
        secure_the_bar_end: 'Secure the end of the bar in its holder before loading it.',
      },
    },
    pike_push_up: {
      name: 'Pike push-up',
      cue: {
        hips_high: 'Hips high, body in an inverted V.',
        crown_toward_floor: 'Lower the crown of your head toward the floor, between your hands.',
        elbows_forward: 'Elbows pointing forward, not flared out.',
      },
      mistake: {
        bending_at_waist_only: 'Bending only at the waist without lifting the hips.',
        neck_compressing: 'Loading the weight onto your neck.',
      },
      safety: {
        stop_if_shoulder_pain: 'Stop if you feel pain in your shoulder. If it persists, check with a professional.',
      },
    },
    wall_handstand_push_up: {
      name: 'Wall handstand push-up',
      cue: {
        hands_close_to_wall: 'Hands a hand-width from the wall, shoulder-width apart.',
        ribs_down: 'Ribs down: no arching through the lower back.',
        controlled_descent: 'Lower under control, taking about two seconds.',
      },
      mistake: {
        collapsing_neck_first: 'Collapsing through the neck first.',
        excessive_arching: 'Arching your back excessively.',
      },
      safety: {
        have_an_exit_plan: 'Know how you will come down safely before you go up.',
        clear_space_around: 'Clear the space around you before you start.',
      },
    },
    machine_shoulder_press: {
      name: 'Machine shoulder press',
      cue: {
        handles_at_shoulder_height: 'Set the seat so the handles sit at shoulder height.',
        back_on_pad: 'Back on the pad, lower back included.',
        no_lockout_slam: 'Do not slam the joint into lockout at the end of the rep.',
      },
      mistake: {
        seat_too_low: 'Seat too low.',
        partial_range: 'Cutting the range short.',
      },
      safety: {
        adjust_seat_first: 'Set the seat and supports before the first rep.',
      },
    },
    band_overhead_press: {
      name: 'Band overhead press',
      cue: {
        band_under_feet: 'Stand on the band with both feet to pin it down.',
        ribs_down: 'Ribs down: no arching through the lower back.',
        slow_return: 'Return slowly to the start position.',
      },
      mistake: {
        band_slipping: 'Letting the band shift or slip.',
        leaning_back: 'Leaning back.',
      },
      safety: {
        check_band_wear: 'Inspect the band: if it has cracks or nicks, do not use it.',
      },
    },
    barbell_bent_over_row: {
      name: 'Barbell bent-over row',
      cue: {
        hinge_to_45_degrees: 'Hinge your torso to about 45 degrees with a straight back.',
        pull_to_navel: 'Pull the bar toward your navel.',
        flat_back: 'Back flat and neutral, never rounded.',
      },
      mistake: {
        jerking_with_lower_back: 'Heaving with your lower back.',
        standing_too_upright: 'Standing too upright.',
      },
      safety: {
        stop_if_back_pain: 'Stop if you feel pain in your back. If it persists, check with a professional.',
      },
    },
    pendlay_row: {
      name: 'Pendlay row',
      cue: {
        torso_parallel: 'Torso nearly parallel to the floor.',
        reset_on_floor: 'Rest the bar on the floor on every rep.',
        explosive_pull: 'Pull the bar to your chest with fast intent.',
      },
      mistake: {
        rounding_back: 'Rounding your back.',
        torso_rising: 'Raising your torso as you pull.',
      },
      safety: {
        stop_if_back_pain: 'Stop if you feel pain in your back. If it persists, check with a professional.',
      },
    },
    t_bar_row: {
      name: 'T-bar row',
      cue: {
        chest_up: 'Chest up, eyes forward.',
        pull_to_sternum: 'Pull toward your sternum.',
        squeeze_blades: 'Squeeze your shoulder blades together at the end of the movement.',
      },
      mistake: {
        rounding_back: 'Rounding your back.',
        using_momentum: 'Using momentum.',
      },
      safety: {
        secure_the_bar_end: 'Secure the end of the bar in its holder before loading it.',
      },
    },
    dumbbell_one_arm_row: {
      name: 'One-arm dumbbell row',
      cue: {
        flat_back: 'Back flat and neutral, never rounded.',
        pull_to_hip: 'Pull the weight toward your hip, not your shoulder.',
        no_torso_rotation: 'Torso does not rotate; only the arm moves.',
      },
      mistake: {
        twisting_the_torso: 'Twisting your torso.',
        shrugging: 'Shrugging your shoulders up to your ears.',
      },
      safety: {
        support_on_stable_bench: 'Rest your free hand on a bench that will not move.',
      },
    },
    chest_supported_dumbbell_row: {
      name: 'Chest-supported dumbbell row',
      cue: {
        chest_stays_on_pad: 'Your chest never leaves the pad.',
        elbows_to_ribs: 'Drive your elbows toward your ribs.',
        squeeze_blades: 'Squeeze your shoulder blades together at the end of the movement.',
      },
      mistake: {
        lifting_chest_off_pad: 'Lifting your chest off the pad.',
        using_momentum: 'Using momentum.',
      },
      safety: {
        set_down_safely: 'Lower the weight to the floor under control; do not drop it from height.',
      },
    },
    kettlebell_row: {
      name: 'Kettlebell row',
      cue: {
        hinge_and_brace: 'Hinge at the hips and brace your abs.',
        pull_to_hip: 'Pull the weight toward your hip, not your shoulder.',
        flat_back: 'Back flat and neutral, never rounded.',
      },
      mistake: {
        rounding_back: 'Rounding your back.',
        twisting_torso: 'Rotating your torso as you pull.',
      },
      safety: {
        stop_if_back_pain: 'Stop if you feel pain in your back. If it persists, check with a professional.',
      },
    },
    inverted_row: {
      name: 'Inverted row',
      cue: {
        body_straight: 'Body rigid and straight, like a plank.',
        chest_to_bar: 'Bring your chest to the bar, not just your chin.',
        squeeze_blades: 'Squeeze your shoulder blades together at the end of the movement.',
      },
      mistake: {
        sagging_hips: 'Letting your hips sag.',
        half_range: 'Doing only half the range.',
      },
      safety: {
        test_the_support_first: 'Check the bar or table holds your weight before you hang from it.',
      },
    },
    band_seated_row: {
      name: 'Band seated row',
      cue: {
        tall_posture: 'Upright posture, no slouching.',
        pull_to_ribs: 'Pull your hands toward your ribs.',
        slow_return: 'Return slowly to the start position.',
      },
      mistake: {
        leaning_back: 'Leaning back.',
        shrugging: 'Shrugging your shoulders up to your ears.',
      },
      safety: {
        check_band_wear: 'Inspect the band: if it has cracks or nicks, do not use it.',
      },
    },
    seated_cable_row: {
      name: 'Seated cable row',
      cue: {
        tall_chest: 'Chest tall, back straight.',
        pull_to_navel: 'Pull the bar toward your navel.',
        control_the_return: 'Return to the start by braking the weight, not letting it pull you.',
      },
      mistake: {
        rocking_the_torso: 'Rocking your torso.',
        shrugging: 'Shrugging your shoulders up to your ears.',
      },
      safety: {
        check_pin_and_clips: 'Check the pin is fully in and the attachment is clipped on properly.',
      },
    },
    machine_seated_row: {
      name: 'Machine seated row',
      cue: {
        chest_on_pad: 'Chest on the pad for the whole set.',
        elbows_to_ribs: 'Drive your elbows toward your ribs.',
        full_range: 'Use the full range of motion; do not cut it short at either end.',
      },
      mistake: {
        lifting_off_the_pad: 'Coming off the pad to pull.',
        partial_range: 'Cutting the range short.',
      },
      safety: {
        adjust_seat_first: 'Set the seat and supports before the first rep.',
      },
    },
    cable_face_pull: {
      name: 'Cable face pull',
      cue: {
        rope_at_eye_level: 'Set the pulley at eye level.',
        pull_to_forehead: 'Pull the rope toward your forehead, splitting your hands apart.',
        elbows_high: 'Elbows high, at shoulder height or above.',
      },
      mistake: {
        using_too_much_weight: 'Using too much weight.',
        shrugging: 'Shrugging your shoulders up to your ears.',
      },
      safety: {
        keep_load_light: 'Keep the weight light; technique matters here.',
      },
    },
    band_face_pull: {
      name: 'Band face pull',
      cue: {
        anchor_at_chest_height: 'Anchor the band at chest height.',
        pull_to_forehead: 'Pull the rope toward your forehead, splitting your hands apart.',
        squeeze_rear_delts: 'Squeeze the back of your shoulders at the end.',
      },
      mistake: {
        shrugging: 'Shrugging your shoulders up to your ears.',
        band_slipping: 'Letting the band shift or slip.',
      },
      safety: {
        check_band_wear: 'Inspect the band: if it has cracks or nicks, do not use it.',
      },
    },
    pull_up: {
      name: 'Pull-up',
      cue: {
        start_from_dead_hang: 'Start from a dead hang with arms fully straight.',
        pull_elbows_down: 'Pull your elbows down and back.',
        chin_over_bar: 'Pull until your chin clears the bar.',
      },
      mistake: {
        kipping_unintentionally: 'Kipping without meaning to.',
        half_range: 'Doing only half the range.',
      },
      safety: {
        check_bar_is_secure: 'Check the bar is secure before you hang from it.',
      },
    },
    chin_up: {
      name: 'Chin-up',
      cue: {
        supinated_grip: 'Underhand grip: palms facing you.',
        chest_to_bar: 'Bring your chest to the bar, not just your chin.',
        controlled_descent: 'Lower under control, taking about two seconds.',
      },
      mistake: {
        swinging: 'Swinging.',
        half_range: 'Doing only half the range.',
      },
      safety: {
        check_bar_is_secure: 'Check the bar is secure before you hang from it.',
      },
    },
    neutral_grip_pull_up: {
      name: 'Neutral-grip pull-up',
      cue: {
        palms_facing: 'Palms facing each other in a neutral grip.',
        elbows_down_and_back: 'Drive your elbows down and back, toward your pockets.',
        full_hang: 'Start hanging with your arms fully straight.',
      },
      mistake: {
        swinging: 'Swinging.',
        shrugging_at_bottom: 'Shrugging in the hang position.',
      },
      safety: {
        check_bar_is_secure: 'Check the bar is secure before you hang from it.',
        stop_if_shoulder_pain: 'Stop if you feel pain in your shoulder. If it persists, check with a professional.',
      },
    },
    negative_pull_up: {
      name: 'Negative pull-up',
      cue: {
        start_at_top: 'Start at the top, chin over the bar.',
        lower_for_five_seconds: 'Lower yourself over a count of five.',
        stay_tight: 'Body tight through the whole descent.',
      },
      mistake: {
        dropping_too_fast: 'Dropping too fast.',
        skipping_the_setup: 'Skipping the setup.',
      },
      safety: {
        check_bar_is_secure: 'Check the bar is secure before you hang from it.',
      },
    },
    band_assisted_pull_up: {
      name: 'Band-assisted pull-up',
      cue: {
        band_under_knee: 'Loop the band over the bar and rest one knee or foot in it.',
        full_hang_start: 'Start every rep from straight arms.',
        controlled_descent: 'Lower under control, taking about two seconds.',
      },
      mistake: {
        bouncing_out_of_the_band: 'Bouncing out of the band to get up.',
        half_range: 'Doing only half the range.',
      },
      safety: {
        check_band_wear: 'Inspect the band: if it has cracks or nicks, do not use it.',
        check_bar_is_secure: 'Check the bar is secure before you hang from it.',
      },
    },
    assisted_pull_up_machine: {
      name: 'Assisted pull-up machine',
      cue: {
        set_assist_weight: 'Set the assistance: more weight means more help.',
        full_range: 'Use the full range of motion; do not cut it short at either end.',
        controlled_descent: 'Lower under control, taking about two seconds.',
      },
      mistake: {
        too_much_assistance: 'Using too much assistance.',
        partial_range: 'Cutting the range short.',
      },
      safety: {
        step_off_carefully: 'Step off the machine carefully; the platform moves.',
      },
    },
    lat_pulldown_cable: {
      name: 'Cable lat pulldown',
      cue: {
        thighs_under_pad: 'Thighs snug under the pad.',
        pull_to_upper_chest: 'Pull the bar to your upper chest.',
        slow_return: 'Return slowly to the start position.',
      },
      mistake: {
        leaning_way_back: 'Leaning way back to pull.',
        pulling_behind_neck: 'Pulling behind your neck.',
      },
      safety: {
        never_pull_behind_neck: 'Never pull the bar behind your neck.',
      },
    },
    lat_pulldown_machine: {
      name: 'Machine lat pulldown',
      cue: {
        secure_the_thigh_pad: 'Set the thigh pad so it does not lift you.',
        elbows_drive_down: 'Pull with your elbows, down toward your sides.',
        full_stretch_at_top: 'Let your arms straighten fully at the top before pulling again.',
      },
      mistake: {
        using_momentum: 'Using momentum.',
        partial_range: 'Cutting the range short.',
      },
      safety: {
        adjust_seat_first: 'Set the seat and supports before the first rep.',
      },
    },
    band_lat_pulldown: {
      name: 'Band lat pulldown',
      cue: {
        anchor_overhead: 'Anchor the band overhead on a fixed point.',
        elbows_to_ribs: 'Drive your elbows toward your ribs.',
        slow_return: 'Return slowly to the start position.',
      },
      mistake: {
        band_slipping: 'Letting the band shift or slip.',
        short_range: 'Cutting the range short.',
      },
      safety: {
        check_anchor_point: 'Check the anchor will hold before you pull.',
        check_band_wear: 'Inspect the band: if it has cracks or nicks, do not use it.',
      },
    },
    straight_arm_pulldown: {
      name: 'Straight-arm pulldown',
      cue: {
        slight_forward_lean: 'Lean your torso slightly forward.',
        arms_nearly_straight: 'Arms nearly straight, with a slight elbow bend that never changes.',
        squeeze_lats: 'Squeeze your lats as your hands reach your thighs.',
      },
      mistake: {
        bending_elbows: 'Bending your elbows and turning it into a pulldown.',
        using_bodyweight: 'Using your bodyweight to pull.',
      },
      safety: {
        keep_load_light: 'Keep the weight light; technique matters here.',
      },
    },
    walking_lunge: {
      name: 'Walking lunge',
      cue: {
        long_step: 'Take a long step so the front shin stays vertical.',
        back_knee_toward_floor: 'Lower the back knee toward the floor without banging it.',
        torso_tall: 'Torso upright.',
      },
      mistake: {
        front_knee_caving: 'Letting the front knee cave inward.',
        steps_too_short: 'Steps too short.',
      },
      safety: {
        stop_if_knee_pain: 'Stop if you feel pain in your knee. If it persists, check with a professional.',
      },
    },
    reverse_lunge: {
      name: 'Reverse lunge',
      cue: {
        step_straight_back: 'Step straight back.',
        weight_on_front_foot: 'Weight stays on the front foot.',
        controlled_return: 'Return to the start under control, with no momentum.',
      },
      mistake: {
        front_knee_caving: 'Letting the front knee cave inward.',
        leaning_forward: 'Leaning your torso too far forward.',
      },
      safety: {
        stop_if_knee_pain: 'Stop if you feel pain in your knee. If it persists, check with a professional.',
      },
    },
    split_squat: {
      name: 'Split squat',
      cue: {
        feet_in_two_tracks: 'Feet on two parallel tracks, not on the same line.',
        vertical_shin: 'Front shin vertical.',
        even_tempo: 'Same tempo down and up.',
      },
      mistake: {
        feet_on_a_tightrope: 'Placing your feet on the same line.',
        bouncing_at_bottom: 'Bouncing at the bottom.',
      },
      safety: {
        hold_support_if_needed: 'If you lose balance, hold on to something stable.',
      },
    },
    bulgarian_split_squat: {
      name: 'Bulgarian split squat',
      cue: {
        rear_foot_elevated: 'Rear foot resting on a bench or low box.',
        hips_square: 'Hips square and facing forward.',
        slow_descent: 'Lower slowly, over two or three seconds.',
      },
      mistake: {
        rear_foot_too_close: 'Rear foot too close to the bench.',
        losing_balance: 'Losing your balance.',
      },
      safety: {
        use_stable_surface: 'Use a solid support that will not move or slip.',
      },
    },
    lateral_lunge: {
      name: 'Lateral lunge',
      cue: {
        step_wide_sideways: 'Take a wide step to the side.',
        sit_into_hip: 'Sit into the hip of the bending leg.',
        other_leg_straight: 'The other leg stays straight.',
      },
      mistake: {
        knee_past_toes_sideways: 'Letting the knee drift sideways past the foot.',
        rounding_back: 'Rounding your back.',
      },
      safety: {
        stop_if_groin_discomfort: 'Stop if you feel discomfort in your groin. If it persists, check with a professional.',
      },
    },
    curtsy_lunge: {
      name: 'Curtsy lunge',
      cue: {
        step_behind_and_across: 'Step back and across, behind the standing leg.',
        hips_facing_forward: 'Hips facing forward, no twisting.',
        controlled_tempo: 'Controlled tempo in both directions, no jerking.',
      },
      mistake: {
        twisting_the_knee: 'Twisting the knee.',
        losing_balance: 'Losing your balance.',
      },
      safety: {
        stop_if_knee_pain: 'Stop if you feel pain in your knee. If it persists, check with a professional.',
      },
    },
    step_up: {
      name: 'Step-up',
      cue: {
        full_foot_on_box: 'Place your whole foot on the box.',
        drive_through_heel: 'Stand up by pushing through the heel of the working foot.',
        lower_under_control: 'Lower under control; do not drop.',
      },
      mistake: {
        pushing_off_back_foot: 'Pushing off the back foot.',
        box_too_high: 'Using a box that is too high.',
      },
      safety: {
        use_stable_surface: 'Use a solid support that will not move or slip.',
      },
    },
    dumbbell_walking_lunge: {
      name: 'Dumbbell walking lunge',
      cue: {
        weights_at_sides: 'Weights at your sides, arms straight.',
        long_step: 'Take a long step so the front shin stays vertical.',
        torso_tall: 'Torso upright.',
      },
      mistake: {
        front_knee_caving: 'Letting the front knee cave inward.',
        leaning_forward: 'Leaning your torso too far forward.',
      },
      safety: {
        clear_space_ahead: 'Make sure you have clear space ahead of you.',
      },
    },
    dumbbell_bulgarian_split_squat: {
      name: 'Dumbbell Bulgarian split squat',
      cue: {
        rear_foot_elevated: 'Rear foot resting on a bench or low box.',
        weights_at_sides: 'Weights at your sides, arms straight.',
        slow_descent: 'Lower slowly, over two or three seconds.',
      },
      mistake: {
        losing_balance: 'Losing your balance.',
        rear_foot_too_close: 'Rear foot too close to the bench.',
      },
      safety: {
        use_stable_surface: 'Use a solid support that will not move or slip.',
      },
    },
    dumbbell_step_up: {
      name: 'Dumbbell step-up',
      cue: {
        full_foot_on_box: 'Place your whole foot on the box.',
        drive_through_heel: 'Stand up by pushing through the heel of the working foot.',
        controlled_descent: 'Lower under control, taking about two seconds.',
      },
      mistake: {
        pushing_off_back_foot: 'Pushing off the back foot.',
        box_too_high: 'Using a box that is too high.',
      },
      safety: {
        use_stable_surface: 'Use a solid support that will not move or slip.',
      },
    },
    barbell_lunge: {
      name: 'Barbell lunge',
      cue: {
        bar_settled_on_traps: 'Settle the bar on your traps before taking the first step.',
        long_step: 'Take a long step so the front shin stays vertical.',
        brace_core: 'Take a breath and brace your abs as if you were about to take a punch.',
      },
      mistake: {
        losing_balance: 'Losing your balance.',
        short_steps: 'Steps too short.',
      },
      safety: {
        clear_space_ahead: 'Make sure you have clear space ahead of you.',
        set_safety_bars: 'Set the rack safeties just below your lowest position.',
      },
    },
    farmers_carry_dumbbells: {
      name: 'Dumbbell farmer\'s carry',
      cue: {
        stand_tall: 'Stand tall, eyes forward.',
        ribs_down: 'Ribs down: no arching through the lower back.',
        short_quick_steps: 'Short, quick steps.',
      },
      mistake: {
        leaning_to_one_side: 'Tilting to one side.',
        shrugging: 'Shrugging your shoulders up to your ears.',
      },
      safety: {
        clear_the_path: 'Clear the path of obstacles.',
        set_down_safely: 'Lower the weight to the floor under control; do not drop it from height.',
      },
    },
    kettlebell_farmers_carry: {
      name: 'Kettlebell farmer\'s carry',
      cue: {
        stand_tall: 'Stand tall, eyes forward.',
        brace_core: 'Take a breath and brace your abs as if you were about to take a punch.',
        steady_breathing: 'Breathe steadily.',
      },
      mistake: {
        leaning_to_one_side: 'Tilting to one side.',
        holding_breath: 'Holding your breath.',
      },
      safety: {
        clear_the_path: 'Clear the path of obstacles.',
      },
    },
    suitcase_carry: {
      name: 'Suitcase carry',
      cue: {
        load_on_one_side: 'Carry the weight on one side only, arm straight.',
        resist_the_lean: 'Do not let the weight tip you; stay upright.',
        even_steps: 'Even steps of the same length.',
      },
      mistake: {
        leaning_toward_the_weight: 'Leaning toward the weighted side.',
        rushing: 'Rushing.',
      },
      safety: {
        alternate_sides: 'Cover the same distance on each side.',
        set_down_safely: 'Lower the weight to the floor under control; do not drop it from height.',
      },
    },
    overhead_carry_dumbbell: {
      name: 'Dumbbell overhead carry',
      cue: {
        elbow_locked: 'Elbow locked and arm vertical for the whole walk.',
        ribs_down: 'Ribs down: no arching through the lower back.',
        eyes_forward: 'Eyes forward, not on the weight.',
      },
      mistake: {
        overarching_lower_back: 'Over-arching your lower back.',
        letting_the_arm_drift: 'Letting the arm drift forward or sideways.',
      },
      safety: {
        clear_space_overhead: 'Check there is nothing above you.',
        stop_if_shoulder_pain: 'Stop if you feel pain in your shoulder. If it persists, check with a professional.',
      },
    },
    front_rack_carry_kettlebell: {
      name: 'Kettlebell front-rack carry',
      cue: {
        rack_position: 'Kettlebell resting on the forearm and tight to the chest, elbow down.',
        ribs_down: 'Ribs down: no arching through the lower back.',
        steady_breathing: 'Breathe steadily.',
      },
      mistake: {
        leaning_back: 'Leaning back.',
        wrist_bent_back: 'Bending your wrist back.',
      },
      safety: {
        set_down_safely: 'Lower the weight to the floor under control; do not drop it from height.',
      },
    },
    plate_carry: {
      name: 'Plate carry',
      cue: {
        plate_at_chest_height: 'Plate held at chest height.',
        arms_extended: 'Hold the load out in front with straight arms.',
        stand_tall: 'Stand tall, eyes forward.',
      },
      mistake: {
        letting_plate_drop: 'Letting the plate drop.',
        leaning_back: 'Leaning back.',
      },
      safety: {
        clear_the_path: 'Clear the path of obstacles.',
      },
    },
    backpack_carry: {
      name: 'Backpack carry',
      cue: {
        load_close_to_body: 'Load held close to your body.',
        stand_tall: 'Stand tall, eyes forward.',
        even_steps: 'Even steps of the same length.',
      },
      mistake: {
        leaning_forward: 'Leaning your torso too far forward.',
        overloading_the_bag: 'Overloading the backpack.',
      },
      safety: {
        clear_the_path: 'Clear the path of obstacles.',
      },
    },
    plank: {
      name: 'Plank',
      cue: {
        elbows_under_shoulders: 'Elbows directly under your shoulders.',
        ribs_down: 'Ribs down: no arching through the lower back.',
        squeeze_glutes: 'Squeeze your glutes.',
      },
      mistake: {
        hips_sagging: 'Letting your hips sag.',
        hips_too_high: 'Pushing your hips too high.',
      },
      safety: {
        stop_if_back_pain: 'Stop if you feel pain in your back. If it persists, check with a professional.',
      },
    },
    side_plank: {
      name: 'Side plank',
      cue: {
        elbow_under_shoulder: 'Elbow directly under the shoulder.',
        hips_stacked: 'Hips and shoulders stacked vertically.',
        lift_the_hip: 'Lift your hip until your body forms a straight line.',
      },
      mistake: {
        hips_dropping: 'Letting your hips drop.',
        rotating_forward: 'Rotating your torso forward.',
      },
      safety: {
        stop_if_shoulder_pain: 'Stop if you feel pain in your shoulder. If it persists, check with a professional.',
      },
    },
    dead_bug: {
      name: 'Dead bug',
      cue: {
        lower_back_flat: 'Lower back flat on the floor for the whole exercise.',
        opposite_arm_and_leg: 'Extend the opposite arm and leg together.',
        exhale_on_extension: 'Breathe out as you extend arm and leg.',
      },
      mistake: {
        back_arching_off_floor: 'Letting your lower back lift off the floor.',
        moving_too_fast: 'Moving too fast.',
      },
      safety: {
        reduce_range_if_back_arches: 'If your lower back arches, shorten the range.',
      },
    },
    bird_dog: {
      name: 'Bird dog',
      cue: {
        flat_back: 'Back flat and neutral, never rounded.',
        extend_opposite_limbs: 'Extend the opposite arm and leg until they line up with your torso.',
        no_hip_rotation: 'Hips do not rotate or tilt.',
      },
      mistake: {
        arching_the_back: 'Arching your back.',
        rushing: 'Rushing.',
      },
      safety: {
        stop_if_back_pain: 'Stop if you feel pain in your back. If it persists, check with a professional.',
      },
    },
    hollow_hold: {
      name: 'Hollow hold',
      cue: {
        lower_back_pressed_down: 'Press your lower back into the floor.',
        shoulders_off_floor: 'Shoulders lifted off the floor.',
        steady_breathing: 'Breathe steadily.',
      },
      mistake: {
        back_arching_off_floor: 'Letting your lower back lift off the floor.',
        holding_breath: 'Holding your breath.',
      },
      safety: {
        bend_knees_to_regress: 'If your lower back lifts off the floor, bend your knees.',
      },
    },
    lying_leg_raise: {
      name: 'Lying leg raise',
      cue: {
        hands_under_hips: 'Place your hands under your hips to support your lower back.',
        legs_straight: 'Legs straight or nearly straight.',
        lower_slowly: 'Lower your legs slowly; do not let them drop.',
      },
      mistake: {
        back_arching_off_floor: 'Letting your lower back lift off the floor.',
        using_momentum: 'Using momentum.',
      },
      safety: {
        bend_knees_to_regress: 'If your lower back lifts off the floor, bend your knees.',
      },
    },
    reverse_crunch: {
      name: 'Reverse crunch',
      cue: {
        curl_hips_off_floor: 'Curl your pelvis and lift your hips off the floor.',
        knees_toward_chest: 'Bring your knees toward your chest.',
        slow_lowering: 'Lower slowly, braking the weight.',
      },
      mistake: {
        swinging_the_legs: 'Throwing your legs up with momentum.',
        pulling_with_neck: 'Pulling with your neck.',
      },
      safety: {
        stop_if_back_pain: 'Stop if you feel pain in your back. If it persists, check with a professional.',
      },
    },
    hanging_knee_raise: {
      name: 'Hanging knee raise',
      cue: {
        stop_the_swing: 'Kill the swing before each rep.',
        curl_the_pelvis: 'Curl your pelvis up as the knees rise.',
        lower_under_control: 'Lower under control; do not drop.',
      },
      mistake: {
        swinging: 'Swinging.',
        only_bending_hips: 'Bending only at the hips without curling the pelvis.',
      },
      safety: {
        check_bar_is_secure: 'Check the bar is secure before you hang from it.',
      },
    },
    mountain_climber: {
      name: 'Mountain climbers',
      cue: {
        plank_position: 'Plank position: hands under shoulders, body in a line.',
        hips_low: 'Hips low, in line with your shoulders.',
        quick_but_controlled: 'Quick but controlled; each knee reaches the same point.',
      },
      mistake: {
        hips_bouncing_up: 'Bouncing your hips up and down with every stride.',
        short_range: 'Cutting the range short.',
      },
      safety: {
        stop_if_wrist_pain: 'Stop if you feel pain in your wrist. If it persists, check with a professional.',
      },
    },
    plank_to_push_up: {
      name: 'Plank to push-up',
      cue: {
        minimize_hip_rotation: 'Keep your hips as still as possible.',
        one_arm_at_a_time: 'Switch from elbow to hand one arm at a time, without rushing.',
        ribs_down: 'Ribs down: no arching through the lower back.',
      },
      mistake: {
        hips_swinging: 'Swinging your hips from side to side.',
        sagging_hips: 'Letting your hips sag.',
      },
      safety: {
        stop_if_wrist_pain: 'Stop if you feel pain in your wrist. If it persists, check with a professional.',
      },
    },
    russian_twist: {
      name: 'Russian twist',
      cue: {
        tall_chest: 'Chest tall, back straight.',
        rotate_from_ribs: 'Rotate from the ribs, not the arms.',
        controlled_tempo: 'Controlled tempo in both directions, no jerking.',
      },
      mistake: {
        rounding_the_back: 'Hunching your back.',
        moving_only_the_arms: 'Moving only the arms, not the torso.',
      },
      safety: {
        stop_if_back_pain: 'Stop if you feel pain in your back. If it persists, check with a professional.',
      },
    },
    copenhagen_plank: {
      name: 'Copenhagen plank',
      cue: {
        top_leg_on_support: 'Top leg resting on the bench.',
        hips_high: 'Hips high, in line between shoulders and feet.',
        short_holds_first: 'Start with short holds and build up over time.',
      },
      mistake: {
        hips_dropping: 'Letting your hips drop.',
        holding_too_long: 'Holding too long from the start.',
      },
      safety: {
        start_with_bent_knee: 'Start with your bent knee resting on the bench.',
        stop_if_groin_discomfort: 'Stop if you feel discomfort in your groin. If it persists, check with a professional.',
      },
    },
    pallof_press_cable: {
      name: 'Cable Pallof press',
      cue: {
        stand_side_on: 'Stand side-on to the pulley.',
        press_straight_out: 'Press your arms straight out in front at chest height.',
        resist_rotation: 'Resist the pull; your torso does not turn.',
      },
      mistake: {
        letting_the_torso_turn: 'Letting your torso turn.',
        holding_breath: 'Holding your breath.',
      },
      safety: {
        keep_load_light: 'Keep the weight light; technique matters here.',
      },
    },
    pallof_press_band: {
      name: 'Band Pallof press',
      cue: {
        anchor_at_chest_height: 'Anchor the band at chest height.',
        press_and_hold: 'Press your arms straight out and hold for a few seconds.',
        resist_rotation: 'Resist the pull; your torso does not turn.',
      },
      mistake: {
        letting_the_torso_turn: 'Letting your torso turn.',
        band_slipping: 'Letting the band shift or slip.',
      },
      safety: {
        check_anchor_point: 'Check the anchor will hold before you pull.',
      },
    },
    cable_crunch: {
      name: 'Cable crunch',
      cue: {
        hips_stay_fixed: 'Hips stay still; only the torso curls.',
        curl_the_spine: 'Curl your spine, bringing your ribs toward your pelvis.',
        exhale_at_bottom: 'Breathe out at the bottom.',
      },
      mistake: {
        pulling_with_arms: 'Pulling with your arms.',
        hinging_at_hips: 'Hinging at the hips instead of curling the torso.',
      },
      safety: {
        check_pin_and_clips: 'Check the pin is fully in and the attachment is clipped on properly.',
      },
    },
    machine_ab_crunch: {
      name: 'Machine ab crunch',
      cue: {
        align_pivot_with_ribs: 'Set the machine pivot level with your lower ribs.',
        curl_not_hinge: 'Curl your torso; do not fold at the hips.',
        slow_return: 'Return slowly to the start position.',
      },
      mistake: {
        using_momentum: 'Using momentum.',
        partial_range: 'Cutting the range short.',
      },
      safety: {
        adjust_seat_first: 'Set the seat and supports before the first rep.',
      },
    },
    dumbbell_biceps_curl: {
      name: 'Dumbbell biceps curl',
      cue: {
        elbows_at_sides: 'Elbows glued to your sides; they do not move.',
        full_range: 'Use the full range of motion; do not cut it short at either end.',
        slow_lowering: 'Lower slowly, braking the weight.',
      },
      mistake: {
        swinging_the_torso: 'Swinging your torso to lift the weight.',
        elbows_drifting_forward: 'Letting your elbows drift forward on the way up.',
      },
      safety: {
        start_light: 'Start light until you own the technique.',
      },
    },
    barbell_biceps_curl: {
      name: 'Barbell biceps curl',
      cue: {
        elbows_pinned: 'Elbows pinned in place; only the forearm moves.',
        no_torso_swing: 'Torso stays still; no swinging.',
        controlled_tempo: 'Controlled tempo in both directions, no jerking.',
      },
      mistake: {
        using_the_lower_back: 'Helping with your lower back.',
        half_range: 'Doing only half the range.',
      },
      safety: {
        stop_if_elbow_pain: 'Stop if you feel pain in your elbow. If it persists, check with a professional.',
      },
    },
    hammer_curl: {
      name: 'Hammer curl',
      cue: {
        neutral_grip: 'Palms facing each other for the whole movement.',
        elbows_at_sides: 'Elbows glued to your sides; they do not move.',
        slow_lowering: 'Lower slowly, braking the weight.',
      },
      mistake: {
        swinging_the_torso: 'Swinging your torso to lift the weight.',
        shrugging: 'Shrugging your shoulders up to your ears.',
      },
      safety: {
        start_light: 'Start light until you own the technique.',
      },
    },
    cable_biceps_curl: {
      name: 'Cable biceps curl',
      cue: {
        constant_tension: 'Keep tension on the cable through the whole range, with no rest at the end.',
        elbows_fixed: 'Elbows fixed in the same spot for the whole set.',
        full_range: 'Use the full range of motion; do not cut it short at either end.',
      },
      mistake: {
        leaning_back: 'Leaning back.',
        using_momentum: 'Using momentum.',
      },
      safety: {
        check_pin_and_clips: 'Check the pin is fully in and the attachment is clipped on properly.',
      },
    },
    band_biceps_curl: {
      name: 'Band biceps curl',
      cue: {
        band_under_feet: 'Stand on the band with both feet to pin it down.',
        elbows_at_sides: 'Elbows glued to your sides; they do not move.',
        slow_return: 'Return slowly to the start position.',
      },
      mistake: {
        band_slipping: 'Letting the band shift or slip.',
        half_range: 'Doing only half the range.',
      },
      safety: {
        check_band_wear: 'Inspect the band: if it has cracks or nicks, do not use it.',
      },
    },
    triceps_pushdown_cable: {
      name: 'Cable triceps pushdown',
      cue: {
        elbows_pinned_to_ribs: 'Elbows pinned to your ribs for the whole set.',
        extend_fully: 'Straighten your arms fully at the bottom.',
        slow_return: 'Return slowly to the start position.',
      },
      mistake: {
        elbows_flaring_out: 'Flaring your elbows out.',
        leaning_over_the_bar: 'Leaning your body over the bar.',
      },
      safety: {
        check_pin_and_clips: 'Check the pin is fully in and the attachment is clipped on properly.',
      },
    },
    band_triceps_pushdown: {
      name: 'Band triceps pushdown',
      cue: {
        anchor_overhead: 'Anchor the band overhead on a fixed point.',
        elbows_pinned: 'Elbows pinned in place; only the forearm moves.',
        full_extension: 'Straighten the arm completely at the end of the rep.',
      },
      mistake: {
        band_slipping: 'Letting the band shift or slip.',
        elbows_flaring_out: 'Flaring your elbows out.',
      },
      safety: {
        check_anchor_point: 'Check the anchor will hold before you pull.',
      },
    },
    overhead_triceps_extension_dumbbell: {
      name: 'Dumbbell overhead triceps extension',
      cue: {
        elbows_close_to_head: 'Elbows close to your head, pointing at the ceiling.',
        ribs_down: 'Ribs down: no arching through the lower back.',
        controlled_descent: 'Lower under control, taking about two seconds.',
      },
      mistake: {
        elbows_flaring_out: 'Flaring your elbows out.',
        arching_the_back: 'Arching your back.',
      },
      safety: {
        start_light: 'Start light until you own the technique.',
        stop_if_elbow_pain: 'Stop if you feel pain in your elbow. If it persists, check with a professional.',
      },
    },
    skull_crusher: {
      name: 'Skull crusher',
      cue: {
        elbows_stay_still: 'Elbows do not move; only the forearm goes down and up.',
        lower_behind_forehead: 'Lower the bar to just behind your forehead.',
        no_lockout_slam: 'Do not slam the joint into lockout at the end of the rep.',
      },
      mistake: {
        elbows_drifting: 'Letting your elbows drift.',
        bouncing_the_bar: 'Bouncing the bar at the bottom.',
      },
      safety: {
        use_spotter_or_safeties: 'Use safety stops or ask someone to spot you.',
        stop_if_elbow_pain: 'Stop if you feel pain in your elbow. If it persists, check with a professional.',
      },
    },
    lateral_raise_dumbbell: {
      name: 'Dumbbell lateral raise',
      cue: {
        slight_elbow_bend: 'Elbows slightly bent and fixed in that position.',
        lead_with_elbows: 'Lead the raise with your elbows, not your hands.',
        stop_at_shoulder_height: 'Raise to shoulder height and no higher.',
      },
      mistake: {
        shrugging: 'Shrugging your shoulders up to your ears.',
        swinging_the_weights: 'Swinging the dumbbells.',
      },
      safety: {
        keep_load_light: 'Keep the weight light; technique matters here.',
      },
    },
    band_lateral_raise: {
      name: 'Band lateral raise',
      cue: {
        band_under_feet: 'Stand on the band with both feet to pin it down.',
        lead_with_elbows: 'Lead the raise with your elbows, not your hands.',
        slow_return: 'Return slowly to the start position.',
      },
      mistake: {
        shrugging: 'Shrugging your shoulders up to your ears.',
        band_slipping: 'Letting the band shift or slip.',
      },
      safety: {
        check_band_wear: 'Inspect the band: if it has cracks or nicks, do not use it.',
      },
    },
    rear_delt_fly_dumbbell: {
      name: 'Dumbbell rear delt fly',
      cue: {
        hinge_forward: 'Hinge at the hips until your torso is nearly parallel to the floor.',
        thumbs_slightly_down: 'Thumbs pointing slightly down.',
        squeeze_rear_delts: 'Squeeze the back of your shoulders at the end.',
      },
      mistake: {
        using_too_much_weight: 'Using too much weight.',
        rowing_instead_of_flying: 'Turning it into a row by bending your elbows.',
      },
      safety: {
        keep_load_light: 'Keep the weight light; technique matters here.',
      },
    },
    prone_y_t_raise: {
      name: 'Prone Y-T raise',
      cue: {
        lie_face_down: 'Lie face down on a bench or the floor.',
        thumbs_up: 'Thumbs pointing at the ceiling.',
        lift_from_the_blades: 'Lift by squeezing your shoulder blades, not by shrugging.',
      },
      mistake: {
        shrugging: 'Shrugging your shoulders up to your ears.',
        lifting_the_head: 'Lifting your head.',
      },
      safety: {
        keep_range_comfortable: 'Move only within a comfortable range.',
      },
    },
    dumbbell_chest_fly: {
      name: 'Dumbbell chest fly',
      cue: {
        slight_elbow_bend: 'Elbows slightly bent and fixed in that position.',
        wide_arc: 'Open your arms in a wide arc.',
        stop_at_chest_level: 'Stop the dumbbells at chest level.',
      },
      mistake: {
        going_too_deep: 'Going deeper than your shoulders tolerate.',
        turning_it_into_a_press: 'Turning it into a press by bending your elbows.',
      },
      safety: {
        start_light: 'Start light until you own the technique.',
        stop_if_shoulder_pain: 'Stop if you feel pain in your shoulder. If it persists, check with a professional.',
      },
    },
    cable_chest_fly: {
      name: 'Cable chest fly',
      cue: {
        staggered_stance: 'One foot forward for a stable base.',
        constant_tension: 'Keep tension on the cable through the whole range, with no rest at the end.',
        squeeze_at_the_front: 'Bring your hands together in front and squeeze your chest.',
      },
      mistake: {
        bending_the_elbows_too_much: 'Bending your elbows too much during the rep.',
        leaning_forward: 'Leaning your torso too far forward.',
      },
      safety: {
        check_pin_and_clips: 'Check the pin is fully in and the attachment is clipped on properly.',
      },
    },
    leg_extension_machine: {
      name: 'Leg extension machine',
      cue: {
        align_knee_with_pivot: 'Line your knee up with the machine pivot before you start.',
        extend_smoothly: 'Straighten your legs smoothly, without slamming.',
        slow_return: 'Return slowly to the start position.',
      },
      mistake: {
        slamming_into_extension: 'Slamming into full extension.',
        partial_range: 'Cutting the range short.',
      },
      safety: {
        adjust_seat_first: 'Set the seat and supports before the first rep.',
        stop_if_knee_pain: 'Stop if you feel pain in your knee. If it persists, check with a professional.',
      },
    },
    leg_curl_machine: {
      name: 'Leg curl machine',
      cue: {
        align_knee_with_pivot: 'Line your knee up with the machine pivot before you start.',
        curl_fully: 'Curl until your heel comes close to your glutes.',
        slow_return: 'Return slowly to the start position.',
      },
      mistake: {
        lifting_the_hips: 'Lifting your hips off the bench.',
        partial_range: 'Cutting the range short.',
      },
      safety: {
        adjust_seat_first: 'Set the seat and supports before the first rep.',
      },
    },
    nordic_hamstring_curl: {
      name: 'Nordic hamstring curl',
      cue: {
        anchor_the_ankles: 'Secure your ankles under a stable support or have someone hold them.',
        lower_as_slowly_as_possible: 'Lower your torso as slowly as you possibly can.',
        hips_extended: 'Hips extended: your body forms a straight line from knees to shoulders.',
      },
      mistake: {
        bending_at_the_hips: 'Folding at the hips instead of keeping them extended.',
        dropping_too_fast: 'Dropping too fast.',
      },
      safety: {
        use_hands_to_catch: 'Keep your hands ready to catch yourself.',
        expect_soreness_first_weeks: 'Heavy soreness at the start is normal; begin with just a few reps.',
      },
    },
    standing_calf_raise: {
      name: 'Standing calf raise',
      cue: {
        full_stretch_at_bottom: 'Let your heel drop below the step until you feel the stretch.',
        pause_at_top: 'Hold for a second at the top.',
        slow_tempo: 'Slow tempo through the whole range.',
      },
      mistake: {
        bouncing: 'Bouncing instead of controlling.',
        short_range: 'Cutting the range short.',
      },
      safety: {
        hold_support_if_needed: 'If you lose balance, hold on to something stable.',
      },
    },
    dumbbell_calf_raise: {
      name: 'Dumbbell calf raise',
      cue: {
        weights_at_sides: 'Weights at your sides, arms straight.',
        full_range: 'Use the full range of motion; do not cut it short at either end.',
        pause_at_top: 'Hold for a second at the top.',
      },
      mistake: {
        bouncing: 'Bouncing instead of controlling.',
        short_range: 'Cutting the range short.',
      },
      safety: {
        hold_support_if_needed: 'If you lose balance, hold on to something stable.',
      },
    },
    calf_raise_machine: {
      name: 'Calf raise machine',
      cue: {
        shoulders_under_pads: 'Shoulders set firmly under the pads.',
        full_stretch: 'Lower your heel until you feel a full stretch in the calf.',
        controlled_tempo: 'Controlled tempo in both directions, no jerking.',
      },
      mistake: {
        bouncing: 'Bouncing instead of controlling.',
        locking_the_knees_hard: 'Locking your knees hard.',
      },
      safety: {
        adjust_seat_first: 'Set the seat and supports before the first rep.',
      },
    },
    dumbbell_shrug: {
      name: 'Dumbbell shrug',
      cue: {
        straight_up_and_down: 'Shrug straight up toward your ears and straight back down.',
        pause_at_top: 'Hold for a second at the top.',
        no_rolling: 'No rolling the shoulders: straight up and down only.',
      },
      mistake: {
        rolling_the_shoulders: 'Rolling your shoulders in circles.',
        using_the_lower_back: 'Helping with your lower back.',
      },
      safety: {
        stop_if_neck_discomfort: 'Stop if you feel discomfort in your neck. If it persists, check with a professional.',
      },
    },
    wrist_curl_dumbbell: {
      name: 'Dumbbell wrist curl',
      cue: {
        forearm_supported: 'Forearm resting on your thigh or the bench, wrist hanging off the edge.',
        small_controlled_range: 'Small, controlled range.',
        light_load: 'Use a light load; this exercise works with little weight.',
      },
      mistake: {
        using_too_much_weight: 'Using too much weight.',
        jerking: 'Jerking through the movement.',
      },
      safety: {
        stop_if_wrist_pain: 'Stop if you feel pain in your wrist. If it persists, check with a professional.',
      },
    },
    glute_kickback_band: {
      name: 'Band glute kickback',
      cue: {
        flat_back: 'Back flat and neutral, never rounded.',
        drive_heel_back: 'Drive your heel back with the knee bent.',
        squeeze_at_top: 'Squeeze your glutes hard at the top.',
      },
      mistake: {
        arching_the_lower_back: 'Arching your lower back.',
        swinging_the_leg: 'Swinging the leg with momentum.',
      },
      safety: {
        check_band_wear: 'Inspect the band: if it has cracks or nicks, do not use it.',
      },
    },
    hip_abduction_band: {
      name: 'Band hip abduction',
      cue: {
        band_above_knees: 'Place the band just above your knees.',
        open_without_rocking: 'Open your knees without rocking your torso.',
        slow_return: 'Return slowly to the start position.',
      },
      mistake: {
        rocking_the_torso: 'Rocking your torso.',
        band_too_stiff: 'Using a band that is too stiff.',
      },
      safety: {
        check_band_wear: 'Inspect the band: if it has cracks or nicks, do not use it.',
      },
    },
    stationary_bike_steady: {
      name: 'Stationary bike, steady pace',
      cue: {
        adjust_saddle_height: 'Set the saddle so your knee is almost straight at the bottom of the pedal stroke.',
        steady_cadence: 'Steady cadence for the whole session.',
        conversational_pace: 'A pace at which you could hold a conversation.',
      },
      mistake: {
        saddle_too_low: 'Saddle too low.',
        gripping_too_tight: 'Gripping the handlebars too tightly.',
      },
      safety: {
        adjust_seat_first: 'Set the seat and supports before the first rep.',
      },
    },
    stationary_bike_intervals: {
      name: 'Stationary bike intervals',
      cue: {
        warm_up_first: 'Warm up for a few minutes at an easy pace first.',
        hard_effort_then_easy: 'Alternate hard efforts with easy stretches.',
        finish_with_easy_spin: 'Finish with a few minutes of easy spinning.',
      },
      mistake: {
        skipping_the_warm_up: 'Skipping the warm-up.',
        intervals_too_long: 'Intervals that are too long.',
      },
      safety: {
        build_intensity_gradually: 'Build intensity gradually over the weeks.',
      },
    },
    treadmill_walk_incline: {
      name: 'Incline treadmill walk',
      cue: {
        no_holding_the_rails: 'No holding the rails; arms swing freely.',
        upright_posture: 'Upright posture.',
        steady_breathing: 'Breathe steadily.',
      },
      mistake: {
        leaning_on_the_handles: 'Leaning on the handles.',
        incline_too_steep_too_soon: 'Raising the incline too soon.',
      },
      safety: {
        use_the_safety_clip: 'Clip the treadmill safety cord to your clothing.',
      },
    },
    treadmill_run_intervals: {
      name: 'Treadmill run intervals',
      cue: {
        warm_up_first: 'Warm up for a few minutes at an easy pace first.',
        step_on_at_speed: 'Step on only once the belt is at the right speed.',
        cool_down_walking: 'Finish with a few minutes of walking to bring your heart rate down.',
      },
      mistake: {
        skipping_the_warm_up: 'Skipping the warm-up.',
        jumping_on_at_full_speed: 'Jumping onto the belt at full speed.',
      },
      safety: {
        use_the_safety_clip: 'Clip the treadmill safety cord to your clothing.',
      },
    },
    rowing_machine_steady: {
      name: 'Rowing machine, steady pace',
      cue: {
        legs_then_hips_then_arms: 'Stroke order: legs, then hips, then arms.',
        flat_back: 'Back flat and neutral, never rounded.',
        steady_rate: 'Steady stroke rate.',
      },
      mistake: {
        pulling_with_arms_first: 'Starting the stroke with your arms.',
        rounding_the_back: 'Hunching your back.',
      },
      safety: {
        set_footstraps_first: 'Fasten the foot straps before you start.',
      },
    },
    rowing_machine_intervals: {
      name: 'Rowing machine intervals',
      cue: {
        warm_up_first: 'Warm up for a few minutes at an easy pace first.',
        drive_with_the_legs: 'Push hard with your legs on every stroke.',
        easy_recovery_strokes: 'Between intervals, row easy to recover.',
      },
      mistake: {
        rushing_the_recovery: 'Cutting the recovery short.',
        rounding_the_back: 'Hunching your back.',
      },
      safety: {
        build_intensity_gradually: 'Build intensity gradually over the weeks.',
      },
    },
    jumping_jacks: {
      name: 'Jumping jacks',
      cue: {
        soft_knees: 'Knees slightly bent, never locked.',
        full_arm_range: 'Arms go all the way up until your hands meet overhead.',
        steady_rhythm: 'Steady rhythm.',
      },
      mistake: {
        landing_stiff: 'Landing with stiff legs.',
        half_range: 'Doing only half the range.',
      },
      safety: {
        land_on_soft_surface: 'Do it on a surface with some give.',
      },
    },
    high_knees: {
      name: 'High knees',
      cue: {
        knees_to_hip_height: 'Bring your knees up to hip height.',
        stay_on_the_balls_of_feet: 'Stay on the balls of your feet.',
        arms_driving: 'Drive your arms as if you were running.',
      },
      mistake: {
        leaning_back: 'Leaning back.',
        low_knees: 'Knees too low.',
      },
      safety: {
        land_on_soft_surface: 'Do it on a surface with some give.',
      },
    },
    jump_rope: {
      name: 'Jump rope',
      cue: {
        small_jumps: 'Small jumps, just enough for the rope to pass.',
        wrists_do_the_work: 'The turn comes from the wrists, not the arms.',
        stay_relaxed: 'Shoulders relaxed.',
      },
      mistake: {
        jumping_too_high: 'Jumping too high.',
        using_the_whole_arm: 'Turning the rope with your whole arm.',
      },
      safety: {
        land_on_soft_surface: 'Do it on a surface with some give.',
      },
    },
    burpee: {
      name: 'Burpees',
      cue: {
        step_back_to_regress: 'If it is too much, step your feet back instead of jumping.',
        chest_to_floor_optional: 'If you own the push-up, take your chest to the floor; if not, plant your hands and move on.',
        stand_fully_each_rep: 'Stand up fully on every rep.',
      },
      mistake: {
        sagging_hips_on_the_push_up: 'Letting your hips sag on the push-up.',
        rushing_and_losing_form: 'Speeding up and losing form.',
      },
      safety: {
        step_instead_of_jump_if_needed: 'If you tire, swap the jumps for steps.',
      },
    },
    brisk_walk: {
      name: 'Brisk walk',
      cue: {
        upright_posture: 'Upright posture.',
        brisk_but_conversational: 'Brisk pace, but one that still lets you talk.',
        consistent_duration: 'Keep the duration similar each time and build it up gradually.',
      },
      mistake: {
        pace_too_slow_to_count: 'Going so slowly it does not count.',
        skipping_footwear: 'Walking in unsuitable footwear.',
      },
      safety: {
        choose_a_safe_route: 'Choose a well-lit route with good footing.',
      },
    },
    stair_climb: {
      name: 'Stair climb',
      cue: {
        whole_foot_on_step: 'Place your whole foot on each step.',
        upright_posture: 'Upright posture.',
        use_the_rail_going_down: 'Use the handrail on the way down.',
      },
      mistake: {
        skipping_steps_when_tired: 'Skipping steps when tired.',
        rushing_the_descent: 'Rushing the way down.',
      },
      safety: {
        use_the_rail_if_unsteady: 'If you feel unsteady, use the handrail.',
      },
    },
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
      body: 'Body',
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
    drinkWater: 'A glass of water. Your body will thank you.',
    moveAround: "You've been still for a while: stand up and walk for two minutes.",
    bedtime: 'Time to wind down. Good sleep is part of the plan.',
  },

  body: {
    report: 'Weekly body report',
    logToday: "Today's entry",
    subtitle:
      'Measure yourself once a week, same time and same conditions. Two entries are enough to compare.',
    photoToday: "Today's photo",
    takePhoto: 'Take photo',
    pickPhoto: 'Choose from gallery',
    save: 'Save entry',
    saved: 'Entry saved.',
    emptyForm: 'Enter at least one measurement or a photo.',
    history: 'History',
    noPhotos: 'No progress photos yet. Take the first one today and compare it in four weeks.',
    deletePhoto: 'Delete photo',
    deletePhotoConfirm: 'This is permanent. There is no trash bin.',
    weeksCompared: 'Compared with {{n}} weeks ago',
    guidelines: 'Guidelines for this week',
    supplements: 'Supplements you could consider',
    supplementsNote:
      'These are general categories with reasonable evidence, not a prescription. If you take medication or have a condition, check with a professional first.',
    supplementsLink: 'See natural supplements',
    trend: {
      insufficient: 'Not enough data yet',
      on_track: 'On track',
      stalled: 'Stalled',
      too_fast: 'Too fast',
      off_track: 'Drifting off track',
    },
    guideline: {
      keepMeasuring: 'Keep measuring every week; two entries 7 days apart are enough to compare.',
      keepGoing: "What you're doing works: change nothing this week.",
      proteinEachMeal: 'Include a protein source in every meal.',
      checkPortions: 'Check your portions: weigh what you eat for three days in a row.',
      dailySteps: 'Add steps: a 20–30 minute walk a day makes the difference.',
      sleepSeven: 'Prioritise 7–9 hours of sleep: no sleep, no progress.',
      slowDown: "You're going faster than recommended: raise calories a little and keep protein up.",
      keepStrength: 'Keep strength training to hold on to muscle.',
      logHonestly: 'Log everything you eat, snacks and drinks included, for one week.',
      progressiveOverload: 'Add weight or reps each week on your main lifts.',
      eatSlightSurplus: 'Eat a bit more: 150–250 extra kcal a day, mostly carbs around training.',
      trimSurplus: 'Trim the surplus a little: 150–200 kcal less per day is enough.',
    },
    supplement: {
      protein: "Protein powder, to reach your daily target when food alone doesn't get you there.",
      creatine: 'Creatine monohydrate, the most studied for strength and muscle mass.',
      omega3: 'Omega-3 (EPA/DHA), if you eat little oily fish.',
      vitaminD: 'Vitamin D, especially with little sun exposure.',
      magnesium: 'Magnesium, useful for rest and recovery.',
      electrolytes: 'Electrolytes, if you sweat a lot or train in the heat.',
    },
    caution: {
      notMedical: 'These guidelines are educational and general; they do not diagnose or replace a health professional.',
      tooFast: 'Losing or gaining weight very fast usually backfires. If you feel drained or dizzy, see a professional.',
      noSupplements: 'Based on your health screening answers, any supplement should be decided by a professional.',
    },
  },
  scan: {
    title: 'Scan food',
    subtitle: "Take a photo of your plate and we'll estimate what's on it and the calories. Then you review and correct.",
    takePhoto: 'Take photo',
    pickPhoto: 'Choose from gallery',
    scanning: 'Analysing the photo…',
    unavailableDemo: "Scanning needs the app server. It's not available in demo mode, but your photo is saved.",
    failed: "Couldn't analyse the photo. Try with more light and the whole plate in view.",
    retry: 'Another photo',
    results: 'What we saw',
    estimateNote: "It's a photo estimate: check the grams before saving.",
    noItems: 'No food was recognised in the photo.',
    grams: 'Grams',
    remove: 'Remove',
    total: 'Total',
    addToLog: 'Add to log',
    mealType: 'Which meal is it?',
    confidenceLow: 'Low confidence on this item: double-check it.',
    photoSaved: 'Photo saved.',
    addManually: 'Add manually',
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
