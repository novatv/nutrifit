-- =====================================================================
-- 0004_entrenamiento.sql
-- NutriFit · Programas, semanas, sesiones planificadas y registro real.
--
-- Cadena de propiedad (la usan las politicas RLS de 0006):
--   training_programs.user_id
--     -> program_weeks.program_id
--        -> workouts.program_week_id
--           -> workout_exercises.workout_id
--   workout_sessions.user_id
--     -> workout_sets.session_id
-- Ninguna tabla hija guarda user_id: se sube por la clave foranea.
-- =====================================================================

-- =========================================================== training_programs
create table if not exists public.training_programs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  name            text not null default '',
  split           text not null default 'full_body'
                    check (split in ('full_body', 'upper_lower', 'ppl', 'upper_lower_plus')),
  goal            public.goal,
  experience      public.experience not null default 'beginner',
  days_per_week   smallint not null check (days_per_week between 2 and 6),
  session_minutes smallint not null check (session_minutes in (20, 30, 45, 60, 75)),
  total_weeks     smallint not null default 12 check (total_weeks between 1 and 24),
  start_date      date not null default current_date,
  status          text not null default 'draft'
                    check (status in ('draft', 'active', 'completed', 'abandoned')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.training_programs is
  'Programa de entrenamiento de N semanas generado para un usuario.';

create index if not exists training_programs_user_start_idx
  on public.training_programs (user_id, start_date desc);
create unique index if not exists training_programs_one_active_idx
  on public.training_programs (user_id) where status = 'active';

drop trigger if exists trg_training_programs_updated_at on public.training_programs;
create trigger trg_training_programs_updated_at
  before update on public.training_programs
  for each row execute function public.set_updated_at();

-- =============================================================== program_weeks
create table if not exists public.program_weeks (
  id            uuid primary key default gen_random_uuid(),
  program_id    uuid not null references public.training_programs (id) on delete cascade,
  week_number   smallint not null check (week_number between 1 and 24),
  phase         public.week_phase not null default 'adaptation',
  -- Objetivo de pasos diarios (guia OMS de actividad fisica, ver HEALTH_RULES).
  step_target   integer not null default 7000 check (step_target between 0 and 40000),
  focus_key     text not null default '',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (program_id, week_number)
);

comment on table public.program_weeks is
  'Semana del programa con su fase de periodizacion. Propiedad via training_programs.';

create index if not exists program_weeks_program_idx on public.program_weeks (program_id);

drop trigger if exists trg_program_weeks_updated_at on public.program_weeks;
create trigger trg_program_weeks_updated_at
  before update on public.program_weeks
  for each row execute function public.set_updated_at();

-- ==================================================================== workouts
create table if not exists public.workouts (
  id                uuid primary key default gen_random_uuid(),
  program_week_id   uuid not null references public.program_weeks (id) on delete cascade,
  name_key          text not null default '',    -- clave i18n
  day_index         smallint not null check (day_index between 0 and 6),
  estimated_minutes smallint not null default 45 check (estimated_minutes between 5 and 240),
  warmup_keys       text[] not null default '{}',
  cooldown_keys     text[] not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (program_week_id, day_index)
);

comment on table public.workouts is
  'Sesion planificada dentro de una semana. Propiedad via program_weeks.';

create index if not exists workouts_program_week_idx on public.workouts (program_week_id);

drop trigger if exists trg_workouts_updated_at on public.workouts;
create trigger trg_workouts_updated_at
  before update on public.workouts
  for each row execute function public.set_updated_at();

-- =========================================================== workout_exercises
-- Referencia al catalogo por slug (WorkoutExercise.exerciseSlug en el dominio).
create table if not exists public.workout_exercises (
  id            uuid primary key default gen_random_uuid(),
  workout_id    uuid not null references public.workouts (id) on delete cascade,
  exercise_slug text not null
                  references public.exercise_library (slug)
                  on update cascade on delete restrict,
  sets          smallint not null check (sets between 1 and 12),
  rep_min       smallint not null check (rep_min between 1 and 100),
  rep_max       smallint not null check (rep_max between 1 and 100),
  rest_seconds  smallint not null default 90 check (rest_seconds between 0 and 600),
  -- RIR (repeticiones en reserva). 0 = fallo muscular; el motor nunca baja de 0.
  target_rir    smallint not null default 2 check (target_rir between 0 and 5),
  notes_key     text,
  position      smallint not null default 0 check (position >= 0),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (workout_id, position),
  constraint workout_exercises_rep_range_ordered check (rep_max >= rep_min)
);

comment on table public.workout_exercises is
  'Prescripcion de series/repeticiones. Propiedad via workouts -> program_weeks.';

create index if not exists workout_exercises_workout_idx
  on public.workout_exercises (workout_id);
create index if not exists workout_exercises_slug_idx
  on public.workout_exercises (exercise_slug);

drop trigger if exists trg_workout_exercises_updated_at on public.workout_exercises;
create trigger trg_workout_exercises_updated_at
  before update on public.workout_exercises
  for each row execute function public.set_updated_at();

-- ============================================================ workout_sessions
-- Lo que el usuario hizo de verdad. Puede no corresponder a ningun workout
-- planificado (sesion libre), por eso workout_id admite null.
create table if not exists public.workout_sessions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles (id) on delete cascade,
  workout_id            uuid references public.workouts (id) on delete set null,
  started_at            timestamptz not null default now(),
  finished_at           timestamptz,
  perceived_difficulty  text check (perceived_difficulty in
                          ('very_easy', 'good', 'hard', 'too_hard')),
  soreness              smallint check (soreness between 1 and 5),
  energy                smallint check (energy between 1 and 5),
  -- Dolor referido: lo lee el motor de seguridad para frenar la progresion.
  pain_reported         boolean not null default false,
  pain_note             text,
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint workout_sessions_time_ordered
    check (finished_at is null or finished_at >= started_at)
);

comment on table public.workout_sessions is
  'Sesion realizada, con feedback subjetivo posterior (RPE, dolor, energia).';

create index if not exists workout_sessions_user_started_idx
  on public.workout_sessions (user_id, started_at desc);
create index if not exists workout_sessions_workout_idx
  on public.workout_sessions (workout_id);
create index if not exists workout_sessions_pain_idx
  on public.workout_sessions (user_id, started_at desc) where pain_reported;

drop trigger if exists trg_workout_sessions_updated_at on public.workout_sessions;
create trigger trg_workout_sessions_updated_at
  before update on public.workout_sessions
  for each row execute function public.set_updated_at();

-- ================================================================ workout_sets
-- SetLog aplanado: una fila por serie. Propiedad via workout_sessions.user_id.
create table if not exists public.workout_sets (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.workout_sessions (id) on delete cascade,
  exercise_slug text not null
                  references public.exercise_library (slug)
                  on update cascade on delete restrict,
  set_index     smallint not null check (set_index between 1 and 50),
  weight_kg     numeric(6, 2) check (weight_kg between 0 and 500),
  reps          smallint check (reps between 0 and 200),
  rir           smallint check (rir between 0 and 10),
  completed     boolean not null default false,
  performed_at  timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  unique (session_id, exercise_slug, set_index)
);

comment on table public.workout_sets is
  'Serie registrada (peso, reps, RIR). Base del calculo de progresion de carga.';

create index if not exists workout_sets_session_idx on public.workout_sets (session_id);
-- Historico por ejercicio: "cuanto levante la ultima vez en sentadilla".
create index if not exists workout_sets_slug_performed_idx
  on public.workout_sets (exercise_slug, performed_at desc);
