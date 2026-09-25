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
    demoMode:
      'Modo demostración: no hay servidor conectado, así que la cuenta vive solo en este dispositivo y no se pueden enviar correos de recuperación. Cuando se conecte el servidor, el registro y la recuperación serán reales.',
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
    scanPhoto: 'Escanear foto',
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
    showHowTo: 'Ver cómo se hace',
    hideHowTo: 'Ocultar cómo se hace',
    howTo: 'Cómo hacerlo',
    mistakes: 'Errores comunes',
    safetyNotes: 'Seguridad',
    watchVideo: 'Ver vídeo de demostración',
    mediaCredit: 'Foto/vídeo: {{credit}}',
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

  /**
   * Ejercicios de la biblioteca (clave = slug en snake_case). Cada entrada
   * tiene nombre, instrucciones (cue), errores comunes (mistake) y notas de
   * seguridad (safety); los tokens los genera exerciseLibrary.ts.
   */
  exercise: {
    barbell_back_squat: {
      name: 'Sentadilla trasera con barra',
      cue: {
        brace_core: 'Coge aire y aprieta el abdomen como si fueras a recibir un golpe.',
        sit_between_hips: 'Baja entre las caderas, con las rodillas abiertas.',
        drive_midfoot: 'Empuja el suelo con todo el pie, con el peso en el centro.',
      },
      mistake: {
        knees_cave_in: 'Dejar que las rodillas se junten.',
        heels_lift: 'Levantar los talones del suelo.',
      },
      safety: {
        set_safety_bars: 'Coloca los topes de seguridad del rack justo por debajo de tu posición más baja.',
      },
    },
    barbell_front_squat: {
      name: 'Sentadilla frontal con barra',
      cue: {
        elbows_high: 'Codos altos y al frente para que la barra descanse sobre los hombros.',
        upright_torso: 'Tronco lo más vertical posible.',
        controlled_descent: 'Baja con control, en unos dos segundos.',
      },
      mistake: {
        elbows_drop: 'Dejar caer los codos.',
        heels_lift: 'Levantar los talones del suelo.',
      },
      safety: {
        set_safety_bars: 'Coloca los topes de seguridad del rack justo por debajo de tu posición más baja.',
        release_bar_forward: 'Si no puedes subir, suelta la barra hacia delante y apártate.',
      },
    },
    barbell_box_squat: {
      name: 'Sentadilla al cajón con barra',
      cue: {
        sit_back_to_box: 'Siéntate hacia atrás hasta tocar el cajón.',
        pause_no_relax: 'Pausa en el cajón sin relajar el tronco.',
        drive_up: 'Sube con fuerza desde el cajón, sin balancearte.',
      },
      mistake: {
        bounce_off_box: 'Rebotar en el cajón.',
        round_lower_back: 'Redondear la zona lumbar.',
      },
      safety: {
        set_safety_bars: 'Coloca los topes de seguridad del rack justo por debajo de tu posición más baja.',
      },
    },
    goblet_squat: {
      name: 'Sentadilla goblet',
      cue: {
        hold_close_to_chest: 'Sujeta el peso pegado al pecho, con los codos abajo.',
        elbows_inside_knees: 'Los codos bajan por dentro de las rodillas.',
        chest_tall: 'Pecho alto y mirada al frente.',
      },
      mistake: {
        rounding_back: 'Redondear la espalda.',
        partial_depth: 'No bajar lo suficiente.',
      },
      safety: {
        start_light: 'Empieza con poco peso hasta dominar la técnica.',
      },
    },
    dumbbell_squat: {
      name: 'Sentadilla con mancuernas',
      cue: {
        weights_at_sides: 'Peso a los lados, brazos estirados.',
        knees_track_toes: 'Las rodillas siguen la dirección de los pies.',
        full_range: 'Recorre todo el rango de movimiento, sin acortar arriba ni abajo.',
      },
      mistake: {
        leaning_forward: 'Inclinar el tronco hacia delante en exceso.',
        partial_depth: 'No bajar lo suficiente.',
      },
      safety: {
        start_light: 'Empieza con poco peso hasta dominar la técnica.',
      },
    },
    kettlebell_front_squat: {
      name: 'Sentadilla frontal con kettlebell',
      cue: {
        rack_position: 'Kettlebell apoyada en el antebrazo y pegada al pecho, codo abajo.',
        wrist_neutral: 'Muñeca recta, en línea con el antebrazo.',
        controlled_descent: 'Baja con control, en unos dos segundos.',
      },
      mistake: {
        wrist_bent_back: 'Doblar la muñeca hacia atrás.',
        torso_collapse: 'Dejar que el tronco se venza hacia delante.',
      },
      safety: {
        start_light: 'Empieza con poco peso hasta dominar la técnica.',
      },
    },
    bodyweight_squat: {
      name: 'Sentadilla con peso corporal',
      cue: {
        feet_shoulder_width: 'Pies a la anchura de los hombros, puntas ligeramente hacia fuera.',
        hips_back_first: 'Empieza el movimiento llevando la cadera hacia atrás.',
        knees_track_toes: 'Las rodillas siguen la dirección de los pies.',
      },
      mistake: {
        knees_cave_in: 'Dejar que las rodillas se junten.',
        heels_lift: 'Levantar los talones del suelo.',
      },
      safety: {
        stop_if_joint_pain: 'Para si notas dolor en alguna articulación. Si persiste, consúltalo con un profesional.',
      },
    },
    chair_squat: {
      name: 'Sentadilla a la silla',
      cue: {
        touch_seat_lightly: 'Roza el asiento sin llegar a sentarte.',
        stand_without_hands: 'Levántate sin ayudarte con las manos.',
        controlled_tempo: 'Ritmo controlado en ambas fases, sin tirones.',
      },
      mistake: {
        dropping_onto_seat: 'Dejarse caer en el asiento.',
        knees_cave_in: 'Dejar que las rodillas se junten.',
      },
      safety: {
        use_stable_chair: 'Usa una silla firme, apoyada contra la pared.',
      },
    },
    jump_squat: {
      name: 'Sentadilla con salto',
      cue: {
        soft_landing: 'Aterriza suave, de puntas a talones.',
        absorb_with_hips: 'Amortigua la caída flexionando cadera y rodillas, no solo las rodillas.',
        reset_each_rep: 'Recoloca los pies y la postura tras cada salto antes del siguiente.',
      },
      mistake: {
        landing_stiff_knees: 'Aterrizar con las rodillas rígidas.',
        rushing_reps: 'Encadenar repeticiones sin control.',
      },
      safety: {
        avoid_if_joint_pain: 'Si te molestan rodillas o tobillos, cámbialo por una sentadilla sin salto.',
        land_on_soft_surface: 'Hazlo sobre una superficie que amortigüe.',
      },
    },
    wall_sit: {
      name: 'Sentadilla isométrica en la pared',
      cue: {
        back_flat_on_wall: 'Espalda completamente apoyada en la pared.',
        thighs_parallel: 'Muslos paralelos al suelo.',
        breathe_steadily: 'Respira de forma continua; no aguantes el aire.',
      },
      mistake: {
        sliding_down: 'Ir deslizándose hacia abajo.',
        holding_breath: 'Aguantar la respiración.',
      },
      safety: {
        stop_if_joint_pain: 'Para si notas dolor en alguna articulación. Si persiste, consúltalo con un profesional.',
      },
    },
    band_squat: {
      name: 'Sentadilla con banda',
      cue: {
        band_under_midfoot: 'Pisa la banda con el centro del pie para que no se mueva.',
        tension_all_range: 'Mantén la banda tensa durante todo el recorrido.',
        chest_tall: 'Pecho alto y mirada al frente.',
      },
      mistake: {
        band_slipping: 'Dejar que la banda se mueva o resbale.',
        partial_depth: 'No bajar lo suficiente.',
      },
      safety: {
        check_band_wear: 'Revisa la banda: si tiene grietas o cortes, no la uses.',
      },
    },
    leg_press: {
      name: 'Prensa de piernas',
      cue: {
        feet_mid_platform: 'Pies en el centro de la plataforma, a la anchura de las caderas.',
        knees_track_toes: 'Las rodillas siguen la dirección de los pies.',
        no_lockout_slam: 'No bloquees la articulación de golpe al final del recorrido.',
      },
      mistake: {
        lower_back_lifting: 'Despegar la lumbar del respaldo.',
        bouncing_bottom: 'Rebotar en la parte baja del recorrido.',
      },
      safety: {
        engage_safety_latch: 'Activa los topes de seguridad antes de soltar el carro.',
      },
    },
    hack_squat_machine: {
      name: 'Sentadilla hack en máquina',
      cue: {
        back_flat_on_pad: 'Pega la espalda y la cadera al respaldo durante todo el recorrido.',
        controlled_descent: 'Baja con control, en unos dos segundos.',
        drive_through_heels: 'Empuja la plataforma con los talones.',
      },
      mistake: {
        knees_cave_in: 'Dejar que las rodillas se junten.',
        partial_depth: 'No bajar lo suficiente.',
      },
      safety: {
        engage_safety_latch: 'Activa los topes de seguridad antes de soltar el carro.',
      },
    },
    conventional_deadlift: {
      name: 'Peso muerto convencional',
      cue: {
        bar_over_midfoot: 'La barra se mantiene sobre el centro del pie en todo momento.',
        flat_back: 'Espalda plana y neutra, sin redondearla.',
        push_floor_away: 'Empuja el suelo con las piernas en vez de tirar con la espalda.',
      },
      mistake: {
        rounding_lower_back: 'Redondear la lumbar.',
        hips_rise_first: 'Subir la cadera antes que el pecho.',
      },
      safety: {
        reset_each_rep: 'Apoya la barra en el suelo y recoloca la espalda antes de cada repetición.',
        stop_if_back_pain: 'Para si notas dolor en la espalda. Si persiste, consúltalo con un profesional.',
      },
    },
    sumo_deadlift: {
      name: 'Peso muerto sumo',
      cue: {
        wide_stance: 'Postura ancha, puntas de los pies hacia fuera.',
        knees_out: 'Rodillas abiertas en la dirección de los pies.',
        chest_up: 'Pecho arriba, mirada al frente.',
      },
      mistake: {
        hips_rise_first: 'Subir la cadera antes que el pecho.',
        bar_drifting_forward: 'Dejar que la barra se aleje del cuerpo.',
      },
      safety: {
        stop_if_back_pain: 'Para si notas dolor en la espalda. Si persiste, consúltalo con un profesional.',
      },
    },
    trap_bar_deadlift: {
      name: 'Peso muerto con barra hexagonal',
      cue: {
        stand_centered: 'Colócate en el centro de la barra hexagonal.',
        flat_back: 'Espalda plana y neutra, sin redondearla.',
        drive_through_floor: 'Empuja el suelo con las piernas, como si quisieras alejarlo.',
      },
      mistake: {
        rounding_lower_back: 'Redondear la lumbar.',
        jerking_start: 'Arrancar de un tirón.',
      },
      safety: {
        reset_each_rep: 'Apoya la barra en el suelo y recoloca la espalda antes de cada repetición.',
      },
    },
    romanian_deadlift: {
      name: 'Peso muerto rumano',
      cue: {
        soft_knees: 'Rodillas ligeramente flexionadas, nunca bloqueadas.',
        hips_travel_back: 'La cadera viaja hacia atrás mientras el tronco baja.',
        bar_close_to_legs: 'La barra roza las piernas durante todo el recorrido.',
      },
      mistake: {
        squatting_instead_of_hinging: 'Hacer una sentadilla en vez de una bisagra de cadera.',
        rounding_back: 'Redondear la espalda.',
      },
      safety: {
        stop_before_back_rounds: 'Para la bajada antes de que la espalda se redondee.',
      },
    },
    dumbbell_romanian_deadlift: {
      name: 'Peso muerto rumano con mancuernas',
      cue: {
        soft_knees: 'Rodillas ligeramente flexionadas, nunca bloqueadas.',
        hips_back: 'Lleva la cadera atrás como si quisieras cerrar una puerta con ella.',
        feel_hamstring_stretch: 'Baja hasta notar el estiramiento en la parte posterior del muslo.',
      },
      mistake: {
        bending_knees_too_much: 'Flexionar demasiado las rodillas.',
        rounding_back: 'Redondear la espalda.',
      },
      safety: {
        stop_before_back_rounds: 'Para la bajada antes de que la espalda se redondee.',
      },
    },
    single_leg_rdl: {
      name: 'Peso muerto rumano a una pierna',
      cue: {
        hips_square: 'Caderas cuadradas, mirando al frente.',
        slow_tempo: 'Ritmo lento en todo el recorrido.',
        reach_toward_floor: 'Baja el tronco alargando la mano hacia el suelo.',
      },
      mistake: {
        hip_opening_up: 'Abrir la cadera hacia el lado.',
        rushing_balance: 'Ir rápido y perder el equilibrio.',
      },
      safety: {
        hold_support_if_needed: 'Si pierdes el equilibrio, apóyate en algo estable.',
      },
    },
    kettlebell_swing: {
      name: 'Kettlebell swing',
      cue: {
        hinge_not_squat: 'Es una bisagra de cadera, no una sentadilla: rodillas poco flexionadas.',
        snap_hips: 'Extiende la cadera de golpe para lanzar el peso.',
        arms_stay_relaxed: 'Los brazos van sueltos: solo guían el peso, no lo levantan.',
      },
      mistake: {
        lifting_with_arms: 'Levantar el peso con los brazos.',
        rounding_back: 'Redondear la espalda.',
      },
      safety: {
        clear_space_around: 'Despeja el espacio a tu alrededor antes de empezar.',
        stop_if_back_pain: 'Para si notas dolor en la espalda. Si persiste, consúltalo con un profesional.',
      },
    },
    barbell_hip_thrust: {
      name: 'Hip thrust con barra',
      cue: {
        chin_tucked: 'Barbilla ligeramente recogida, mirada al frente.',
        ribs_down: 'Costillas abajo: sin arquear la lumbar.',
        full_hip_extension: 'Sube hasta que la cadera quede completamente extendida.',
      },
      mistake: {
        overarching_lower_back: 'Arquear en exceso la zona lumbar.',
        pushing_through_toes: 'Empujar con las puntas de los pies.',
      },
      safety: {
        pad_the_bar: 'Coloca una almohadilla entre la barra y la cadera.',
      },
    },
    glute_bridge: {
      name: 'Puente de glúteo',
      cue: {
        feet_flat_close: 'Pies planos y cerca del glúteo.',
        squeeze_at_top: 'Aprieta el glúteo con fuerza en el punto más alto.',
        ribs_down: 'Costillas abajo: sin arquear la lumbar.',
      },
      mistake: {
        overarching_lower_back: 'Arquear en exceso la zona lumbar.',
        pushing_through_toes: 'Empujar con las puntas de los pies.',
      },
      safety: {
        stop_if_back_pain: 'Para si notas dolor en la espalda. Si persiste, consúltalo con un profesional.',
      },
    },
    single_leg_glute_bridge: {
      name: 'Puente de glúteo a una pierna',
      cue: {
        hips_level: 'Caderas niveladas, sin que caiga ningún lado.',
        squeeze_at_top: 'Aprieta el glúteo con fuerza en el punto más alto.',
        slow_lowering: 'Baja despacio, frenando el peso.',
      },
      mistake: {
        hip_dropping: 'Dejar caer la cadera de un lado.',
        arching_back: 'Arquear la espalda al subir.',
      },
      safety: {
        stop_if_back_pain: 'Para si notas dolor en la espalda. Si persiste, consúltalo con un profesional.',
      },
    },
    good_morning: {
      name: 'Good morning',
      cue: {
        light_load: 'Usa una carga ligera: el ejercicio funciona con poco peso.',
        hips_back: 'Lleva la cadera atrás como si quisieras cerrar una puerta con ella.',
        flat_back: 'Espalda plana y neutra, sin redondearla.',
      },
      mistake: {
        rounding_back: 'Redondear la espalda.',
        going_too_heavy: 'Cargar demasiado peso.',
      },
      safety: {
        use_light_load_first: 'Aprende el movimiento con la barra sola o muy poco peso.',
        stop_if_back_pain: 'Para si notas dolor en la espalda. Si persiste, consúltalo con un profesional.',
      },
    },
    band_good_morning: {
      name: 'Good morning con banda',
      cue: {
        band_under_feet: 'Pisa la banda con ambos pies para fijarla.',
        hips_back: 'Lleva la cadera atrás como si quisieras cerrar una puerta con ella.',
        flat_back: 'Espalda plana y neutra, sin redondearla.',
      },
      mistake: {
        rounding_back: 'Redondear la espalda.',
        band_slipping: 'Dejar que la banda se mueva o resbale.',
      },
      safety: {
        check_band_wear: 'Revisa la banda: si tiene grietas o cortes, no la uses.',
      },
    },
    cable_pull_through: {
      name: 'Pull-through en polea',
      cue: {
        face_away_from_stack: 'Colócate de espaldas a la polea con la cuerda entre las piernas.',
        hinge_at_hips: 'Dobla desde la cadera, no desde la espalda.',
        squeeze_at_lockout: 'Aprieta el glúteo al estirar la cadera.',
      },
      mistake: {
        squatting_the_movement: 'Convertirlo en una sentadilla.',
        overextending_at_top: 'Hiperextender la espalda al final.',
      },
      safety: {
        keep_stable_stance: 'Pies bien plantados para que el cable no te desplace.',
      },
    },
    back_extension: {
      name: 'Extensión lumbar',
      cue: {
        pads_below_hip_crease: 'Ajusta el apoyo justo por debajo del pliegue de la cadera.',
        neutral_spine: 'Columna neutra, sin arquear ni redondear.',
        stop_at_straight: 'Sube hasta que el cuerpo quede recto.',
      },
      mistake: {
        hyperextending_at_top: 'Hiperextender la espalda arriba.',
        jerking_up: 'Subir de golpe.',
      },
      safety: {
        stop_if_back_pain: 'Para si notas dolor en la espalda. Si persiste, consúltalo con un profesional.',
      },
    },
    barbell_bench_press: {
      name: 'Press de banca con barra',
      cue: {
        shoulder_blades_retracted: 'Junta los omóplatos y clávalos en el banco.',
        feet_planted: 'Pies firmes en el suelo, empujando durante toda la serie.',
        bar_to_lower_chest: 'Baja la barra hasta la parte baja del pecho.',
      },
      mistake: {
        bouncing_off_chest: 'Rebotar la barra en el pecho.',
        flaring_elbows: 'Abrir los codos en exceso.',
      },
      safety: {
        use_spotter_or_safeties: 'Usa topes de seguridad o pide que alguien te vigile.',
        no_thumbless_grip: 'Agarra siempre la barra con el pulgar rodeándola.',
      },
    },
    incline_barbell_bench_press: {
      name: 'Press de banca inclinado con barra',
      cue: {
        bench_30_degrees: 'Coloca el banco a unos 30 grados de inclinación.',
        blades_retracted: 'Junta los omóplatos y mantenlos así durante toda la serie.',
        bar_to_upper_chest: 'Baja la barra hasta la parte alta del pecho, bajo la clavícula.',
      },
      mistake: {
        bench_too_steep: 'Inclinar demasiado el banco.',
        bouncing_off_chest: 'Rebotar la barra en el pecho.',
      },
      safety: {
        use_spotter_or_safeties: 'Usa topes de seguridad o pide que alguien te vigile.',
      },
    },
    dumbbell_bench_press: {
      name: 'Press de banca con mancuernas',
      cue: {
        blades_retracted: 'Junta los omóplatos y mantenlos así durante toda la serie.',
        wrists_stacked: 'Muñecas rectas, alineadas sobre los codos.',
        control_the_descent: 'Baja el peso despacio, contando dos segundos.',
      },
      mistake: {
        flaring_elbows: 'Abrir los codos en exceso.',
        clanging_dumbbells: 'Chocar las mancuernas arriba.',
      },
      safety: {
        set_down_safely: 'Deja el peso en el suelo con control; no lo sueltes desde arriba.',
      },
    },
    incline_dumbbell_press: {
      name: 'Press inclinado con mancuernas',
      cue: {
        bench_30_degrees: 'Coloca el banco a unos 30 grados de inclinación.',
        elbows_45_degrees: 'Codos a unos 45 grados del cuerpo, ni pegados ni abiertos.',
        full_range: 'Recorre todo el rango de movimiento, sin acortar arriba ni abajo.',
      },
      mistake: {
        bench_too_steep: 'Inclinar demasiado el banco.',
        short_range: 'Acortar el recorrido.',
      },
      safety: {
        set_down_safely: 'Deja el peso en el suelo con control; no lo sueltes desde arriba.',
      },
    },
    dumbbell_floor_press: {
      name: 'Press en el suelo con mancuernas',
      cue: {
        elbows_touch_floor: 'Baja hasta que los codos toquen suavemente el suelo.',
        pause_briefly: 'Haz una pausa breve abajo antes de empujar.',
        press_straight_up: 'Empuja en vertical, sobre el pecho.',
      },
      mistake: {
        bouncing_elbows: 'Rebotar los codos contra el suelo.',
        flaring_elbows: 'Abrir los codos en exceso.',
      },
      safety: {
        set_down_safely: 'Deja el peso en el suelo con control; no lo sueltes desde arriba.',
      },
    },
    push_up: {
      name: 'Flexiones',
      cue: {
        body_in_straight_line: 'Cuerpo en línea recta de la cabeza a los talones.',
        elbows_45_degrees: 'Codos a unos 45 grados del cuerpo, ni pegados ni abiertos.',
        full_range: 'Recorre todo el rango de movimiento, sin acortar arriba ni abajo.',
      },
      mistake: {
        sagging_hips: 'Dejar caer la cadera.',
        flaring_elbows: 'Abrir los codos en exceso.',
      },
      safety: {
        drop_to_knees_if_form_breaks: 'Si la cadera cae, apoya las rodillas y sigue.',
      },
    },
    knee_push_up: {
      name: 'Flexiones con rodillas apoyadas',
      cue: {
        knees_hips_shoulders_aligned: 'Rodillas, cadera y hombros en línea recta.',
        chest_to_floor: 'Baja hasta que el pecho casi roce el suelo.',
        controlled_tempo: 'Ritmo controlado en ambas fases, sin tirones.',
      },
      mistake: {
        sagging_hips: 'Dejar caer la cadera.',
        half_range: 'Hacer solo medio recorrido.',
      },
      safety: {
        pad_the_knees: 'Apoya las rodillas sobre una esterilla.',
      },
    },
    incline_push_up: {
      name: 'Flexiones inclinadas',
      cue: {
        hands_on_stable_surface: 'Manos en un apoyo firme que no se mueva.',
        straight_body: 'Cuerpo recto de la cabeza a los pies.',
        chest_to_edge: 'Baja hasta que el pecho casi toque el borde del apoyo.',
      },
      mistake: {
        sagging_hips: 'Dejar caer la cadera.',
        unstable_surface: 'Apoyarse en algo que se mueve.',
      },
      safety: {
        use_stable_surface: 'Usa un apoyo firme que no se mueva ni resbale.',
      },
    },
    decline_push_up: {
      name: 'Flexiones declinadas',
      cue: {
        feet_elevated: 'Apoya los pies en un cajón o banco.',
        ribs_down: 'Costillas abajo: sin arquear la lumbar.',
        controlled_descent: 'Baja con control, en unos dos segundos.',
      },
      mistake: {
        sagging_hips: 'Dejar caer la cadera.',
        neck_craning: 'Estirar el cuello hacia delante.',
      },
      safety: {
        use_stable_surface: 'Usa un apoyo firme que no se mueva ni resbale.',
      },
    },
    diamond_push_up: {
      name: 'Flexiones diamante',
      cue: {
        hands_form_triangle: 'Junta índices y pulgares formando un triángulo bajo el pecho.',
        elbows_close: 'Codos cerca del cuerpo durante todo el recorrido.',
        straight_body: 'Cuerpo recto de la cabeza a los pies.',
      },
      mistake: {
        flaring_elbows: 'Abrir los codos en exceso.',
        sagging_hips: 'Dejar caer la cadera.',
      },
      safety: {
        stop_if_wrist_pain: 'Para si notas dolor en la muñeca. Si persiste, consúltalo con un profesional.',
      },
    },
    machine_chest_press: {
      name: 'Press de pecho en máquina',
      cue: {
        handles_at_chest_height: 'Ajusta el asiento para que los agarres queden a la altura del pecho.',
        blades_back: 'Junta y baja los omóplatos antes de empujar.',
        no_lockout_slam: 'No bloquees la articulación de golpe al final del recorrido.',
      },
      mistake: {
        seat_too_high: 'Asiento demasiado alto.',
        partial_range: 'Acortar el recorrido.',
      },
      safety: {
        adjust_seat_first: 'Ajusta el asiento y los apoyos antes de la primera repetición.',
      },
    },
    cable_chest_press: {
      name: 'Press de pecho en polea',
      cue: {
        staggered_stance: 'Un pie adelantado para tener una base estable.',
        press_and_squeeze: 'Empuja al frente y aprieta el pecho al final.',
        control_the_return: 'Vuelve a la posición inicial frenando el peso, sin dejar que tire de ti.',
      },
      mistake: {
        leaning_too_far: 'Inclinarse demasiado hacia delante.',
        shrugging_shoulders: 'Subir los hombros.',
      },
      safety: {
        check_pin_and_clips: 'Comprueba que el pasador está bien metido y el accesorio bien enganchado.',
      },
    },
    band_chest_press: {
      name: 'Press de pecho con banda',
      cue: {
        band_behind_back: 'Pasa la banda por detrás de la espalda, a la altura de los omóplatos.',
        press_forward: 'Empuja al frente hasta estirar los brazos.',
        slow_return: 'Vuelve despacio a la posición inicial.',
      },
      mistake: {
        band_slipping: 'Dejar que la banda se mueva o resbale.',
        short_range: 'Acortar el recorrido.',
      },
      safety: {
        check_band_wear: 'Revisa la banda: si tiene grietas o cortes, no la uses.',
      },
    },
    bench_dip: {
      name: 'Fondos en banco',
      cue: {
        hands_at_bench_edge: 'Manos en el borde del banco, dedos hacia delante.',
        elbows_back: 'Los codos apuntan hacia atrás, no hacia los lados.',
        stop_at_parallel: 'Baja hasta que el brazo quede paralelo al suelo.',
      },
      mistake: {
        going_too_deep: 'Bajar más de lo que el hombro tolera.',
        shoulders_shrugging: 'Encoger los hombros.',
      },
      safety: {
        stop_if_shoulder_pain: 'Para si notas dolor en el hombro. Si persiste, consúltalo con un profesional.',
      },
    },
    parallel_bar_dip: {
      name: 'Fondos en paralelas',
      cue: {
        slight_forward_lean: 'Inclina el torso ligeramente hacia delante.',
        elbows_back: 'Los codos apuntan hacia atrás, no hacia los lados.',
        stop_at_shoulder_height: 'Baja hasta que el hombro quede a la altura del codo, no más.',
      },
      mistake: {
        going_too_deep: 'Bajar más de lo que el hombro tolera.',
        swinging_legs: 'Balancear las piernas.',
      },
      safety: {
        stop_if_shoulder_pain: 'Para si notas dolor en el hombro. Si persiste, consúltalo con un profesional.',
        use_assistance_if_needed: 'Si no controlas la bajada, usa una banda o la máquina asistida.',
      },
    },
    barbell_overhead_press: {
      name: 'Press militar con barra',
      cue: {
        squeeze_glutes: 'Aprieta el glúteo.',
        head_through_at_top: 'Al bloquear arriba, pasa la cabeza por delante de la barra.',
        bar_over_midfoot: 'La barra se mantiene sobre el centro del pie en todo momento.',
      },
      mistake: {
        overarching_lower_back: 'Arquear en exceso la zona lumbar.',
        pressing_around_head: 'Empujar rodeando la cabeza en vez de apartarla.',
      },
      safety: {
        stop_if_shoulder_pain: 'Para si notas dolor en el hombro. Si persiste, consúltalo con un profesional.',
      },
    },
    push_press: {
      name: 'Push press',
      cue: {
        short_dip: 'Flexiona ligeramente las rodillas, sin llegar a media sentadilla.',
        drive_with_legs: 'El impulso sale de las piernas, no de los brazos.',
        lock_out_overhead: 'Termina con la barra encima de la cabeza y los brazos estirados.',
      },
      mistake: {
        dipping_too_deep: 'Flexionar demasiado las piernas en el impulso.',
        overarching_lower_back: 'Arquear en exceso la zona lumbar.',
      },
      safety: {
        clear_space_overhead: 'Comprueba que no hay nada encima de ti.',
      },
    },
    dumbbell_shoulder_press: {
      name: 'Press de hombro con mancuernas',
      cue: {
        ribs_down: 'Costillas abajo: sin arquear la lumbar.',
        press_slightly_forward: 'Empuja ligeramente hacia delante, no solo hacia arriba.',
        full_lockout: 'Estira los brazos del todo arriba.',
      },
      mistake: {
        overarching_lower_back: 'Arquear en exceso la zona lumbar.',
        half_range: 'Hacer solo medio recorrido.',
      },
      safety: {
        stop_if_shoulder_pain: 'Para si notas dolor en el hombro. Si persiste, consúltalo con un profesional.',
      },
    },
    seated_dumbbell_shoulder_press: {
      name: 'Press de hombro sentado con mancuernas',
      cue: {
        back_against_pad: 'Apoya toda la espalda en el respaldo.',
        wrists_stacked: 'Muñecas rectas, alineadas sobre los codos.',
        controlled_descent: 'Baja con control, en unos dos segundos.',
      },
      mistake: {
        bouncing_off_shoulders: 'Rebotar el peso en los hombros.',
        arching_off_pad: 'Despegar la espalda del respaldo.',
      },
      safety: {
        set_down_safely: 'Deja el peso en el suelo con control; no lo sueltes desde arriba.',
      },
    },
    arnold_press: {
      name: 'Press Arnold',
      cue: {
        start_palms_in: 'Empieza con las palmas hacia ti, a la altura de los hombros.',
        rotate_as_you_press: 'Gira las palmas hacia delante mientras empujas.',
        controlled_tempo: 'Ritmo controlado en ambas fases, sin tirones.',
      },
      mistake: {
        rushing_the_rotation: 'Girar demasiado rápido.',
        using_momentum: 'Usar impulso.',
      },
      safety: {
        stop_if_shoulder_pain: 'Para si notas dolor en el hombro. Si persiste, consúltalo con un profesional.',
      },
    },
    kettlebell_overhead_press: {
      name: 'Press militar con kettlebell',
      cue: {
        rack_position: 'Kettlebell apoyada en el antebrazo y pegada al pecho, codo abajo.',
        wrist_neutral: 'Muñeca recta, en línea con el antebrazo.',
        press_and_lock: 'Empuja hasta bloquear el brazo encima de la cabeza.',
      },
      mistake: {
        wrist_bent_back: 'Doblar la muñeca hacia atrás.',
        leaning_sideways: 'Inclinarse hacia un lado.',
      },
      safety: {
        stop_if_shoulder_pain: 'Para si notas dolor en el hombro. Si persiste, consúltalo con un profesional.',
      },
    },
    landmine_press: {
      name: 'Press landmine',
      cue: {
        staggered_stance: 'Un pie adelantado para tener una base estable.',
        press_up_and_forward: 'Empuja hacia arriba y hacia delante, siguiendo el ángulo de la barra.',
        ribs_down: 'Costillas abajo: sin arquear la lumbar.',
      },
      mistake: {
        leaning_back: 'Inclinarse hacia atrás.',
        shrugging_shoulders: 'Subir los hombros.',
      },
      safety: {
        secure_the_bar_end: 'Asegura el extremo de la barra en su soporte antes de cargarla.',
      },
    },
    pike_push_up: {
      name: 'Flexiones pike',
      cue: {
        hips_high: 'Cadera alta, cuerpo en forma de V invertida.',
        crown_toward_floor: 'Baja la coronilla hacia el suelo, entre las manos.',
        elbows_forward: 'Codos apuntando hacia delante, no abiertos.',
      },
      mistake: {
        bending_at_waist_only: 'Doblar solo por la cintura sin elevar la cadera.',
        neck_compressing: 'Cargar el peso en el cuello.',
      },
      safety: {
        stop_if_shoulder_pain: 'Para si notas dolor en el hombro. Si persiste, consúltalo con un profesional.',
      },
    },
    wall_handstand_push_up: {
      name: 'Flexiones en pino contra la pared',
      cue: {
        hands_close_to_wall: 'Manos a un palmo de la pared, a la anchura de los hombros.',
        ribs_down: 'Costillas abajo: sin arquear la lumbar.',
        controlled_descent: 'Baja con control, en unos dos segundos.',
      },
      mistake: {
        collapsing_neck_first: 'Colapsar primero por el cuello.',
        excessive_arching: 'Arquear la espalda en exceso.',
      },
      safety: {
        have_an_exit_plan: 'Ten claro cómo bajar de forma segura antes de subir.',
        clear_space_around: 'Despeja el espacio a tu alrededor antes de empezar.',
      },
    },
    machine_shoulder_press: {
      name: 'Press de hombro en máquina',
      cue: {
        handles_at_shoulder_height: 'Ajusta el asiento para que los agarres queden a la altura de los hombros.',
        back_on_pad: 'Espalda pegada al respaldo, sin despegar la zona lumbar.',
        no_lockout_slam: 'No bloquees la articulación de golpe al final del recorrido.',
      },
      mistake: {
        seat_too_low: 'Asiento demasiado bajo.',
        partial_range: 'Acortar el recorrido.',
      },
      safety: {
        adjust_seat_first: 'Ajusta el asiento y los apoyos antes de la primera repetición.',
      },
    },
    band_overhead_press: {
      name: 'Press militar con banda',
      cue: {
        band_under_feet: 'Pisa la banda con ambos pies para fijarla.',
        ribs_down: 'Costillas abajo: sin arquear la lumbar.',
        slow_return: 'Vuelve despacio a la posición inicial.',
      },
      mistake: {
        band_slipping: 'Dejar que la banda se mueva o resbale.',
        leaning_back: 'Inclinarse hacia atrás.',
      },
      safety: {
        check_band_wear: 'Revisa la banda: si tiene grietas o cortes, no la uses.',
      },
    },
    barbell_bent_over_row: {
      name: 'Remo inclinado con barra',
      cue: {
        hinge_to_45_degrees: 'Inclina el tronco unos 45 grados con la espalda recta.',
        pull_to_navel: 'Tira de la barra hacia el ombligo.',
        flat_back: 'Espalda plana y neutra, sin redondearla.',
      },
      mistake: {
        jerking_with_lower_back: 'Tirar con la zona lumbar.',
        standing_too_upright: 'Ponerse demasiado vertical.',
      },
      safety: {
        stop_if_back_pain: 'Para si notas dolor en la espalda. Si persiste, consúltalo con un profesional.',
      },
    },
    pendlay_row: {
      name: 'Remo Pendlay',
      cue: {
        torso_parallel: 'Tronco casi paralelo al suelo.',
        reset_on_floor: 'Apoya la barra en el suelo en cada repetición.',
        explosive_pull: 'Tira de la barra con intención rápida hasta el pecho.',
      },
      mistake: {
        rounding_back: 'Redondear la espalda.',
        torso_rising: 'Levantar el tronco al tirar.',
      },
      safety: {
        stop_if_back_pain: 'Para si notas dolor en la espalda. Si persiste, consúltalo con un profesional.',
      },
    },
    t_bar_row: {
      name: 'Remo en barra T',
      cue: {
        chest_up: 'Pecho arriba, mirada al frente.',
        pull_to_sternum: 'Tira hacia el esternón.',
        squeeze_blades: 'Junta los omóplatos al final del movimiento.',
      },
      mistake: {
        rounding_back: 'Redondear la espalda.',
        using_momentum: 'Usar impulso.',
      },
      safety: {
        secure_the_bar_end: 'Asegura el extremo de la barra en su soporte antes de cargarla.',
      },
    },
    dumbbell_one_arm_row: {
      name: 'Remo a un brazo con mancuerna',
      cue: {
        flat_back: 'Espalda plana y neutra, sin redondearla.',
        pull_to_hip: 'Lleva el peso hacia la cadera, no hacia el hombro.',
        no_torso_rotation: 'El tronco no gira; solo se mueve el brazo.',
      },
      mistake: {
        twisting_the_torso: 'Girar el tronco.',
        shrugging: 'Encoger los hombros hacia las orejas.',
      },
      safety: {
        support_on_stable_bench: 'Apoya la mano libre en un banco que no se mueva.',
      },
    },
    chest_supported_dumbbell_row: {
      name: 'Remo con mancuernas con apoyo en banco',
      cue: {
        chest_stays_on_pad: 'El pecho no se despega del respaldo en ningún momento.',
        elbows_to_ribs: 'Lleva los codos hacia las costillas.',
        squeeze_blades: 'Junta los omóplatos al final del movimiento.',
      },
      mistake: {
        lifting_chest_off_pad: 'Despegar el pecho del respaldo.',
        using_momentum: 'Usar impulso.',
      },
      safety: {
        set_down_safely: 'Deja el peso en el suelo con control; no lo sueltes desde arriba.',
      },
    },
    kettlebell_row: {
      name: 'Remo con kettlebell',
      cue: {
        hinge_and_brace: 'Inclina el tronco desde la cadera y aprieta el abdomen.',
        pull_to_hip: 'Lleva el peso hacia la cadera, no hacia el hombro.',
        flat_back: 'Espalda plana y neutra, sin redondearla.',
      },
      mistake: {
        rounding_back: 'Redondear la espalda.',
        twisting_torso: 'Rotar el tronco al tirar.',
      },
      safety: {
        stop_if_back_pain: 'Para si notas dolor en la espalda. Si persiste, consúltalo con un profesional.',
      },
    },
    inverted_row: {
      name: 'Remo invertido',
      cue: {
        body_straight: 'Cuerpo rígido y en línea, como una tabla.',
        chest_to_bar: 'Lleva el pecho hacia la barra, no la barbilla.',
        squeeze_blades: 'Junta los omóplatos al final del movimiento.',
      },
      mistake: {
        sagging_hips: 'Dejar caer la cadera.',
        half_range: 'Hacer solo medio recorrido.',
      },
      safety: {
        test_the_support_first: 'Comprueba que la barra o mesa aguanta tu peso antes de colgarte.',
      },
    },
    band_seated_row: {
      name: 'Remo sentado con banda',
      cue: {
        tall_posture: 'Postura erguida, sin encorvarte.',
        pull_to_ribs: 'Lleva las manos hacia las costillas.',
        slow_return: 'Vuelve despacio a la posición inicial.',
      },
      mistake: {
        leaning_back: 'Inclinarse hacia atrás.',
        shrugging: 'Encoger los hombros hacia las orejas.',
      },
      safety: {
        check_band_wear: 'Revisa la banda: si tiene grietas o cortes, no la uses.',
      },
    },
    seated_cable_row: {
      name: 'Remo sentado en polea',
      cue: {
        tall_chest: 'Pecho alto y espalda recta.',
        pull_to_navel: 'Tira de la barra hacia el ombligo.',
        control_the_return: 'Vuelve a la posición inicial frenando el peso, sin dejar que tire de ti.',
      },
      mistake: {
        rocking_the_torso: 'Balancear el tronco.',
        shrugging: 'Encoger los hombros hacia las orejas.',
      },
      safety: {
        check_pin_and_clips: 'Comprueba que el pasador está bien metido y el accesorio bien enganchado.',
      },
    },
    machine_seated_row: {
      name: 'Remo sentado en máquina',
      cue: {
        chest_on_pad: 'Pecho apoyado en el soporte durante toda la serie.',
        elbows_to_ribs: 'Lleva los codos hacia las costillas.',
        full_range: 'Recorre todo el rango de movimiento, sin acortar arriba ni abajo.',
      },
      mistake: {
        lifting_off_the_pad: 'Separarse del respaldo para tirar.',
        partial_range: 'Acortar el recorrido.',
      },
      safety: {
        adjust_seat_first: 'Ajusta el asiento y los apoyos antes de la primera repetición.',
      },
    },
    cable_face_pull: {
      name: 'Face pull en polea',
      cue: {
        rope_at_eye_level: 'Ajusta la polea a la altura de los ojos.',
        pull_to_forehead: 'Tira de la cuerda hacia la frente, separando las manos.',
        elbows_high: 'Codos altos, a la altura de los hombros o por encima.',
      },
      mistake: {
        using_too_much_weight: 'Usar demasiado peso.',
        shrugging: 'Encoger los hombros hacia las orejas.',
      },
      safety: {
        keep_load_light: 'Usa poco peso; aquí importa la técnica.',
      },
    },
    band_face_pull: {
      name: 'Face pull con banda',
      cue: {
        anchor_at_chest_height: 'Ancla la banda a la altura del pecho.',
        pull_to_forehead: 'Tira de la cuerda hacia la frente, separando las manos.',
        squeeze_rear_delts: 'Aprieta la parte posterior del hombro al final.',
      },
      mistake: {
        shrugging: 'Encoger los hombros hacia las orejas.',
        band_slipping: 'Dejar que la banda se mueva o resbale.',
      },
      safety: {
        check_band_wear: 'Revisa la banda: si tiene grietas o cortes, no la uses.',
      },
    },
    pull_up: {
      name: 'Dominadas',
      cue: {
        start_from_dead_hang: 'Empieza colgado con los brazos estirados del todo.',
        pull_elbows_down: 'Tira de los codos hacia abajo y atrás.',
        chin_over_bar: 'Sube hasta que la barbilla supere la barra.',
      },
      mistake: {
        kipping_unintentionally: 'Balancearse sin querer para subir.',
        half_range: 'Hacer solo medio recorrido.',
      },
      safety: {
        check_bar_is_secure: 'Comprueba que la barra está bien fijada antes de colgarte.',
      },
    },
    chin_up: {
      name: 'Dominadas supinas',
      cue: {
        supinated_grip: 'Agarre supino: palmas hacia ti.',
        chest_to_bar: 'Lleva el pecho hacia la barra, no la barbilla.',
        controlled_descent: 'Baja con control, en unos dos segundos.',
      },
      mistake: {
        swinging: 'Balancearse.',
        half_range: 'Hacer solo medio recorrido.',
      },
      safety: {
        check_bar_is_secure: 'Comprueba que la barra está bien fijada antes de colgarte.',
      },
    },
    neutral_grip_pull_up: {
      name: 'Dominadas con agarre neutro',
      cue: {
        palms_facing: 'Palmas enfrentadas en el agarre neutro.',
        elbows_down_and_back: 'Lleva los codos abajo y atrás, hacia los bolsillos.',
        full_hang: 'Empieza colgado con los brazos completamente estirados.',
      },
      mistake: {
        swinging: 'Balancearse.',
        shrugging_at_bottom: 'Encoger los hombros al colgarte.',
      },
      safety: {
        check_bar_is_secure: 'Comprueba que la barra está bien fijada antes de colgarte.',
        stop_if_shoulder_pain: 'Para si notas dolor en el hombro. Si persiste, consúltalo con un profesional.',
      },
    },
    negative_pull_up: {
      name: 'Dominadas negativas',
      cue: {
        start_at_top: 'Empieza arriba, con la barbilla por encima de la barra.',
        lower_for_five_seconds: 'Baja contando cinco segundos.',
        stay_tight: 'Cuerpo tenso durante toda la bajada.',
      },
      mistake: {
        dropping_too_fast: 'Bajar demasiado rápido.',
        skipping_the_setup: 'Saltarse la colocación inicial.',
      },
      safety: {
        check_bar_is_secure: 'Comprueba que la barra está bien fijada antes de colgarte.',
      },
    },
    band_assisted_pull_up: {
      name: 'Dominadas asistidas con banda',
      cue: {
        band_under_knee: 'Engancha la banda en la barra y apoya una rodilla o un pie en ella.',
        full_hang_start: 'Arranca cada repetición desde los brazos estirados.',
        controlled_descent: 'Baja con control, en unos dos segundos.',
      },
      mistake: {
        bouncing_out_of_the_band: 'Rebotar en la banda para subir.',
        half_range: 'Hacer solo medio recorrido.',
      },
      safety: {
        check_band_wear: 'Revisa la banda: si tiene grietas o cortes, no la uses.',
        check_bar_is_secure: 'Comprueba que la barra está bien fijada antes de colgarte.',
      },
    },
    assisted_pull_up_machine: {
      name: 'Dominadas asistidas en máquina',
      cue: {
        set_assist_weight: 'Ajusta la ayuda: más peso, más ayuda.',
        full_range: 'Recorre todo el rango de movimiento, sin acortar arriba ni abajo.',
        controlled_descent: 'Baja con control, en unos dos segundos.',
      },
      mistake: {
        too_much_assistance: 'Poner demasiada ayuda.',
        partial_range: 'Acortar el recorrido.',
      },
      safety: {
        step_off_carefully: 'Baja de la máquina con cuidado; la plataforma se mueve.',
      },
    },
    lat_pulldown_cable: {
      name: 'Jalón al pecho en polea',
      cue: {
        thighs_under_pad: 'Muslos bien ajustados bajo el apoyo.',
        pull_to_upper_chest: 'Tira de la barra hacia la parte alta del pecho.',
        slow_return: 'Vuelve despacio a la posición inicial.',
      },
      mistake: {
        leaning_way_back: 'Echarse muy atrás para tirar.',
        pulling_behind_neck: 'Tirar por detrás del cuello.',
      },
      safety: {
        never_pull_behind_neck: 'Nunca tires de la barra por detrás del cuello.',
      },
    },
    lat_pulldown_machine: {
      name: 'Jalón al pecho en máquina',
      cue: {
        secure_the_thigh_pad: 'Ajusta el apoyo de los muslos para que no te levante.',
        elbows_drive_down: 'Tira con los codos hacia abajo, hacia los costados.',
        full_stretch_at_top: 'Deja que los brazos se estiren del todo arriba antes de volver a tirar.',
      },
      mistake: {
        using_momentum: 'Usar impulso.',
        partial_range: 'Acortar el recorrido.',
      },
      safety: {
        adjust_seat_first: 'Ajusta el asiento y los apoyos antes de la primera repetición.',
      },
    },
    band_lat_pulldown: {
      name: 'Jalón al pecho con banda',
      cue: {
        anchor_overhead: 'Ancla la banda por encima de la cabeza, en un punto fijo.',
        elbows_to_ribs: 'Lleva los codos hacia las costillas.',
        slow_return: 'Vuelve despacio a la posición inicial.',
      },
      mistake: {
        band_slipping: 'Dejar que la banda se mueva o resbale.',
        short_range: 'Acortar el recorrido.',
      },
      safety: {
        check_anchor_point: 'Comprueba que el anclaje aguanta antes de tirar.',
        check_band_wear: 'Revisa la banda: si tiene grietas o cortes, no la uses.',
      },
    },
    straight_arm_pulldown: {
      name: 'Pullover en polea con brazos rectos',
      cue: {
        slight_forward_lean: 'Inclina el torso ligeramente hacia delante.',
        arms_nearly_straight: 'Brazos casi rectos, con una flexión mínima de codo que no cambia.',
        squeeze_lats: 'Aprieta el dorsal al llevar las manos al muslo.',
      },
      mistake: {
        bending_elbows: 'Flexionar los codos y convertirlo en un jalón.',
        using_bodyweight: 'Usar el peso del cuerpo para tirar.',
      },
      safety: {
        keep_load_light: 'Usa poco peso; aquí importa la técnica.',
      },
    },
    walking_lunge: {
      name: 'Zancadas caminando',
      cue: {
        long_step: 'Paso largo, para que la espinilla delantera quede vertical.',
        back_knee_toward_floor: 'Baja la rodilla trasera hacia el suelo sin llegar a golpearlo.',
        torso_tall: 'Tronco erguido.',
      },
      mistake: {
        front_knee_caving: 'Dejar que la rodilla delantera se meta hacia dentro.',
        steps_too_short: 'Pasos demasiado cortos.',
      },
      safety: {
        stop_if_knee_pain: 'Para si notas dolor en la rodilla. Si persiste, consúltalo con un profesional.',
      },
    },
    reverse_lunge: {
      name: 'Zancadas hacia atrás',
      cue: {
        step_straight_back: 'Paso recto hacia atrás.',
        weight_on_front_foot: 'El peso va sobre el pie delantero.',
        controlled_return: 'Vuelve a la posición inicial con control, sin impulso.',
      },
      mistake: {
        front_knee_caving: 'Dejar que la rodilla delantera se meta hacia dentro.',
        leaning_forward: 'Inclinar el tronco hacia delante en exceso.',
      },
      safety: {
        stop_if_knee_pain: 'Para si notas dolor en la rodilla. Si persiste, consúltalo con un profesional.',
      },
    },
    split_squat: {
      name: 'Zancada estática',
      cue: {
        feet_in_two_tracks: 'Pies en dos raíles paralelos, no en la misma línea.',
        vertical_shin: 'Espinilla delantera vertical.',
        even_tempo: 'Mismo ritmo al bajar y al subir.',
      },
      mistake: {
        feet_on_a_tightrope: 'Colocar los pies en la misma línea.',
        bouncing_at_bottom: 'Rebotar en el punto más bajo.',
      },
      safety: {
        hold_support_if_needed: 'Si pierdes el equilibrio, apóyate en algo estable.',
      },
    },
    bulgarian_split_squat: {
      name: 'Sentadilla búlgara',
      cue: {
        rear_foot_elevated: 'Pie trasero apoyado en un banco o cajón bajo.',
        hips_square: 'Caderas cuadradas, mirando al frente.',
        slow_descent: 'Baja despacio, en dos o tres segundos.',
      },
      mistake: {
        rear_foot_too_close: 'Pie trasero demasiado cerca del banco.',
        losing_balance: 'Perder el equilibrio.',
      },
      safety: {
        use_stable_surface: 'Usa un apoyo firme que no se mueva ni resbale.',
      },
    },
    lateral_lunge: {
      name: 'Zancada lateral',
      cue: {
        step_wide_sideways: 'Paso amplio hacia el lado.',
        sit_into_hip: 'Siéntate sobre la cadera de la pierna que se flexiona.',
        other_leg_straight: 'La pierna contraria se queda estirada.',
      },
      mistake: {
        knee_past_toes_sideways: 'Dejar que la rodilla se salga hacia el lado por delante del pie.',
        rounding_back: 'Redondear la espalda.',
      },
      safety: {
        stop_if_groin_discomfort: 'Para si notas molestias en la ingle. Si persisten, consúltalo con un profesional.',
      },
    },
    curtsy_lunge: {
      name: 'Zancada cruzada',
      cue: {
        step_behind_and_across: 'Da el paso atrás y cruzado, por detrás de la pierna de apoyo.',
        hips_facing_forward: 'Caderas mirando al frente, sin girar.',
        controlled_tempo: 'Ritmo controlado en ambas fases, sin tirones.',
      },
      mistake: {
        twisting_the_knee: 'Girar la rodilla.',
        losing_balance: 'Perder el equilibrio.',
      },
      safety: {
        stop_if_knee_pain: 'Para si notas dolor en la rodilla. Si persiste, consúltalo con un profesional.',
      },
    },
    step_up: {
      name: 'Subidas al cajón',
      cue: {
        full_foot_on_box: 'Apoya todo el pie sobre el cajón.',
        drive_through_heel: 'Sube empujando con el talón del pie apoyado.',
        lower_under_control: 'Baja con control, sin dejarte caer.',
      },
      mistake: {
        pushing_off_back_foot: 'Impulsarse con el pie de atrás.',
        box_too_high: 'Usar un cajón demasiado alto.',
      },
      safety: {
        use_stable_surface: 'Usa un apoyo firme que no se mueva ni resbale.',
      },
    },
    dumbbell_walking_lunge: {
      name: 'Zancadas caminando con mancuernas',
      cue: {
        weights_at_sides: 'Peso a los lados, brazos estirados.',
        long_step: 'Paso largo, para que la espinilla delantera quede vertical.',
        torso_tall: 'Tronco erguido.',
      },
      mistake: {
        front_knee_caving: 'Dejar que la rodilla delantera se meta hacia dentro.',
        leaning_forward: 'Inclinar el tronco hacia delante en exceso.',
      },
      safety: {
        clear_space_ahead: 'Asegúrate de tener espacio libre por delante.',
      },
    },
    dumbbell_bulgarian_split_squat: {
      name: 'Sentadilla búlgara con mancuernas',
      cue: {
        rear_foot_elevated: 'Pie trasero apoyado en un banco o cajón bajo.',
        weights_at_sides: 'Peso a los lados, brazos estirados.',
        slow_descent: 'Baja despacio, en dos o tres segundos.',
      },
      mistake: {
        losing_balance: 'Perder el equilibrio.',
        rear_foot_too_close: 'Pie trasero demasiado cerca del banco.',
      },
      safety: {
        use_stable_surface: 'Usa un apoyo firme que no se mueva ni resbale.',
      },
    },
    dumbbell_step_up: {
      name: 'Subidas al cajón con mancuernas',
      cue: {
        full_foot_on_box: 'Apoya todo el pie sobre el cajón.',
        drive_through_heel: 'Sube empujando con el talón del pie apoyado.',
        controlled_descent: 'Baja con control, en unos dos segundos.',
      },
      mistake: {
        pushing_off_back_foot: 'Impulsarse con el pie de atrás.',
        box_too_high: 'Usar un cajón demasiado alto.',
      },
      safety: {
        use_stable_surface: 'Usa un apoyo firme que no se mueva ni resbale.',
      },
    },
    barbell_lunge: {
      name: 'Zancadas con barra',
      cue: {
        bar_settled_on_traps: 'Asienta la barra sobre los trapecios antes de dar el primer paso.',
        long_step: 'Paso largo, para que la espinilla delantera quede vertical.',
        brace_core: 'Coge aire y aprieta el abdomen como si fueras a recibir un golpe.',
      },
      mistake: {
        losing_balance: 'Perder el equilibrio.',
        short_steps: 'Pasos demasiado cortos.',
      },
      safety: {
        clear_space_ahead: 'Asegúrate de tener espacio libre por delante.',
        set_safety_bars: 'Coloca los topes de seguridad del rack justo por debajo de tu posición más baja.',
      },
    },
    farmers_carry_dumbbells: {
      name: 'Farmer\'s walk con mancuernas',
      cue: {
        stand_tall: 'Erguido, mirando al frente.',
        ribs_down: 'Costillas abajo: sin arquear la lumbar.',
        short_quick_steps: 'Pasos cortos y rápidos.',
      },
      mistake: {
        leaning_to_one_side: 'Ladearse hacia un lado.',
        shrugging: 'Encoger los hombros hacia las orejas.',
      },
      safety: {
        clear_the_path: 'Despeja el recorrido de obstáculos.',
        set_down_safely: 'Deja el peso en el suelo con control; no lo sueltes desde arriba.',
      },
    },
    kettlebell_farmers_carry: {
      name: 'Farmer\'s walk con kettlebells',
      cue: {
        stand_tall: 'Erguido, mirando al frente.',
        brace_core: 'Coge aire y aprieta el abdomen como si fueras a recibir un golpe.',
        steady_breathing: 'Respira de forma regular.',
      },
      mistake: {
        leaning_to_one_side: 'Ladearse hacia un lado.',
        holding_breath: 'Aguantar la respiración.',
      },
      safety: {
        clear_the_path: 'Despeja el recorrido de obstáculos.',
      },
    },
    suitcase_carry: {
      name: 'Paseo con carga a un lado (suitcase carry)',
      cue: {
        load_on_one_side: 'Lleva el peso solo en un lado, con el brazo estirado.',
        resist_the_lean: 'No dejes que el peso te incline; mantente vertical.',
        even_steps: 'Pasos regulares y del mismo tamaño.',
      },
      mistake: {
        leaning_toward_the_weight: 'Inclinarse hacia el lado del peso.',
        rushing: 'Ir con prisa.',
      },
      safety: {
        alternate_sides: 'Haz la misma distancia con cada lado.',
        set_down_safely: 'Deja el peso en el suelo con control; no lo sueltes desde arriba.',
      },
    },
    overhead_carry_dumbbell: {
      name: 'Paseo con mancuerna sobre la cabeza',
      cue: {
        elbow_locked: 'Codo bloqueado y brazo vertical durante todo el paseo.',
        ribs_down: 'Costillas abajo: sin arquear la lumbar.',
        eyes_forward: 'Mirada al frente, no al peso.',
      },
      mistake: {
        overarching_lower_back: 'Arquear en exceso la zona lumbar.',
        letting_the_arm_drift: 'Dejar que el brazo se desvíe hacia delante o el lado.',
      },
      safety: {
        clear_space_overhead: 'Comprueba que no hay nada encima de ti.',
        stop_if_shoulder_pain: 'Para si notas dolor en el hombro. Si persiste, consúltalo con un profesional.',
      },
    },
    front_rack_carry_kettlebell: {
      name: 'Paseo con kettlebell en posición frontal',
      cue: {
        rack_position: 'Kettlebell apoyada en el antebrazo y pegada al pecho, codo abajo.',
        ribs_down: 'Costillas abajo: sin arquear la lumbar.',
        steady_breathing: 'Respira de forma regular.',
      },
      mistake: {
        leaning_back: 'Inclinarse hacia atrás.',
        wrist_bent_back: 'Doblar la muñeca hacia atrás.',
      },
      safety: {
        set_down_safely: 'Deja el peso en el suelo con control; no lo sueltes desde arriba.',
      },
    },
    plate_carry: {
      name: 'Paseo con disco',
      cue: {
        plate_at_chest_height: 'Disco sujeto a la altura del pecho.',
        arms_extended: 'Brazos estirados al frente sujetando la carga.',
        stand_tall: 'Erguido, mirando al frente.',
      },
      mistake: {
        letting_plate_drop: 'Dejar que el disco baje.',
        leaning_back: 'Inclinarse hacia atrás.',
      },
      safety: {
        clear_the_path: 'Despeja el recorrido de obstáculos.',
      },
    },
    backpack_carry: {
      name: 'Paseo con mochila cargada',
      cue: {
        load_close_to_body: 'Carga pegada al cuerpo.',
        stand_tall: 'Erguido, mirando al frente.',
        even_steps: 'Pasos regulares y del mismo tamaño.',
      },
      mistake: {
        leaning_forward: 'Inclinar el tronco hacia delante en exceso.',
        overloading_the_bag: 'Cargar demasiado la mochila.',
      },
      safety: {
        clear_the_path: 'Despeja el recorrido de obstáculos.',
      },
    },
    plank: {
      name: 'Plancha',
      cue: {
        elbows_under_shoulders: 'Codos justo debajo de los hombros.',
        ribs_down: 'Costillas abajo: sin arquear la lumbar.',
        squeeze_glutes: 'Aprieta el glúteo.',
      },
      mistake: {
        hips_sagging: 'Dejar caer la cadera.',
        hips_too_high: 'Subir demasiado la cadera.',
      },
      safety: {
        stop_if_back_pain: 'Para si notas dolor en la espalda. Si persiste, consúltalo con un profesional.',
      },
    },
    side_plank: {
      name: 'Plancha lateral',
      cue: {
        elbow_under_shoulder: 'Codo justo debajo del hombro.',
        hips_stacked: 'Cadera y hombros apilados en vertical.',
        lift_the_hip: 'Eleva la cadera hasta que el cuerpo quede en línea recta.',
      },
      mistake: {
        hips_dropping: 'Dejar caer la cadera.',
        rotating_forward: 'Girar el tronco hacia delante.',
      },
      safety: {
        stop_if_shoulder_pain: 'Para si notas dolor en el hombro. Si persiste, consúltalo con un profesional.',
      },
    },
    dead_bug: {
      name: 'Dead bug',
      cue: {
        lower_back_flat: 'Lumbar pegada al suelo durante todo el ejercicio.',
        opposite_arm_and_leg: 'Estira brazo y pierna contrarios a la vez.',
        exhale_on_extension: 'Suelta el aire mientras estiras brazo y pierna.',
      },
      mistake: {
        back_arching_off_floor: 'Despegar la lumbar del suelo.',
        moving_too_fast: 'Ir demasiado rápido.',
      },
      safety: {
        reduce_range_if_back_arches: 'Si la lumbar se arquea, acorta el recorrido.',
      },
    },
    bird_dog: {
      name: 'Bird dog',
      cue: {
        flat_back: 'Espalda plana y neutra, sin redondearla.',
        extend_opposite_limbs: 'Estira brazo y pierna contrarios hasta quedar en línea con el tronco.',
        no_hip_rotation: 'La cadera no gira ni se inclina.',
      },
      mistake: {
        arching_the_back: 'Arquear la espalda.',
        rushing: 'Ir con prisa.',
      },
      safety: {
        stop_if_back_pain: 'Para si notas dolor en la espalda. Si persiste, consúltalo con un profesional.',
      },
    },
    hollow_hold: {
      name: 'Hollow hold',
      cue: {
        lower_back_pressed_down: 'Presiona la lumbar contra el suelo.',
        shoulders_off_floor: 'Hombros despegados del suelo.',
        steady_breathing: 'Respira de forma regular.',
      },
      mistake: {
        back_arching_off_floor: 'Despegar la lumbar del suelo.',
        holding_breath: 'Aguantar la respiración.',
      },
      safety: {
        bend_knees_to_regress: 'Si la lumbar se despega, flexiona las rodillas.',
      },
    },
    lying_leg_raise: {
      name: 'Elevaciones de piernas tumbado',
      cue: {
        hands_under_hips: 'Coloca las manos bajo la cadera para apoyar la lumbar.',
        legs_straight: 'Piernas estiradas o casi estiradas.',
        lower_slowly: 'Baja las piernas despacio, sin que caigan.',
      },
      mistake: {
        back_arching_off_floor: 'Despegar la lumbar del suelo.',
        using_momentum: 'Usar impulso.',
      },
      safety: {
        bend_knees_to_regress: 'Si la lumbar se despega, flexiona las rodillas.',
      },
    },
    reverse_crunch: {
      name: 'Crunch inverso',
      cue: {
        curl_hips_off_floor: 'Enrolla la pelvis y despega la cadera del suelo.',
        knees_toward_chest: 'Lleva las rodillas hacia el pecho.',
        slow_lowering: 'Baja despacio, frenando el peso.',
      },
      mistake: {
        swinging_the_legs: 'Lanzar las piernas con impulso.',
        pulling_with_neck: 'Tirar con el cuello.',
      },
      safety: {
        stop_if_back_pain: 'Para si notas dolor en la espalda. Si persiste, consúltalo con un profesional.',
      },
    },
    hanging_knee_raise: {
      name: 'Elevaciones de rodillas colgado',
      cue: {
        stop_the_swing: 'Frena el balanceo antes de cada repetición.',
        curl_the_pelvis: 'Enrosca la pelvis hacia arriba al subir las rodillas.',
        lower_under_control: 'Baja con control, sin dejarte caer.',
      },
      mistake: {
        swinging: 'Balancearse.',
        only_bending_hips: 'Flexionar solo la cadera sin enroscar la pelvis.',
      },
      safety: {
        check_bar_is_secure: 'Comprueba que la barra está bien fijada antes de colgarte.',
      },
    },
    mountain_climber: {
      name: 'Escaladores',
      cue: {
        plank_position: 'Posición de plancha: manos bajo los hombros, cuerpo en línea.',
        hips_low: 'Cadera baja, en línea con los hombros.',
        quick_but_controlled: 'Rápido pero con control; cada rodilla llega al mismo punto.',
      },
      mistake: {
        hips_bouncing_up: 'Subir y bajar la cadera con cada zancada.',
        short_range: 'Acortar el recorrido.',
      },
      safety: {
        stop_if_wrist_pain: 'Para si notas dolor en la muñeca. Si persiste, consúltalo con un profesional.',
      },
    },
    plank_to_push_up: {
      name: 'Plancha a flexión',
      cue: {
        minimize_hip_rotation: 'Mantén la cadera lo más quieta posible.',
        one_arm_at_a_time: 'Cambia de codo a mano de uno en uno, sin prisa.',
        ribs_down: 'Costillas abajo: sin arquear la lumbar.',
      },
      mistake: {
        hips_swinging: 'Balancear la cadera de lado a lado.',
        sagging_hips: 'Dejar caer la cadera.',
      },
      safety: {
        stop_if_wrist_pain: 'Para si notas dolor en la muñeca. Si persiste, consúltalo con un profesional.',
      },
    },
    russian_twist: {
      name: 'Giro ruso',
      cue: {
        tall_chest: 'Pecho alto y espalda recta.',
        rotate_from_ribs: 'Gira desde las costillas, no desde los brazos.',
        controlled_tempo: 'Ritmo controlado en ambas fases, sin tirones.',
      },
      mistake: {
        rounding_the_back: 'Encorvar la espalda.',
        moving_only_the_arms: 'Mover solo los brazos, no el tronco.',
      },
      safety: {
        stop_if_back_pain: 'Para si notas dolor en la espalda. Si persiste, consúltalo con un profesional.',
      },
    },
    copenhagen_plank: {
      name: 'Plancha Copenhague',
      cue: {
        top_leg_on_support: 'Pierna superior apoyada sobre el banco.',
        hips_high: 'Cadera alta, en línea entre hombros y pies.',
        short_holds_first: 'Empieza con aguantes cortos y aumenta con el tiempo.',
      },
      mistake: {
        hips_dropping: 'Dejar caer la cadera.',
        holding_too_long: 'Aguantar demasiado tiempo desde el principio.',
      },
      safety: {
        start_with_bent_knee: 'Empieza con la rodilla flexionada apoyada en el banco.',
        stop_if_groin_discomfort: 'Para si notas molestias en la ingle. Si persisten, consúltalo con un profesional.',
      },
    },
    pallof_press_cable: {
      name: 'Press Pallof en polea',
      cue: {
        stand_side_on: 'Colócate de lado a la polea.',
        press_straight_out: 'Estira los brazos rectos al frente, a la altura del pecho.',
        resist_rotation: 'Resiste el tirón; el tronco no gira.',
      },
      mistake: {
        letting_the_torso_turn: 'Dejar que el tronco gire.',
        holding_breath: 'Aguantar la respiración.',
      },
      safety: {
        keep_load_light: 'Usa poco peso; aquí importa la técnica.',
      },
    },
    pallof_press_band: {
      name: 'Press Pallof con banda',
      cue: {
        anchor_at_chest_height: 'Ancla la banda a la altura del pecho.',
        press_and_hold: 'Estira los brazos al frente y aguanta unos segundos.',
        resist_rotation: 'Resiste el tirón; el tronco no gira.',
      },
      mistake: {
        letting_the_torso_turn: 'Dejar que el tronco gire.',
        band_slipping: 'Dejar que la banda se mueva o resbale.',
      },
      safety: {
        check_anchor_point: 'Comprueba que el anclaje aguanta antes de tirar.',
      },
    },
    cable_crunch: {
      name: 'Crunch en polea',
      cue: {
        hips_stay_fixed: 'La cadera no se mueve; solo se enrosca el tronco.',
        curl_the_spine: 'Enrosca la columna llevando las costillas hacia la pelvis.',
        exhale_at_bottom: 'Suelta el aire al llegar abajo.',
      },
      mistake: {
        pulling_with_arms: 'Tirar con los brazos.',
        hinging_at_hips: 'Doblar por la cadera en vez de enroscar el tronco.',
      },
      safety: {
        check_pin_and_clips: 'Comprueba que el pasador está bien metido y el accesorio bien enganchado.',
      },
    },
    machine_ab_crunch: {
      name: 'Crunch de abdominales en máquina',
      cue: {
        align_pivot_with_ribs: 'Coloca el eje de la máquina a la altura de las costillas bajas.',
        curl_not_hinge: 'Enrosca el tronco, no lo dobles por la cadera.',
        slow_return: 'Vuelve despacio a la posición inicial.',
      },
      mistake: {
        using_momentum: 'Usar impulso.',
        partial_range: 'Acortar el recorrido.',
      },
      safety: {
        adjust_seat_first: 'Ajusta el asiento y los apoyos antes de la primera repetición.',
      },
    },
    dumbbell_biceps_curl: {
      name: 'Curl de bíceps con mancuernas',
      cue: {
        elbows_at_sides: 'Codos pegados a los costados, sin moverlos.',
        full_range: 'Recorre todo el rango de movimiento, sin acortar arriba ni abajo.',
        slow_lowering: 'Baja despacio, frenando el peso.',
      },
      mistake: {
        swinging_the_torso: 'Balancear el tronco para subir el peso.',
        elbows_drifting_forward: 'Adelantar los codos al subir.',
      },
      safety: {
        start_light: 'Empieza con poco peso hasta dominar la técnica.',
      },
    },
    barbell_biceps_curl: {
      name: 'Curl de bíceps con barra',
      cue: {
        elbows_pinned: 'Codos clavados en su sitio; solo se mueve el antebrazo.',
        no_torso_swing: 'El tronco se queda quieto; sin balanceo.',
        controlled_tempo: 'Ritmo controlado en ambas fases, sin tirones.',
      },
      mistake: {
        using_the_lower_back: 'Ayudarse con la zona lumbar.',
        half_range: 'Hacer solo medio recorrido.',
      },
      safety: {
        stop_if_elbow_pain: 'Para si notas dolor en el codo. Si persiste, consúltalo con un profesional.',
      },
    },
    hammer_curl: {
      name: 'Curl martillo',
      cue: {
        neutral_grip: 'Palmas mirándose entre sí durante todo el movimiento.',
        elbows_at_sides: 'Codos pegados a los costados, sin moverlos.',
        slow_lowering: 'Baja despacio, frenando el peso.',
      },
      mistake: {
        swinging_the_torso: 'Balancear el tronco para subir el peso.',
        shrugging: 'Encoger los hombros hacia las orejas.',
      },
      safety: {
        start_light: 'Empieza con poco peso hasta dominar la técnica.',
      },
    },
    cable_biceps_curl: {
      name: 'Curl de bíceps en polea',
      cue: {
        constant_tension: 'Mantén la tensión del cable durante todo el recorrido, sin descansar al final.',
        elbows_fixed: 'Codos fijos en el mismo punto durante toda la serie.',
        full_range: 'Recorre todo el rango de movimiento, sin acortar arriba ni abajo.',
      },
      mistake: {
        leaning_back: 'Inclinarse hacia atrás.',
        using_momentum: 'Usar impulso.',
      },
      safety: {
        check_pin_and_clips: 'Comprueba que el pasador está bien metido y el accesorio bien enganchado.',
      },
    },
    band_biceps_curl: {
      name: 'Curl de bíceps con banda',
      cue: {
        band_under_feet: 'Pisa la banda con ambos pies para fijarla.',
        elbows_at_sides: 'Codos pegados a los costados, sin moverlos.',
        slow_return: 'Vuelve despacio a la posición inicial.',
      },
      mistake: {
        band_slipping: 'Dejar que la banda se mueva o resbale.',
        half_range: 'Hacer solo medio recorrido.',
      },
      safety: {
        check_band_wear: 'Revisa la banda: si tiene grietas o cortes, no la uses.',
      },
    },
    triceps_pushdown_cable: {
      name: 'Extensión de tríceps en polea',
      cue: {
        elbows_pinned_to_ribs: 'Codos pegados a las costillas durante toda la serie.',
        extend_fully: 'Estira los brazos del todo abajo.',
        slow_return: 'Vuelve despacio a la posición inicial.',
      },
      mistake: {
        elbows_flaring_out: 'Abrir los codos hacia fuera.',
        leaning_over_the_bar: 'Echar el cuerpo encima de la barra.',
      },
      safety: {
        check_pin_and_clips: 'Comprueba que el pasador está bien metido y el accesorio bien enganchado.',
      },
    },
    band_triceps_pushdown: {
      name: 'Extensión de tríceps con banda',
      cue: {
        anchor_overhead: 'Ancla la banda por encima de la cabeza, en un punto fijo.',
        elbows_pinned: 'Codos clavados en su sitio; solo se mueve el antebrazo.',
        full_extension: 'Estira el brazo por completo al final del recorrido.',
      },
      mistake: {
        band_slipping: 'Dejar que la banda se mueva o resbale.',
        elbows_flaring_out: 'Abrir los codos hacia fuera.',
      },
      safety: {
        check_anchor_point: 'Comprueba que el anclaje aguanta antes de tirar.',
      },
    },
    overhead_triceps_extension_dumbbell: {
      name: 'Extensión de tríceps sobre la cabeza con mancuerna',
      cue: {
        elbows_close_to_head: 'Codos cerca de la cabeza, apuntando al techo.',
        ribs_down: 'Costillas abajo: sin arquear la lumbar.',
        controlled_descent: 'Baja con control, en unos dos segundos.',
      },
      mistake: {
        elbows_flaring_out: 'Abrir los codos hacia fuera.',
        arching_the_back: 'Arquear la espalda.',
      },
      safety: {
        start_light: 'Empieza con poco peso hasta dominar la técnica.',
        stop_if_elbow_pain: 'Para si notas dolor en el codo. Si persiste, consúltalo con un profesional.',
      },
    },
    skull_crusher: {
      name: 'Press francés',
      cue: {
        elbows_stay_still: 'Los codos no se mueven; solo baja y sube el antebrazo.',
        lower_behind_forehead: 'Baja la barra hasta justo detrás de la frente.',
        no_lockout_slam: 'No bloquees la articulación de golpe al final del recorrido.',
      },
      mistake: {
        elbows_drifting: 'Dejar que los codos se muevan.',
        bouncing_the_bar: 'Rebotar la barra en el punto más bajo.',
      },
      safety: {
        use_spotter_or_safeties: 'Usa topes de seguridad o pide que alguien te vigile.',
        stop_if_elbow_pain: 'Para si notas dolor en el codo. Si persiste, consúltalo con un profesional.',
      },
    },
    lateral_raise_dumbbell: {
      name: 'Elevaciones laterales con mancuernas',
      cue: {
        slight_elbow_bend: 'Codos ligeramente flexionados, fijos en esa posición.',
        lead_with_elbows: 'Sube guiando con los codos, no con las manos.',
        stop_at_shoulder_height: 'Sube hasta la altura de los hombros y no más.',
      },
      mistake: {
        shrugging: 'Encoger los hombros hacia las orejas.',
        swinging_the_weights: 'Balancear las mancuernas.',
      },
      safety: {
        keep_load_light: 'Usa poco peso; aquí importa la técnica.',
      },
    },
    band_lateral_raise: {
      name: 'Elevaciones laterales con banda',
      cue: {
        band_under_feet: 'Pisa la banda con ambos pies para fijarla.',
        lead_with_elbows: 'Sube guiando con los codos, no con las manos.',
        slow_return: 'Vuelve despacio a la posición inicial.',
      },
      mistake: {
        shrugging: 'Encoger los hombros hacia las orejas.',
        band_slipping: 'Dejar que la banda se mueva o resbale.',
      },
      safety: {
        check_band_wear: 'Revisa la banda: si tiene grietas o cortes, no la uses.',
      },
    },
    rear_delt_fly_dumbbell: {
      name: 'Pájaros con mancuernas',
      cue: {
        hinge_forward: 'Inclina el tronco desde la cadera hasta casi paralelo al suelo.',
        thumbs_slightly_down: 'Pulgares ligeramente hacia abajo.',
        squeeze_rear_delts: 'Aprieta la parte posterior del hombro al final.',
      },
      mistake: {
        using_too_much_weight: 'Usar demasiado peso.',
        rowing_instead_of_flying: 'Convertirlo en un remo flexionando los codos.',
      },
      safety: {
        keep_load_light: 'Usa poco peso; aquí importa la técnica.',
      },
    },
    prone_y_t_raise: {
      name: 'Elevaciones en Y y T boca abajo',
      cue: {
        lie_face_down: 'Túmbate boca abajo en un banco o en el suelo.',
        thumbs_up: 'Pulgares apuntando al techo.',
        lift_from_the_blades: 'Eleva los brazos juntando los omóplatos, no con los hombros.',
      },
      mistake: {
        shrugging: 'Encoger los hombros hacia las orejas.',
        lifting_the_head: 'Levantar la cabeza.',
      },
      safety: {
        keep_range_comfortable: 'Muévete solo dentro de un rango cómodo.',
      },
    },
    dumbbell_chest_fly: {
      name: 'Aperturas con mancuernas',
      cue: {
        slight_elbow_bend: 'Codos ligeramente flexionados, fijos en esa posición.',
        wide_arc: 'Abre los brazos en un arco amplio.',
        stop_at_chest_level: 'Detén las mancuernas a la altura del pecho.',
      },
      mistake: {
        going_too_deep: 'Bajar más de lo que el hombro tolera.',
        turning_it_into_a_press: 'Convertirlo en un press doblando los codos.',
      },
      safety: {
        start_light: 'Empieza con poco peso hasta dominar la técnica.',
        stop_if_shoulder_pain: 'Para si notas dolor en el hombro. Si persiste, consúltalo con un profesional.',
      },
    },
    cable_chest_fly: {
      name: 'Aperturas en polea',
      cue: {
        staggered_stance: 'Un pie adelantado para tener una base estable.',
        constant_tension: 'Mantén la tensión del cable durante todo el recorrido, sin descansar al final.',
        squeeze_at_the_front: 'Junta las manos delante y aprieta el pecho.',
      },
      mistake: {
        bending_the_elbows_too_much: 'Doblar los codos en exceso durante el recorrido.',
        leaning_forward: 'Inclinar el tronco hacia delante en exceso.',
      },
      safety: {
        check_pin_and_clips: 'Comprueba que el pasador está bien metido y el accesorio bien enganchado.',
      },
    },
    leg_extension_machine: {
      name: 'Extensión de cuádriceps en máquina',
      cue: {
        align_knee_with_pivot: 'Alinea la rodilla con el eje de giro de la máquina antes de empezar.',
        extend_smoothly: 'Estira las piernas de forma suave, sin golpes.',
        slow_return: 'Vuelve despacio a la posición inicial.',
      },
      mistake: {
        slamming_into_extension: 'Extender de golpe hasta el bloqueo.',
        partial_range: 'Acortar el recorrido.',
      },
      safety: {
        adjust_seat_first: 'Ajusta el asiento y los apoyos antes de la primera repetición.',
        stop_if_knee_pain: 'Para si notas dolor en la rodilla. Si persiste, consúltalo con un profesional.',
      },
    },
    leg_curl_machine: {
      name: 'Curl femoral en máquina',
      cue: {
        align_knee_with_pivot: 'Alinea la rodilla con el eje de giro de la máquina antes de empezar.',
        curl_fully: 'Flexiona hasta que el talón se acerque al glúteo.',
        slow_return: 'Vuelve despacio a la posición inicial.',
      },
      mistake: {
        lifting_the_hips: 'Levantar la cadera del banco.',
        partial_range: 'Acortar el recorrido.',
      },
      safety: {
        adjust_seat_first: 'Ajusta el asiento y los apoyos antes de la primera repetición.',
      },
    },
    nordic_hamstring_curl: {
      name: 'Curl nórdico',
      cue: {
        anchor_the_ankles: 'Fija los tobillos bajo un soporte estable o con ayuda de alguien.',
        lower_as_slowly_as_possible: 'Baja el tronco tan despacio como puedas.',
        hips_extended: 'Cadera estirada: el cuerpo forma una línea de rodillas a hombros.',
      },
      mistake: {
        bending_at_the_hips: 'Doblar por la cadera en vez de mantenerla extendida.',
        dropping_too_fast: 'Bajar demasiado rápido.',
      },
      safety: {
        use_hands_to_catch: 'Ten las manos listas para frenar la caída.',
        expect_soreness_first_weeks: 'Es normal notar agujetas fuertes al principio: empieza con pocas repeticiones.',
      },
    },
    standing_calf_raise: {
      name: 'Elevaciones de gemelos de pie',
      cue: {
        full_stretch_at_bottom: 'Deja caer el talón por debajo del escalón hasta notar el estiramiento.',
        pause_at_top: 'Aguanta un segundo en el punto más alto.',
        slow_tempo: 'Ritmo lento en todo el recorrido.',
      },
      mistake: {
        bouncing: 'Rebotar en vez de controlar.',
        short_range: 'Acortar el recorrido.',
      },
      safety: {
        hold_support_if_needed: 'Si pierdes el equilibrio, apóyate en algo estable.',
      },
    },
    dumbbell_calf_raise: {
      name: 'Elevaciones de gemelos con mancuernas',
      cue: {
        weights_at_sides: 'Peso a los lados, brazos estirados.',
        full_range: 'Recorre todo el rango de movimiento, sin acortar arriba ni abajo.',
        pause_at_top: 'Aguanta un segundo en el punto más alto.',
      },
      mistake: {
        bouncing: 'Rebotar en vez de controlar.',
        short_range: 'Acortar el recorrido.',
      },
      safety: {
        hold_support_if_needed: 'Si pierdes el equilibrio, apóyate en algo estable.',
      },
    },
    calf_raise_machine: {
      name: 'Elevaciones de gemelos en máquina',
      cue: {
        shoulders_under_pads: 'Hombros bien colocados bajo las almohadillas.',
        full_stretch: 'Baja el talón hasta notar el estiramiento completo del gemelo.',
        controlled_tempo: 'Ritmo controlado en ambas fases, sin tirones.',
      },
      mistake: {
        bouncing: 'Rebotar en vez de controlar.',
        locking_the_knees_hard: 'Bloquear las rodillas con fuerza.',
      },
      safety: {
        adjust_seat_first: 'Ajusta el asiento y los apoyos antes de la primera repetición.',
      },
    },
    dumbbell_shrug: {
      name: 'Encogimientos de hombros con mancuernas',
      cue: {
        straight_up_and_down: 'Sube los hombros hacia las orejas y bájalos en línea recta.',
        pause_at_top: 'Aguanta un segundo en el punto más alto.',
        no_rolling: 'Sin rotar los hombros: solo arriba y abajo.',
      },
      mistake: {
        rolling_the_shoulders: 'Rotar los hombros en círculo.',
        using_the_lower_back: 'Ayudarse con la zona lumbar.',
      },
      safety: {
        stop_if_neck_discomfort: 'Para si notas molestias en el cuello. Si persisten, consúltalo con un profesional.',
      },
    },
    wrist_curl_dumbbell: {
      name: 'Curl de muñeca con mancuerna',
      cue: {
        forearm_supported: 'Antebrazo apoyado en el muslo o el banco, con la muñeca fuera.',
        small_controlled_range: 'Rango pequeño y controlado.',
        light_load: 'Usa una carga ligera: el ejercicio funciona con poco peso.',
      },
      mistake: {
        using_too_much_weight: 'Usar demasiado peso.',
        jerking: 'Hacer el movimiento a tirones.',
      },
      safety: {
        stop_if_wrist_pain: 'Para si notas dolor en la muñeca. Si persiste, consúltalo con un profesional.',
      },
    },
    glute_kickback_band: {
      name: 'Patada de glúteo con banda',
      cue: {
        flat_back: 'Espalda plana y neutra, sin redondearla.',
        drive_heel_back: 'Empuja con el talón hacia atrás, con la rodilla flexionada.',
        squeeze_at_top: 'Aprieta el glúteo con fuerza en el punto más alto.',
      },
      mistake: {
        arching_the_lower_back: 'Arquear la zona lumbar.',
        swinging_the_leg: 'Balancear la pierna con impulso.',
      },
      safety: {
        check_band_wear: 'Revisa la banda: si tiene grietas o cortes, no la uses.',
      },
    },
    hip_abduction_band: {
      name: 'Abducción de cadera con banda',
      cue: {
        band_above_knees: 'Coloca la banda justo por encima de las rodillas.',
        open_without_rocking: 'Abre las rodillas sin balancear el tronco.',
        slow_return: 'Vuelve despacio a la posición inicial.',
      },
      mistake: {
        rocking_the_torso: 'Balancear el tronco.',
        band_too_stiff: 'Usar una banda demasiado dura.',
      },
      safety: {
        check_band_wear: 'Revisa la banda: si tiene grietas o cortes, no la uses.',
      },
    },
    stationary_bike_steady: {
      name: 'Bicicleta estática a ritmo constante',
      cue: {
        adjust_saddle_height: 'Ajusta el sillín para que la rodilla quede casi estirada con el pedal abajo.',
        steady_cadence: 'Cadencia constante durante todo el tiempo.',
        conversational_pace: 'Ritmo al que podrías mantener una conversación.',
      },
      mistake: {
        saddle_too_low: 'Sillín demasiado bajo.',
        gripping_too_tight: 'Apretar el manillar en exceso.',
      },
      safety: {
        adjust_seat_first: 'Ajusta el asiento y los apoyos antes de la primera repetición.',
      },
    },
    stationary_bike_intervals: {
      name: 'Bicicleta estática por intervalos',
      cue: {
        warm_up_first: 'Calienta unos minutos a ritmo suave antes de empezar.',
        hard_effort_then_easy: 'Alterna tramos de esfuerzo alto con tramos suaves.',
        finish_with_easy_spin: 'Acaba con unos minutos pedaleando suave.',
      },
      mistake: {
        skipping_the_warm_up: 'Saltarse el calentamiento.',
        intervals_too_long: 'Intervalos demasiado largos.',
      },
      safety: {
        build_intensity_gradually: 'Sube la intensidad poco a poco a lo largo de las semanas.',
      },
    },
    treadmill_walk_incline: {
      name: 'Caminar en cinta con inclinación',
      cue: {
        no_holding_the_rails: 'Sin agarrarte a las barandillas; brazos sueltos.',
        upright_posture: 'Postura erguida.',
        steady_breathing: 'Respira de forma regular.',
      },
      mistake: {
        leaning_on_the_handles: 'Apoyarse en las asas.',
        incline_too_steep_too_soon: 'Subir la inclinación demasiado pronto.',
      },
      safety: {
        use_the_safety_clip: 'Engancha la pinza de seguridad de la cinta a la ropa.',
      },
    },
    treadmill_run_intervals: {
      name: 'Correr en cinta por intervalos',
      cue: {
        warm_up_first: 'Calienta unos minutos a ritmo suave antes de empezar.',
        step_on_at_speed: 'Súbete solo cuando la cinta esté a la velocidad correcta.',
        cool_down_walking: 'Termina con unos minutos caminando para bajar pulsaciones.',
      },
      mistake: {
        skipping_the_warm_up: 'Saltarse el calentamiento.',
        jumping_on_at_full_speed: 'Subir a la cinta a toda velocidad.',
      },
      safety: {
        use_the_safety_clip: 'Engancha la pinza de seguridad de la cinta a la ropa.',
      },
    },
    rowing_machine_steady: {
      name: 'Remo (máquina) a ritmo constante',
      cue: {
        legs_then_hips_then_arms: 'Orden de la palada: piernas, luego cadera, luego brazos.',
        flat_back: 'Espalda plana y neutra, sin redondearla.',
        steady_rate: 'Ritmo de palada constante.',
      },
      mistake: {
        pulling_with_arms_first: 'Empezar la palada con los brazos.',
        rounding_the_back: 'Encorvar la espalda.',
      },
      safety: {
        set_footstraps_first: 'Ajusta las correas de los pies antes de empezar.',
      },
    },
    rowing_machine_intervals: {
      name: 'Remo (máquina) por intervalos',
      cue: {
        warm_up_first: 'Calienta unos minutos a ritmo suave antes de empezar.',
        drive_with_the_legs: 'Empuja fuerte con las piernas en cada palada.',
        easy_recovery_strokes: 'Entre intervalos, rema suave para recuperarte.',
      },
      mistake: {
        rushing_the_recovery: 'Acortar la fase de recuperación.',
        rounding_the_back: 'Encorvar la espalda.',
      },
      safety: {
        build_intensity_gradually: 'Sube la intensidad poco a poco a lo largo de las semanas.',
      },
    },
    jumping_jacks: {
      name: 'Jumping jacks',
      cue: {
        soft_knees: 'Rodillas ligeramente flexionadas, nunca bloqueadas.',
        full_arm_range: 'Los brazos suben del todo, hasta juntar las manos arriba.',
        steady_rhythm: 'Ritmo constante.',
      },
      mistake: {
        landing_stiff: 'Aterrizar con las piernas rígidas.',
        half_range: 'Hacer solo medio recorrido.',
      },
      safety: {
        land_on_soft_surface: 'Hazlo sobre una superficie que amortigüe.',
      },
    },
    high_knees: {
      name: 'Rodillas arriba',
      cue: {
        knees_to_hip_height: 'Sube las rodillas hasta la altura de la cadera.',
        stay_on_the_balls_of_feet: 'Mantente sobre la parte delantera del pie.',
        arms_driving: 'Acompaña con los brazos, como al correr.',
      },
      mistake: {
        leaning_back: 'Inclinarse hacia atrás.',
        low_knees: 'Rodillas demasiado bajas.',
      },
      safety: {
        land_on_soft_surface: 'Hazlo sobre una superficie que amortigüe.',
      },
    },
    jump_rope: {
      name: 'Saltar a la comba',
      cue: {
        small_jumps: 'Saltos pequeños, apenas para que pase la cuerda.',
        wrists_do_the_work: 'El giro sale de las muñecas, no de los brazos.',
        stay_relaxed: 'Hombros relajados.',
      },
      mistake: {
        jumping_too_high: 'Saltar demasiado alto.',
        using_the_whole_arm: 'Girar con todo el brazo.',
      },
      safety: {
        land_on_soft_surface: 'Hazlo sobre una superficie que amortigüe.',
      },
    },
    burpee: {
      name: 'Burpees',
      cue: {
        step_back_to_regress: 'Si es demasiado, lleva los pies atrás caminando en vez de saltar.',
        chest_to_floor_optional: 'Si controlas la flexión, baja el pecho al suelo; si no, apoya las manos y sigue.',
        stand_fully_each_rep: 'Ponte de pie del todo en cada repetición.',
      },
      mistake: {
        sagging_hips_on_the_push_up: 'Dejar caer la cadera en la flexión.',
        rushing_and_losing_form: 'Acelerar y perder la técnica.',
      },
      safety: {
        step_instead_of_jump_if_needed: 'Si te cansas, cambia los saltos por pasos.',
      },
    },
    brisk_walk: {
      name: 'Caminar a paso ligero',
      cue: {
        upright_posture: 'Postura erguida.',
        brisk_but_conversational: 'Ritmo vivo, pero que te permita hablar sin ahogarte.',
        consistent_duration: 'Mantén una duración parecida cada vez y auméntala poco a poco.',
      },
      mistake: {
        pace_too_slow_to_count: 'Ir tan despacio que no cuenta.',
        skipping_footwear: 'Caminar con calzado inadecuado.',
      },
      safety: {
        choose_a_safe_route: 'Elige una ruta iluminada y con buen firme.',
      },
    },
    stair_climb: {
      name: 'Subir escaleras',
      cue: {
        whole_foot_on_step: 'Apoya todo el pie en cada escalón.',
        upright_posture: 'Postura erguida.',
        use_the_rail_going_down: 'Al bajar, usa la barandilla.',
      },
      mistake: {
        skipping_steps_when_tired: 'Saltar escalones al cansarte.',
        rushing_the_descent: 'Bajar con prisa.',
      },
      safety: {
        use_the_rail_if_unsteady: 'Si te sientes inestable, usa la barandilla.',
      },
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
      body: 'Figura',
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
    privacyPolicy: 'Leer la política de privacidad',
    resetData: 'Restablecer datos',
    resetDataConfirm:
      'Se borrarán de este dispositivo tus registros de comida, medidas, fotos, entrenamientos y datos del reloj. Los ajustes de idioma y unidades se conservan. No se puede deshacer.',
    resetDone: 'Datos restablecidos.',
    dataSummary:
      'Guardado en este dispositivo: {{days}} días de registro de comida, {{checks}} registros de figura, {{photos}} fotos y {{health}} días del reloj.',
    health: 'Reloj y salud',
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
    drinkWater: 'Un vaso de agua. Tu cuerpo lo agradece.',
    moveAround: 'Llevas un rato sin moverte: levántate y camina dos minutos.',
    bedtime: 'Hora de ir desconectando. Dormir bien es parte del plan.',
  },

  body: {
    report: 'Informe semanal de figura',
    logToday: 'Registro de hoy',
    subtitle:
      'Mídete una vez por semana, a la misma hora y en las mismas condiciones. Con dos registros ya hay comparación.',
    photoToday: 'Foto de hoy',
    takePhoto: 'Hacer foto',
    pickPhoto: 'Elegir de galería',
    save: 'Guardar registro',
    saved: 'Registro guardado.',
    emptyForm: 'Introduce al menos una medida o una foto.',
    history: 'Historial',
    noPhotos: 'Todavía no hay fotos de progreso. Haz la primera hoy y compárala dentro de cuatro semanas.',
    deletePhoto: 'Borrar foto',
    deletePhotoConfirm: 'Se borra de forma definitiva. No hay papelera.',
    weeksCompared: 'Comparado con hace {{n}} semanas',
    guidelines: 'Pautas para esta semana',
    supplements: 'Suplementos que podrías considerar',
    supplementsNote:
      'Son categorías generales con evidencia razonable, no una prescripción. Si tomas medicación o tienes alguna condición, consúltalo antes con un profesional.',
    supplementsLink: 'Ver suplementos naturales',
    trend: {
      insufficient: 'Aún faltan datos',
      on_track: 'Vas en camino',
      stalled: 'Estancamiento',
      too_fast: 'Demasiado rápido',
      off_track: 'Te estás desviando',
    },
    guideline: {
      keepMeasuring: 'Sigue midiéndote cada semana; con dos registros separados 7 días ya hay comparación.',
      keepGoing: 'Lo que estás haciendo funciona: no cambies nada esta semana.',
      proteinEachMeal: 'Incluye una fuente de proteína en cada comida.',
      checkPortions: 'Revisa las raciones: pesa lo que comes tres días seguidos.',
      dailySteps: 'Suma pasos: un paseo de 20–30 minutos al día marca la diferencia.',
      sleepSeven: 'Prioriza dormir 7–9 horas: sin sueño no hay progreso.',
      slowDown: 'Vas más rápido de lo recomendable: sube un poco las calorías y mantén la proteína.',
      keepStrength: 'Mantén el entrenamiento de fuerza para conservar músculo.',
      logHonestly: 'Registra todo lo que comes, incluidos picoteos y bebidas, durante una semana.',
      progressiveOverload: 'Añade peso o repeticiones cada semana en los ejercicios principales.',
      eatSlightSurplus: 'Come un poco más: 150–250 kcal extra al día, sobre todo de carbohidratos alrededor del entrenamiento.',
      trimSurplus: 'Recorta un poco el exceso: 150–200 kcal menos al día bastan.',
    },
    supplement: {
      protein: 'Proteína en polvo, para llegar a tu objetivo diario si con comida no llegas.',
      creatine: 'Creatina monohidrato, la más estudiada para fuerza y masa muscular.',
      omega3: 'Omega-3 (EPA/DHA), si comes poco pescado azul.',
      vitaminD: 'Vitamina D, especialmente con poca exposición al sol.',
      magnesium: 'Magnesio, útil para el descanso y la recuperación.',
      electrolytes: 'Electrolitos, si sudas mucho o entrenas con calor.',
    },
    caution: {
      notMedical: 'Estas pautas son educativas y generales; no diagnostican ni sustituyen a un profesional sanitario.',
      tooFast: 'Perder o ganar peso muy deprisa suele salir caro. Si te notas sin energía o con mareos, consulta a un profesional.',
      noSupplements: 'Por tus respuestas al cribado de salud, cualquier suplemento debe decidirlo un profesional.',
    },
  },
  scan: {
    title: 'Escanear comida',
    subtitle: 'Haz una foto del plato y te estimamos qué hay y cuántas calorías. Luego lo revisas y corriges.',
    takePhoto: 'Hacer foto',
    pickPhoto: 'Elegir de galería',
    scanning: 'Analizando la foto…',
    unavailableDemo: 'El escaneo necesita el servidor de la app. En modo demo no está disponible, pero tu foto queda guardada.',
    failed: 'No se pudo analizar la foto. Inténtalo con más luz y el plato entero a la vista.',
    retry: 'Otra foto',
    results: 'Lo que hemos visto',
    estimateNote: 'Es una estimación por foto: revisa los gramos antes de guardar.',
    noItems: 'No se ha reconocido comida en la foto.',
    grams: 'Gramos',
    remove: 'Quitar',
    total: 'Total',
    addToLog: 'Añadir al registro',
    mealType: '¿En qué comida va?',
    confidenceLow: 'Poca seguridad en este alimento: compruébalo.',
    photoSaved: 'Foto guardada.',
    addManually: 'Añadir a mano',
  },
  health: {
    intro:
      'Conecta tu reloj o pulsera para traer pasos, entrenamientos, sueño, pulso en reposo y peso. Vale cualquier marca que sincronice con la app de salud del teléfono: Apple Watch, Garmin, Fitbit, Samsung, Xiaomi, Polar, Huawei…',
    hintIos: 'En iPhone se lee de Apple Health. Asegúrate de que tu reloj vuelca ahí sus datos.',
    hintAndroid: 'En Android se lee de Health Connect. Instálalo y activa tu reloj como fuente.',
    hintWeb: 'En la versión web no hay acceso al reloj. Usa la app en el móvil.',
    connect: 'Conectar reloj',
    disconnect: 'Desconectar',
    syncNow: 'Sincronizar ahora',
    connectedTo: 'Conectado a {{source}}',
    lastSync: 'Última sincronización: {{when}}',
    stepsToday: 'Pasos hoy',
    avgSteps: 'Media 7 días',
    avgSleep: 'Sueño medio',
    restingHr: 'Pulso en reposo',
    noDataYet: 'Aún no hay datos. Si acabas de conectar, dale a sincronizar en unos minutos.',
    unavailable: 'No hay servicio de salud disponible en este dispositivo (en Expo Go y en web no funciona; hace falta la app instalada).',
    denied: 'Sin permiso de lectura. Puedes darlo desde Ajustes → Salud (iOS) o Health Connect (Android).',
    error: 'No se pudo leer del servicio de salud. Inténtalo de nuevo.',
    readOnly: 'Solo lectura: la app nunca escribe en tu historial de salud. Los permisos se gestionan desde el sistema.',
    source: {
      appleHealth: 'Apple Health',
      healthConnect: 'Health Connect',
      pedometer: 'podómetro del teléfono',
      none: 'ninguna fuente',
    },
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
