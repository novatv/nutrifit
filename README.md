# NutriFit 12

Aplicación móvil de nutrición y entrenamiento que genera un programa
personalizado de 12 semanas: objetivos de calorías y macros, plan de comidas,
lista de compra, entrenamientos con progresión y ajuste semanal según
resultados.

> Esta aplicación proporciona información general de nutrición y actividad
> física y no sustituye el consejo de un profesional sanitario.

---

## Requisitos

- Node 20 o superior (probado con 24)
- npm 10 o superior
- Para ejecutar en dispositivo: la app de **Expo Go**, o un *development build*
  si añades módulos nativos
- Opcional: cuenta de [Supabase](https://supabase.com) para el backend

## Instalación

```bash
npm install
cp .env.example .env
```

La app **arranca sin configurar nada**: si no hay credenciales de Supabase
entra en modo demostración con datos locales, y puedes ver el panel, el plan,
los entrenamientos y el progreso.

## Variables de entorno

Solo las variables con prefijo `EXPO_PUBLIC_` llegan al cliente. Cualquier
secreto real vive exclusivamente en el servidor.

| Variable | ¿Va en el cliente? | Para qué |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sí | Clave publicable; la protección real la da RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **No, nunca** | Solo scripts y Edge Functions |
| `USDA_API_KEY` | **No, nunca** | Se consume desde una Edge Function |

Poner un secreto con prefijo `EXPO_PUBLIC_` equivale a publicarlo: queda
dentro del binario.

## Supabase

```bash
npx supabase start                       # entorno local
npx supabase db reset                    # aplica migraciones + seed
npx supabase db push                     # aplica migraciones a tu proyecto remoto
```

Las migraciones están en `supabase/migrations/` numeradas por orden. El
esquema activa **Row Level Security en todas las tablas** y las políticas
comprueban la propiedad subiendo por las claves foráneas, sin fiarse de ningún
identificador que mande el cliente. `supabase/seed.sql` carga catálogo de
ejercicios, alimentos y recetas de ejemplo; no crea usuarios.

## Ejecutar

```bash
npm run start        # servidor de desarrollo
npm run ios          # simulador de iOS
npm run android      # emulador de Android
npm run web          # navegador
```

## Calidad

```bash
npm run lint         # expo lint
npm run typecheck    # tsc --noEmit
npm run test         # jest
npm run test:watch
```

## Arquitectura

```
src/
  app/            rutas de expo-router (cada archivo es una pantalla)
    (tabs)/       Hoy · Plan · Registrar · Progreso · Perfil
    (auth)/       acceso y registro
    (onboarding)/ alta en 16 pasos
    workout/      sesión de entrenamiento en vivo
  components/ui/  kit de componentes (Button, Card, ProgressRing…)
  domain/         motores puros, sin React ni red
    nutrition/    energía, macros, comidas, sustituciones, compra
    training/     biblioteca, generador, progresión, descarga
    safety/       cribado y guardarraíles
  features/       lógica de pantalla por funcionalidad
  i18n/           es (referencia, completo) y en
  providers/      tema y cliente de datos
  services/       supabase, configuración, registro de eventos
  stores/         estado local (Zustand)
  theme/          tokens de color, espaciado, radios, tipografía
  types/          contrato de tipos del dominio
supabase/
  migrations/     esquema SQL versionado
docs/             reglas de salud y modelo de datos
tests/            unitarios de dominio y de pantallas
```

**Principio rector**: los cálculos viven en `src/domain/` como funciones puras
y testeables. Las pantallas no calculan; solo muestran. Así las reglas de
nutrición, progresión y seguridad se pueden probar sin montar React.

### Diseño

El color se reserva para los datos. Los macronutrientes llevan la paleta viva
—proteína, carbohidratos, grasa y fibra tienen cada uno su tono— y el resto de
la interfaz se mantiene neutra para no competir con ellos. Modo claro y oscuro
salen de los mismos tokens.

## Seguridad

- **Row Level Security** activo en todas las tablas; un usuario solo ve lo suyo.
- La app usa únicamente la clave publicable. La service-role nunca se empaqueta.
- Las fotos de progreso van a almacenamiento **privado**, nunca a un bucket público.
- El registro de eventos redacta tokens, contraseñas y emails antes de escribir.
- Cribado de salud en el alta: menores de 18, embarazo o lactancia, trastorno
  alimentario actual, pauta médica en curso y contraindicación de ejercicio
  **no reciben un plan automático**, sino la recomendación de consultar con un
  profesional.
- Suelos de energía documentados en `src/domain/safety/`: si el objetivo que
  pide el usuario exigiría bajar de ese suelo, no se aplica el recorte; se
  alarga el plazo y se explica.

Las reglas y sus fuentes están en [`docs/HEALTH_RULES.md`](docs/HEALTH_RULES.md),
separadas en tres categorías: regla basada en evidencia, decisión de producto y
guardarraíl de seguridad.

## Limitaciones conocidas

- La base de datos de alimentos usa una abstracción `FoodProvider`. El
  proveedor USDA requiere clave y se consume desde el servidor; sin ella
  funciona el catálogo local y los alimentos manuales.
- El escáner de código de barras, Apple Health y Health Connect están detrás de
  banderas de funcionalidad, con sus interfaces definidas pero desactivadas.
- El *AI Coach* está previsto como capa de explicación, nunca como motor: las
  calorías, los macros, la progresión y las reglas de seguridad son
  deterministas y testeables, y seguirán siéndolo.
- Las estimaciones energéticas son eso, estimaciones. La app no promete una
  cantidad exacta de pérdida de peso ni presenta cifras como garantías.
