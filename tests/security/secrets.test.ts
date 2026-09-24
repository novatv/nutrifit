import fs from 'node:fs';
import path from 'node:path';

/**
 * Guardia de secretos.
 *
 * Cualquier variable EXPO_PUBLIC_ acaba dentro del binario de la app, así que
 * una con pinta de secreto es una filtración. Ya pasó una vez con la clave de
 * USDA; a partir de ahora lo vigila el CI y no la revisión a ojo.
 */

const SRC = path.join(__dirname, '..', '..', 'src');

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return /\.tsx?$/.test(e.name) ? [full] : [];
  });

const SECRET_SHAPED = /EXPO_PUBLIC_[A-Z0-9_]*(SECRET|SERVICE_ROLE|PRIVATE|_API_KEY|_TOKEN)\b/g;

describe('el cliente no empaqueta secretos', () => {
  const files = walk(SRC);

  it('encuentra archivos que analizar', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it('ninguna variable EXPO_PUBLIC_ tiene pinta de secreto', () => {
    const offenders = files.flatMap((file) => {
      const src = fs.readFileSync(file, 'utf8');
      return [...src.matchAll(SECRET_SHAPED)].map(
        (m) => `${path.relative(SRC, file)}: ${m[0]}`,
      );
    });
    expect(offenders).toEqual([]);
  });

  it('la service-role de Supabase no se referencia desde el cliente', () => {
    const offenders = files.filter((file) => {
      const src = fs.readFileSync(file, 'utf8');
      // Se permite nombrarla en un comentario de advertencia, no usarla.
      return /process\.env\.[A-Z_]*SERVICE_ROLE/.test(src);
    });
    expect(offenders.map((f) => path.relative(SRC, f))).toEqual([]);
  });
});
