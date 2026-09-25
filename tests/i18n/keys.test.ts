import fs from 'node:fs';
import path from 'node:path';

import { EXERCISES } from '@/domain/training/exerciseLibrary';
import { en } from '@/i18n/en';
import { es } from '@/i18n/es';

/**
 * Guardia de traducciones.
 *
 * Una clave que no existe se muestra en crudo al usuario ("safety.pregnancy"
 * en mitad de la pantalla). Ya pasó una vez con el motor de seguridad, así que
 * esto lo vigila el CI y no la vista.
 */

const leaves = (obj: unknown, prefix = ''): string[] => {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    leaves(v, prefix ? `${prefix}.${k}` : k),
  );
};

const esKeys = new Set(leaves(es));

describe('diccionarios', () => {
  it('inglés tiene exactamente las mismas claves que español', () => {
    const enKeys = new Set(leaves(en));
    const missing = [...esKeys].filter((k) => !enKeys.has(k));
    const extra = [...enKeys].filter((k) => !esKeys.has(k));
    expect({ missing, extra }).toEqual({ missing: [], extra: [] });
  });

  it('los marcadores de interpolación coinciden entre idiomas', () => {
    const placeholders = (s: string) => (s.match(/\{\{\w+\}\}/g) ?? []).sort().join(',');
    const read = (obj: unknown, keyPath: string[]): unknown =>
      keyPath.reduce<unknown>(
        (acc, k) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[k] : undefined),
        obj,
      );

    const mismatched = [...esKeys].filter((key) => {
      const a = read(es, key.split('.'));
      const b = read(en, key.split('.'));
      return typeof a === 'string' && typeof b === 'string' && placeholders(a) !== placeholders(b);
    });
    expect(mismatched).toEqual([]);
  });
});

describe('claves usadas por el dominio', () => {
  /** Lee las messageKey que el código de seguridad emite de verdad. */
  const emittedSafetyKeys = (): string[] => {
    const dir = path.join(__dirname, '..', '..', 'src', 'domain', 'safety');
    return [
      ...new Set(
        fs
          .readdirSync(dir)
          .filter((f) => f.endsWith('.ts'))
          .flatMap((f) => {
            const src = fs.readFileSync(path.join(dir, f), 'utf8');
            return [...src.matchAll(/messageKey:\s*'([\w.]+)'/g)].map((m) => m[1]);
          }),
      ),
    ];
  };

  it('toda messageKey emitida por el motor de seguridad existe en español', () => {
    const emitted = emittedSafetyKeys();
    expect(emitted.length).toBeGreaterThan(0);
    const orphans = emitted.filter((k) => !esKeys.has(k));
    expect(orphans).toEqual([]);
  });

  it('toda clave que genera la biblioteca de ejercicios tiene texto en ambos idiomas', () => {
    const read = (obj: unknown, key: string): unknown =>
      key.split('.').reduce<unknown>(
        (acc, k) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[k] : undefined),
        obj,
      );
    const generated = EXERCISES.flatMap((e) => [
      `${e.nameKey}.name`,
      ...e.instructionKeys,
      ...e.commonMistakeKeys,
      ...e.safetyNoteKeys,
    ]);
    expect(generated.length).toBeGreaterThan(0);
    const empty = generated.filter((k) => {
      const a = read(es, k);
      const b = read(en, k);
      return typeof a !== 'string' || a.trim() === '' || typeof b !== 'string' || b.trim() === '';
    });
    expect(empty).toEqual([]);
  });

  it('las claves de explicación del ajuste semanal existen', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '..', '..', 'src', 'domain', 'progress', 'weeklyAdjustmentEngine.ts'),
      'utf8',
    );
    const used = [...new Set([...src.matchAll(/explanationKey:\s*\n?\s*'([\w.]+)'/g)].map((m) => m[1]))];
    const orphans = used.filter((k) => !esKeys.has(k));
    expect(orphans).toEqual([]);
  });
});

describe('claves usadas por la interfaz', () => {
  /** Recorre src/ buscando llamadas t('clave.literal'). */
  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) return walk(full);
      return /\.tsx?$/.test(e.name) ? [full] : [];
    });

  it('toda clave literal pasada a t() existe en el diccionario', () => {
    const SRC = path.join(__dirname, '..', '..', 'src');
    const orphans: string[] = [];

    for (const file of walk(SRC)) {
      const src = fs.readFileSync(file, 'utf8');
      // Solo literales: las claves compuestas con plantillas no se pueden
      // verificar de forma estática y se quedan fuera a propósito.
      for (const m of src.matchAll(/\bt\(\s*'([\w.]+)'/g)) {
        const key = m[1];
        if (!esKeys.has(key)) orphans.push(`${path.relative(SRC, file)}: ${key}`);
      }
    }

    expect(orphans).toEqual([]);
  });
});
