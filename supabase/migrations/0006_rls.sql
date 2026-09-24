-- =====================================================================
-- 0006_rls.sql
-- NutriFit · Row Level Security. Esta es la pieza critica del esquema:
-- son datos de salud, y la base de datos -no la app- es quien decide
-- quien ve que.
--
-- Principios:
--   1. RLS activado en TODAS las tablas de `public`. Sin excepcion.
--   2. Una politica por comando (select / insert / update / delete). Nada de
--      `for all`: una politica por comando se lee y se audita mejor.
--   3. La propiedad SIEMPRE se deriva de auth.uid(). En las tablas hijas se
--      sube por la clave foranea hasta el dueno; jamas se confia en un
--      user_id que mande el cliente (podria enviar el de otra persona).
--   4. Los catalogos globales (exercise_library, foods con owner_id null,
--      recetas del sistema) son de lectura para autenticados y de escritura
--      solo para service_role.
--   5. En UPDATE siempre hay `using` (que filas puedo tocar) Y `with check`
--      (en que estado pueden quedar): sin el segundo, un usuario podria
--      reasignarse una fila a otro dueno.
--
-- Nota: service_role ya ignora RLS por definicion en Supabase; las politicas
-- `to service_role` se escriben igualmente para dejar la intencion por escrito
-- y para que el esquema siga siendo correcto si alguien activa FORCE RLS.
-- =====================================================================

-- ------------------------------------------------------------------- permisos
-- RLS solo filtra filas: los privilegios de tabla se conceden aparte.
grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete on all tables in schema public
  to authenticated;
grant select, insert, update, delete on all tables in schema public
  to service_role;

-- El rol anonimo no toca nada del esquema de la aplicacion.
revoke all on all tables in schema public from anon;

-- =====================================================================
-- 1. TABLAS DE PROPIEDAD DIRECTA (tienen user_id, o id = auth.uid())
-- =====================================================================

-- ---------------------------------------------------------------- profiles ---
alter table public.profiles enable row level security;

-- Cada usuario ve unicamente su propio perfil.
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

-- El alta normal la hace el trigger handle_new_user; esta politica solo
-- permite crear la fila propia si el trigger no llego a ejecutarse.
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

-- Se puede editar el perfil propio y debe seguir siendo propio despues.
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Borrar el perfil propio (derecho de supresion); arrastra todo en cascada.
drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own on public.profiles
  for delete to authenticated
  using (id = (select auth.uid()));

-- -------------------------------------------------------- user_preferences ---
alter table public.user_preferences enable row level security;

-- Preferencias de dieta y equipamiento: privadas de su dueno.
drop policy if exists user_preferences_select_own on public.user_preferences;
create policy user_preferences_select_own on public.user_preferences
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists user_preferences_insert_own on public.user_preferences;
create policy user_preferences_insert_own on public.user_preferences
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists user_preferences_update_own on public.user_preferences;
create policy user_preferences_update_own on public.user_preferences
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists user_preferences_delete_own on public.user_preferences;
create policy user_preferences_delete_own on public.user_preferences
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- --------------------------------------------------------------- user_goals ---
alter table public.user_goals enable row level security;

-- Objetivos: historico privado. Nadie mas puede leer a que peso aspira nadie.
drop policy if exists user_goals_select_own on public.user_goals;
create policy user_goals_select_own on public.user_goals
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists user_goals_insert_own on public.user_goals;
create policy user_goals_insert_own on public.user_goals
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists user_goals_update_own on public.user_goals;
create policy user_goals_update_own on public.user_goals
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists user_goals_delete_own on public.user_goals;
create policy user_goals_delete_own on public.user_goals
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ------------------------------------------------- notification_preferences ---
alter table public.notification_preferences enable row level security;

-- Incluye el token push: dato identificativo de dispositivo, nunca compartido.
drop policy if exists notification_preferences_select_own on public.notification_preferences;
create policy notification_preferences_select_own on public.notification_preferences
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists notification_preferences_insert_own on public.notification_preferences;
create policy notification_preferences_insert_own on public.notification_preferences
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists notification_preferences_update_own on public.notification_preferences;
create policy notification_preferences_update_own on public.notification_preferences
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists notification_preferences_delete_own on public.notification_preferences;
create policy notification_preferences_delete_own on public.notification_preferences
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- -------------------------------------------------------- body_measurements ---
alter table public.body_measurements enable row level security;

-- Peso y perimetros: dato de salud. Solo el dueno.
drop policy if exists body_measurements_select_own on public.body_measurements;
create policy body_measurements_select_own on public.body_measurements
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists body_measurements_insert_own on public.body_measurements;
create policy body_measurements_insert_own on public.body_measurements
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists body_measurements_update_own on public.body_measurements;
create policy body_measurements_update_own on public.body_measurements
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists body_measurements_delete_own on public.body_measurements;
create policy body_measurements_delete_own on public.body_measurements
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ----------------------------------------------------------- progress_photos ---
alter table public.progress_photos enable row level security;

-- Fotos corporales: el dato mas sensible del producto. Lectura estrictamente
-- propia; no existe ningun caso de "foto publica" en el esquema.
drop policy if exists progress_photos_select_own on public.progress_photos;
create policy progress_photos_select_own on public.progress_photos
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists progress_photos_insert_own on public.progress_photos;
create policy progress_photos_insert_own on public.progress_photos
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists progress_photos_update_own on public.progress_photos;
create policy progress_photos_update_own on public.progress_photos
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists progress_photos_delete_own on public.progress_photos;
create policy progress_photos_delete_own on public.progress_photos
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- --------------------------------------------------------- nutrition_targets ---
alter table public.nutrition_targets enable row level security;

-- Objetivos calculados por el motor: privados de su dueno.
drop policy if exists nutrition_targets_select_own on public.nutrition_targets;
create policy nutrition_targets_select_own on public.nutrition_targets
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists nutrition_targets_insert_own on public.nutrition_targets;
create policy nutrition_targets_insert_own on public.nutrition_targets
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists nutrition_targets_update_own on public.nutrition_targets;
create policy nutrition_targets_update_own on public.nutrition_targets
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists nutrition_targets_delete_own on public.nutrition_targets;
create policy nutrition_targets_delete_own on public.nutrition_targets
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ------------------------------------------------------------ favorite_foods ---
alter table public.favorite_foods enable row level security;

-- Favoritos: solo los propios. El food_id referenciado puede ser global o
-- privado; la visibilidad del alimento la resuelve la politica de `foods`.
drop policy if exists favorite_foods_select_own on public.favorite_foods;
create policy favorite_foods_select_own on public.favorite_foods
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists favorite_foods_insert_own on public.favorite_foods;
create policy favorite_foods_insert_own on public.favorite_foods
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists favorite_foods_update_own on public.favorite_foods;
create policy favorite_foods_update_own on public.favorite_foods
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists favorite_foods_delete_own on public.favorite_foods;
create policy favorite_foods_delete_own on public.favorite_foods
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------- meal_plans ---
alter table public.meal_plans enable row level security;

drop policy if exists meal_plans_select_own on public.meal_plans;
create policy meal_plans_select_own on public.meal_plans
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists meal_plans_insert_own on public.meal_plans;
create policy meal_plans_insert_own on public.meal_plans
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists meal_plans_update_own on public.meal_plans;
create policy meal_plans_update_own on public.meal_plans
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists meal_plans_delete_own on public.meal_plans;
create policy meal_plans_delete_own on public.meal_plans
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- -------------------------------------------------------------- meal_entries ---
alter table public.meal_entries enable row level security;

-- Diario nutricional. El insert exige que user_id sea el del token: si el
-- cliente manda otro, la fila se rechaza.
drop policy if exists meal_entries_select_own on public.meal_entries;
create policy meal_entries_select_own on public.meal_entries
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists meal_entries_insert_own on public.meal_entries;
create policy meal_entries_insert_own on public.meal_entries
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists meal_entries_update_own on public.meal_entries;
create policy meal_entries_update_own on public.meal_entries
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists meal_entries_delete_own on public.meal_entries;
create policy meal_entries_delete_own on public.meal_entries
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ------------------------------------------------------------ shopping_lists ---
alter table public.shopping_lists enable row level security;

drop policy if exists shopping_lists_select_own on public.shopping_lists;
create policy shopping_lists_select_own on public.shopping_lists
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists shopping_lists_insert_own on public.shopping_lists;
create policy shopping_lists_insert_own on public.shopping_lists
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists shopping_lists_update_own on public.shopping_lists;
create policy shopping_lists_update_own on public.shopping_lists
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists shopping_lists_delete_own on public.shopping_lists;
create policy shopping_lists_delete_own on public.shopping_lists
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- --------------------------------------------------------- training_programs ---
alter table public.training_programs enable row level security;

drop policy if exists training_programs_select_own on public.training_programs;
create policy training_programs_select_own on public.training_programs
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists training_programs_insert_own on public.training_programs;
create policy training_programs_insert_own on public.training_programs
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists training_programs_update_own on public.training_programs;
create policy training_programs_update_own on public.training_programs
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists training_programs_delete_own on public.training_programs;
create policy training_programs_delete_own on public.training_programs
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------- workout_sessions ---
alter table public.workout_sessions enable row level security;

drop policy if exists workout_sessions_select_own on public.workout_sessions;
create policy workout_sessions_select_own on public.workout_sessions
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists workout_sessions_insert_own on public.workout_sessions;
create policy workout_sessions_insert_own on public.workout_sessions
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists workout_sessions_update_own on public.workout_sessions;
create policy workout_sessions_update_own on public.workout_sessions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists workout_sessions_delete_own on public.workout_sessions;
create policy workout_sessions_delete_own on public.workout_sessions
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ------------------------------------------------------------ weekly_checkins ---
alter table public.weekly_checkins enable row level security;

drop policy if exists weekly_checkins_select_own on public.weekly_checkins;
create policy weekly_checkins_select_own on public.weekly_checkins
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists weekly_checkins_insert_own on public.weekly_checkins;
create policy weekly_checkins_insert_own on public.weekly_checkins
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists weekly_checkins_update_own on public.weekly_checkins;
create policy weekly_checkins_update_own on public.weekly_checkins
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists weekly_checkins_delete_own on public.weekly_checkins;
create policy weekly_checkins_delete_own on public.weekly_checkins
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ----------------------------------------------------------- plan_adjustments ---
alter table public.plan_adjustments enable row level security;

-- El usuario puede leer y confirmar sus ajustes; el motor los escribe con
-- service_role o desde una Edge Function que actua en su nombre.
drop policy if exists plan_adjustments_select_own on public.plan_adjustments;
create policy plan_adjustments_select_own on public.plan_adjustments
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists plan_adjustments_insert_own on public.plan_adjustments;
create policy plan_adjustments_insert_own on public.plan_adjustments
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists plan_adjustments_update_own on public.plan_adjustments;
create policy plan_adjustments_update_own on public.plan_adjustments
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists plan_adjustments_delete_own on public.plan_adjustments;
create policy plan_adjustments_delete_own on public.plan_adjustments
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- -------------------------------------------------------------------- habits ---
alter table public.habits enable row level security;

drop policy if exists habits_select_own on public.habits;
create policy habits_select_own on public.habits
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists habits_insert_own on public.habits;
create policy habits_insert_own on public.habits
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists habits_update_own on public.habits;
create policy habits_update_own on public.habits
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists habits_delete_own on public.habits;
create policy habits_delete_own on public.habits
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- =====================================================================
-- 2. TABLAS HIJAS: la propiedad se comprueba SUBIENDO por la clave foranea.
--    Nunca hay un user_id en la fila hija que el cliente pueda falsear.
-- =====================================================================

-- ------------------------------------------------------------ meal_plan_days ---
alter table public.meal_plan_days enable row level security;

-- Un dia del plan es visible si el plan padre es del usuario.
drop policy if exists meal_plan_days_select_own on public.meal_plan_days;
create policy meal_plan_days_select_own on public.meal_plan_days
  for select to authenticated
  using (exists (
    select 1 from public.meal_plans p
    where p.id = meal_plan_days.meal_plan_id
      and p.user_id = (select auth.uid())
  ));

-- Solo se pueden colgar dias de un plan propio.
drop policy if exists meal_plan_days_insert_own on public.meal_plan_days;
create policy meal_plan_days_insert_own on public.meal_plan_days
  for insert to authenticated
  with check (exists (
    select 1 from public.meal_plans p
    where p.id = meal_plan_days.meal_plan_id
      and p.user_id = (select auth.uid())
  ));

-- `using` impide tocar dias ajenos; `with check` impide moverlos a un plan ajeno.
drop policy if exists meal_plan_days_update_own on public.meal_plan_days;
create policy meal_plan_days_update_own on public.meal_plan_days
  for update to authenticated
  using (exists (
    select 1 from public.meal_plans p
    where p.id = meal_plan_days.meal_plan_id
      and p.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.meal_plans p
    where p.id = meal_plan_days.meal_plan_id
      and p.user_id = (select auth.uid())
  ));

drop policy if exists meal_plan_days_delete_own on public.meal_plan_days;
create policy meal_plan_days_delete_own on public.meal_plan_days
  for delete to authenticated
  using (exists (
    select 1 from public.meal_plans p
    where p.id = meal_plan_days.meal_plan_id
      and p.user_id = (select auth.uid())
  ));

-- ---------------------------------------------------------- meal_entry_items ---
alter table public.meal_entry_items enable row level security;

-- Los alimentos de una comida pertenecen a quien sea dueno de la comida.
drop policy if exists meal_entry_items_select_own on public.meal_entry_items;
create policy meal_entry_items_select_own on public.meal_entry_items
  for select to authenticated
  using (exists (
    select 1 from public.meal_entries e
    where e.id = meal_entry_items.meal_entry_id
      and e.user_id = (select auth.uid())
  ));

drop policy if exists meal_entry_items_insert_own on public.meal_entry_items;
create policy meal_entry_items_insert_own on public.meal_entry_items
  for insert to authenticated
  with check (exists (
    select 1 from public.meal_entries e
    where e.id = meal_entry_items.meal_entry_id
      and e.user_id = (select auth.uid())
  ));

drop policy if exists meal_entry_items_update_own on public.meal_entry_items;
create policy meal_entry_items_update_own on public.meal_entry_items
  for update to authenticated
  using (exists (
    select 1 from public.meal_entries e
    where e.id = meal_entry_items.meal_entry_id
      and e.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.meal_entries e
    where e.id = meal_entry_items.meal_entry_id
      and e.user_id = (select auth.uid())
  ));

drop policy if exists meal_entry_items_delete_own on public.meal_entry_items;
create policy meal_entry_items_delete_own on public.meal_entry_items
  for delete to authenticated
  using (exists (
    select 1 from public.meal_entries e
    where e.id = meal_entry_items.meal_entry_id
      and e.user_id = (select auth.uid())
  ));

-- -------------------------------------------------------- shopping_list_items ---
alter table public.shopping_list_items enable row level security;

drop policy if exists shopping_list_items_select_own on public.shopping_list_items;
create policy shopping_list_items_select_own on public.shopping_list_items
  for select to authenticated
  using (exists (
    select 1 from public.shopping_lists l
    where l.id = shopping_list_items.shopping_list_id
      and l.user_id = (select auth.uid())
  ));

drop policy if exists shopping_list_items_insert_own on public.shopping_list_items;
create policy shopping_list_items_insert_own on public.shopping_list_items
  for insert to authenticated
  with check (exists (
    select 1 from public.shopping_lists l
    where l.id = shopping_list_items.shopping_list_id
      and l.user_id = (select auth.uid())
  ));

drop policy if exists shopping_list_items_update_own on public.shopping_list_items;
create policy shopping_list_items_update_own on public.shopping_list_items
  for update to authenticated
  using (exists (
    select 1 from public.shopping_lists l
    where l.id = shopping_list_items.shopping_list_id
      and l.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.shopping_lists l
    where l.id = shopping_list_items.shopping_list_id
      and l.user_id = (select auth.uid())
  ));

drop policy if exists shopping_list_items_delete_own on public.shopping_list_items;
create policy shopping_list_items_delete_own on public.shopping_list_items
  for delete to authenticated
  using (exists (
    select 1 from public.shopping_lists l
    where l.id = shopping_list_items.shopping_list_id
      and l.user_id = (select auth.uid())
  ));

-- ------------------------------------------------------------- program_weeks ---
alter table public.program_weeks enable row level security;

drop policy if exists program_weeks_select_own on public.program_weeks;
create policy program_weeks_select_own on public.program_weeks
  for select to authenticated
  using (exists (
    select 1 from public.training_programs tp
    where tp.id = program_weeks.program_id
      and tp.user_id = (select auth.uid())
  ));

drop policy if exists program_weeks_insert_own on public.program_weeks;
create policy program_weeks_insert_own on public.program_weeks
  for insert to authenticated
  with check (exists (
    select 1 from public.training_programs tp
    where tp.id = program_weeks.program_id
      and tp.user_id = (select auth.uid())
  ));

drop policy if exists program_weeks_update_own on public.program_weeks;
create policy program_weeks_update_own on public.program_weeks
  for update to authenticated
  using (exists (
    select 1 from public.training_programs tp
    where tp.id = program_weeks.program_id
      and tp.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.training_programs tp
    where tp.id = program_weeks.program_id
      and tp.user_id = (select auth.uid())
  ));

drop policy if exists program_weeks_delete_own on public.program_weeks;
create policy program_weeks_delete_own on public.program_weeks
  for delete to authenticated
  using (exists (
    select 1 from public.training_programs tp
    where tp.id = program_weeks.program_id
      and tp.user_id = (select auth.uid())
  ));

-- ------------------------------------------------------------------ workouts ---
alter table public.workouts enable row level security;

-- Dos saltos: workouts -> program_weeks -> training_programs.user_id.
drop policy if exists workouts_select_own on public.workouts;
create policy workouts_select_own on public.workouts
  for select to authenticated
  using (exists (
    select 1
    from public.program_weeks pw
    join public.training_programs tp on tp.id = pw.program_id
    where pw.id = workouts.program_week_id
      and tp.user_id = (select auth.uid())
  ));

drop policy if exists workouts_insert_own on public.workouts;
create policy workouts_insert_own on public.workouts
  for insert to authenticated
  with check (exists (
    select 1
    from public.program_weeks pw
    join public.training_programs tp on tp.id = pw.program_id
    where pw.id = workouts.program_week_id
      and tp.user_id = (select auth.uid())
  ));

drop policy if exists workouts_update_own on public.workouts;
create policy workouts_update_own on public.workouts
  for update to authenticated
  using (exists (
    select 1
    from public.program_weeks pw
    join public.training_programs tp on tp.id = pw.program_id
    where pw.id = workouts.program_week_id
      and tp.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1
    from public.program_weeks pw
    join public.training_programs tp on tp.id = pw.program_id
    where pw.id = workouts.program_week_id
      and tp.user_id = (select auth.uid())
  ));

drop policy if exists workouts_delete_own on public.workouts;
create policy workouts_delete_own on public.workouts
  for delete to authenticated
  using (exists (
    select 1
    from public.program_weeks pw
    join public.training_programs tp on tp.id = pw.program_id
    where pw.id = workouts.program_week_id
      and tp.user_id = (select auth.uid())
  ));

-- -------------------------------------------------------- workout_exercises ---
alter table public.workout_exercises enable row level security;

-- Tres saltos: workout_exercises -> workouts -> program_weeks -> programs.
drop policy if exists workout_exercises_select_own on public.workout_exercises;
create policy workout_exercises_select_own on public.workout_exercises
  for select to authenticated
  using (exists (
    select 1
    from public.workouts w
    join public.program_weeks pw on pw.id = w.program_week_id
    join public.training_programs tp on tp.id = pw.program_id
    where w.id = workout_exercises.workout_id
      and tp.user_id = (select auth.uid())
  ));

drop policy if exists workout_exercises_insert_own on public.workout_exercises;
create policy workout_exercises_insert_own on public.workout_exercises
  for insert to authenticated
  with check (exists (
    select 1
    from public.workouts w
    join public.program_weeks pw on pw.id = w.program_week_id
    join public.training_programs tp on tp.id = pw.program_id
    where w.id = workout_exercises.workout_id
      and tp.user_id = (select auth.uid())
  ));

drop policy if exists workout_exercises_update_own on public.workout_exercises;
create policy workout_exercises_update_own on public.workout_exercises
  for update to authenticated
  using (exists (
    select 1
    from public.workouts w
    join public.program_weeks pw on pw.id = w.program_week_id
    join public.training_programs tp on tp.id = pw.program_id
    where w.id = workout_exercises.workout_id
      and tp.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1
    from public.workouts w
    join public.program_weeks pw on pw.id = w.program_week_id
    join public.training_programs tp on tp.id = pw.program_id
    where w.id = workout_exercises.workout_id
      and tp.user_id = (select auth.uid())
  ));

drop policy if exists workout_exercises_delete_own on public.workout_exercises;
create policy workout_exercises_delete_own on public.workout_exercises
  for delete to authenticated
  using (exists (
    select 1
    from public.workouts w
    join public.program_weeks pw on pw.id = w.program_week_id
    join public.training_programs tp on tp.id = pw.program_id
    where w.id = workout_exercises.workout_id
      and tp.user_id = (select auth.uid())
  ));

-- ------------------------------------------------------------- workout_sets ---
alter table public.workout_sets enable row level security;

-- Las series pertenecen a quien sea dueno de la sesion.
drop policy if exists workout_sets_select_own on public.workout_sets;
create policy workout_sets_select_own on public.workout_sets
  for select to authenticated
  using (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_sets.session_id
      and s.user_id = (select auth.uid())
  ));

drop policy if exists workout_sets_insert_own on public.workout_sets;
create policy workout_sets_insert_own on public.workout_sets
  for insert to authenticated
  with check (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_sets.session_id
      and s.user_id = (select auth.uid())
  ));

drop policy if exists workout_sets_update_own on public.workout_sets;
create policy workout_sets_update_own on public.workout_sets
  for update to authenticated
  using (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_sets.session_id
      and s.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_sets.session_id
      and s.user_id = (select auth.uid())
  ));

drop policy if exists workout_sets_delete_own on public.workout_sets;
create policy workout_sets_delete_own on public.workout_sets
  for delete to authenticated
  using (exists (
    select 1 from public.workout_sessions s
    where s.id = workout_sets.session_id
      and s.user_id = (select auth.uid())
  ));

-- --------------------------------------------------------------- habit_logs ---
alter table public.habit_logs enable row level security;

drop policy if exists habit_logs_select_own on public.habit_logs;
create policy habit_logs_select_own on public.habit_logs
  for select to authenticated
  using (exists (
    select 1 from public.habits h
    where h.id = habit_logs.habit_id
      and h.user_id = (select auth.uid())
  ));

drop policy if exists habit_logs_insert_own on public.habit_logs;
create policy habit_logs_insert_own on public.habit_logs
  for insert to authenticated
  with check (exists (
    select 1 from public.habits h
    where h.id = habit_logs.habit_id
      and h.user_id = (select auth.uid())
  ));

drop policy if exists habit_logs_update_own on public.habit_logs;
create policy habit_logs_update_own on public.habit_logs
  for update to authenticated
  using (exists (
    select 1 from public.habits h
    where h.id = habit_logs.habit_id
      and h.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.habits h
    where h.id = habit_logs.habit_id
      and h.user_id = (select auth.uid())
  ));

drop policy if exists habit_logs_delete_own on public.habit_logs;
create policy habit_logs_delete_own on public.habit_logs
  for delete to authenticated
  using (exists (
    select 1 from public.habits h
    where h.id = habit_logs.habit_id
      and h.user_id = (select auth.uid())
  ));

-- =====================================================================
-- 3. CATALOGOS: lectura para autenticados, escritura solo service_role.
-- =====================================================================

-- ----------------------------------------------------------- exercise_library ---
alter table public.exercise_library enable row level security;

-- Catalogo global: cualquier usuario autenticado puede leerlo entero.
drop policy if exists exercise_library_select_authenticated on public.exercise_library;
create policy exercise_library_select_authenticated on public.exercise_library
  for select to authenticated
  using (true);

-- Escritura reservada al backend (seed, importadores, panel interno).
drop policy if exists exercise_library_select_service on public.exercise_library;
create policy exercise_library_select_service on public.exercise_library
  for select to service_role using (true);

drop policy if exists exercise_library_insert_service on public.exercise_library;
create policy exercise_library_insert_service on public.exercise_library
  for insert to service_role with check (true);

drop policy if exists exercise_library_update_service on public.exercise_library;
create policy exercise_library_update_service on public.exercise_library
  for update to service_role using (true) with check (true);

drop policy if exists exercise_library_delete_service on public.exercise_library;
create policy exercise_library_delete_service on public.exercise_library
  for delete to service_role using (true);

-- ---------------------------------------------------------------------- foods ---
alter table public.foods enable row level security;

-- Lectura: el catalogo global (owner_id is null) mas los alimentos propios.
-- Los alimentos privados de otros usuarios quedan fuera.
drop policy if exists foods_select_catalog_or_own on public.foods;
create policy foods_select_catalog_or_own on public.foods
  for select to authenticated
  using (owner_id is null or owner_id = (select auth.uid()));

-- Solo se pueden crear alimentos propios: owner_id null (catalogo) se rechaza.
drop policy if exists foods_insert_own on public.foods;
create policy foods_insert_own on public.foods
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

-- Editar solo los propios, y sin poder convertirlos en globales ni cederlos.
drop policy if exists foods_update_own on public.foods;
create policy foods_update_own on public.foods
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists foods_delete_own on public.foods;
create policy foods_delete_own on public.foods
  for delete to authenticated
  using (owner_id = (select auth.uid()));

-- El catalogo global lo mantiene el backend (importacion USDA, seed).
drop policy if exists foods_select_service on public.foods;
create policy foods_select_service on public.foods
  for select to service_role using (true);

drop policy if exists foods_insert_service on public.foods;
create policy foods_insert_service on public.foods
  for insert to service_role with check (true);

drop policy if exists foods_update_service on public.foods;
create policy foods_update_service on public.foods
  for update to service_role using (true) with check (true);

drop policy if exists foods_delete_service on public.foods;
create policy foods_delete_service on public.foods
  for delete to service_role using (true);

-- -------------------------------------------------------------------- recipes ---
alter table public.recipes enable row level security;

-- Lectura: las propias, las del sistema (owner_id null) y las publicas.
drop policy if exists recipes_select_own_or_public on public.recipes;
create policy recipes_select_own_or_public on public.recipes
  for select to authenticated
  using (owner_id = (select auth.uid()) or owner_id is null or is_public);

-- Solo el dueno crea sus recetas; las del sistema las siembra service_role.
drop policy if exists recipes_insert_own on public.recipes;
create policy recipes_insert_own on public.recipes
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

-- Escritura estrictamente del dueno, aunque la receta sea publica.
drop policy if exists recipes_update_own on public.recipes;
create policy recipes_update_own on public.recipes
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

drop policy if exists recipes_delete_own on public.recipes;
create policy recipes_delete_own on public.recipes
  for delete to authenticated
  using (owner_id = (select auth.uid()));

drop policy if exists recipes_select_service on public.recipes;
create policy recipes_select_service on public.recipes
  for select to service_role using (true);

drop policy if exists recipes_insert_service on public.recipes;
create policy recipes_insert_service on public.recipes
  for insert to service_role with check (true);

drop policy if exists recipes_update_service on public.recipes;
create policy recipes_update_service on public.recipes
  for update to service_role using (true) with check (true);

drop policy if exists recipes_delete_service on public.recipes;
create policy recipes_delete_service on public.recipes
  for delete to service_role using (true);

-- --------------------------------------------------------- recipe_ingredients ---
alter table public.recipe_ingredients enable row level security;

-- Se ven los ingredientes de toda receta que el usuario pueda ver: si la
-- receta es visible, su composicion tambien. Se sube por recipe_id.
drop policy if exists recipe_ingredients_select_visible on public.recipe_ingredients;
create policy recipe_ingredients_select_visible on public.recipe_ingredients
  for select to authenticated
  using (exists (
    select 1 from public.recipes r
    where r.id = recipe_ingredients.recipe_id
      and (r.owner_id = (select auth.uid()) or r.owner_id is null or r.is_public)
  ));

-- Escribir ingredientes exige ser dueno de la receta: ser publica no basta.
drop policy if exists recipe_ingredients_insert_own on public.recipe_ingredients;
create policy recipe_ingredients_insert_own on public.recipe_ingredients
  for insert to authenticated
  with check (exists (
    select 1 from public.recipes r
    where r.id = recipe_ingredients.recipe_id
      and r.owner_id = (select auth.uid())
  ));

drop policy if exists recipe_ingredients_update_own on public.recipe_ingredients;
create policy recipe_ingredients_update_own on public.recipe_ingredients
  for update to authenticated
  using (exists (
    select 1 from public.recipes r
    where r.id = recipe_ingredients.recipe_id
      and r.owner_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.recipes r
    where r.id = recipe_ingredients.recipe_id
      and r.owner_id = (select auth.uid())
  ));

drop policy if exists recipe_ingredients_delete_own on public.recipe_ingredients;
create policy recipe_ingredients_delete_own on public.recipe_ingredients
  for delete to authenticated
  using (exists (
    select 1 from public.recipes r
    where r.id = recipe_ingredients.recipe_id
      and r.owner_id = (select auth.uid())
  ));

drop policy if exists recipe_ingredients_select_service on public.recipe_ingredients;
create policy recipe_ingredients_select_service on public.recipe_ingredients
  for select to service_role using (true);

drop policy if exists recipe_ingredients_insert_service on public.recipe_ingredients;
create policy recipe_ingredients_insert_service on public.recipe_ingredients
  for insert to service_role with check (true);

drop policy if exists recipe_ingredients_update_service on public.recipe_ingredients;
create policy recipe_ingredients_update_service on public.recipe_ingredients
  for update to service_role using (true) with check (true);

drop policy if exists recipe_ingredients_delete_service on public.recipe_ingredients;
create policy recipe_ingredients_delete_service on public.recipe_ingredients
  for delete to service_role using (true);

-- =====================================================================
-- 4. COMPROBACIONES. Este bloque falla la migracion si el esquema queda
--    en un estado inseguro. Es la red de seguridad frente al olvido:
--    una tabla nueva sin RLS rompe el despliegue, no la privacidad.
-- =====================================================================
do $$
declare
  v_sin_rls        text;
  v_sin_politicas  text;
  v_sin_comando    text;
begin
  -- (a) Toda tabla de `public` debe tener RLS activado.
  select string_agg(c.relname, ', ' order by c.relname)
    into v_sin_rls
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
    and not c.relrowsecurity;

  if v_sin_rls is not null then
    raise exception
      'RLS desactivado en las siguientes tablas de public: %. '
      'Anade "alter table ... enable row level security" y sus politicas.',
      v_sin_rls;
  end if;

  -- (b) RLS sin politicas deja la tabla inaccesible: sintoma de olvido.
  select string_agg(c.relname, ', ' order by c.relname)
    into v_sin_politicas
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
    and not exists (
      select 1 from pg_policy p where p.polrelid = c.oid
    );

  if v_sin_politicas is not null then
    raise exception
      'Tablas de public con RLS pero sin ninguna politica: %.', v_sin_politicas;
  end if;

  -- (c) Cada tabla debe cubrir los cuatro comandos (select/insert/update/delete).
  --     polcmd: 'r' select, 'a' insert, 'w' update, 'd' delete, '*' all.
  select string_agg(format('%s (falta %s)', t.relname, t.faltan), '; ' order by t.relname)
    into v_sin_comando
  from (
    select c.relname,
           array_to_string(array(
             select cmd
             from unnest(array['r', 'a', 'w', 'd']) as cmd
             where not exists (
               select 1 from pg_policy p
               where p.polrelid = c.oid
                 and (p.polcmd = cmd or p.polcmd = '*')
             )
           ), ',') as faltan
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r'
  ) t
  where t.faltan <> '';

  if v_sin_comando is not null then
    raise exception
      'Tablas de public sin politica para algun comando (r=select, a=insert, '
      'w=update, d=delete): %.', v_sin_comando;
  end if;

  raise notice 'RLS verificado: todas las tablas de public estan protegidas.';
end;
$$;
