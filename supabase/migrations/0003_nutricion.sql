-- =====================================================================
-- 0003_nutricion.sql
-- NutriFit · Objetivos nutricionales, planes de menu, registro de comidas
-- y listas de la compra.
--
-- Modelo elegido: meal_entries sirve para lo PLANIFICADO y lo REGISTRADO.
--   * status = 'planned' y meal_plan_day_id no nulo -> comida del plan.
--   * status = 'logged'                             -> lo que el usuario comio.
-- Asi el diario y el plan comparten una sola forma de datos (PlannedMeal).
-- =====================================================================

-- =========================================================== nutrition_targets
-- Historico versionado: nunca se sobrescribe, se cierra el periodo anterior.
create table if not exists public.nutrition_targets (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.profiles (id) on delete cascade,
  effective_from          date not null default current_date,
  effective_to            date,
  -- 1000 kcal es el suelo DURO de la base de datos (limite de plausibilidad).
  -- El suelo de producto es mas alto (1200/1500 kcal segun sexo) y lo aplica
  -- el motor de nutricion: ver docs/HEALTH_RULES.md (SAFETY GUARDRAIL SG-1).
  kcal                    integer not null check (kcal between 1000 and 6000),
  protein_g               numeric(6, 2) not null check (protein_g between 0 and 400),
  carbs_g                 numeric(6, 2) not null check (carbs_g between 0 and 900),
  fat_g                   numeric(6, 2) not null check (fat_g between 0 and 300),
  fiber_g                 numeric(6, 2) not null default 25 check (fiber_g between 0 and 100),
  -- Trazabilidad (NutritionTargets.rationale): por que salieron estos numeros.
  rationale_bmr_kcal      numeric(7, 2) check (rationale_bmr_kcal between 500 and 5000),
  rationale_tdee_kcal     numeric(7, 2) check (rationale_tdee_kcal between 500 and 8000),
  rationale_adjustment_kcal numeric(7, 2)
                            check (rationale_adjustment_kcal between -1500 and 1500),
  rationale_floor_applied boolean not null default false,
  source                  text not null default 'engine'
                            check (source in ('engine', 'manual', 'adjustment')),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  constraint nutrition_targets_period_ordered
    check (effective_to is null or effective_to >= effective_from),
  -- Los macros no pueden desviarse mas de un 15% de las kcal declaradas.
  constraint nutrition_targets_macros_match_kcal
    check (abs((protein_g * 4 + carbs_g * 4 + fat_g * 9) - kcal) <= kcal * 0.15)
);

comment on table public.nutrition_targets is
  'Objetivos diarios vigentes e historicos, con la trazabilidad del calculo.';

create index if not exists nutrition_targets_user_from_idx
  on public.nutrition_targets (user_id, effective_from desc);
-- Solo un objetivo abierto por usuario.
create unique index if not exists nutrition_targets_one_current_idx
  on public.nutrition_targets (user_id) where effective_to is null;

drop trigger if exists trg_nutrition_targets_updated_at on public.nutrition_targets;
create trigger trg_nutrition_targets_updated_at
  before update on public.nutrition_targets
  for each row execute function public.set_updated_at();

-- ================================================================== meal_plans
create table if not exists public.meal_plans (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles (id) on delete cascade,
  nutrition_target_id uuid references public.nutrition_targets (id) on delete set null,
  name                text not null default '',
  start_date          date not null default current_date,
  weeks               smallint not null default 1 check (weeks between 1 and 12),
  status              text not null default 'draft'
                        check (status in ('draft', 'active', 'archived')),
  generated_by        text not null default 'engine'
                        check (generated_by in ('engine', 'manual')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.meal_plans is
  'Plan de menus de una o varias semanas para un usuario.';

create index if not exists meal_plans_user_start_idx
  on public.meal_plans (user_id, start_date desc);
create unique index if not exists meal_plans_one_active_idx
  on public.meal_plans (user_id) where status = 'active';

drop trigger if exists trg_meal_plans_updated_at on public.meal_plans;
create trigger trg_meal_plans_updated_at
  before update on public.meal_plans
  for each row execute function public.set_updated_at();

-- ============================================================== meal_plan_days
-- Tabla hija de meal_plans (DayPlan del dominio). Sin user_id propio.
create table if not exists public.meal_plan_days (
  id            uuid primary key default gen_random_uuid(),
  meal_plan_id  uuid not null references public.meal_plans (id) on delete cascade,
  -- 0..6 dentro de la semana, igual que DayPlan.dayIndex.
  day_index     smallint not null check (day_index between 0 and 6),
  week_number   smallint not null default 1 check (week_number between 1 and 12),
  plan_date     date,
  kcal          numeric(8, 2) not null default 0 check (kcal >= 0),
  protein_g     numeric(7, 2) not null default 0 check (protein_g >= 0),
  carbs_g       numeric(7, 2) not null default 0 check (carbs_g >= 0),
  fat_g         numeric(7, 2) not null default 0 check (fat_g >= 0),
  fiber_g       numeric(7, 2) not null default 0 check (fiber_g >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (meal_plan_id, week_number, day_index)
);

comment on table public.meal_plan_days is
  'Dia del plan con sus totales cacheados. Propiedad via meal_plans.user_id.';

create index if not exists meal_plan_days_plan_idx on public.meal_plan_days (meal_plan_id);
create index if not exists meal_plan_days_date_idx on public.meal_plan_days (plan_date);

drop trigger if exists trg_meal_plan_days_updated_at on public.meal_plan_days;
create trigger trg_meal_plan_days_updated_at
  before update on public.meal_plan_days
  for each row execute function public.set_updated_at();

-- ================================================================ meal_entries
create table if not exists public.meal_entries (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles (id) on delete cascade,
  meal_plan_day_id  uuid references public.meal_plan_days (id) on delete set null,
  recipe_id         uuid references public.recipes (id) on delete set null,
  entry_date        date not null default current_date,
  meal_type         public.meal_type not null,
  name              text not null default '',
  status            text not null default 'logged'
                      check (status in ('planned', 'logged', 'skipped')),
  prep_minutes      smallint not null default 0 check (prep_minutes between 0 and 600),
  instructions      text[] not null default '{}',
  -- Totales cacheados de meal_entry_items (Nutrients del dominio).
  kcal              numeric(8, 2) not null default 0 check (kcal >= 0),
  protein_g         numeric(7, 2) not null default 0 check (protein_g >= 0),
  carbs_g           numeric(7, 2) not null default 0 check (carbs_g >= 0),
  fat_g             numeric(7, 2) not null default 0 check (fat_g >= 0),
  fiber_g           numeric(7, 2) not null default 0 check (fiber_g >= 0),
  sugar_g           numeric(7, 2) check (sugar_g >= 0),
  sodium_mg         numeric(9, 2) check (sodium_mg >= 0),
  logged_at         timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- Una comida registrada lleva marca de tiempo; una planificada no la necesita.
  constraint meal_entries_logged_has_timestamp
    check (status <> 'logged' or logged_at is not null)
);

comment on table public.meal_entries is
  'Comida planificada o registrada. Es la unidad del diario nutricional.';

-- Indice principal del diario: "las comidas de este usuario en esta fecha".
create index if not exists meal_entries_user_date_idx
  on public.meal_entries (user_id, entry_date desc);
create index if not exists meal_entries_plan_day_idx
  on public.meal_entries (meal_plan_day_id);
create index if not exists meal_entries_recipe_idx on public.meal_entries (recipe_id);

drop trigger if exists trg_meal_entries_updated_at on public.meal_entries;
create trigger trg_meal_entries_updated_at
  before update on public.meal_entries
  for each row execute function public.set_updated_at();

-- =========================================================== meal_entry_items
-- Tabla hija (MealItem). La propiedad se comprueba subiendo a meal_entries.
create table if not exists public.meal_entry_items (
  id              uuid primary key default gen_random_uuid(),
  meal_entry_id   uuid not null references public.meal_entries (id) on delete cascade,
  food_id         uuid references public.foods (id) on delete set null,
  -- Se guarda el nombre para que el historico no cambie si el alimento cambia.
  name            text not null default '',
  grams           numeric(8, 2) not null check (grams > 0 and grams <= 5000),
  kcal            numeric(8, 2) not null default 0 check (kcal >= 0),
  protein_g       numeric(7, 2) not null default 0 check (protein_g >= 0),
  carbs_g         numeric(7, 2) not null default 0 check (carbs_g >= 0),
  fat_g           numeric(7, 2) not null default 0 check (fat_g >= 0),
  fiber_g         numeric(7, 2) not null default 0 check (fiber_g >= 0),
  sugar_g         numeric(7, 2) check (sugar_g >= 0),
  sodium_mg       numeric(9, 2) check (sodium_mg >= 0),
  position        smallint not null default 0 check (position >= 0),
  created_at      timestamptz not null default now(),
  unique (meal_entry_id, position)
);

comment on table public.meal_entry_items is
  'Alimentos de una comida, en gramos, con sus macros congelados.';

create index if not exists meal_entry_items_entry_idx
  on public.meal_entry_items (meal_entry_id);
create index if not exists meal_entry_items_food_idx
  on public.meal_entry_items (food_id);

-- ============================================================== shopping_lists
create table if not exists public.shopping_lists (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  meal_plan_id  uuid references public.meal_plans (id) on delete set null,
  name          text not null default '',
  status        text not null default 'open'
                  check (status in ('open', 'done', 'archived')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.shopping_lists is
  'Lista de la compra, normalmente derivada de un meal_plan.';

create index if not exists shopping_lists_user_idx
  on public.shopping_lists (user_id, created_at desc);
create index if not exists shopping_lists_plan_idx
  on public.shopping_lists (meal_plan_id);

drop trigger if exists trg_shopping_lists_updated_at on public.shopping_lists;
create trigger trg_shopping_lists_updated_at
  before update on public.shopping_lists
  for each row execute function public.set_updated_at();

-- ========================================================= shopping_list_items
-- Tabla hija. La propiedad se comprueba subiendo a shopping_lists.user_id.
create table if not exists public.shopping_list_items (
  id                uuid primary key default gen_random_uuid(),
  shopping_list_id  uuid not null references public.shopping_lists (id) on delete cascade,
  food_id           uuid references public.foods (id) on delete set null,
  label             text not null check (length(btrim(label)) > 0),
  quantity          numeric(9, 2) not null default 1 check (quantity > 0),
  unit              text not null default 'g'
                      check (unit in ('g', 'ml', 'unit', 'package')),
  aisle             text check (aisle is null or aisle in
                      ('produce', 'butcher', 'fish', 'dairy', 'bakery',
                       'pantry', 'frozen', 'other')),
  is_checked        boolean not null default false,
  position          smallint not null default 0 check (position >= 0),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.shopping_list_items is
  'Linea de la lista de la compra. Puede o no apuntar a un alimento del catalogo.';

create index if not exists shopping_list_items_list_idx
  on public.shopping_list_items (shopping_list_id);
create index if not exists shopping_list_items_food_idx
  on public.shopping_list_items (food_id);

drop trigger if exists trg_shopping_list_items_updated_at on public.shopping_list_items;
create trigger trg_shopping_list_items_updated_at
  before update on public.shopping_list_items
  for each row execute function public.set_updated_at();
