#!/usr/bin/env node
/**
 * Genera con MuAPI (flux-2-dev, ~0,015 $/imagen) las ilustraciones de los
 * ejercicios que no tienen foto de wger.de, y las deja en assets/exercises/.
 *
 * Uso:
 *   MUAPI_API_KEY=... node scripts/generate-exercise-images.mjs --dry-run   # solo prompts y coste
 *   MUAPI_API_KEY=... node scripts/generate-exercise-images.mjs             # genera todas las que faltan
 *   MUAPI_API_KEY=... node scripts/generate-exercise-images.mjs burpee dead-bug   # solo esas
 *
 * La clave se lee del entorno; nunca va en el repo. Cada imagen cuesta dinero,
 * así que el script no regenera las que ya existen en assets/exercises/.
 * Al terminar imprime las entradas para pegar en src/data/exercise-media.ts
 * (licencia 'own': son nuestras).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'assets', 'exercises');
const API = 'https://api.muapi.ai/api/v1';
const MODEL = 'flux-2-dev';
const COST_PER_IMAGE = 0.015;
const SIZE = 1024;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const only = new Set(args.filter((a) => !a.startsWith('--')));
const apiKey = process.env.MUAPI_API_KEY;

/* ------------------------------------------------------- ejercicios sin foto */

const media = fs.readFileSync(path.join(ROOT, 'src/data/exercise-media.ts'), 'utf8');
const withMedia = new Set([...media.matchAll(/^  '([a-z0-9-]+)': \{/gm)].map((m) => m[1]));

const lib = fs.readFileSync(path.join(ROOT, 'src/domain/training/exerciseLibrary.ts'), 'utf8');
const rows = [
  ...lib.matchAll(/^\s*s\('([a-z0-9-]+)',\s*'([a-z_]+)',\s*\[[^\]]*\],\s*\[[^\]]*\],\s*\[([^\]]*)\]/gm),
].map((m) => ({
  slug: m[1],
  pattern: m[2],
  equipment: m[3].split(',').map((e) => e.trim().replace(/'/g, '')).filter(Boolean),
}));

const en = fs.readFileSync(path.join(ROOT, 'src/i18n/en.ts'), 'utf8');
const nameOf = (slug) => {
  const key = slug.replace(/-/g, '_');
  const m = en.match(new RegExp(`^\\s*${key}: \\{\\s*\\n\\s*name: '([^']+)'`, 'm'));
  return m ? m[1] : slug.replace(/-/g, ' ');
};

const targets = rows
  .filter((r) => !withMedia.has(r.slug))
  .filter((r) => only.size === 0 || only.has(r.slug))
  .filter((r) => !fs.existsSync(path.join(ASSETS, `${r.slug}.jpg`)))
  .map((r) => ({ ...r, name: nameOf(r.slug) }));

/* -------------------------------------------------------------- el prompt */

const EQUIPMENT_TEXT = {
  barbell: 'with a barbell',
  dumbbells: 'with dumbbells',
  kettlebell: 'with a kettlebell',
  bands: 'with a resistance band',
  cables: 'at a cable machine',
  machines: 'on a gym machine',
  bench: 'on a flat bench',
  pull_up_bar: 'on a pull-up bar',
  trap_bar: 'with a trap bar',
  plates: '',
  rack: '',
  box: 'with a plyo box',
  treadmill: 'on a treadmill',
  bike: 'on a stationary bike',
  rower: 'on a rowing machine',
  jump_rope: 'with a jump rope',
  stairs: 'on a staircase',
  backpack: 'with a loaded backpack',
};

/**
 * Un mismo estilo para las 69: figura genérica, fondo verde de marca, línea
 * dorada. Sin caras reconocibles, sin texto, sin marcas.
 */
function promptFor(ex) {
  const equipment = ex.equipment.map((e) => EQUIPMENT_TEXT[e] ?? '').filter(Boolean)[0] ?? 'with bodyweight only';
  return (
    `Clean instructional fitness illustration of an athletic adult performing a ${ex.name.toLowerCase()} ${equipment}, ` +
    `shown at the key mid-movement position with correct form, full body visible, side three-quarter view, centered, ` +
    `plenty of empty space around the figure. Flat vector style with subtle shading, simplified featureless face, ` +
    `gold and warm-white figure and equipment on a solid deep green background (#1B4212), soft rim light. ` +
    `No text, no logos, no background objects, sharp focus throughout.`
  );
}

/* ------------------------------------------------------------------ API */

async function submit(prompt) {
  const res = await fetch(`${API}/${MODEL}`, {
    method: 'POST',
    headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, width: SIZE, height: SIZE }),
  });
  const body = await res.json();
  // Clave mala: no tiene sentido seguir con las otras 68.
  if (res.status === 401 || res.status === 403) {
    console.error(`\nMuAPI rechaza la clave (${res.status}). Revisa MUAPI_API_KEY. No se ha cobrado nada.`);
    process.exit(1);
  }
  if (!res.ok || !body.request_id) throw new Error(`submit ${res.status}: ${JSON.stringify(body)}`);
  return body.request_id;
}

async function waitFor(id) {
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(`${API}/predictions/${id}/result`, { headers: { 'x-api-key': apiKey } });
    const body = await res.json();
    // Un fallo llega con HTTP 200 y status "failed": hay que mirar el status, no el código.
    if (body.status === 'completed') return body.outputs?.[0];
    if (body.status === 'failed') throw new Error(`failed: ${body.error ?? 'sin detalle'}`);
  }
  throw new Error('timeout');
}

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

/* ----------------------------------------------------------------- main */

console.log(`${targets.length} ejercicios sin imagen · ${MODEL} · ≈ $${(targets.length * COST_PER_IMAGE).toFixed(2)}`);

if (dryRun) {
  for (const ex of targets) console.log(`\n[${ex.slug}] ${promptFor(ex)}`);
  process.exit(0);
}
if (!apiKey || apiKey === 'pega_aqui_tu_clave') {
  console.error('Falta MUAPI_API_KEY real en el entorno (muapi.ai → Dashboard → API Keys). Con --dry-run se ven los prompts sin gastar.');
  process.exit(1);
}

fs.mkdirSync(ASSETS, { recursive: true });
const done = [];
const failed = [];
for (const ex of targets) {
  const file = path.join(ASSETS, `${ex.slug}.jpg`);
  try {
    process.stdout.write(`${ex.slug} … `);
    const id = await submit(promptFor(ex));
    const url = await waitFor(id);
    if (!url) throw new Error('sin salida');
    await download(url, file);
    console.log('ok');
    done.push(ex.slug);
  } catch (error) {
    console.log(`ERROR ${error.message}`);
    failed.push(ex.slug);
  }
}

console.log(`\n${done.length} generadas, ${failed.length} fallidas · gasto ≈ $${(done.length * COST_PER_IMAGE).toFixed(2)}`);
if (failed.length) console.log('Fallidas:', failed.join(' '));
if (done.length) {
  console.log('\nPega en EXERCISE_MEDIA (src/data/exercise-media.ts):\n');
  for (const slug of done) {
    console.log(`  '${slug}': {\n    image: require('@/assets/exercises/${slug}.jpg'),\n    author: 'YL Nutrición',\n    license: 'own',\n    sourceUrl: 'generated:muapi/${MODEL}',\n  },`);
  }
}
