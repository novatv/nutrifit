-- =====================================================================
-- 0005_progreso_y_habitos.sql
-- NutriFit · Medidas corporales, fotos, check-in semanal, ajustes del plan
-- y habitos diarios.
-- =====================================================================

-- =========================================================== body_measurements
create table if not exists public.body_measurements (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  measured_on   date not null default current_date,
  weight_kg     numeric(6, 2) check (weight_kg between 25 and 400),
  body_fat_pct  numeric(4, 1) check (body_fat_pct between 3 and 70),
  waist_cm      numeric(5, 1) check (waist_cm between 30 and 250),
  hip_cm        numeric(5, 1) check (hip_cm between 30 and 250),
  chest_cm      numeric(5, 1) check (chest_cm between 30 and 250),
  arm_cm        numeric(5, 1) check (arm_cm between 10 and 100),
  thigh_cm      numeric(5, 1) check (thigh_cm between 20 and 150),
  neck_cm       numeric(5, 1) check (neck_cm between 20 and 80),
  source        text not null default 'manual'
                  check (source in ('manual', 'scale', 'import')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  -- Una medicion por dia: evita ruido y duplicados en las graficas.
  unique (user_id, measured_on),
  -- Al menos un dato: una fila vacia no aporta nada.
  constraint body_measurements_not_empty check (
    weight_kg is not null or body_fat_pct is not null or waist_cm is not null
    or hip_cm is not null or chest_cm is not null or arm_cm is not null
    or thigh_cm is not null or neck_cm is not null
  )
);

comment on table public.body_measurements is
  'Serie temporal de peso y perimetros. Alimenta las tendencias del check-in.';

create index if not exists body_measurements_user_date_idx
  on public.body_measurements (user_id, measured_on desc);

drop trigger if exists trg_body_measurements_updated_at on public.body_measurements;
create trigger trg_body_measurements_updated_at
  before update on public.body_measurements
  for each row execute function public.set_updated_at();

-- ============================================================== progress_photos
-- Dato especialmente sensible: solo el dueno, nunca lectura publica.
create table if not exists public.progress_photos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  taken_on      date not null default current_date,
  -- Ruta dentro del bucket privado de Supabase Storage, no una URL publica.
  storage_path  text not null check (length(btrim(storage_path)) > 0),
  pose          text not null default 'front'
                  check (pose in ('front', 'side', 'back', 'other')),
  weight_kg     numeric(6, 2) check (weight_kg between 25 and 400),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, storage_path)
);

comment on table public.progress_photos is
  'Fotos de progreso. Solo rutas de Storage privado; nunca se comparten.';

create index if not exists progress_photos_user_date_idx
  on public.progress_photos (user_id, taken_on desc);

drop trigger if exists trg_progress_photos_updated_at on public.progress_photos;
create trigger trg_progress_photos_updated_at
  before update on public.progress_photos
  for each row execute function public.set_updated_at();

-- ============================================================== weekly_checkins
create table if not exists public.weekly_checkins (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles (id) on delete cascade,
  program_id            uuid references public.training_programs (id) on delete set null,
  week_number           smallint not null check (week_number between 1 and 104),
  checkin_date          date not null default current_date,
  weight_kg             numeric(6, 2) check (weight_kg between 25 and 400),
  -- Adherencia nutricional 0..1 (fraccion, no porcentaje).
  nutrition_adherence   numeric(4, 3) not null default 0
                          check (nutrition_adherence between 0 and 1),
  workouts_completed    smallint not null default 0
                          check (workouts_completed between 0 and 21),
  workouts_planned      smallint not null default 0
                          check (workouts_planned between 0 and 21),
  hunger                smallint not null check (hunger between 1 and 5),
  energy                smallint not null check (energy between 1 and 5),
  sleep                 smallint not null check (sleep between 1 and 5),
  difficulty            smallint not null check (difficulty between 1 and 5),
  perceived_progress    smallint not null check (perceived_progress between 1 and 5),
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (user_id, checkin_date)
);

comment on table public.weekly_checkins is
  'Check-in semanal: entrada del motor de ajuste (hambre, energia, adherencia).';

create index if not exists weekly_checkins_user_date_idx
  on public.weekly_checkins (user_id, checkin_date desc);
create index if not exists weekly_checkins_program_idx
  on public.weekly_checkins (program_id);

drop trigger if exists trg_weekly_checkins_updated_at on public.weekly_checkins;
create trigger trg_weekly_checkins_updated_at
  before update on public.weekly_checkins
  for each row execute function public.set_updated_at();

-- ============================================================= plan_adjustments
-- Decision del motor tras un check-in. Un cambio de objetivos nunca se aplica
-- en silencio: requires_confirmation arranca en true (PlanAdjustment del dominio).
create table if not exists public.plan_adjustments (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles (id) on delete cascade,
  checkin_id            uuid references public.weekly_checkins (id) on delete cascade,
  decision              public.adjustment_decision not null,
  explanation_key       text not null,           -- clave i18n, nunca texto suelto
  explanation_params    jsonb not null default '{}'::jsonb,
  -- Instantaneas parciales de NutritionTargets antes/despues del ajuste.
  before_targets        jsonb,
  after_targets         jsonb,
  requires_confirmation boolean not null default true,
  confirmed_at          timestamptz,
  applied_at            timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  -- Si requiere confirmacion, no puede figurar como aplicado sin confirmar.
  constraint plan_adjustments_confirm_before_apply
    check (applied_at is null or requires_confirmation = false or confirmed_at is not null),
  constraint plan_adjustments_params_is_object
    check (jsonb_typeof(explanation_params) = 'object')
);

comment on table public.plan_adjustments is
  'Historial de decisiones del motor de ajuste y su confirmacion por el usuario.';

create index if not exists plan_adjustments_user_created_idx
  on public.plan_adjustments (user_id, created_at desc);
create index if not exists plan_adjustments_checkin_idx
  on public.plan_adjustments (checkin_id);
create index if not exists plan_adjustments_pending_idx
  on public.plan_adjustments (user_id) where requires_confirmation and confirmed_at is null;

drop trigger if exists trg_plan_adjustments_updated_at on public.plan_adjustments;
create trigger trg_plan_adjustments_updated_at
  before update on public.plan_adjustments
  for each row execute function public.set_updated_at();

-- ====================================================================== habits
create table if not exists public.habits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  slug          text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title         text not null check (length(btrim(title)) > 0),
  kind          text not null default 'custom'
                  check (kind in ('steps', 'water', 'sleep', 'protein',
                                  'mobility', 'meditation', 'custom')),
  target_value  numeric(9, 2) check (target_value > 0),
  unit          text check (unit in ('steps', 'ml', 'hours', 'g', 'minutes', 'times')),
  cadence       text not null default 'daily' check (cadence in ('daily', 'weekly')),
  -- Dias en los que aplica (0 = domingo .. 6 = sabado). Vacio = todos.
  days_of_week  smallint[] not null default '{}'
                  check (days_of_week <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, slug)
);

comment on table public.habits is
  'Habitos diarios del usuario (pasos, agua, sueno...). Base del objetivo "habits".';

create index if not exists habits_user_active_idx
  on public.habits (user_id) where is_active;

drop trigger if exists trg_habits_updated_at on public.habits;
create trigger trg_habits_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

-- ================================================================== habit_logs
-- Tabla hija: la propiedad se comprueba subiendo a habits.user_id.
create table if not exists public.habit_logs (
  id          uuid primary key default gen_random_uuid(),
  habit_id    uuid not null references public.habits (id) on delete cascade,
  log_date    date not null default current_date,
  value       numeric(9, 2) check (value >= 0),
  completed   boolean not null default false,
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (habit_id, log_date)
);

comment on table public.habit_logs is
  'Registro diario de un habito. Propiedad via habits.user_id.';

create index if not exists habit_logs_habit_date_idx
  on public.habit_logs (habit_id, log_date desc);
create index if not exists habit_logs_date_idx on public.habit_logs (log_date);

drop trigger if exists trg_habit_logs_updated_at on public.habit_logs;
create trigger trg_habit_logs_updated_at
  before update on public.habit_logs
  for each row execute function public.set_updated_at();
