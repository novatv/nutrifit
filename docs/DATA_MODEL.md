# Modelo de datos de NutriFit

Esquema PostgreSQL para Supabase. **28 tablas** en el esquema `public`, todas con
Row Level Security activada y **125 políticas** (109 para `authenticated`,
16 para `service_role`), más 102 índices.

Las migraciones se aplican en orden:

| Fichero | Contenido |
|---|---|
| `0001_extensiones_y_perfiles.sql` | Extensiones, los 9 enums, `set_updated_at()`, alta automática de usuario, `profiles`, `user_preferences`, `user_goals`, `notification_preferences` |
| `0002_catalogos.sql` | `exercise_library`, `foods`, `favorite_foods`, `recipes`, `recipe_ingredients` |
| `0003_nutricion.sql` | `nutrition_targets`, `meal_plans`, `meal_plan_days`, `meal_entries`, `meal_entry_items`, `shopping_lists`, `shopping_list_items` |
| `0004_entrenamiento.sql` | `training_programs`, `program_weeks`, `workouts`, `workout_exercises`, `workout_sessions`, `workout_sets` |
| `0005_progreso_y_habitos.sql` | `body_measurements`, `progress_photos`, `weekly_checkins`, `plan_adjustments`, `habits`, `habit_logs` |
| `0006_rls.sql` | Permisos, todas las políticas RLS y el bloque de comprobación |
| `seed.sql` | Catálogos de demostración **solo para entorno local** |

---

## 1. Convenciones

- **Claves primarias `uuid`** con `default gen_random_uuid()`. `profiles.id` es la excepción: es exactamente `auth.users.id`.
- **`created_at` / `updated_at`** son `timestamptz default now()`. El `updated_at` lo refresca el trigger `set_updated_at()`, nunca el cliente.
- **snake_case** con correspondencia 1:1 con `src/types/domain.ts`: `targetWeightKg` → `target_weight_kg`, `exerciseSlug` → `exercise_slug`, etc. Ese fichero manda; el esquema lo sigue.
- **Enums de PostgreSQL solo donde el dominio es cerrado y el motor lo recorre entero**: `goal`, `activity_level`, `experience`, `diet_pattern`, `meal_type`, `movement_pattern`, `difficulty`, `week_phase`, `adjustment_decision`. El resto (estados, unidades, fuentes, poses...) es `text` con `check`, porque son listas que crecen y no merecen una migración de tipo.
- **`check` para todo rango con significado físico o clínico**: alturas, pesos, kcal, RIR, escalas 1–5, adherencia 0–1. Ver `docs/HEALTH_RULES.md`.
- **Índices donde de verdad se filtra**: `user_id`, fechas descendentes (`entry_date`, `started_at`, `measured_on`), `slug`, y GIN de trigramas para la búsqueda por nombre de alimentos y recetas.
- **Nutrición siempre por 100 g** en `foods`; las raciones se describen con `serving_label` + `serving_grams`.

---

## 2. Mapa de relaciones

```
auth.users
   │ (trigger on_auth_user_created)
   ▼
profiles ──1:1── user_preferences
   │      ──1:1── notification_preferences
   │      ──1:N── user_goals
   │      ──1:N── body_measurements
   │      ──1:N── progress_photos
   │      ──1:N── weekly_checkins ──1:N── plan_adjustments
   │      ──1:N── habits ──1:N── habit_logs
   │      ──1:N── favorite_foods ──N:1── foods
   │      ──1:N── foods            (alimentos privados: owner_id)
   │      ──1:N── recipes          (recetas propias: owner_id)
   │
   ├── NUTRICIÓN ────────────────────────────────────────────────
   │   nutrition_targets (versionado por effective_from/effective_to)
   │   meal_plans ──1:N── meal_plan_days ──1:N── meal_entries
   │                                                │
   │                                                └──1:N── meal_entry_items ──N:1── foods
   │   meal_entries ──N:1── recipes (opcional)
   │   shopping_lists ──1:N── shopping_list_items ──N:1── foods
   │
   └── ENTRENAMIENTO ────────────────────────────────────────────
       training_programs ──1:N── program_weeks ──1:N── workouts
                                                         │
                                                         └──1:N── workout_exercises ──N:1── exercise_library (slug)
       workout_sessions ──N:1── workouts (opcional)
                │
                └──1:N── workout_sets ──N:1── exercise_library (slug)

CATÁLOGOS GLOBALES
   exercise_library                (siempre global)
   foods   con owner_id is null    (global)  /  owner_id = uuid (privado)
   recipes con owner_id is null    (sistema) /  owner_id = uuid (propia, pública o no)
        └──1:N── recipe_ingredients ──N:1── foods
```

### Decisiones de diseño que conviene conocer

- **`meal_entries` sirve para lo planificado y para lo registrado.** `status` distingue `planned` / `logged` / `skipped`, y `meal_plan_day_id` enlaza con el plan cuando la comida viene de él. Evita duplicar toda la estructura de `PlannedMeal` en dos familias de tablas.
- **Las tablas hijas no llevan `user_id`.** `workout_sets`, `meal_entry_items`, `recipe_ingredients`, `shopping_list_items`, `meal_plan_days`, `program_weeks`, `workouts`, `workout_exercises` y `habit_logs` derivan su dueño subiendo por la clave foránea. Un `user_id` duplicado en la hija sería un dato que el cliente podría falsear.
- **`nutrition_targets` y `user_goals` se versionan, no se sobrescriben.** Índices únicos parciales garantizan un solo objetivo abierto (`effective_to is null`) y un solo `user_goals.status = 'active'` por usuario. Lo mismo para `meal_plans` y `training_programs` activos.
- **Los macros de `meal_entries` y `meal_plan_days` son caché.** La verdad está en `meal_entry_items`; los totales se guardan para no recalcular el diario en cada consulta.
- **`foods` y `recipes` tienen dueño opcional.** `owner_id is null` significa "fila del catálogo global". Esa única columna decide qué política RLS aplica, sin tablas separadas para catálogo y contenido de usuario.
- **Referencias por `slug` al catálogo de ejercicios.** `workout_exercises.exercise_slug` y `workout_sets.exercise_slug` apuntan a `exercise_library(slug)` con `on update cascade on delete restrict`: el dominio habla de slugs y un ejercicio referenciado no se puede borrar.
- **`on delete cascade` hacia el dueño, `on delete set null` o `restrict` hacia los catálogos.** Borrar una cuenta borra todos sus datos; borrar un alimento del catálogo nunca destruye el histórico de lo que alguien comió (`meal_entry_items.food_id` queda a null y conserva `name` y macros congelados).

---

## 3. Estrategia de RLS

La base de datos, no el cliente, decide quién ve qué. Son datos de salud: si una
consulta se equivoca, RLS tiene que ser la red que lo impida.

### Principios

1. **RLS activada en las 28 tablas de `public`.** El final de `0006_rls.sql` contiene un bloque `do $$ ... $$` que **hace fallar la migración** si alguna tabla se queda sin RLS, sin políticas, o sin cubrir alguno de los cuatro comandos. Una tabla nueva sin proteger rompe el despliegue, no la privacidad.
2. **Una política por comando** (`select`, `insert`, `update`, `delete`). Nada de `for all`: separadas se leen y se auditan mejor, y permiten asimetrías (leer una receta pública sí, escribirla no).
3. **`auth.uid()` es la única fuente de identidad.** Nunca se confía en un identificador enviado por el cliente.
4. **En `update` siempre hay `using` *y* `with check`.** El primero dice qué filas puedo tocar; el segundo, en qué estado pueden quedar. Sin el segundo, un usuario podría reasignar una fila suya a otra persona.
5. **`(select auth.uid())`** en lugar de `auth.uid()` suelto: PostgreSQL evalúa el subselect una vez por consulta en lugar de una vez por fila.

### Los tres patrones

**a) Propiedad directa** — 16 tablas con `user_id` (o `profiles.id`):

```sql
using (user_id = (select auth.uid()))
```

`profiles`, `user_preferences`, `user_goals`, `notification_preferences`,
`body_measurements`, `progress_photos`, `nutrition_targets`, `favorite_foods`,
`meal_plans`, `meal_entries`, `shopping_lists`, `training_programs`,
`workout_sessions`, `weekly_checkins`, `plan_adjustments`, `habits`.

**b) Propiedad heredada** — 9 tablas hijas que suben por la clave foránea:

```sql
-- workout_sets: el dueño es el de la sesión
using (exists (
  select 1 from public.workout_sessions s
  where s.id = workout_sets.session_id
    and s.user_id = (select auth.uid())
))
```

`workout_exercises` sube tres niveles (`workouts` → `program_weeks` →
`training_programs`). Da igual lo que mande el cliente: si la cadena no termina
en `auth.uid()`, la fila no existe para él y el `insert` se rechaza.

**c) Catálogos** — lectura amplia, escritura restringida:

| Tabla | Lectura (`authenticated`) | Escritura |
|---|---|---|
| `exercise_library` | todo el catálogo (`using (true)`) | solo `service_role` |
| `foods` | `owner_id is null or owner_id = auth.uid()` | el usuario solo sus propias filas (`with check (owner_id = auth.uid())`, así no puede crear filas globales); el catálogo global, `service_role` |
| `recipes` | propias + del sistema (`owner_id is null`) + `is_public` | solo el dueño; las del sistema, `service_role` |
| `recipe_ingredients` | si la receta padre es visible | solo si el usuario es **dueño** de la receta: que sea pública no da derecho a editarla |

### Qué está verificado

Contra un PostgreSQL local con `auth.uid()` simulado se comprobó que un usuario:

- solo ve sus propias filas en `meal_entries`, `profiles`, `progress_photos`, `workout_sessions`;
- **no puede** insertar una fila con el `user_id` de otro (error de RLS, no fila silenciosa);
- **no puede** colgar un `workout_set` de la sesión de otra persona;
- **no puede** escribir en `exercise_library` ni crear un alimento global (`owner_id is null`);
- **no puede** cambiar el `id` de su perfil por el de otro usuario;
- ve los ingredientes de las recetas públicas o del sistema, pero no puede modificarlos;
- al borrar o actualizar filas ajenas obtiene 0 filas afectadas, no un error que revele su existencia.

### Permisos y roles

RLS filtra filas, pero los privilegios de tabla se conceden aparte: `0006_rls.sql`
otorga `select, insert, update, delete` sobre `public` a `authenticated` y
`service_role`, y **revoca todo al rol `anon`** — la aplicación no tiene zona
pública. `service_role` ignora RLS por definición; sus políticas se escriben de
todas formas para dejar la intención por escrito y para que el esquema siga
siendo correcto si algún día se activa `force row level security`.

---

## 4. Alta de usuario

`auth.users` dispara `handle_new_user()` (SECURITY DEFINER, `search_path`
fijado), que crea la fila de `profiles` y las de `user_preferences` y
`notification_preferences` con valores por defecto. El `display_name` y el
`locale` se leen de los metadatos del registro **validándolos**: un `locale`
desconocido cae a `es` en lugar de violar el `check`.

---

## 5. Entorno local

```bash
supabase start          # levanta Postgres + API
supabase db reset       # aplica migrations/*.sql en orden y luego seed.sql
```

`seed.sql` deja **65 alimentos, 31 recetas (140 ingredientes) y 28 ejercicios**,
todos en el catálogo global. **No crea usuarios ni ningún dato personal**, y no
debe ejecutarse en producción.

La nutrición de las recetas no está escrita a mano: se calcula desde los
ingredientes, y los alérgenos (unión) y los patrones dietéticos (intersección)
se derivan igual. Un bloque final `do $$ ... $$` hace fallar el seed si alguna
receta se queda sin ingredientes, si sus macros no cuadran con la suma de estos
(tolerancia de 0,2 kcal) o si no es compatible con ninguna dieta. Tanto las
migraciones como el seed son idempotentes: volver a ejecutarlos no duplica nada.
