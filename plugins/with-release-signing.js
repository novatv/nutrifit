const { withAppBuildGradle } = require('@expo/config-plugins');

/**
 * Firma de release para Google Play.
 *
 * Lee la clave de subida de ~/.gradle/gradle.properties (YL_UPLOAD_*), que
 * nunca está en el repo. Si no existen esas propiedades (otra máquina, CI sin
 * secretos) se sigue firmando con la clave de depuración, como hace Expo por
 * defecto, para que `expo run:android` no se rompa.
 */
const SIGNING = `
        release {
            if (project.hasProperty('YL_UPLOAD_STORE_FILE')) {
                storeFile file(YL_UPLOAD_STORE_FILE)
                storePassword YL_UPLOAD_STORE_PASSWORD
                keyAlias YL_UPLOAD_KEY_ALIAS
                keyPassword YL_UPLOAD_KEY_PASSWORD
            }
        }
`;

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (mod) => {
    let gradle = mod.modResults.contents;
    if (gradle.includes('YL_UPLOAD_STORE_FILE')) return mod;

    // signingConfigs.release justo después del bloque debug.
    gradle = gradle.replace(
      /(signingConfigs\s*\{\s*debug\s*\{[\s\S]*?\n\s*\}\n)/,
      `$1${SIGNING}`,
    );
    // El buildType release usa la clave de subida cuando existe.
    gradle = gradle.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/,
      `$1signingConfig project.hasProperty('YL_UPLOAD_STORE_FILE') ? signingConfigs.release : signingConfigs.debug`,
    );
    mod.modResults.contents = gradle;
    return mod;
  });
};
