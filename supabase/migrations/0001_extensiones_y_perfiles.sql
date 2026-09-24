-- =====================================================================
-- 0001_extensiones_y_perfiles.sql
-- NutriFit · Esquema base: extensiones, tipos enumerados compartidos,
-- utilidades (set_updated_at) y las tablas de identidad del usuario.
--
-- Convenciones de todo el esquema:
--   * Claves primarias uuid (gen_random_uuid(), nucleo de PostgreSQL 13+).
--   * created_at / updated_at timestamptz default now().
--   * Nombres en snake_case, equivalentes 1:1 a src/types/domain.ts.
--   * Enums SOLO donde el dominio es cerrado y estable; el resto texto + check.
-- =====================================================================

-- ------------------------------------------------------------------ extensiones
-- En Supabase el esquema `extensions` ya existe y esta en el search_path.
create schema if not exists extensions;

-- pgcrypto: utilidades criptograficas (gen_random_uuid ya es nucleo, pero
-- pgcrypto se mantiene por compatibilidad con helpers de Supabase).
create extension if not exists pgcrypto with schema extensions;

-- pg_trgm: busqueda por similitud en nombres de alimentos y recetas.
create extension if not exists pg_trgm with schema extensions;

-- ------------------------------------------------------------ tipos enumerados
-- Solo estos nueve. Son dominios cerrados que el motor de negocio recorre
-- exhaustivamente; un valor nuevo debe ser una migracion consciente.

do $$ begin
  create type public.goal as enum
    ('lose_fat', 'gain_muscle', 'recomp', 'maintain', 'fitness', 'habits');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.activity_level as enum
    ('sedentary', 'light', 'moderate', 'high', 'very_high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.experience as enum
    ('beginner', 'intermediate', 'advanced');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.diet_pattern as enum
    ('omnivore', 'vegetarian', 'vegan', 'pescatarian');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.meal_type as enum
    ('breakfast', 'lunch', 'dinner', 'snack');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.movement_pattern as enum
    ('squat', 'hinge', 'horizontal_push', 'vertical_push', 'horizontal_pull',
     'vertical_pull', 'lunge', 'carry', 'core', 'isolation', 'cardio');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.difficulty as enum
    ('beginner', 'intermediate', 'advanced');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.week_phase as enum
    ('adaptation', 'progression', 'consolidation', 'deload');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.adjustment_decision as enum
    ('KEEP', 'ADJUST_NUTRITION', 'ADJUST_TRAINING', 'RECOVERY_WEEK', 'NEEDS_REVIEW');
exception when duplicate_object then null; end $$;

-- --------------------------------------------------------------- set_updated_at
-- Trigger reutilizable: refresca updated_at en cada UPDATE. Se aplica a todas
-- las tablas que tienen esa columna (ver `create trigger` al final de cada bloque).
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Trigger BEFORE UPDATE: pone updated_at = now() sin confiar en el cliente.';

-- ====================================================================== profiles
-- Espejo de auth.users dentro de `public`. Es la raiz de propiedad de todo el
-- esquema: casi todas las politicas RLS terminan comparando contra profiles.id.
create table if not exists public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  display_name      text not null default '',
  birth_date        date,
  -- Sexo biologico para las formulas de gasto energetico, no identidad de genero.
  sex               text not null default 'unspecified'
                      check (sex in ('male', 'female', 'unspecified')),
  height_cm         numeric(5, 1) check (height_cm between 90 and 250),
  weight_kg         numeric(6, 2) check (weight_kg between 25 and 400),
  target_weight_kg  numeric(6, 2) check (target_weight_kg between 25 and 400),
  goal              public.goal,
  activity_level    public.activity_level,
  experience        public.experience,
  days_per_week     smallint check (days_per_week between 2 and 6),
  session_minutes   smallint check (session_minutes in (20, 30, 45, 60, 75)),
  training_location text check (training_location in ('gym', 'home', 'both', 'outdoor')),
  unit_system       text not null default 'metric'
                      check (unit_system in ('metric', 'imperial')),
  locale            text not null default 'es' check (locale in ('es', 'en')),
  -- Cribado de seguridad del onboarding (HealthScreening en domain.ts).
  screening_pregnant_or_breastfeeding boolean not null default false,
  screening_eating_disorder_current   boolean not null default false,
  screening_major_injury              boolean not null default false,
  screening_medical_nutrition_therapy boolean not null default false,
  screening_exercise_contraindicated  boolean not null default false,
  screening_completed_at              timestamptz,
  -- Ultimo veredicto del motor de seguridad (SafetyVerdict).
  safety_verdict    text check (safety_verdict in
                      ('ALLOW', 'ALLOW_WITH_CAUTION',
                       'REQUIRES_PROFESSIONAL_REVIEW', 'BLOCK_AUTOMATED_PLAN')),
  safety_reviewed_at timestamptz,
  onboarding_completed boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  -- La fecha de nacimiento no puede ser futura ni de hace mas de 120 anos.
  constraint profiles_birth_date_plausible
    check (birth_date is null or
           (birth_date <= current_date and birth_date > current_date - interval '120 years'))
);

comment on table public.profiles is
  'Perfil del usuario. profiles.id = auth.users.id: raiz de propiedad para RLS.';

create index if not exists profiles_goal_idx on public.profiles (goal);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------- alta automatica
-- Al registrarse un usuario en auth.users se crean sus filas base. SECURITY
-- DEFINER porque el trigger corre en el contexto de GoTrue, no del usuario.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_display_name text;
  v_locale       text;
begin
  v_display_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    split_part(coalesce(new.email, ''), '@', 1),
    ''
  );

  -- El locale llega de metadatos del cliente: se valida, no se confia.
  v_locale := case
    when new.raw_user_meta_data ->> 'locale' in ('es', 'en')
      then new.raw_user_meta_data ->> 'locale'
    else 'es'
  end;

  insert into public.profiles (id, display_name, locale)
  values (new.id, v_display_name, v_locale)
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Crea profiles + user_preferences + notification_preferences al alta en auth.users.';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================= user_preferences
-- Preferencias de dieta, equipamiento y cocina. Una fila por usuario.
create table if not exists public.user_preferences (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null unique references public.profiles (id) on delete cascade,
  diet              public.diet_pattern not null default 'omnivore',
  allergens         text[] not null default '{}'
                      check (allergens <@ array['gluten', 'lactose', 'tree_nuts', 'peanut',
                                                'egg', 'fish', 'shellfish', 'soy']::text[]),
  disliked_foods    text[] not null default '{}'
                      check (cardinality(disliked_foods) <= 100),
  meals_per_day     smallint not null default 4 check (meals_per_day in (3, 4, 5)),
  budget            text not null default 'medium'
                      check (budget in ('low', 'medium', 'flexible')),
  cooking_time      text not null default 'normal'
                      check (cooking_time in ('minimal', 'normal', 'enjoys')),
  equipment         text[] not null default '{}'
                      check (equipment <@ array['none', 'dumbbells', 'bands', 'barbell',
                                                'plates', 'bench', 'rack', 'cables',
                                                'machines', 'kettlebell', 'bike',
                                                'treadmill', 'rower']::text[]),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.user_preferences is
  'Dieta, alergenos, equipamiento y presupuesto. Filtra generacion de menus y rutinas.';

drop trigger if exists trg_user_preferences_updated_at on public.user_preferences;
create trigger trg_user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

-- =================================================================== user_goals
-- Historial de objetivos. Solo uno activo a la vez por usuario.
create table if not exists public.user_goals (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles (id) on delete cascade,
  goal              public.goal not null,
  start_weight_kg   numeric(6, 2) check (start_weight_kg between 25 and 400),
  target_weight_kg  numeric(6, 2) check (target_weight_kg between 25 and 400),
  -- Ritmo semanal. El limite duro (+/- 1.0 kg/semana) es un guardarrail de
  -- seguridad: ver docs/HEALTH_RULES.md (CDC / NHS, perdida gradual).
  weekly_rate_kg    numeric(4, 2) check (weekly_rate_kg between -1.0 and 1.0),
  start_date        date not null default current_date,
  target_date       date,
  status            text not null default 'active'
                      check (status in ('active', 'achieved', 'abandoned', 'superseded')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint user_goals_dates_ordered
    check (target_date is null or target_date >= start_date)
);

comment on table public.user_goals is
  'Objetivo vigente e historico. weekly_rate_kg acotado por guardarrail de seguridad.';

create index if not exists user_goals_user_start_idx
  on public.user_goals (user_id, start_date desc);

-- Un unico objetivo activo por usuario (indice unico parcial).
create unique index if not exists user_goals_one_active_idx
  on public.user_goals (user_id) where status = 'active';

drop trigger if exists trg_user_goals_updated_at on public.user_goals;
create trigger trg_user_goals_updated_at
  before update on public.user_goals
  for each row execute function public.set_updated_at();

-- ====================================================== notification_preferences
create table if not exists public.notification_preferences (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references public.profiles (id) on delete cascade,
  push_enabled        boolean not null default true,
  email_enabled       boolean not null default false,
  meal_reminders      boolean not null default true,
  workout_reminders   boolean not null default true,
  checkin_reminder    boolean not null default true,
  habit_reminders     boolean not null default true,
  -- 0 = domingo ... 6 = sabado, igual que dayIndex en el dominio.
  checkin_weekday     smallint not null default 0 check (checkin_weekday between 0 and 6),
  reminder_time       time not null default '09:00',
  quiet_hours_start   time not null default '22:00',
  quiet_hours_end     time not null default '08:00',
  timezone            text not null default 'Europe/Madrid',
  expo_push_token     text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.notification_preferences is
  'Avisos push/email. El token de Expo es dato sensible: solo lo ve su dueno.';

drop trigger if exists trg_notification_preferences_updated_at on public.notification_preferences;
create trigger trg_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_updated_at();
