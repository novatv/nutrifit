/**
 * Español — idioma de referencia. Debe estar siempre completo:
 * el resto de idiomas se compara contra estas claves.
 */
export const es = {
  common: {
    continue: 'Continuar',
    back: 'Atrás',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    done: 'Hecho',
    retry: 'Reintentar',
    loading: 'Cargando…',
    search: 'Buscar',
    add: 'Añadir',
    skip: 'Saltar',
    today: 'Hoy',
    week: 'Semana',
    day: 'Día',
    of: 'de',
    optional: 'opcional',
    minutes: '{{n}} min',
    why: '¿Por qué?',
  },

  disclaimer: {
    general:
      'Esta aplicación proporciona información general de nutrición y actividad física y no sustituye el consejo de un profesional sanitario.',
    estimate: 'Es una estimación inicial, no una cifra exacta. Se ajusta según tu progreso.',
  },

  tabs: {
    today: 'Hoy',
    plan: 'Plan',
    log: 'Registrar',
    progress: 'Progreso',
    profile: 'Perfil',
  },

  auth: {
    signInTitle: 'Bienvenido de nuevo',
    signUpTitle: 'Crea tu cuenta',
    email: 'Email',
    password: 'Contraseña',
    signIn: 'Entrar',
    signUp: 'Crear cuenta',
    signOut: 'Cerrar sesión',
    forgot: '¿Olvidaste la contraseña?',
    resetSent: 'Te enviamos un correo para restablecerla.',
    noAccount: '¿Sin cuenta?',
    hasAccount: '¿Ya tienes cuenta?',
    deleteAccount: 'Eliminar cuenta',
    deleteAccountWarning:
      'Se borrarán tu perfil, tus registros y tus fotos. No se puede deshacer.',
    errorInvalid: 'Email o contraseña incorrectos.',
    errorNetwork: 'No hay conexión. Inténtalo otra vez.',
  },

  onboarding: {
    welcomeTitle: 'Tu plan de 12 semanas',
    welcomeBody:
      'Unas preguntas rápidas y creamos tu nutrición y tu entrenamiento a medida.',
    stepOf: 'Paso {{current}} de {{total}}',
    birthDateHint: 'Formato AAAA-MM-DD',
    daysPerWeek: '{{n}} días',
    mealsPerDay: '{{n}} comidas',
    errors: {
      required: 'Contesta esto para seguir.',
      birthDate: 'Revisa la fecha: no parece correcta.',
    },

    goalTitle: '¿Cuál es tu objetivo?',
    goal: {
      lose_fat: 'Perder grasa',
      gain_muscle: 'Ganar músculo',
      recomp: 'Recomposición corporal',
      maintain: 'Mantener peso',
      fitness: 'Mejorar condición física',
      habits: 'Crear hábitos saludables',
    },

    dataTitle: 'Tus datos',
    birthDate: 'Fecha de nacimiento',
    sexTitle: 'Sexo',
    sexWhy:
      'Lo usamos solo para estimar tu gasto energético, porque las fórmulas lo necesitan. No aparece en ningún otro sitio.',
    sex: { male: 'Hombre', female: 'Mujer', unspecified: 'Prefiero no decirlo' },
    height: 'Altura',
    weight: 'Peso actual',
    targetWeight: 'Peso objetivo',

    activityTitle: '¿Cuánto te mueves normalmente?',
    activity: {
      sedentary: 'Sedentaria',
      light: 'Ligera',
      moderate: 'Moderada',
      high: 'Alta',
      very_high: 'Muy alta',
    },

    experienceTitle: '¿Cuánta experiencia entrenando?',
    experience: {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
    },

    availabilityTitle: '¿Cuántos días por semana?',
    sessionTitle: '¿Cuánto tiempo por sesión?',
    minutes: '{{n}} min',

    locationTitle: '¿Dónde vas a entrenar?',
    location: { gym: 'Gimnasio', home: 'Casa', both: 'Ambos', outdoor: 'Exterior' },

    equipmentTitle: '¿Qué equipo tienes?',
    equipment: {
      none: 'Ninguno',
      dumbbells: 'Mancuernas',
      bands: 'Bandas',
      barbell: 'Barra',
      plates: 'Discos',
      bench: 'Banco',
      rack: 'Rack',
      cables: 'Poleas',
      machines: 'Máquinas',
      kettlebell: 'Kettlebell',
      bike: 'Bicicleta',
      treadmill: 'Cinta',
      rower: 'Remo',
    },

    dietTitle: '¿Cómo comes?',
    diet: {
      omnivore: 'Omnívora',
      vegetarian: 'Vegetariana',
      vegan: 'Vegana',
      pescatarian: 'Pescetariana',
    },

    allergensTitle: 'Alergias e intolerancias',
    allergen: {
      gluten: 'Gluten',
      lactose: 'Lactosa',
      tree_nuts: 'Frutos secos',
      peanut: 'Cacahuete',
      egg: 'Huevo',
      fish: 'Pescado',
      shellfish: 'Marisco',
      soy: 'Soja',
    },

    dislikesTitle: '¿Algo que no te guste?',
    dislikesHint: 'Lo evitaremos al montar tus comidas.',

    mealsTitle: '¿Cuántas comidas al día?',
    budgetTitle: 'Presupuesto',
    budget: { low: 'Económico', medium: 'Medio', flexible: 'Flexible' },

    cookingTitle: '¿Cuánto tiempo para cocinar?',
    cooking: { minimal: 'El mínimo', normal: 'Normal', enjoys: 'Me gusta cocinar' },

    screeningTitle: 'Antes de empezar',
    screeningHint: 'Esto nos ayuda a no proponerte algo que no te convenga.',
    screening: {
      pregnantOrBreastfeeding: 'Estoy embarazada o en período de lactancia',
      eatingDisorderCurrent: 'Tengo un trastorno de la conducta alimentaria actualmente',
      majorInjury: 'Tengo una lesión importante que me limita al entrenar',
      medicalNutritionTherapy: 'Sigo una pauta nutricional indicada por un profesional sanitario',
      exerciseContraindicated: 'Un profesional sanitario me ha desaconsejado hacer ejercicio',
      none: 'Ninguna de las anteriores',
    },

    summaryTitle: 'Resumen',
    createPlan: 'Crear mi plan de 12 semanas',

    generating: {
      analyzing: 'Analizando tu objetivo…',
      targets: 'Calculando objetivos iniciales…',
      training: 'Preparando entrenamientos…',
      nutrition: 'Organizando nutrición…',
      weeks: 'Creando tus primeras semanas…',
    },
    ready: {
      title: 'Tu plan está listo',
      weeks: '12 semanas',
      sessions: '{{n}} entrenamientos/semana',
      kcal: '~{{n}} kcal objetivo inicial',
      protein: '{{n}} g proteína',
      steps: '{{n}} pasos',
      cta: 'Ver mi semana',
    },
  },

  safety: {
    under18:
      'Esta versión está diseñada para personas de 18 años o más, así que no generamos un plan automático.',
    pregnancy:
      'Durante el embarazo y la lactancia las necesidades cambian mucho. Consulta con un profesional sanitario antes de seguir un plan automatizado.',
    eatingDisorder:
      'Un plan automático de calorías no es lo adecuado ahora mismo. Busca acompañamiento de un profesional cualificado.',
    medicalNutrition:
      'Ya sigues una pauta indicada por un profesional. No vamos a sustituirla con un plan automático.',
    exerciseContraindicated:
      'Si te han desaconsejado hacer ejercicio, consúltalo antes de usar un plan automatizado.',
    majorInjury:
      'Con una lesión importante, adapta o consulta antes. Evitaremos proponerte progresiones agresivas.',
    implausibleInput: 'Revisa los datos: la altura o el peso introducidos no parecen correctos.',
    aggressiveRate:
      'Ese objetivo necesitaría un ritmo más agresivo del que esta aplicación genera automáticamente. Mantendremos un ritmo gradual y tardará algo más.',
    energyFloor:
      'Hemos ajustado tus calorías al mínimo que consideramos seguro en lugar de bajar más.',
    seeProfessional: 'Hablar con un profesional',
    continueAnyway: 'Entendido, continuar',
  },

  today: {
    greetingMorning: 'Buenos días, {{name}}',
    greetingAfternoon: 'Buenas tardes, {{name}}',
    greetingEvening: 'Buenas noches, {{name}}',
    weekDay: 'Semana {{week}} · Día {{day}}',
    dailyGoal: 'Objetivo del día',
    calories: 'Calorías',
    protein: 'Proteína',
    carbs: 'Carbohidratos',
    fat: 'Grasa',
    fiber: 'Fibra',
    steps: 'Pasos',
    water: 'Agua',
    todayWorkout: 'Entrenamiento de hoy',
    startWorkout: 'Empezar',
    restDay: 'Hoy toca descanso',
    nextMeal: 'Próxima comida',
    logBreakfast: 'Registrar desayuno',
    habits: 'Hábitos',
    streak: '{{n}} días seguidos',
    adherenceWeek: 'Adherencia esta semana',
  },

  plan: {
    title: 'Tu plan',
    month: 'Mes {{n}}',
    weekN: 'Semana {{n}}',
    phase: {
      adaptation: 'Adaptación y técnica',
      progression: 'Progresión',
      consolidation: 'Consolidación',
      deload: 'Descarga',
    },
    status: { pending: 'Pendiente', current: 'En curso', completed: 'Completada' },
    rest: 'Descanso',
    checkin: 'Check-in',
  },

  log: {
    title: 'Registrar',
    breakfast: 'Desayuno',
    lunch: 'Almuerzo',
    dinner: 'Cena',
    snacks: 'Snacks',
    addFood: 'Añadir alimento',
    searchFood: 'Buscar alimento',
    recent: 'Recientes',
    favorites: 'Favoritos',
    recipes: 'Recetas',
    savedMeals: 'Comidas guardadas',
    manual: 'Introducir manualmente',
    barcode: 'Código de barras',
    repeatYesterday: 'Repetir {{meal}} de ayer',
    copyMeal: 'Copiar comida',
    saveAsMeal: 'Guardar como comida',
    grams: 'gramos',
    servings: 'raciones',
    swap: 'Cambiar',
    foodName: 'Nombre del alimento',
    noResults: 'Ningún alimento coincide con esa búsqueda.',
    remaining: 'restante',
    sugar: 'Azúcar',
    sodium: 'Sodio',
    perHundredGrams: 'por 100 g',
    copyMealTo: '¿A qué comida?',
    orientativeHint: 'La fibra, el azúcar y el sodio son orientativos, no una medición precisa.',
  },

  workout: {
    day: {
      full_body_a: 'Cuerpo completo A', full_body_b: 'Cuerpo completo B', full_body_c: 'Cuerpo completo C',
      upper: 'Tren superior', lower: 'Tren inferior', push: 'Empuje', pull: 'Tirón', legs: 'Pierna',
    },
    note: { deload_week: 'Semana de descarga: menos volumen para llegar fresco a la siguiente.' },
    exerciseOf: 'Ejercicio {{current}}/{{total}}',
    target: 'Objetivo',
    lastTime: 'Última vez',
    set: 'Serie',
    weight: 'Peso',
    reps: 'Reps',
    rir: 'RIR',
    rest: 'Descanso',
    nextExercise: 'Siguiente ejercicio',
    swapExercise: 'Cambiar ejercicio',
    finish: 'Finalizar',
    notes: 'Notas',
    completed: 'Entrenamiento completado',
    duration: 'Duración',
    volume: 'Volumen',
    exercises: 'Ejercicios',
    prs: 'PR',
    howWasIt: '¿Cómo te sentiste?',
    difficulty: {
      very_easy: 'Muy fácil',
      good: 'Bien',
      hard: 'Difícil',
      too_hard: 'Demasiado difícil',
    },
    painQuestion: '¿Notaste dolor o molestias?',
    painFollowUp:
      'Si el dolor es agudo o persiste, conviene que lo valore un profesional antes de seguir progresando.',
    offlineSaved: 'Sin conexión: guardamos tus series y las sincronizamos luego.',
  },

  progression: {
    reason: {
      no_history: 'Primera vez con este ejercicio: empieza cómodo y anota lo que levantes.',
      top_of_range_increase: 'Completaste todas las series arriba del rango. Puedes subir un poco.',
      add_reps_first: 'Antes de subir peso, gana repeticiones dentro del rango.',
      missed_once_hold: 'Se quedó corto una vez. Repite el mismo peso antes de subir.',
      repeated_misses_reduce: 'Varias sesiones sin llegar al rango. Baja algo el peso y reconstruye.',
      pain_reported_hold: 'Has indicado molestias, así que no proponemos subir carga.',
    },
    pr: {
      max_load: 'Más peso que nunca',
      max_reps_at_load: 'Más repeticiones con ese peso',
      session_volume: 'Tu mayor volumen en una sesión',
    },
  },

  training: {
    progression: { increase: 'Subir', hold: 'Mantener', deload: 'Descargar' },
    deload: { not_needed: 'No toca descarga todavía.' },
    pain: {
      consider_professional_review:
        'Si el dolor es agudo o persiste, conviene que lo valore un profesional antes de seguir progresando.',
    },
  },

  progress: {
    title: 'Progreso',
    tabs: {
      general: 'General',
      weight: 'Peso',
      measurements: 'Medidas',
      strength: 'Fuerza',
      nutrition: 'Nutrición',
      activity: 'Actividad',
    },
    trend: 'Tendencia',
    dailyPoints: 'Registros diarios',
    noData: 'Todavía no hay datos suficientes para ver una tendencia.',
    addWeight: 'Añadir peso',
    measurement: {
      weight: 'Peso',
      waist: 'Cintura',
      hip: 'Cadera',
      chest: 'Pecho',
      arm: 'Brazo',
      thigh: 'Muslo',
      bodyFat: 'Grasa corporal',
    },
    bodyFatHint: 'El porcentaje que introduzcas es una estimación, no una medición clínica.',
    photos: 'Fotos de progreso',
    photosPrivate: 'Tus fotos se guardan en almacenamiento privado. Puedes borrarlas cuando quieras.',
  },

  checkin: {
    title: 'Check-in semanal',
    subtitle: 'Una vez por semana repasamos cómo ha ido y ajustamos si hace falta.',
    weight: 'Peso actual',
    adherence: '¿Cómo llevaste la nutrición?',
    workouts: 'Entrenamientos completados',
    hunger: 'Hambre',
    energy: 'Energía',
    sleep: 'Sueño',
    difficulty: 'Dificultad',
    perceivedProgress: '¿Notas progreso?',
    submit: 'Enviar check-in',
    decision: {
      KEEP: 'Mantenemos el plan',
      ADJUST_NUTRITION: 'Ajustamos la nutrición',
      ADJUST_TRAINING: 'Ajustamos el entrenamiento',
      RECOVERY_WEEK: 'Toca una semana de recuperación',
      NEEDS_REVIEW: 'Conviene revisarlo con calma',
    },
    before: 'Antes',
    after: 'Ahora',
    reason: 'Razón',
    confirmChange: 'Aplicar el cambio',
    keepAsIs: 'Dejarlo como está',
    explain: {
      keepOnTrack:
        'Tu rendimiento está mejorando y tu tendencia está dentro del rango previsto. Esta semana mantenemos el plan.',
      singleDataPoint:
        'Una sola medición de peso no justifica cambiar el plan. Seguimos y lo revisamos la semana que viene.',
      lowAdherence:
        'La adherencia fue baja esta semana. Antes de tocar los números, probemos otra semana con el plan actual.',
      trendStalled:
        'Tu tendencia lleva varias semanas plana, así que bajamos ligeramente las calorías.',
      trendTooFast:
        'Estás bajando más rápido de lo recomendable, así que subimos un poco las calorías.',
      fatigueHigh:
        'Vienes con la energía baja y las sesiones muy duras. Esta semana bajamos el volumen para recuperar.',
    },
  },

  shopping: {
    title: 'Lista de compra',
    regenerate: 'Regenerar',
    addItem: 'Añadir producto',
    categories: {
      fruit: 'Frutas',
      vegetables: 'Verduras',
      meatFish: 'Carnes y pescados',
      plantProtein: 'Proteínas vegetales',
      dairy: 'Lácteos',
      grains: 'Cereales',
      pantry: 'Despensa',
      frozen: 'Congelados',
      other: 'Otros',
    },
  },

  settings: {
    title: 'Perfil',
    account: 'Cuenta',
    units: 'Unidades',
    metric: 'Métrico (kg, cm)',
    imperial: 'Imperial (lb, ft)',
    language: 'Idioma',
    appearance: 'Apariencia',
    appearanceSystem: 'Del sistema',
    appearanceLight: 'Claro',
    appearanceDark: 'Oscuro',
    notifications: 'Notificaciones',
    privacy: 'Privacidad y datos',
    privacyBody:
      'Tus datos de salud son sensibles. Guardamos lo mínimo necesario y puedes borrarlo cuando quieras.',
    exportData: 'Exportar mis datos',
    viewData: 'Ver mis datos',
    about: 'Acerca de',
  },

  notifications: {
    workoutReady: 'Tu entrenamiento está listo.',
    logDinner: 'Te queda registrar tu cena.',
    newWeek: 'Mañana empieza tu semana {{n}}.',
    checkinTime: 'Es hora de tu check-in semanal.',
  },

  states: {
    emptyTitle: 'Todavía no hay nada aquí',
    emptyBody: 'Cuando empieces a registrar, lo verás en esta pantalla.',
    errorTitle: 'Algo no ha ido bien',
    errorBody: 'No hemos podido cargar esta información.',
    offlineTitle: 'Sin conexión',
    offlineBody: 'Seguimos guardando lo que hagas y lo sincronizamos al volver.',
  },
} as const;

export type TranslationSchema = typeof es;
