import { ScrollView, View } from 'react-native';

import { Logo } from '@/components/brand/logo';
import { Screen, Text } from '@/components/ui';
import { useTheme } from '@/providers';
import { useAppLocale } from '@/stores/settings-store';

/**
 * Política de privacidad.
 *
 * Google Play y Apple exigen una URL pública; esta pantalla se publica en la
 * web (…/privacidad) y es la misma que ve el usuario dentro de la app.
 * Texto fijo en dos idiomas: no pasa por i18n porque no es interfaz, es un
 * documento que debe leerse igual en todas las versiones.
 */
const ES = [
  ['Qué datos guardamos', 'Tu perfil (edad, sexo, altura, peso, objetivo), tus registros de comida, medidas y fotos de progreso, tus entrenamientos y, si conectas un reloj, pasos, energía activa, sueño, pulso en reposo y peso leídos de Apple Health o Health Connect.'],
  ['Dónde se guardan', 'Por defecto, solo en tu dispositivo. Si inicias sesión con una cuenta, tu perfil, registros y fotos se guardan en tu cuenta en Supabase (servidores en la Unión Europea), cifrados en tránsito y accesibles solo por ti. Los datos del reloj nunca salen del dispositivo.'],
  ['Datos de salud (Health Connect / Apple Health)', 'Solo se leen; la app nunca escribe en tu historial de salud. Se usan únicamente para mostrarte tu actividad y ajustar tu plan. No se venden, no se comparten con terceros ni se usan para publicidad. Puedes retirar el permiso desde los ajustes del sistema en cualquier momento.'],
  ['Fotos', 'Las fotos de progreso y de comidas se guardan en almacenamiento privado. La foto de una comida se envía a nuestro servidor solo para estimar su contenido y no se conserva allí.'],
  ['Borrado', 'En Perfil → Privacidad y datos puedes ver, exportar y restablecer todos tus datos locales, y eliminar tu cuenta con todo lo asociado. El borrado es definitivo.'],
  ['Menores y salud', 'La app es para mayores de 18 años. No diagnostica ni sustituye a un profesional sanitario; las cifras son estimaciones.'],
  ['Contacto', 'Para cualquier consulta sobre tus datos: iamdjcasanova@gmail.com.'],
];

const EN = [
  ['What we store', 'Your profile (age, sex, height, weight, goal), your food logs, measurements and progress photos, your workouts and, if you connect a watch, steps, active energy, sleep, resting heart rate and weight read from Apple Health or Health Connect.'],
  ['Where it is stored', 'By default, only on your device. If you sign in with an account, your profile, logs and photos are stored in your account on Supabase (servers in the European Union), encrypted in transit and accessible only to you. Watch data never leaves the device.'],
  ['Health data (Health Connect / Apple Health)', 'Read-only; the app never writes to your health history. It is used solely to show your activity and adjust your plan. It is not sold, shared with third parties or used for advertising. You can revoke the permission from system settings at any time.'],
  ['Photos', 'Progress and meal photos are kept in private storage. A meal photo is sent to our server only to estimate its content and is not kept there.'],
  ['Deletion', 'In Profile → Privacy and data you can view, export and reset all your local data, and delete your account with everything attached. Deletion is permanent.'],
  ['Minors and health', 'The app is for adults 18+. It does not diagnose or replace a health professional; figures are estimates.'],
  ['Contact', 'For any question about your data: iamdjcasanova@gmail.com.'],
];

export default function PrivacyScreen() {
  const { spacing } = useTheme();
  const locale = useAppLocale();
  const sections = locale === 'en' ? EN : ES;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: spacing.lg, paddingVertical: spacing.xl }}>
        <Logo size="md" />
        <Text variant="h1">{locale === 'en' ? 'Privacy policy' : 'Política de privacidad'}</Text>
        <Text variant="caption" color="muted">
          {locale === 'en' ? 'YL Nutrición · Updated 25 September 2026' : 'YL Nutrición · Actualizada el 25 de septiembre de 2026'}
        </Text>
        {sections.map(([title, body]) => (
          <View key={title} style={{ gap: spacing.xs }}>
            <Text variant="h3">{title}</Text>
            <Text variant="body">{body}</Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
