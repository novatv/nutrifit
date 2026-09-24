-- =====================================================================
-- seed.sql · NutriFit
--
-- ATENCION: este seed es SOLO para el entorno LOCAL de desarrollo
-- (`supabase db reset` / `supabase start`). NO se ejecuta en produccion.
-- No crea usuarios, ni perfiles, ni ningun dato personal: solo catalogos
-- globales (owner_id is null) que cualquier usuario autenticado puede leer.
--
-- Se ejecuta con el rol propietario del esquema (postgres/service_role),
-- que es el unico autorizado por RLS a escribir en los catalogos.
--
-- Origen de los valores nutricionales: medias de referencia de USDA
-- FoodData Central y tablas de composicion europeas, redondeadas por
-- 100 g. Son datos de DEMOSTRACION, no una base nutricional certificada.
--
-- La nutricion de cada receta NO se escribe a mano: se calcula al final
-- desde sus ingredientes y se verifica en un bloque `do $$`. Asi es
-- imposible que una receta del seed mienta sobre sus macros.
-- =====================================================================

-- =====================================================================
-- 1. BIBLIOTECA DE EJERCICIOS (catalogo global)
-- =====================================================================
insert into public.exercise_library
  (slug, name_key, pattern, primary_muscles, secondary_muscles, equipment,
   difficulty, instruction_keys, common_mistake_keys, safety_note_keys, alternatives)
values
  ('sentadilla-copa', 'exercise.goblet_squat.name', 'squat',
   '{quads,glutes}', '{abs,lower_back}', '{dumbbells,kettlebell}', 'beginner',
   '{exercise.goblet_squat.step1,exercise.goblet_squat.step2,exercise.goblet_squat.step3}',
   '{exercise.goblet_squat.mistake1,exercise.goblet_squat.mistake2}',
   '{exercise.common.safety.knee_tracking}', '{sentadilla-trasera,prensa-de-piernas}'),
  ('sentadilla-trasera', 'exercise.back_squat.name', 'squat',
   '{quads,glutes}', '{hamstrings,lower_back,abs}', '{barbell,plates,rack}', 'advanced',
   '{exercise.back_squat.step1,exercise.back_squat.step2,exercise.back_squat.step3}',
   '{exercise.back_squat.mistake1,exercise.back_squat.mistake2}',
   '{exercise.common.safety.use_safety_bars,exercise.common.safety.neutral_spine}',
   '{sentadilla-copa,prensa-de-piernas}'),
  ('prensa-de-piernas', 'exercise.leg_press.name', 'squat',
   '{quads,glutes}', '{hamstrings}', '{machines}', 'beginner',
   '{exercise.leg_press.step1,exercise.leg_press.step2}',
   '{exercise.leg_press.mistake1}',
   '{exercise.common.safety.no_lumbar_rounding}', '{sentadilla-copa,sentadilla-trasera}'),
  ('peso-muerto-rumano', 'exercise.romanian_deadlift.name', 'hinge',
   '{hamstrings,glutes}', '{lower_back,forearms}', '{barbell,dumbbells}', 'intermediate',
   '{exercise.romanian_deadlift.step1,exercise.romanian_deadlift.step2,exercise.romanian_deadlift.step3}',
   '{exercise.romanian_deadlift.mistake1,exercise.romanian_deadlift.mistake2}',
   '{exercise.common.safety.neutral_spine}', '{puente-de-gluteo,peso-muerto-convencional}'),
  ('peso-muerto-convencional', 'exercise.deadlift.name', 'hinge',
   '{hamstrings,glutes,lower_back}', '{lats,traps,forearms}', '{barbell,plates}', 'advanced',
   '{exercise.deadlift.step1,exercise.deadlift.step2,exercise.deadlift.step3}',
   '{exercise.deadlift.mistake1,exercise.deadlift.mistake2}',
   '{exercise.common.safety.neutral_spine,exercise.common.safety.progress_slowly}',
   '{peso-muerto-rumano,puente-de-gluteo}'),
  ('puente-de-gluteo', 'exercise.glute_bridge.name', 'hinge',
   '{glutes}', '{hamstrings,abs}', '{none,bands}', 'beginner',
   '{exercise.glute_bridge.step1,exercise.glute_bridge.step2}',
   '{exercise.glute_bridge.mistake1}',
   '{exercise.common.safety.no_lumbar_hyperextension}', '{peso-muerto-rumano}'),
  ('press-banca', 'exercise.bench_press.name', 'horizontal_push',
   '{chest}', '{triceps,shoulders}', '{barbell,bench,rack}', 'intermediate',
   '{exercise.bench_press.step1,exercise.bench_press.step2,exercise.bench_press.step3}',
   '{exercise.bench_press.mistake1,exercise.bench_press.mistake2}',
   '{exercise.common.safety.use_spotter}', '{press-mancuernas,flexiones}'),
  ('press-mancuernas', 'exercise.dumbbell_press.name', 'horizontal_push',
   '{chest}', '{triceps,shoulders}', '{dumbbells,bench}', 'beginner',
   '{exercise.dumbbell_press.step1,exercise.dumbbell_press.step2}',
   '{exercise.dumbbell_press.mistake1}',
   '{exercise.common.safety.control_eccentric}', '{press-banca,flexiones}'),
  ('flexiones', 'exercise.push_up.name', 'horizontal_push',
   '{chest}', '{triceps,shoulders,abs}', '{none}', 'beginner',
   '{exercise.push_up.step1,exercise.push_up.step2}',
   '{exercise.push_up.mistake1,exercise.push_up.mistake2}',
   '{exercise.common.safety.neutral_spine}', '{press-mancuernas,press-banca}'),
  ('press-militar', 'exercise.overhead_press.name', 'vertical_push',
   '{shoulders}', '{triceps,abs}', '{barbell,dumbbells}', 'intermediate',
   '{exercise.overhead_press.step1,exercise.overhead_press.step2}',
   '{exercise.overhead_press.mistake1}',
   '{exercise.common.safety.no_lumbar_hyperextension}', '{elevaciones-laterales}'),
  ('elevaciones-laterales', 'exercise.lateral_raise.name', 'isolation',
   '{shoulders}', '{traps}', '{dumbbells,bands,cables}', 'beginner',
   '{exercise.lateral_raise.step1,exercise.lateral_raise.step2}',
   '{exercise.lateral_raise.mistake1}',
   '{exercise.common.safety.control_eccentric}', '{press-militar}'),
  ('remo-con-mancuerna', 'exercise.dumbbell_row.name', 'horizontal_pull',
   '{back,lats}', '{biceps,forearms}', '{dumbbells,bench}', 'beginner',
   '{exercise.dumbbell_row.step1,exercise.dumbbell_row.step2}',
   '{exercise.dumbbell_row.mistake1}',
   '{exercise.common.safety.neutral_spine}', '{remo-con-barra,remo-en-polea}'),
  ('remo-con-barra', 'exercise.barbell_row.name', 'horizontal_pull',
   '{back,lats}', '{biceps,lower_back}', '{barbell,plates}', 'intermediate',
   '{exercise.barbell_row.step1,exercise.barbell_row.step2}',
   '{exercise.barbell_row.mistake1,exercise.barbell_row.mistake2}',
   '{exercise.common.safety.neutral_spine}', '{remo-con-mancuerna,remo-en-polea}'),
  ('remo-en-polea', 'exercise.cable_row.name', 'horizontal_pull',
   '{back,lats}', '{biceps}', '{cables,machines}', 'beginner',
   '{exercise.cable_row.step1,exercise.cable_row.step2}',
   '{exercise.cable_row.mistake1}',
   '{exercise.common.safety.control_eccentric}', '{remo-con-mancuerna}'),
  ('dominadas', 'exercise.pull_up.name', 'vertical_pull',
   '{lats,back}', '{biceps,forearms}', '{rack}', 'advanced',
   '{exercise.pull_up.step1,exercise.pull_up.step2}',
   '{exercise.pull_up.mistake1}',
   '{exercise.common.safety.control_eccentric}', '{jalon-al-pecho,remo-con-mancuerna}'),
  ('jalon-al-pecho', 'exercise.lat_pulldown.name', 'vertical_pull',
   '{lats,back}', '{biceps}', '{machines,cables}', 'beginner',
   '{exercise.lat_pulldown.step1,exercise.lat_pulldown.step2}',
   '{exercise.lat_pulldown.mistake1}',
   '{exercise.common.safety.no_neck_pulldown}', '{dominadas,remo-en-polea}'),
  ('zancadas', 'exercise.lunge.name', 'lunge',
   '{quads,glutes}', '{hamstrings,abs}', '{none,dumbbells}', 'beginner',
   '{exercise.lunge.step1,exercise.lunge.step2}',
   '{exercise.lunge.mistake1}',
   '{exercise.common.safety.knee_tracking}', '{sentadilla-bulgara,sentadilla-copa}'),
  ('sentadilla-bulgara', 'exercise.bulgarian_split_squat.name', 'lunge',
   '{quads,glutes}', '{hamstrings}', '{dumbbells,bench}', 'intermediate',
   '{exercise.bulgarian_split_squat.step1,exercise.bulgarian_split_squat.step2}',
   '{exercise.bulgarian_split_squat.mistake1}',
   '{exercise.common.safety.knee_tracking}', '{zancadas}'),
  ('paseo-del-granjero', 'exercise.farmer_walk.name', 'carry',
   '{forearms,traps}', '{abs,glutes}', '{dumbbells,kettlebell}', 'beginner',
   '{exercise.farmer_walk.step1,exercise.farmer_walk.step2}',
   '{exercise.farmer_walk.mistake1}',
   '{exercise.common.safety.neutral_spine}', '{plancha-frontal}'),
  ('plancha-frontal', 'exercise.plank.name', 'core',
   '{abs}', '{obliques,lower_back}', '{none}', 'beginner',
   '{exercise.plank.step1,exercise.plank.step2}',
   '{exercise.plank.mistake1,exercise.plank.mistake2}',
   '{exercise.common.safety.no_lumbar_hyperextension}', '{plancha-lateral,pallof-press}'),
  ('plancha-lateral', 'exercise.side_plank.name', 'core',
   '{obliques}', '{abs,glutes}', '{none}', 'beginner',
   '{exercise.side_plank.step1,exercise.side_plank.step2}',
   '{exercise.side_plank.mistake1}',
   '{exercise.common.safety.neutral_spine}', '{plancha-frontal}'),
  ('pallof-press', 'exercise.pallof_press.name', 'core',
   '{abs,obliques}', '{glutes}', '{bands,cables}', 'intermediate',
   '{exercise.pallof_press.step1,exercise.pallof_press.step2}',
   '{exercise.pallof_press.mistake1}',
   '{exercise.common.safety.no_trunk_rotation}', '{plancha-frontal}'),
  ('curl-de-biceps', 'exercise.biceps_curl.name', 'isolation',
   '{biceps}', '{forearms}', '{dumbbells,bands,cables}', 'beginner',
   '{exercise.biceps_curl.step1,exercise.biceps_curl.step2}',
   '{exercise.biceps_curl.mistake1}',
   '{exercise.common.safety.control_eccentric}', '{remo-con-mancuerna}'),
  ('extension-de-triceps', 'exercise.triceps_extension.name', 'isolation',
   '{triceps}', '{shoulders}', '{dumbbells,bands,cables}', 'beginner',
   '{exercise.triceps_extension.step1,exercise.triceps_extension.step2}',
   '{exercise.triceps_extension.mistake1}',
   '{exercise.common.safety.control_eccentric}', '{flexiones}'),
  ('elevacion-de-talones', 'exercise.calf_raise.name', 'isolation',
   '{calves}', '{}', '{none,dumbbells,machines}', 'beginner',
   '{exercise.calf_raise.step1}',
   '{exercise.calf_raise.mistake1}',
   '{exercise.common.safety.control_eccentric}', '{paseo-del-granjero}'),
  ('caminata-rapida', 'exercise.brisk_walk.name', 'cardio',
   '{full_body}', '{quads,calves}', '{none,treadmill}', 'beginner',
   '{exercise.brisk_walk.step1}',
   '{exercise.brisk_walk.mistake1}',
   '{exercise.common.safety.hydrate}', '{bicicleta-estatica,remo-ergometro}'),
  ('bicicleta-estatica', 'exercise.stationary_bike.name', 'cardio',
   '{quads}', '{glutes,calves}', '{bike}', 'beginner',
   '{exercise.stationary_bike.step1}',
   '{exercise.stationary_bike.mistake1}',
   '{exercise.common.safety.adjust_seat_height}', '{caminata-rapida,remo-ergometro}'),
  ('remo-ergometro', 'exercise.rowing_machine.name', 'cardio',
   '{full_body}', '{lats,quads}', '{rower}', 'intermediate',
   '{exercise.rowing_machine.step1,exercise.rowing_machine.step2}',
   '{exercise.rowing_machine.mistake1}',
   '{exercise.common.safety.neutral_spine}', '{bicicleta-estatica,caminata-rapida}')
on conflict (slug) do update set
  name_key            = excluded.name_key,
  pattern             = excluded.pattern,
  primary_muscles     = excluded.primary_muscles,
  secondary_muscles   = excluded.secondary_muscles,
  equipment           = excluded.equipment,
  difficulty          = excluded.difficulty,
  instruction_keys    = excluded.instruction_keys,
  common_mistake_keys = excluded.common_mistake_keys,
  safety_note_keys    = excluded.safety_note_keys,
  alternatives        = excluded.alternatives;

-- =====================================================================
-- 2. ALIMENTOS DE DEMOSTRACION (catalogo global: owner_id is null)
--    Todos los valores son por 100 g de producto tal y como se compra.
--    Las restricciones `check` de la tabla ya verifican la coherencia
--    energetica (Atwater) y que los macros no sumen mas de 100 g.
-- =====================================================================
insert into public.foods
  (owner_id, slug, name, serving_label, serving_grams, kcal_per_100g,
   protein_g_per_100g, carbs_g_per_100g, fat_g_per_100g, fiber_g_per_100g,
   sugar_g_per_100g, sodium_mg_per_100g, source, tags, allergens, diet_patterns, is_verified)
values
  -- ---------------------------------------------------------- proteina animal
  (null, 'pechuga-de-pollo', 'Pechuga de pollo cruda', '1 filete (150 g)', 150, 120, 22.5, 0, 2.6, 0, 0, 60, 'usda', '{carne,proteina}', '{}', '{omnivore}', true),
  (null, 'pechuga-de-pavo', 'Pechuga de pavo cruda', '1 filete (120 g)', 120, 104, 22.0, 0, 1.7, 0, 0, 55, 'usda', '{carne,proteina}', '{}', '{omnivore}', true),
  (null, 'ternera-magra', 'Ternera magra 5% grasa, cruda', '1 racion (150 g)', 150, 137, 21.5, 0, 5.4, 0, 0, 60, 'usda', '{carne,proteina}', '{}', '{omnivore}', true),
  (null, 'lomo-de-cerdo', 'Lomo de cerdo crudo', '1 racion (150 g)', 150, 143, 21.0, 0, 6.3, 0, 0, 55, 'usda', '{carne,proteina}', '{}', '{omnivore}', true),
  (null, 'salmon-fresco', 'Salmon fresco', '1 lomo (150 g)', 150, 208, 20.0, 0, 13.0, 0, 0, 59, 'usda', '{pescado,omega3}', '{fish}', '{omnivore,pescatarian}', true),
  (null, 'merluza', 'Merluza fresca', '1 lomo (180 g)', 180, 86, 17.8, 0, 1.3, 0, 0, 90, 'usda', '{pescado,magro}', '{fish}', '{omnivore,pescatarian}', true),
  (null, 'atun-en-conserva-al-natural', 'Atun en conserva al natural, escurrido', '1 lata (80 g)', 80, 116, 25.5, 0, 1.0, 0, 0, 320, 'usda', '{pescado,conserva,proteina}', '{fish}', '{omnivore,pescatarian}', true),
  (null, 'gambas-peladas', 'Gambas peladas crudas', '1 racion (150 g)', 150, 99, 20.3, 0.2, 1.7, 0, 0, 148, 'usda', '{marisco,magro}', '{shellfish}', '{omnivore,pescatarian}', true),
  (null, 'huevo-entero', 'Huevo entero', '1 huevo (55 g)', 55, 143, 12.6, 0.7, 9.5, 0, 0.4, 142, 'usda', '{proteina,basico}', '{egg}', '{omnivore,vegetarian,pescatarian}', true),
  (null, 'clara-de-huevo', 'Clara de huevo', '1 clara (33 g)', 33, 52, 10.9, 0.7, 0.2, 0, 0.7, 166, 'usda', '{proteina,magro}', '{egg}', '{omnivore,vegetarian,pescatarian}', true),
  -- ----------------------------------------------------------------- lacteos
  (null, 'yogur-griego-natural', 'Yogur griego natural', '1 tarrina (150 g)', 150, 97, 9.0, 3.6, 5.0, 0, 3.6, 36, 'usda', '{lacteo,proteina}', '{lactose}', '{omnivore,vegetarian,pescatarian}', true),
  (null, 'yogur-natural-desnatado', 'Yogur natural desnatado', '1 unidad (125 g)', 125, 56, 5.7, 7.7, 0.2, 0, 7.7, 60, 'usda', '{lacteo}', '{lactose}', '{omnivore,vegetarian,pescatarian}', true),
  (null, 'queso-batido-desnatado', 'Queso batido desnatado 0%', '1 tarrina (200 g)', 200, 47, 8.0, 3.9, 0.2, 0, 3.9, 40, 'usda', '{lacteo,proteina}', '{lactose}', '{omnivore,vegetarian,pescatarian}', true),
  (null, 'requeson', 'Requeson (cottage)', '1 racion (100 g)', 100, 98, 11.0, 3.4, 4.3, 0, 2.7, 364, 'usda', '{lacteo,proteina}', '{lactose}', '{omnivore,vegetarian,pescatarian}', true),
  (null, 'leche-semidesnatada', 'Leche semidesnatada', '1 vaso (200 ml)', 200, 46, 3.2, 4.7, 1.6, 0, 4.7, 44, 'usda', '{lacteo,basico}', '{lactose}', '{omnivore,vegetarian,pescatarian}', true),
  (null, 'queso-mozzarella', 'Queso mozzarella', '1 racion (60 g)', 60, 254, 24.0, 2.2, 16.0, 0, 1.0, 627, 'usda', '{lacteo,queso}', '{lactose}', '{omnivore,vegetarian,pescatarian}', true),
  (null, 'queso-parmesano', 'Queso parmesano rallado', '1 cucharada (15 g)', 15, 392, 35.8, 3.2, 25.0, 0, 0.9, 1529, 'usda', '{lacteo,queso}', '{lactose}', '{omnivore,vegetarian,pescatarian}', true),
  -- ------------------------------------------------------ proteina vegetal
  (null, 'tofu-firme', 'Tofu firme', '1 racion (200 g)', 200, 144, 15.8, 2.8, 8.7, 2.3, 0.6, 14, 'usda', '{vegetal,proteina}', '{soy}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'tempeh', 'Tempeh', '1 racion (150 g)', 150, 192, 20.3, 7.6, 10.8, 4.0, 0, 9, 'usda', '{vegetal,proteina,fermentado}', '{soy}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'seitan', 'Seitan', '1 racion (150 g)', 150, 141, 25.0, 14.0, 1.9, 0.6, 0.5, 300, 'usda', '{vegetal,proteina}', '{gluten}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'proteina-de-suero', 'Proteina de suero en polvo', '1 cacito (30 g)', 30, 380, 80.0, 8.0, 4.0, 0, 5.0, 250, 'manual', '{suplemento,proteina}', '{lactose}', '{omnivore,vegetarian,pescatarian}', false),
  (null, 'bebida-de-soja', 'Bebida de soja sin azucar', '1 vaso (250 ml)', 250, 33, 3.3, 0.6, 1.8, 0.4, 0.5, 39, 'usda', '{vegetal,bebida}', '{soy}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'hummus', 'Hummus de garbanzo', '2 cucharadas (40 g)', 40, 166, 7.9, 14.3, 9.6, 6.0, 0.3, 379, 'usda', '{untable,legumbre}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  -- --------------------------------------------------- cereales y legumbres
  (null, 'arroz-blanco', 'Arroz blanco crudo', '1 racion (80 g)', 80, 358, 7.1, 79.0, 0.9, 1.3, 0.1, 5, 'usda', '{cereal,basico}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'arroz-integral', 'Arroz integral crudo', '1 racion (70 g)', 70, 362, 7.5, 76.2, 2.7, 3.5, 0.7, 7, 'usda', '{cereal,integral}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'pasta-de-trigo', 'Pasta de trigo cruda', '1 racion (80 g)', 80, 359, 12.5, 71.5, 1.5, 3.0, 2.7, 6, 'usda', '{cereal,basico}', '{gluten}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'pasta-integral', 'Pasta integral cruda', '1 racion (80 g)', 80, 348, 13.0, 66.0, 2.5, 8.0, 3.0, 8, 'usda', '{cereal,integral}', '{gluten}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'pan-integral', 'Pan integral', '2 rebanadas (60 g)', 60, 247, 10.0, 41.0, 3.4, 6.8, 4.0, 450, 'usda', '{cereal,integral}', '{gluten}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'copos-de-avena', 'Copos de avena', '1 racion (50 g)', 50, 379, 13.5, 58.0, 6.5, 10.0, 1.0, 6, 'usda', '{cereal,integral,puede-contener-gluten}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'patata', 'Patata cruda', '1 unidad mediana (180 g)', 180, 77, 2.0, 17.0, 0.1, 2.2, 0.8, 6, 'usda', '{tuberculo,basico}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'boniato', 'Boniato crudo', '1 unidad mediana (200 g)', 200, 86, 1.6, 20.1, 0.1, 3.0, 4.2, 55, 'usda', '{tuberculo}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'quinoa', 'Quinoa cruda', '1 racion (70 g)', 70, 368, 14.1, 64.2, 6.1, 7.0, null, 5, 'usda', '{cereal,integral,sin-gluten}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'cuscus', 'Cuscus crudo', '1 racion (70 g)', 70, 376, 12.8, 77.4, 0.6, 5.0, 0.1, 10, 'usda', '{cereal}', '{gluten}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'lentejas-cocidas', 'Lentejas cocidas', '1 racion (200 g)', 200, 116, 9.0, 20.1, 0.4, 7.9, 1.8, 2, 'usda', '{legumbre,fibra}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'garbanzos-cocidos', 'Garbanzos cocidos', '1 racion (200 g)', 200, 139, 7.3, 22.5, 2.6, 7.6, 3.9, 6, 'usda', '{legumbre,fibra}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'alubias-negras-cocidas', 'Alubias negras cocidas', '1 racion (200 g)', 200, 132, 8.9, 23.7, 0.5, 8.7, 0.3, 2, 'usda', '{legumbre,fibra}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'tortillas-de-maiz', 'Tortillas de maiz', '2 unidades (60 g)', 60, 218, 5.7, 44.6, 2.9, 5.0, 1.0, 45, 'usda', '{cereal,sin-gluten}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  -- ---------------------------------------------------------------- verduras
  (null, 'brocoli', 'Brocoli crudo', '1 racion (150 g)', 150, 34, 2.8, 6.6, 0.4, 2.6, 1.7, 33, 'usda', '{verdura,fibra}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'espinacas', 'Espinacas frescas', '1 racion (80 g)', 80, 23, 2.9, 3.6, 0.4, 2.2, 0.4, 79, 'usda', '{verdura,hoja-verde}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'calabacin', 'Calabacin crudo', '1 unidad (200 g)', 200, 17, 1.2, 3.1, 0.3, 1.0, 2.5, 8, 'usda', '{verdura}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'pimiento-rojo', 'Pimiento rojo crudo', '1 unidad (150 g)', 150, 31, 1.0, 6.0, 0.3, 2.1, 4.2, 4, 'usda', '{verdura}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'cebolla', 'Cebolla cruda', '1 unidad (120 g)', 120, 40, 1.1, 9.3, 0.1, 1.7, 4.2, 4, 'usda', '{verdura,basico}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'tomate', 'Tomate fresco', '1 unidad (120 g)', 120, 18, 0.9, 3.9, 0.2, 1.2, 2.6, 5, 'usda', '{verdura}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'tomate-triturado', 'Tomate triturado en conserva', '1 racion (150 g)', 150, 32, 1.6, 7.3, 0.3, 1.9, 4.4, 186, 'usda', '{conserva,basico}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'zanahoria', 'Zanahoria cruda', '1 unidad (80 g)', 80, 41, 0.9, 9.6, 0.2, 2.8, 4.7, 69, 'usda', '{verdura}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'champinones', 'Champinones frescos', '1 racion (100 g)', 100, 22, 3.1, 3.3, 0.3, 1.0, 2.0, 5, 'usda', '{verdura,setas}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'esparragos', 'Esparragos verdes', '1 racion (120 g)', 120, 20, 2.2, 3.9, 0.1, 2.1, 1.9, 2, 'usda', '{verdura}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  -- ----------------------------------------------------------------- frutas
  (null, 'platano', 'Platano', '1 unidad (120 g)', 120, 89, 1.1, 22.8, 0.3, 2.6, 12.2, 1, 'usda', '{fruta}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'manzana', 'Manzana', '1 unidad (180 g)', 180, 52, 0.3, 13.8, 0.2, 2.4, 10.4, 1, 'usda', '{fruta}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'naranja', 'Naranja', '1 unidad (180 g)', 180, 47, 0.9, 11.8, 0.1, 2.4, 9.4, 0, 'usda', '{fruta}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'arandanos', 'Arandanos', '1 racion (80 g)', 80, 57, 0.7, 14.5, 0.3, 2.4, 10.0, 1, 'usda', '{fruta}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'fresas', 'Fresas', '1 racion (150 g)', 150, 32, 0.7, 7.7, 0.3, 2.0, 4.9, 1, 'usda', '{fruta}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'aguacate', 'Aguacate', '1/2 unidad (70 g)', 70, 160, 2.0, 8.5, 14.7, 6.7, 0.7, 7, 'usda', '{fruta,grasa-saludable}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  -- -------------------------------------------------------- grasas y semillas
  (null, 'aceite-de-oliva-virgen-extra', 'Aceite de oliva virgen extra', '1 cucharada (10 ml)', 10, 884, 0, 0, 100.0, 0, 0, 2, 'usda', '{grasa,basico}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'almendras', 'Almendras crudas', '1 punado (25 g)', 25, 579, 21.2, 21.6, 49.9, 12.5, 4.4, 1, 'usda', '{fruto-seco,grasa-saludable}', '{tree_nuts}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'nueces', 'Nueces peladas', '1 punado (25 g)', 25, 654, 15.2, 13.7, 65.2, 6.7, 2.6, 2, 'usda', '{fruto-seco,omega3}', '{tree_nuts}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'crema-de-cacahuete', 'Crema de cacahuete 100%', '1 cucharada (15 g)', 15, 588, 25.8, 20.0, 50.0, 6.0, 9.2, 17, 'usda', '{untable,grasa-saludable}', '{peanut}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'semillas-de-chia', 'Semillas de chia', '1 cucharada (15 g)', 15, 486, 16.5, 42.1, 30.7, 34.4, 0, 16, 'usda', '{semilla,fibra,omega3}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'leche-de-coco-ligera', 'Leche de coco ligera', '1 racion (120 ml)', 120, 73, 0.7, 1.4, 7.5, 0.3, 1.0, 13, 'usda', '{grasa,bebida}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'aceitunas-verdes', 'Aceitunas verdes', '1 racion (20 g)', 20, 145, 1.0, 3.8, 15.3, 3.3, 0.5, 1556, 'usda', '{grasa,encurtido}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  -- ------------------------------------------------------------------- otros
  (null, 'miel', 'Miel', '1 cucharadita (10 g)', 10, 304, 0.3, 82.4, 0, 0.2, 82.1, 4, 'usda', '{endulzante}', '{}', '{omnivore,vegetarian,pescatarian}', true),
  (null, 'cacao-en-polvo-desgrasado', 'Cacao en polvo desgrasado sin azucar', '1 cucharada (10 g)', 10, 228, 19.6, 54.3, 13.7, 33.0, 1.8, 21, 'usda', '{cacao,fibra}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'chocolate-negro-85', 'Chocolate negro 85%', '1 onza (25 g)', 25, 592, 10.3, 22.0, 46.7, 12.0, 8.0, 20, 'usda', '{cacao,capricho}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'salsa-de-soja', 'Salsa de soja', '1 cucharada (15 ml)', 15, 53, 8.1, 4.9, 0.6, 0.8, 0.4, 5493, 'usda', '{condimento,alto-en-sodio}', '{soy,gluten}', '{omnivore,vegetarian,vegan,pescatarian}', true),
  (null, 'caldo-de-verduras', 'Caldo de verduras', '1 taza (250 ml)', 250, 4, 0.2, 0.5, 0.1, 0, 0.3, 300, 'usda', '{condimento,liquido}', '{}', '{omnivore,vegetarian,vegan,pescatarian}', true)
on conflict (slug) where owner_id is null and slug is not null do update set
  name               = excluded.name,
  serving_label      = excluded.serving_label,
  serving_grams      = excluded.serving_grams,
  kcal_per_100g      = excluded.kcal_per_100g,
  protein_g_per_100g = excluded.protein_g_per_100g,
  carbs_g_per_100g   = excluded.carbs_g_per_100g,
  fat_g_per_100g     = excluded.fat_g_per_100g,
  fiber_g_per_100g   = excluded.fiber_g_per_100g,
  sugar_g_per_100g   = excluded.sugar_g_per_100g,
  sodium_mg_per_100g = excluded.sodium_mg_per_100g,
  tags               = excluded.tags,
  allergens          = excluded.allergens,
  diet_patterns      = excluded.diet_patterns,
  is_verified        = excluded.is_verified;

-- =====================================================================
-- 3. RECETAS DEL SISTEMA (owner_id is null, is_public = true)
--    Se insertan SIN nutricion: los macros se calculan en el paso 5 a
--    partir de los ingredientes. Los alergenos y los patrones dieteticos
--    tambien se derivan, nunca se escriben a mano.
-- =====================================================================
insert into public.recipes
  (owner_id, is_public, slug, title, description, meal_type, servings,
   prep_minutes, cook_minutes, instructions, tags)
values
  (null, true, 'avena-proteica-con-platano', 'Avena proteica con platano',
   'Desayuno rapido de avena con leche, proteina y platano.', 'breakfast', 1, 5, 5,
   '{Calienta la leche con los copos de avena 3 minutos.,Retira del fuego y mezcla la proteina fuera del calor.,Anade el platano en rodajas y la crema de cacahuete.}',
   '{rapido,alto-en-proteina}'),
  (null, true, 'tostada-de-aguacate-y-huevo', 'Tostada de aguacate y huevo',
   'Pan integral con aguacate machacado y huevo a la plancha.', 'breakfast', 1, 5, 8,
   '{Tuesta el pan.,Machaca el aguacate con el tomate picado y extiendelo.,Cocina el huevo en la sarten con el aceite y coloca encima.}',
   '{clasico,saciante}'),
  (null, true, 'yogur-griego-con-frutos-rojos', 'Yogur griego con frutos rojos',
   'Desayuno o merienda sin cocina, alto en proteina.', 'breakfast', 1, 5, 0,
   '{Pon el yogur en un bol.,Anade los arandanos y las almendras troceadas.,Termina con la miel.}',
   '{sin-cocina,rapido}'),
  (null, true, 'tortilla-de-claras-con-espinacas', 'Tortilla de claras con espinacas',
   'Tortilla ligera con espinacas salteadas y parmesano.', 'breakfast', 1, 5, 8,
   '{Saltea las espinacas con el aceite.,Bate las claras con el huevo entero y viertelas.,Anade el parmesano y cuaja a fuego medio.}',
   '{bajo-en-grasa,alto-en-proteina}'),
  (null, true, 'batido-verde-proteico', 'Batido verde proteico',
   'Batido de espinacas, platano y proteina con chia.', 'snack', 1, 5, 0,
   '{Tritura la bebida de soja con las espinacas y el platano.,Anade la proteina y bate de nuevo.,Deja reposar 5 minutos con la chia.}',
   '{sin-cocina,post-entreno}'),
  (null, true, 'pollo-con-arroz-y-brocoli', 'Pollo con arroz y brocoli',
   'El plato base de cualquier semana: proteina magra, cereal y verdura.', 'lunch', 1, 10, 20,
   '{Cuece el arroz.,Cocina el pollo a la plancha con la mitad del aceite.,Hierve o saltea el brocoli y alina con el resto del aceite.}',
   '{batch-cooking,clasico}'),
  (null, true, 'salmon-al-horno-con-boniato', 'Salmon al horno con boniato',
   'Salmon al horno con boniato asado y esparragos.', 'lunch', 1, 10, 25,
   '{Corta el boniato y asalo 20 minutos a 200 grados.,Anade el salmon y los esparragos los ultimos 10 minutos.,Alina con el aceite al servir.}',
   '{omega3,horno}'),
  (null, true, 'lentejas-guisadas-con-verduras', 'Lentejas guisadas con verduras',
   'Guiso de lentejas con sofrito de zanahoria, cebolla y tomate.', 'lunch', 2, 10, 30,
   '{Sofrie la cebolla y la zanahoria con el aceite.,Anade el tomate triturado y cocina 5 minutos.,Incorpora las lentejas y el caldo y guisa 15 minutos.}',
   '{legumbre,batch-cooking}'),
  (null, true, 'bowl-de-quinoa-y-garbanzos', 'Bowl de quinoa y garbanzos',
   'Bowl vegetal completo con quinoa, garbanzos y pimiento.', 'lunch', 1, 10, 15,
   '{Cuece la quinoa 12 minutos.,Saltea el pimiento y las espinacas con el aceite.,Mezcla con los garbanzos escurridos.}',
   '{vegetal,bowl}'),
  (null, true, 'pasta-integral-con-atun', 'Pasta integral con atun',
   'Pasta integral con salsa de tomate y atun al natural.', 'lunch', 1, 5, 12,
   '{Cuece la pasta al dente.,Sofrie la cebolla con el aceite y anade el tomate.,Incorpora el atun escurrido y mezcla con la pasta.}',
   '{rapido,despensa}'),
  (null, true, 'wrap-de-pavo-y-hummus', 'Wrap de pavo y hummus',
   'Tortillas de maiz con pavo a la plancha, hummus y verdura.', 'lunch', 1, 10, 5,
   '{Cocina el pavo a la plancha y cortalo en tiras.,Unta las tortillas con el hummus.,Rellena con el pavo, el pimiento y las espinacas.}',
   '{para-llevar,rapido}'),
  (null, true, 'curry-de-garbanzos-y-coco', 'Curry de garbanzos y coco',
   'Curry vegano suave de garbanzos con leche de coco.', 'dinner', 2, 10, 20,
   '{Sofrie la cebolla con el aceite y las especias.,Anade el tomate y la leche de coco.,Incorpora los garbanzos y cocina 10 minutos.}',
   '{vegano,especiado}'),
  (null, true, 'merluza-con-patata-y-pimiento', 'Merluza con patata y pimiento',
   'Merluza al horno sobre cama de patata y pimiento.', 'dinner', 1, 10, 20,
   '{Corta la patata fina y asala 15 minutos.,Anade el pimiento en tiras y la merluza.,Hornea 8 minutos mas y alina con el aceite.}',
   '{ligero,horno}'),
  (null, true, 'salteado-de-tofu-y-verduras', 'Salteado de tofu y verduras',
   'Wok de tofu firme con calabacin, pimiento y arroz integral.', 'dinner', 1, 10, 12,
   '{Cuece el arroz integral.,Dora el tofu en dados con el aceite.,Anade las verduras y la salsa de soja y saltea 5 minutos.}',
   '{vegano,wok}'),
  (null, true, 'tortilla-de-patata-ligera', 'Tortilla de patata ligera',
   'Tortilla de patata con la patata cocida en lugar de frita.', 'dinner', 2, 10, 20,
   '{Cuece la patata y la cebolla en dados.,Bate los huevos y mezcla con la patata.,Cuaja en la sarten con el aceite por los dos lados.}',
   '{clasico,vegetariano}'),
  (null, true, 'ternera-salteada-con-arroz', 'Ternera salteada con arroz',
   'Salteado rapido de ternera magra con pimiento y cebolla.', 'dinner', 1, 10, 15,
   '{Cuece el arroz.,Saltea la cebolla y el pimiento con el aceite.,Anade la ternera en tiras y saltea 4 minutos.}',
   '{rapido,alto-en-proteina}'),
  (null, true, 'ensalada-de-pollo-y-aguacate', 'Ensalada de pollo y aguacate',
   'Ensalada completa con pollo a la plancha, aguacate y aceitunas.', 'lunch', 1, 10, 10,
   '{Cocina el pollo a la plancha y cortalo.,Mezcla las espinacas, el tomate y el aguacate.,Anade las aceitunas y alina con el aceite.}',
   '{ensalada,sin-horno}'),
  (null, true, 'gambas-al-ajillo-con-quinoa', 'Gambas al ajillo con quinoa',
   'Gambas salteadas con ajo, calabacin y quinoa.', 'dinner', 1, 10, 12,
   '{Cuece la quinoa.,Saltea el calabacin con parte del aceite.,Anade las gambas y el ajo y cocina 3 minutos.}',
   '{marisco,rapido}'),
  (null, true, 'requeson-con-manzana-y-nueces', 'Requeson con manzana y nueces',
   'Merienda de requeson con manzana en dados y nueces.', 'snack', 1, 5, 0,
   '{Pon el requeson en un bol.,Anade la manzana en dados.,Termina con las nueces troceadas.}',
   '{sin-cocina,saciante}'),
  (null, true, 'tostada-de-crema-de-cacahuete', 'Tostada de crema de cacahuete y platano',
   'Merienda energetica antes de entrenar.', 'snack', 1, 3, 2,
   '{Tuesta el pan.,Extiende la crema de cacahuete.,Anade el platano en rodajas.}',
   '{pre-entreno,rapido}'),
  (null, true, 'crema-de-calabacin-con-pollo', 'Crema de calabacin con pollo',
   'Crema suave de calabacin y patata con dados de pollo.', 'dinner', 2, 10, 25,
   '{Cuece el calabacin, la patata y la cebolla en el caldo.,Tritura hasta que quede fina.,Anade el pollo a la plancha en dados y el aceite.}',
   '{reconfortante,ligero}'),
  (null, true, 'tempeh-con-boniato-y-espinacas', 'Tempeh con boniato y espinacas',
   'Plato vegano completo con tempeh marinado.', 'dinner', 1, 10, 20,
   '{Asa el boniato en dados 20 minutos.,Dora el tempeh en la sarten con el aceite.,Saltea las espinacas y sirve todo junto.}',
   '{vegano,alto-en-proteina}'),
  (null, true, 'bowl-de-atun-arroz-y-aguacate', 'Bowl de atun, arroz y aguacate',
   'Bowl frio estilo poke con atun al natural.', 'lunch', 1, 10, 15,
   '{Cuece el arroz integral y dejalo templar.,Rallla la zanahoria y corta el aguacate.,Monta el bowl con el atun y la salsa de soja.}',
   '{bowl,para-llevar}'),
  (null, true, 'pudin-de-chia-y-cacao', 'Pudin de chia y cacao',
   'Postre o desayuno de chia con cacao, sin azucar anadido.', 'snack', 1, 5, 0,
   '{Mezcla la bebida de soja con el cacao.,Anade la chia y remueve bien.,Deja en la nevera al menos 4 horas y sirve con el platano.}',
   '{vegano,preparar-la-vispera}'),
  (null, true, 'snack-de-chocolate-y-almendras', 'Snack de chocolate negro y almendras',
   'Capricho medido para cerrar el dia.', 'snack', 1, 2, 0,
   '{Pesa la onza de chocolate.,Acompana con las almendras.}',
   '{capricho,porcion-controlada}'),
  (null, true, 'cuscus-con-verduras-y-seitan', 'Cuscus con verduras y seitan',
   'Cuscus rapido con seitan y champinones salteados.', 'lunch', 1, 10, 10,
   '{Hidrata el cuscus con agua hirviendo 5 minutos.,Saltea los champinones y el pimiento con el aceite.,Anade el seitan en tiras y mezcla con el cuscus.}',
   '{vegetal,rapido}'),
  (null, true, 'chili-de-alubias-negras', 'Chili de alubias negras',
   'Chili vegano de alubias negras con pimiento y tomate.', 'dinner', 2, 10, 25,
   '{Sofrie la cebolla y el pimiento con el aceite.,Anade el tomate triturado y las especias.,Incorpora las alubias y cocina 15 minutos.}',
   '{vegano,batch-cooking}'),
  (null, true, 'pasta-al-horno-con-mozzarella', 'Pasta al horno con mozzarella',
   'Pasta con tomate y calabacin gratinada con mozzarella.', 'dinner', 2, 10, 25,
   '{Cuece la pasta al dente.,Saltea el calabacin y mezcla con el tomate.,Cubre con la mozzarella y gratina 10 minutos.}',
   '{vegetariano,horno}'),
  (null, true, 'lomo-de-cerdo-con-manzana', 'Lomo de cerdo con manzana',
   'Lomo a la plancha con manzana caramelizada y patata.', 'dinner', 1, 10, 18,
   '{Cuece la patata en dados.,Dora el lomo con el aceite y reservalo.,Saltea la manzana en la misma sarten y sirve.}',
   '{clasico,otono}'),
  (null, true, 'bol-de-yogur-y-fresas', 'Bol de yogur y fresas',
   'Desayuno ligero de yogur desnatado con fresas y avena.', 'breakfast', 1, 5, 0,
   '{Pon el yogur en un bol.,Anade las fresas troceadas y los copos de avena.,Termina con la miel.}',
   '{sin-cocina,ligero}'),
  (null, true, 'queso-batido-con-naranja', 'Queso batido con naranja y almendras',
   'Merienda proteica sin cocina.', 'snack', 1, 3, 0,
   '{Pon el queso batido en un bol.,Anade los gajos de naranja.,Termina con las almendras.}',
   '{sin-cocina,alto-en-proteina}')
on conflict (slug) where owner_id is null and slug is not null do update set
  title        = excluded.title,
  description  = excluded.description,
  meal_type    = excluded.meal_type,
  servings     = excluded.servings,
  prep_minutes = excluded.prep_minutes,
  cook_minutes = excluded.cook_minutes,
  instructions = excluded.instructions,
  tags         = excluded.tags;

-- =====================================================================
-- 4. INGREDIENTES (gramos de producto por RECETA COMPLETA, no por racion)
--    Se reescriben enteros en cada ejecucion para que el seed sea
--    reproducible: si cambia una cantidad, la nutricion se recalcula sola.
-- =====================================================================
delete from public.recipe_ingredients ri
using public.recipes r
where ri.recipe_id = r.id
  and r.owner_id is null
  and r.slug is not null;

insert into public.recipe_ingredients (recipe_id, food_id, grams, position)
select r.id, f.id, v.grams::numeric, v.position::smallint
from (values
  -- receta                              alimento                         g   pos
  ('avena-proteica-con-platano',        'copos-de-avena',                 60, 0),
  ('avena-proteica-con-platano',        'leche-semidesnatada',           200, 1),
  ('avena-proteica-con-platano',        'proteina-de-suero',              25, 2),
  ('avena-proteica-con-platano',        'platano',                       100, 3),
  ('avena-proteica-con-platano',        'crema-de-cacahuete',             15, 4),

  ('tostada-de-aguacate-y-huevo',       'pan-integral',                   80, 0),
  ('tostada-de-aguacate-y-huevo',       'aguacate',                       60, 1),
  ('tostada-de-aguacate-y-huevo',       'huevo-entero',                  110, 2),
  ('tostada-de-aguacate-y-huevo',       'tomate',                         50, 3),
  ('tostada-de-aguacate-y-huevo',       'aceite-de-oliva-virgen-extra',    5, 4),

  ('yogur-griego-con-frutos-rojos',     'yogur-griego-natural',          200, 0),
  ('yogur-griego-con-frutos-rojos',     'arandanos',                      80, 1),
  ('yogur-griego-con-frutos-rojos',     'almendras',                      20, 2),
  ('yogur-griego-con-frutos-rojos',     'miel',                           10, 3),

  ('tortilla-de-claras-con-espinacas',  'clara-de-huevo',                200, 0),
  ('tortilla-de-claras-con-espinacas',  'huevo-entero',                   55, 1),
  ('tortilla-de-claras-con-espinacas',  'espinacas',                      80, 2),
  ('tortilla-de-claras-con-espinacas',  'queso-parmesano',                15, 3),
  ('tortilla-de-claras-con-espinacas',  'aceite-de-oliva-virgen-extra',    5, 4),

  ('batido-verde-proteico',             'bebida-de-soja',                250, 0),
  ('batido-verde-proteico',             'espinacas',                      40, 1),
  ('batido-verde-proteico',             'platano',                       100, 2),
  ('batido-verde-proteico',             'proteina-de-suero',              30, 3),
  ('batido-verde-proteico',             'semillas-de-chia',               10, 4),

  ('pollo-con-arroz-y-brocoli',         'pechuga-de-pollo',              180, 0),
  ('pollo-con-arroz-y-brocoli',         'arroz-blanco',                   80, 1),
  ('pollo-con-arroz-y-brocoli',         'brocoli',                       150, 2),
  ('pollo-con-arroz-y-brocoli',         'aceite-de-oliva-virgen-extra',   10, 3),

  ('salmon-al-horno-con-boniato',       'salmon-fresco',                 150, 0),
  ('salmon-al-horno-con-boniato',       'boniato',                       200, 1),
  ('salmon-al-horno-con-boniato',       'esparragos',                    120, 2),
  ('salmon-al-horno-con-boniato',       'aceite-de-oliva-virgen-extra',    8, 3),

  ('lentejas-guisadas-con-verduras',    'lentejas-cocidas',              400, 0),
  ('lentejas-guisadas-con-verduras',    'zanahoria',                     120, 1),
  ('lentejas-guisadas-con-verduras',    'cebolla',                        80, 2),
  ('lentejas-guisadas-con-verduras',    'tomate-triturado',              150, 3),
  ('lentejas-guisadas-con-verduras',    'aceite-de-oliva-virgen-extra',   15, 4),
  ('lentejas-guisadas-con-verduras',    'caldo-de-verduras',             300, 5),

  ('bowl-de-quinoa-y-garbanzos',        'quinoa',                         70, 0),
  ('bowl-de-quinoa-y-garbanzos',        'garbanzos-cocidos',             150, 1),
  ('bowl-de-quinoa-y-garbanzos',        'pimiento-rojo',                  80, 2),
  ('bowl-de-quinoa-y-garbanzos',        'espinacas',                      50, 3),
  ('bowl-de-quinoa-y-garbanzos',        'aceite-de-oliva-virgen-extra',   10, 4),

  ('pasta-integral-con-atun',           'pasta-integral',                 90, 0),
  ('pasta-integral-con-atun',           'atun-en-conserva-al-natural',   120, 1),
  ('pasta-integral-con-atun',           'tomate-triturado',              150, 2),
  ('pasta-integral-con-atun',           'cebolla',                        50, 3),
  ('pasta-integral-con-atun',           'aceite-de-oliva-virgen-extra',    8, 4),

  ('wrap-de-pavo-y-hummus',             'tortillas-de-maiz',              80, 0),
  ('wrap-de-pavo-y-hummus',             'pechuga-de-pavo',               120, 1),
  ('wrap-de-pavo-y-hummus',             'hummus',                         40, 2),
  ('wrap-de-pavo-y-hummus',             'pimiento-rojo',                  60, 3),
  ('wrap-de-pavo-y-hummus',             'espinacas',                      20, 4),

  ('curry-de-garbanzos-y-coco',         'garbanzos-cocidos',             400, 0),
  ('curry-de-garbanzos-y-coco',         'leche-de-coco-ligera',          240, 1),
  ('curry-de-garbanzos-y-coco',         'tomate-triturado',              240, 2),
  ('curry-de-garbanzos-y-coco',         'cebolla',                       140, 3),
  ('curry-de-garbanzos-y-coco',         'aceite-de-oliva-virgen-extra',   16, 4),

  ('merluza-con-patata-y-pimiento',     'merluza',                       200, 0),
  ('merluza-con-patata-y-pimiento',     'patata',                        250, 1),
  ('merluza-con-patata-y-pimiento',     'pimiento-rojo',                 100, 2),
  ('merluza-con-patata-y-pimiento',     'aceite-de-oliva-virgen-extra',   10, 3),

  ('salteado-de-tofu-y-verduras',       'tofu-firme',                    200, 0),
  ('salteado-de-tofu-y-verduras',       'calabacin',                     150, 1),
  ('salteado-de-tofu-y-verduras',       'pimiento-rojo',                  80, 2),
  ('salteado-de-tofu-y-verduras',       'salsa-de-soja',                  15, 3),
  ('salteado-de-tofu-y-verduras',       'aceite-de-oliva-virgen-extra',   10, 4),
  ('salteado-de-tofu-y-verduras',       'arroz-integral',                 70, 5),

  ('tortilla-de-patata-ligera',         'patata',                        500, 0),
  ('tortilla-de-patata-ligera',         'huevo-entero',                  300, 1),
  ('tortilla-de-patata-ligera',         'cebolla',                       120, 2),
  ('tortilla-de-patata-ligera',         'aceite-de-oliva-virgen-extra',   20, 3),

  ('ternera-salteada-con-arroz',        'ternera-magra',                 170, 0),
  ('ternera-salteada-con-arroz',        'arroz-blanco',                   75, 1),
  ('ternera-salteada-con-arroz',        'pimiento-rojo',                  80, 2),
  ('ternera-salteada-con-arroz',        'cebolla',                        50, 3),
  ('ternera-salteada-con-arroz',        'aceite-de-oliva-virgen-extra',    8, 4),

  ('ensalada-de-pollo-y-aguacate',      'pechuga-de-pollo',              150, 0),
  ('ensalada-de-pollo-y-aguacate',      'aguacate',                       70, 1),
  ('ensalada-de-pollo-y-aguacate',      'tomate',                        100, 2),
  ('ensalada-de-pollo-y-aguacate',      'espinacas',                      60, 3),
  ('ensalada-de-pollo-y-aguacate',      'aceitunas-verdes',               20, 4),
  ('ensalada-de-pollo-y-aguacate',      'aceite-de-oliva-virgen-extra',    8, 5),

  ('gambas-al-ajillo-con-quinoa',       'gambas-peladas',                180, 0),
  ('gambas-al-ajillo-con-quinoa',       'quinoa',                         60, 1),
  ('gambas-al-ajillo-con-quinoa',       'calabacin',                     120, 2),
  ('gambas-al-ajillo-con-quinoa',       'aceite-de-oliva-virgen-extra',   12, 3),

  ('requeson-con-manzana-y-nueces',     'requeson',                      200, 0),
  ('requeson-con-manzana-y-nueces',     'manzana',                       150, 1),
  ('requeson-con-manzana-y-nueces',     'nueces',                         20, 2),

  ('tostada-de-crema-de-cacahuete',     'pan-integral',                   60, 0),
  ('tostada-de-crema-de-cacahuete',     'crema-de-cacahuete',             20, 1),
  ('tostada-de-crema-de-cacahuete',     'platano',                        80, 2),

  ('crema-de-calabacin-con-pollo',      'calabacin',                     600, 0),
  ('crema-de-calabacin-con-pollo',      'patata',                        200, 1),
  ('crema-de-calabacin-con-pollo',      'pechuga-de-pollo',              240, 2),
  ('crema-de-calabacin-con-pollo',      'cebolla',                       100, 3),
  ('crema-de-calabacin-con-pollo',      'caldo-de-verduras',             400, 4),
  ('crema-de-calabacin-con-pollo',      'aceite-de-oliva-virgen-extra',   16, 5),

  ('tempeh-con-boniato-y-espinacas',    'tempeh',                        150, 0),
  ('tempeh-con-boniato-y-espinacas',    'boniato',                       200, 1),
  ('tempeh-con-boniato-y-espinacas',    'espinacas',                     100, 2),
  ('tempeh-con-boniato-y-espinacas',    'aceite-de-oliva-virgen-extra',   10, 3),

  ('bowl-de-atun-arroz-y-aguacate',     'arroz-integral',                 70, 0),
  ('bowl-de-atun-arroz-y-aguacate',     'atun-en-conserva-al-natural',   120, 1),
  ('bowl-de-atun-arroz-y-aguacate',     'aguacate',                       60, 2),
  ('bowl-de-atun-arroz-y-aguacate',     'zanahoria',                      60, 3),
  ('bowl-de-atun-arroz-y-aguacate',     'salsa-de-soja',                  10, 4),

  ('pudin-de-chia-y-cacao',             'bebida-de-soja',                250, 0),
  ('pudin-de-chia-y-cacao',             'semillas-de-chia',               30, 1),
  ('pudin-de-chia-y-cacao',             'cacao-en-polvo-desgrasado',      10, 2),
  ('pudin-de-chia-y-cacao',             'platano',                        60, 3),

  ('snack-de-chocolate-y-almendras',    'chocolate-negro-85',             25, 0),
  ('snack-de-chocolate-y-almendras',    'almendras',                      20, 1),

  ('cuscus-con-verduras-y-seitan',      'cuscus',                         70, 0),
  ('cuscus-con-verduras-y-seitan',      'seitan',                        150, 1),
  ('cuscus-con-verduras-y-seitan',      'champinones',                   100, 2),
  ('cuscus-con-verduras-y-seitan',      'pimiento-rojo',                  80, 3),
  ('cuscus-con-verduras-y-seitan',      'aceite-de-oliva-virgen-extra',   10, 4),

  ('chili-de-alubias-negras',           'alubias-negras-cocidas',        400, 0),
  ('chili-de-alubias-negras',           'tomate-triturado',              200, 1),
  ('chili-de-alubias-negras',           'pimiento-rojo',                 150, 2),
  ('chili-de-alubias-negras',           'cebolla',                       100, 3),
  ('chili-de-alubias-negras',           'aceite-de-oliva-virgen-extra',   14, 4),

  ('pasta-al-horno-con-mozzarella',     'pasta-de-trigo',                160, 0),
  ('pasta-al-horno-con-mozzarella',     'tomate-triturado',              300, 1),
  ('pasta-al-horno-con-mozzarella',     'queso-mozzarella',              100, 2),
  ('pasta-al-horno-con-mozzarella',     'calabacin',                     150, 3),
  ('pasta-al-horno-con-mozzarella',     'aceite-de-oliva-virgen-extra',   12, 4),

  ('lomo-de-cerdo-con-manzana',         'lomo-de-cerdo',                 170, 0),
  ('lomo-de-cerdo-con-manzana',         'manzana',                       150, 1),
  ('lomo-de-cerdo-con-manzana',         'patata',                        200, 2),
  ('lomo-de-cerdo-con-manzana',         'aceite-de-oliva-virgen-extra',    8, 3),

  ('bol-de-yogur-y-fresas',             'yogur-natural-desnatado',       250, 0),
  ('bol-de-yogur-y-fresas',             'fresas',                        150, 1),
  ('bol-de-yogur-y-fresas',             'copos-de-avena',                 30, 2),
  ('bol-de-yogur-y-fresas',             'miel',                           10, 3),

  ('queso-batido-con-naranja',          'queso-batido-desnatado',        200, 0),
  ('queso-batido-con-naranja',          'naranja',                       150, 1),
  ('queso-batido-con-naranja',          'almendras',                      15, 2)
) as v(recipe_slug, food_slug, grams, position)
join public.recipes r on r.slug = v.recipe_slug and r.owner_id is null
join public.foods   f on f.slug = v.food_slug   and f.owner_id is null;

-- =====================================================================
-- 5. NUTRICION, ALERGENOS Y PATRONES DIETETICOS DERIVADOS
--    Nada de esto se escribe a mano: se calcula desde los ingredientes.
-- =====================================================================

-- 5.1 Macros por racion = suma de los ingredientes / numero de raciones.
update public.recipes r
set kcal_per_serving      = round(agg.kcal      / r.servings, 1),
    protein_g_per_serving = round(agg.protein_g / r.servings, 1),
    carbs_g_per_serving   = round(agg.carbs_g   / r.servings, 1),
    fat_g_per_serving     = round(agg.fat_g     / r.servings, 1),
    fiber_g_per_serving   = round(agg.fiber_g   / r.servings, 1)
from (
  select ri.recipe_id,
         sum(f.kcal_per_100g      * ri.grams / 100) as kcal,
         sum(f.protein_g_per_100g * ri.grams / 100) as protein_g,
         sum(f.carbs_g_per_100g   * ri.grams / 100) as carbs_g,
         sum(f.fat_g_per_100g     * ri.grams / 100) as fat_g,
         sum(f.fiber_g_per_100g   * ri.grams / 100) as fiber_g
  from public.recipe_ingredients ri
  join public.foods f on f.id = ri.food_id
  group by ri.recipe_id
) agg
where agg.recipe_id = r.id
  and r.owner_id is null;

-- 5.2 Alergenos = union de los alergenos de los ingredientes.
--     Es informacion de seguridad: se deriva, nunca se teclea.
update public.recipes r
set allergens = coalesce((
  select array_agg(distinct a order by a)
  from public.recipe_ingredients ri
  join public.foods f on f.id = ri.food_id
  cross join lateral unnest(f.allergens) as a
  where ri.recipe_id = r.id
), '{}')
where r.owner_id is null;

-- 5.3 Patron dietetico = interseccion: una receta es apta para una dieta
--     solo si TODOS sus ingredientes lo son.
update public.recipes r
set diet_patterns = array(
  select d
  from unnest(array['omnivore', 'vegetarian', 'vegan', 'pescatarian']) as d
  where not exists (
    select 1
    from public.recipe_ingredients ri
    join public.foods f on f.id = ri.food_id
    where ri.recipe_id = r.id
      and not (d = any (f.diet_patterns))
  )
)
where r.owner_id is null;

-- =====================================================================
-- 6. COMPROBACIONES DEL SEED
--    Si algo no cuadra, el seed falla aqui en vez de dejar datos falsos.
-- =====================================================================
do $$
declare
  v_foods    integer;
  v_recipes  integer;
  v_huerfana text;
  v_descuadre text;
  v_sin_dieta text;
begin
  select count(*) into v_foods   from public.foods   where owner_id is null;
  select count(*) into v_recipes from public.recipes where owner_id is null;

  if v_foods < 40 then
    raise exception 'El seed deberia dejar al menos 40 alimentos globales, hay %.', v_foods;
  end if;

  if v_recipes < 20 then
    raise exception 'El seed deberia dejar al menos 20 recetas, hay %.', v_recipes;
  end if;

  -- (a) Ninguna receta puede quedarse sin ingredientes: significaria que un
  --     slug del bloque 4 no existe en foods y la fila se perdio en el join.
  select string_agg(r.slug, ', ' order by r.slug) into v_huerfana
  from public.recipes r
  where r.owner_id is null
    and not exists (select 1 from public.recipe_ingredients ri where ri.recipe_id = r.id);

  if v_huerfana is not null then
    raise exception 'Recetas sin ingredientes (revisa los slugs): %.', v_huerfana;
  end if;

  -- (b) La nutricion guardada debe cuadrar con la suma de los ingredientes
  --     (tolerancia 0.2 kcal por el redondeo a un decimal).
  select string_agg(format('%s (guardado %s, calculado %s)',
                           x.slug, x.kcal_per_serving, round(x.calc, 1)), '; ')
    into v_descuadre
  from (
    select r.slug, r.kcal_per_serving,
           sum(f.kcal_per_100g * ri.grams / 100) / r.servings as calc
    from public.recipes r
    join public.recipe_ingredients ri on ri.recipe_id = r.id
    join public.foods f on f.id = ri.food_id
    where r.owner_id is null
    group by r.id, r.slug, r.kcal_per_serving, r.servings
  ) x
  where abs(x.kcal_per_serving - x.calc) > 0.2;

  if v_descuadre is not null then
    raise exception 'Recetas cuya nutricion no cuadra con sus ingredientes: %.', v_descuadre;
  end if;

  -- (c) Toda receta debe ser apta para, al menos, la dieta omnivora.
  select string_agg(r.slug, ', ' order by r.slug) into v_sin_dieta
  from public.recipes r
  where r.owner_id is null and cardinality(r.diet_patterns) = 0;

  if v_sin_dieta is not null then
    raise exception 'Recetas sin ningun patron dietetico compatible: %.', v_sin_dieta;
  end if;

  raise notice 'Seed local correcto: % alimentos, % recetas, % ingredientes, % ejercicios.',
    v_foods, v_recipes,
    (select count(*) from public.recipe_ingredients),
    (select count(*) from public.exercise_library);
end;
$$;
