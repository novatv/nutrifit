# Reglas de salud de NutriFit

Este documento explica **de dónde sale cada número** que la aplicación usa para
tomar decisiones sobre la salud de una persona. Es la referencia que deben citar
los motores de `src/domain/` (nutrition, training, safety) y el esquema de
`supabase/migrations/`.

Las reglas se clasifican en tres categorías, y la distinción importa:

| Categoría | Qué significa | Quién puede cambiarla |
|---|---|---|
| **EVIDENCE-BASED RULE** | Deriva directamente de una guía pública de un organismo de salud o de una sociedad científica. | Solo al actualizarse la fuente. |
| **PRODUCT DECISION** | Elección de producto razonable y compatible con la evidencia, pero que la evidencia no impone. | El equipo de producto, documentándolo aquí. |
| **SAFETY GUARDRAIL** | Límite que existe para que un cálculo automático no pueda hacer daño. Es un tope, no una recomendación. | Nadie lo relaja sin revisión clínica. |

> **Aviso.** NutriFit no es un producto sanitario ni sustituye a un profesional.
> No diagnostica, no trata y no prescribe. Las fuentes se citan por su nombre y
> su URL; **no se reproduce su texto**. Las URL pueden cambiar: la referencia
> válida es el nombre del documento.

---

## 1. EVIDENCE-BASED RULES

### EB-1 · Volumen mínimo de actividad física
- **Fuente:** World Health Organization — *WHO guidelines on physical activity and sedentary behaviour* (2020).
- **URL:** https://www.who.int/publications/i/item/9789240015128
- **Regla de producto:** todo programa generado apunta a 150–300 minutos semanales de actividad aeróbica moderada e incluye **al menos 2 días de trabajo de fuerza**. En el esquema: `training_programs.days_per_week` tiene `check (days_per_week between 2 and 6)` y `program_weeks.step_target` fija el objetivo de pasos diarios de la semana.

### EB-2 · Prescripción de entrenamiento de fuerza
- **Fuente:** American College of Sports Medicine — guías de actividad física y recomendaciones de entrenamiento de fuerza (*Progression Models in Resistance Training for Healthy Adults*).
- **URL:** https://www.acsm.org/education-resources/trending-topics-resources/physical-activity-guidelines
- **Regla de producto:** para principiantes se prescriben 2–3 sesiones semanales, 1–3 series por ejercicio en rangos de 8–12 repeticiones, con progresión gradual de carga y al menos 48 h entre sesiones del mismo grupo muscular. En el esquema: `workout_exercises.sets` (1–12), `rep_min`/`rep_max` (1–100, con `rep_max >= rep_min`), `target_rir` (0–5) y `public.experience` como enum que condiciona la plantilla.

### EB-3 · El déficit energético no es lineal
- **Fuente:** NIH / NIDDK — *Body Weight Planner*.
- **URL:** https://www.niddk.nih.gov/bwp
- **Regla de producto:** el gasto energético cae a medida que se pierde peso, así que **el objetivo calórico se recalcula**, no se fija una vez. Cada recálculo deja traza en `nutrition_targets.rationale_bmr_kcal`, `rationale_tdee_kcal` y `rationale_adjustment_kcal`, y el histórico se versiona con `effective_from` / `effective_to` en lugar de sobrescribirse.

### EB-4 · Ritmo de pérdida de peso gradual
- **Fuentes:** CDC — *Losing Weight* (Healthy Weight); NHS — *Healthy weight / Start losing weight*.
- **URLs:** https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html · https://www.nhs.uk/live-well/healthy-weight/
- **Regla de producto:** el ritmo objetivo por defecto es de **0,25–0,75 kg por semana** (aprox. 0,5–1 % del peso corporal). En el esquema: `user_goals.weekly_rate_kg` con `check (weekly_rate_kg between -1.0 and 1.0)`; por encima de 0,75 kg/semana el motor de seguridad emite `AGGRESSIVE_RATE_REQUESTED`.

### EB-5 · Valores de referencia de nutrientes
- **Fuente:** EFSA — *Dietary Reference Values for nutrients* (y el DRV Finder).
- **URLs:** https://www.efsa.europa.eu/en/topics/topic/dietary-reference-values · https://multimedia.efsa.europa.eu/drvs/index.htm
- **Regla de producto:** la fibra objetivo por defecto son **25 g/día** (`nutrition_targets.fiber_g default 25`), y la proteína nunca baja del valor de referencia poblacional (~0,83 g/kg/día) aunque el objetivo sea perder grasa. El reparto de macros se valida contra las kcal declaradas con `nutrition_targets_macros_match_kcal` (desviación máxima del 15 %).

### EB-6 · Composición nutricional de los alimentos
- **Fuente:** USDA — *FoodData Central*.
- **URL:** https://fdc.nal.usda.gov/
- **Regla de producto:** los alimentos del catálogo se almacenan **por 100 g** con `source = 'usda'` y el identificador de origen en `foods.external_id`. La restricción `foods_kcal_matches_macros` comprueba la coherencia energética por Atwater (4 kcal/g proteína, 4 kcal/g hidratos netos, 2 kcal/g fibra, 9 kcal/g grasa) con tolerancia para el redondeo de las fuentes.

---

## 2. PRODUCT DECISIONS

Decisiones compatibles con la evidencia, pero que la evidencia no obliga.

### PD-1 · Proteína objetivo de 1,6 g/kg en objetivos de masa muscular
- **Referencia de apoyo:** EFSA DRV (https://www.efsa.europa.eu/en/topics/topic/dietary-reference-values) fija el mínimo poblacional; el valor alto es una elección de producto dentro del rango habitual en deportistas.
- **Decisión:** para `goal = 'gain_muscle'` o `'recomp'` se apunta a 1,6 g/kg de peso corporal, acotado para que nunca comprima la grasa por debajo del 20 % de las kcal. Se refleja en `nutrition_targets.protein_g`.

### PD-2 · Programas de 12 semanas con descarga cada cuarta semana
- **Referencia de apoyo:** ACSM, progresión gradual (https://www.acsm.org/education-resources/trending-topics-resources/physical-activity-guidelines).
- **Decisión:** `training_programs.total_weeks` por defecto 12, y `program_weeks.phase` usa el enum `week_phase` (`adaptation` → `progression` → `consolidation` → `deload`). La cadencia concreta de la descarga es criterio de producto.

### PD-3 · Check-in semanal como única puerta de ajuste
- **Referencia de apoyo:** NIDDK Body Weight Planner (https://www.niddk.nih.gov/bwp), que justifica reevaluar periódicamente.
- **Decisión:** el plan solo se ajusta tras un `weekly_checkins`, nunca a diario, para no perseguir el ruido de la báscula. `notification_preferences.checkin_weekday` por defecto es domingo (0).

### PD-4 · Ningún cambio de objetivos se aplica en silencio
- **Decisión:** `plan_adjustments.requires_confirmation` nace en `true` y la restricción `plan_adjustments_confirm_before_apply` impide marcar `applied_at` sin `confirmed_at`. La explicación viaja como clave i18n (`explanation_key`), nunca como texto suelto, para que el mensaje sea revisable y traducible.

### PD-5 · Una medición corporal por día
- **Decisión:** `body_measurements` tiene `unique (user_id, measured_on)`. Pesarse varias veces al día es ruido y, en perfiles de riesgo, un patrón que no conviene incentivar.

### PD-6 · La adherencia se mide como fracción, no como nota
- **Decisión:** `weekly_checkins.nutrition_adherence` es `numeric` entre 0 y 1. No se muestra como calificación ni se gamifica con rachas que castiguen fallar un día.

### PD-7 · Contenido de salud siempre por clave i18n
- **Decisión:** `exercise_library.instruction_keys`, `safety_note_keys`, `common_mistake_keys`, `workouts.name_key`, `plan_adjustments.explanation_key`. Ningún texto de salud se genera libre en tiempo de ejecución: así se puede revisar antes de publicarse.

---

## 3. SAFETY GUARDRAILS

Topes duros. No son recomendaciones: existen para que un cálculo automático no pueda proponer algo peligroso.

### SG-1 · Suelo calórico
- **Fuentes de apoyo:** CDC — *Losing Weight* (https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html); NHS — *Healthy weight* (https://www.nhs.uk/live-well/healthy-weight/); EFSA DRV (https://www.efsa.europa.eu/en/topics/topic/dietary-reference-values).
- **Guardarrail:** el motor nunca propone menos de **1 200 kcal/día** (mujeres) ni **1 500 kcal/día** (hombres) sin supervisión profesional. Si el déficit pedido cruza ese suelo, se recorta y se marca `rationale_floor_applied = true` (`ENERGY_FLOOR_APPLIED` en el dominio). La base de datos añade un tope absoluto de plausibilidad: `check (kcal between 1000 and 6000)`.

### SG-2 · Ritmo máximo de cambio de peso
- **Fuentes de apoyo:** CDC y NHS (mismas URL que SG-1).
- **Guardarrail:** `user_goals.weekly_rate_kg` no admite valores fuera de ±1,0 kg/semana **a nivel de base de datos**. Aunque el cliente lo intente, el `check` lo rechaza.

### SG-3 · Cribado de seguridad en el onboarding
- **Guardarrail:** las respuestas viven en `profiles.screening_*` y producen un `safety_verdict`:
  - menor de 18 años (`UNDER_18`), embarazo o lactancia, trastorno de la conducta alimentaria activo, terapia nutricional médica → `BLOCK_AUTOMATED_PLAN` o `REQUIRES_PROFESSIONAL_REVIEW`; **no se genera plan automático**.
  - lesión importante o ejercicio contraindicado → se bloquea la parte de entrenamiento y se deriva a profesional.
- La fecha de nacimiento tiene su propio `check` de plausibilidad (`profiles_birth_date_plausible`).

### SG-4 · Rangos de entrada implausibles
- **Guardarrail:** `height_cm` 90–250, `weight_kg` 25–400, `body_fat_pct` 3–70, perímetros acotados en `body_measurements`. Un dato fuera de rango es un error de entrada (`IMPLAUSIBLE_INPUT`), no un caso extremo a modelar.

### SG-5 · El dolor detiene la progresión
- **Fuente de apoyo:** ACSM, progresión gradual (https://www.acsm.org/education-resources/trending-topics-resources/physical-activity-guidelines).
- **Guardarrail:** `workout_sessions.pain_reported` tiene índice parcial propio. Si hay dolor reportado, el motor no sube carga en la siguiente sesión y puede forzar `RECOVERY_WEEK` o `NEEDS_REVIEW` en `plan_adjustments.decision`.

### SG-6 · Los alérgenos de una receta se derivan, no se teclean
- **Fuente de apoyo:** USDA FoodData Central (https://fdc.nal.usda.gov/) como origen de la composición.
- **Guardarrail:** en `supabase/seed.sql`, `recipes.allergens` se calcula como la unión de los alérgenos de sus ingredientes y `diet_patterns` como la intersección. Una receta no puede declarar "sin gluten" si un ingrediente lo contiene, porque nadie escribe ese campo a mano.

### SG-7 · Los datos sensibles no salen de su dueño
- **Guardarrail:** RLS en las 28 tablas de `public`. `progress_photos` solo guarda rutas de un bucket privado de Storage y no tiene ninguna política de lectura pública. Ver `docs/DATA_MODEL.md`, sección de RLS.

---

## Cómo añadir una regla nueva

1. Decide la categoría. Si no puedes citar una fuente, **no es EVIDENCE-BASED**: será PRODUCT DECISION o SAFETY GUARDRAIL.
2. Añade el bloque aquí con nombre de fuente, URL y la regla de producto concreta.
3. Si la regla se puede expresar como restricción (`check`, `unique`, RLS), impleméntala en el esquema: lo que está en la base de datos no se puede olvidar en el cliente.
4. Referencia el identificador (EB-n / PD-n / SG-n) desde el código del motor que la aplica.
