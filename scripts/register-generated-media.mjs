#!/usr/bin/env node
/**
 * Registra en EXERCISE_MEDIA las ilustraciones generadas (assets/exercises/<slug>.jpg)
 * que aún no tienen entrada, con licencia 'own', y las anota en MEDIA_ATTRIBUTION.md.
 * Idempotente: se puede ejecutar tantas veces como haga falta.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MEDIA = path.join(ROOT, 'src/data/exercise-media.ts');
const DOC = path.join(ROOT, 'docs/MEDIA_ATTRIBUTION.md');
const MODEL = process.argv[2] ?? 'seedream-5.0-pro';

const lib = fs.readFileSync(path.join(ROOT, 'src/domain/training/exerciseLibrary.ts'), 'utf8');
const slugs = new Set([...lib.matchAll(/^\s*s\('([a-z0-9-]+)'/gm)].map((m) => m[1]));

let media = fs.readFileSync(MEDIA, 'utf8');
const registered = new Set([...media.matchAll(/^  '([a-z0-9-]+)': \{/gm)].map((m) => m[1]));

const fresh = fs
  .readdirSync(path.join(ROOT, 'assets/exercises'))
  .filter((f) => f.endsWith('.jpg'))
  .map((f) => f.replace(/\.jpg$/, ''))
  .filter((slug) => slugs.has(slug) && !registered.has(slug))
  .sort();

if (fresh.length === 0) {
  console.log('Nada nuevo que registrar.');
  process.exit(0);
}

const entries = fresh
  .map(
    (slug) =>
      `  '${slug}': {\n    image: require('@/assets/exercises/${slug}.jpg'),\n    author: 'YL Nutrición',\n    license: 'own',\n    sourceUrl: 'generated:muapi/${MODEL}',\n  },`,
  )
  .join('\n');

// Se insertan justo antes del cierre del objeto.
const close = media.lastIndexOf('\n};');
if (close < 0) throw new Error('No se encontró el cierre de EXERCISE_MEDIA');
media = `${media.slice(0, close)}\n${entries}${media.slice(close)}`;
fs.writeFileSync(MEDIA, media);

let doc = fs.existsSync(DOC) ? fs.readFileSync(DOC, 'utf8') : '# Atribución de medios\n';
const header = '\n## Ilustraciones propias (generadas)\n';
if (!doc.includes(header)) {
  doc += `${header}\nGeneradas con MuAPI (modelo \`${MODEL}\`) a partir de un prompt propio, sin material de terceros. Licencia: propia de YL Nutrición. Estilo: figura dorada sobre verde de marca, sin rostro reconocible.\n\n| Slug | Archivo |\n|---|---|\n`;
}
const rows = fresh.map((slug) => `| ${slug} | assets/exercises/${slug}.jpg |`).join('\n');
doc = doc.trimEnd() + '\n' + rows + '\n';
fs.writeFileSync(DOC, doc);

console.log(`Registradas ${fresh.length}: ${fresh.join(' ')}`);
