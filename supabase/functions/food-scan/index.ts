// Edge Function: food-scan
//
// Recibe una foto de un plato (base64) y devuelve qué alimentos ve y cuántos
// gramos y calorías estima cada uno. La clave del modelo (ANTHROPIC_API_KEY)
// vive aquí, como secreto de la función; el móvil solo manda la foto con la
// sesión del usuario.
//
// Es una ESTIMACIÓN. La app lo dice y deja corregir cada cifra antes de
// registrarla; nunca se apunta nada solo porque lo dijo el modelo.
//
// Despliegue:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase functions deploy food-scan

import Anthropic from 'npm:@anthropic-ai/sdk';
import { zodOutputFormat } from 'npm:@anthropic-ai/sdk/helpers/zod';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod';

const MODEL = 'claude-opus-5';
/** ~4 MB en base64. Más grande es una foto sin comprimir; la app manda calidad 0.7. */
const MAX_IMAGE_CHARS = 5_500_000;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ScanItem = z.object({
  name: z.string().describe('Nombre corto del alimento en el idioma pedido, como se diría en la cocina'),
  grams: z.number().describe('Gramos estimados en el plato'),
  kcal: z.number().describe('Calorías estimadas para esos gramos'),
  proteinG: z.number(),
  carbsG: z.number(),
  fatG: z.number(),
  confidence: z.number().min(0).max(1).describe('0..1, seguridad de haberlo identificado bien'),
});

const ScanResult = z.object({
  items: z.array(ScanItem),
  note: z
    .string()
    .describe('Aviso breve si algo dificulta la estimación (plato tapado, foto oscura, envase sin abrir). Vacío si no hay nada que avisar.'),
});

const SYSTEM = `Eres un asistente de nutrición que estima el contenido de un plato a partir de una foto.
Reglas:
- Identifica cada alimento visible por separado. Si un plato es una mezcla inseparable (guiso, ensalada mixta), trátalo como un solo alimento.
- Estima los gramos por el tamaño aparente respecto a la vajilla y a la mano si aparece. Sé conservador: ante la duda, ración media.
- Calcula kcal y macros para ESOS gramos con valores estándar de tablas de composición de alimentos.
- Si no ves comida, devuelve items vacío y explícalo en note.
- No inventes alimentos ocultos (salsas, aceite) salvo que sean claramente visibles.
- Nunca des consejos de salud ni juzgues la comida. Solo cuantifica.`;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  // Solo usuarios con sesión: cada llamada cuesta dinero y el endpoint no es público.
  const authHeader = req.headers.get('Authorization') ?? '';
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) return json({ error: 'unauthorized' }, 401);

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return json({ error: 'not_configured' }, 503);

  let body: { image?: unknown; locale?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_request' }, 400);
  }

  const image = typeof body.image === 'string' ? body.image : '';
  if (!image || image.length > MAX_IMAGE_CHARS) return json({ error: 'bad_image' }, 400);
  const locale = body.locale === 'en' ? 'en' : 'es';

  // Se aceptan las dos formas: base64 pelado o data URL.
  const match = /^data:(image\/\w+);base64,(.+)$/s.exec(image);
  const mediaType = (match?.[1] ?? 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  const data = match?.[2] ?? image;

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      thinking: { type: 'adaptive' },
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data } },
            {
              type: 'text',
              text:
                locale === 'en'
                  ? 'Estimate what is on this plate. Names in English.'
                  : 'Estima lo que hay en este plato. Nombres en español.',
            },
          ],
        },
      ],
      output_config: { format: zodOutputFormat(ScanResult) },
    });

    const parsed = response.parsed_output;
    if (!parsed) return json({ error: 'unparseable' }, 502);

    return json({
      items: parsed.items,
      note: parsed.note.trim() || undefined,
    });
  } catch (error) {
    console.error('food-scan', error);
    return json({ error: 'model_failed' }, 502);
  }
});
