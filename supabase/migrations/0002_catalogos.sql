-- =====================================================================
-- 0002_catalogos.sql
-- NutriFit · Catalogos: biblioteca de ejercicios, alimentos, favoritos,
-- recetas e ingredientes.
--
-- Regla de propiedad de los catalogos:
--   * exercise_library es 100% global (solo escribe service_role).
--   * foods con owner_id is null  -> catalogo global (solo service_role).
--     foods con owner_id = uuid   -> alimento privado del usuario.
--   * recipes con owner_id is null -> recetas del sistema (solo service_role).
--     recipes con owner_id = uuid  -> receta del usuario, publica o privada.
-- =====================================================================

-- ============================================================ exercise_library
create table if not exists public.exercise_library (
  id                  uuid primary key default gen_random_uuid(),
  -- slug es la clave estable que usa el dominio (WorkoutExercise.exerciseSlug).
  slug                text not null unique
                        check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_key            text not null,          -- clave i18n, nunca texto suelto
  pattern             public.movement_pattern not null,
  primary_muscles     text[] not null default '{}'
                        check (primary_muscles <@ array[
                          'quads','hamstrings','glutes','calves','chest','back','lats',
                          'traps','shoulders','biceps','triceps','forearms','abs',
                          'obliques','lower_back','full_body']::text[]),
  secondary_muscles   text[] not null default '{}'
                        check (secondary_muscles <@ array[
                          'quads','hamstrings','glutes','calves','chest','back','lats',
                          'traps','shoulders','biceps','triceps','forearms','abs',
                          'obliques','lower_back','full_body']::text[]),
  equipment           text[] not null default '{}'
                        check (equipment <@ array[
                          'none','dumbbells','bands','barbell','plates','bench','rack',
                          'cables','machines','kettlebell','bike','treadmill','rower']::text[]),
  difficulty          public.difficulty not null default 'beginner',
  instruction_keys    text[] not null default '{}',
  common_mistake_keys text[] not null default '{}',
  safety_note_keys    text[] not null default '{}',
  alternatives        text[] not null default '{}',   -- slugs de ejercicios equivalentes
  video_url           text check (video_url is null or video_url ~* '^https://'),
  image_url           text check (image_url is null or image_url ~* '^https://'),
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  -- Un ejercicio debe tener al menos un musculo primario.
  constraint exercise_library_has_primary check (cardinality(primary_muscles) >= 1)
);

comment on table public.exercise_library is
  'Catalogo global de ejercicios. Lectura para autenticados, escritura solo service_role.';

create index if not exists exercise_library_pattern_idx
  on public.exercise_library (pattern) where is_active;
create index if not exists exercise_library_difficulty_idx
  on public.exercise_library (difficulty) where is_active;
-- GIN para "que ejercicios puedo hacer con este equipamiento".
create index if not exists exercise_library_equipment_idx
  on public.exercise_library using gin (equipment);

drop trigger if exists trg_exercise_library_updated_at on public.exercise_library;
create trigger trg_exercise_library_updated_at
  before update on public.exercise_library
  for each row execute function public.set_updated_at();

-- ======================================================================= foods
-- Macros siempre por 100 g (Nutrients.per100g en el dominio); la racion
-- concreta se describe con serving_label + serving_grams.
create table if not exists public.foods (
  id                  uuid primary key default gen_random_uuid(),
  -- null = alimento del catalogo global; uuid = alimento privado del usuario.
  owner_id            uuid references public.profiles (id) on delete cascade,
  slug                text check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name                text not null check (length(btrim(name)) > 0),
  brand               text,
  serving_label       text not null default '100 g',
  serving_grams       numeric(8, 2) not null default 100
                        check (serving_grams > 0 and serving_grams <= 5000),
  kcal_per_100g       numeric(7, 2) not null check (kcal_per_100g between 0 and 900),
  protein_g_per_100g  numeric(6, 2) not null default 0 check (protein_g_per_100g between 0 and 100),
  carbs_g_per_100g    numeric(6, 2) not null default 0 check (carbs_g_per_100g between 0 and 100),
  fat_g_per_100g      numeric(6, 2) not null default 0 check (fat_g_per_100g between 0 and 100),
  fiber_g_per_100g    numeric(6, 2) not null default 0 check (fiber_g_per_100g between 0 and 100),
  sugar_g_per_100g    numeric(6, 2) check (sugar_g_per_100g between 0 and 100),
  sodium_mg_per_100g  numeric(8, 2) check (sodium_mg_per_100g between 0 and 40000),
  source              text not null default 'manual'
                        check (source in ('usda', 'manual', 'recipe')),
  external_id         text,                     -- fdcId de USDA FoodData Central
  barcode             text check (barcode is null or barcode ~ '^[0-9]{8,14}$'),
  tags                text[] not null default '{}',
  allergens           text[] not null default '{}'
                        check (allergens <@ array['gluten','lactose','tree_nuts','peanut',
                                                  'egg','fish','shellfish','soy']::text[]),
  diet_patterns       text[] not null default '{}'
                        check (diet_patterns <@ array['omnivore','vegetarian','vegan',
                                                      'pescatarian']::text[]),
  is_verified         boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  -- Plausibilidad fisica: los macros de 100 g no pueden sumar mas de 100 g.
  constraint foods_macros_plausible
    check (protein_g_per_100g + carbs_g_per_100g + fat_g_per_100g <= 100.5),
  -- La fibra es parte de los hidratos declarados.
  constraint foods_fiber_within_carbs
    check (fiber_g_per_100g <= carbs_g_per_100g + 0.5),
  constraint foods_sugar_within_carbs
    check (sugar_g_per_100g is null or sugar_g_per_100g <= carbs_g_per_100g + 0.5),
  -- Coherencia energetica (Atwater: 4 kcal proteina, 4 hidratos netos,
  -- 2 fibra, 9 grasa) con tolerancia amplia para redondeos de las fuentes.
  constraint foods_kcal_matches_macros
    check (
      kcal_per_100g <= (protein_g_per_100g * 4
                        + (carbs_g_per_100g - least(fiber_g_per_100g, carbs_g_per_100g)) * 4
                        + least(fiber_g_per_100g, carbs_g_per_100g) * 2
                        + fat_g_per_100g * 9) * 1.25 + 25
      and kcal_per_100g >= (protein_g_per_100g * 4
                        + (carbs_g_per_100g - least(fiber_g_per_100g, carbs_g_per_100g)) * 4
                        + least(fiber_g_per_100g, carbs_g_per_100g) * 2
                        + fat_g_per_100g * 9) * 0.65 - 25
    )
);

comment on table public.foods is
  'Alimentos. owner_id null = catalogo global (solo service_role escribe); '
  'owner_id = usuario -> alimento privado.';
comment on column public.foods.owner_id is
  'null = fila del catalogo global compartido. Determina la politica RLS aplicable.';

-- Un slug unico por fila global; los alimentos privados no necesitan slug.
create unique index if not exists foods_global_slug_idx
  on public.foods (slug) where owner_id is null and slug is not null;
create unique index if not exists foods_global_barcode_idx
  on public.foods (barcode) where owner_id is null and barcode is not null;
create index if not exists foods_owner_idx on public.foods (owner_id);
-- Busqueda por nombre con trigramas (se filtra de verdad por aqui).
create index if not exists foods_name_trgm_idx
  on public.foods using gin (name extensions.gin_trgm_ops);
create index if not exists foods_diet_patterns_idx
  on public.foods using gin (diet_patterns);
create index if not exists foods_allergens_idx
  on public.foods using gin (allergens);

drop trigger if exists trg_foods_updated_at on public.foods;
create trigger trg_foods_updated_at
  before update on public.foods
  for each row execute function public.set_updated_at();

-- ============================================================== favorite_foods
create table if not exists public.favorite_foods (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  food_id     uuid not null references public.foods (id) on delete cascade,
  position    smallint not null default 0 check (position >= 0),
  created_at  timestamptz not null default now(),
  unique (user_id, food_id)
);

comment on table public.favorite_foods is
  'Acceso rapido del usuario a sus alimentos habituales.';

create index if not exists favorite_foods_user_idx on public.favorite_foods (user_id);
create index if not exists favorite_foods_food_idx on public.favorite_foods (food_id);

-- ===================================================================== recipes
-- La nutricion de la receta se guarda por racion y DEBE cuadrar con la suma
-- de recipe_ingredients (ver comprobacion al final de seed.sql).
create table if not exists public.recipes (
  id                    uuid primary key default gen_random_uuid(),
  owner_id              uuid references public.profiles (id) on delete cascade,
  is_public             boolean not null default false,
  slug                  text check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title                 text not null check (length(btrim(title)) > 0),
  description           text,
  meal_type             public.meal_type not null default 'lunch',
  servings              smallint not null default 1 check (servings between 1 and 20),
  prep_minutes          smallint not null default 0 check (prep_minutes between 0 and 600),
  cook_minutes          smallint not null default 0 check (cook_minutes between 0 and 600),
  instructions          text[] not null default '{}',
  tags                  text[] not null default '{}',
  allergens             text[] not null default '{}'
                          check (allergens <@ array['gluten','lactose','tree_nuts','peanut',
                                                    'egg','fish','shellfish','soy']::text[]),
  diet_patterns         text[] not null default '{}'
                          check (diet_patterns <@ array['omnivore','vegetarian','vegan',
                                                        'pescatarian']::text[]),
  kcal_per_serving      numeric(8, 2) not null default 0
                          check (kcal_per_serving between 0 and 5000),
  protein_g_per_serving numeric(7, 2) not null default 0 check (protein_g_per_serving >= 0),
  carbs_g_per_serving   numeric(7, 2) not null default 0 check (carbs_g_per_serving >= 0),
  fat_g_per_serving     numeric(7, 2) not null default 0 check (fat_g_per_serving >= 0),
  fiber_g_per_serving   numeric(7, 2) not null default 0 check (fiber_g_per_serving >= 0),
  image_url             text check (image_url is null or image_url ~* '^https://'),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

comment on table public.recipes is
  'Recetas del sistema (owner_id null) y del usuario. is_public abre la lectura.';
comment on column public.recipes.kcal_per_serving is
  'Cache calculada desde recipe_ingredients; seed.sql la recalcula y verifica.';

create unique index if not exists recipes_global_slug_idx
  on public.recipes (slug) where owner_id is null and slug is not null;
create index if not exists recipes_owner_idx on public.recipes (owner_id);
create index if not exists recipes_public_idx on public.recipes (is_public) where is_public;
create index if not exists recipes_meal_type_idx on public.recipes (meal_type);
create index if not exists recipes_title_trgm_idx
  on public.recipes using gin (title extensions.gin_trgm_ops);
create index if not exists recipes_diet_patterns_idx
  on public.recipes using gin (diet_patterns);

drop trigger if exists trg_recipes_updated_at on public.recipes;
create trigger trg_recipes_updated_at
  before update on public.recipes
  for each row execute function public.set_updated_at();

-- ========================================================== recipe_ingredients
-- Tabla hija: su dueno es el de la receta. Nunca lleva user_id propio.
create table if not exists public.recipe_ingredients (
  id          uuid primary key default gen_random_uuid(),
  recipe_id   uuid not null references public.recipes (id) on delete cascade,
  food_id     uuid not null references public.foods (id) on delete restrict,
  grams       numeric(8, 2) not null check (grams > 0 and grams <= 5000),
  position    smallint not null default 0 check (position >= 0),
  note        text,
  created_at  timestamptz not null default now(),
  unique (recipe_id, position)
);

comment on table public.recipe_ingredients is
  'Ingredientes en gramos. La propiedad se resuelve subiendo a recipes.owner_id.';

create index if not exists recipe_ingredients_recipe_idx
  on public.recipe_ingredients (recipe_id);
create index if not exists recipe_ingredients_food_idx
  on public.recipe_ingredients (food_id);
