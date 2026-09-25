import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, View } from 'react-native';

import { Button, Card, EmptyState, Input, Section, Text } from '@/components/ui';
import {
  BODY_MEASURES,
  buildBodyReport,
  type BodyCheck,
  type BodyMeasure,
} from '@/domain/progress/bodyMonitorEngine';
import { t } from '@/i18n';
import { useTheme } from '@/providers';
import { config } from '@/services/config';
import { demoProfile } from '@/services/demo-data';
import { capturePhoto, pickPhoto, storePhoto } from '@/services/photo-storage';
import { useAuthStore } from '@/stores/auth-store';
import { useBodyChecks, useBodyStore } from '@/stores/body-store';
import { toDateKey } from '@/stores/log-store';
import { usePhotosOfKind, usePhotosStore } from '@/stores/photos-store';
import { minTouchTarget } from '@/theme';
import { safeNumber } from '@/utils/units';

/* -------------------------------------------------------------- etiquetas */

const MEASURE_LABEL: Record<BodyMeasure, string> = {
  weightKg: 'progress.measurement.weight',
  waistCm: 'progress.measurement.waist',
  hipCm: 'progress.measurement.hip',
  chestCm: 'progress.measurement.chest',
  armCm: 'progress.measurement.arm',
  thighCm: 'progress.measurement.thigh',
  bodyFatPct: 'progress.measurement.bodyFat',
};

const MEASURE_UNIT: Record<BodyMeasure, string> = {
  weightKg: 'kg',
  waistCm: 'cm',
  hipCm: 'cm',
  chestCm: 'cm',
  armCm: 'cm',
  thighCm: 'cm',
  bodyFatPct: '%',
};

const parse = (s: string): number | undefined => {
  if (!s.trim()) return undefined;
  const n = safeNumber(Number(s.replace(',', '.')));
  return n > 0 ? n : undefined;
};

/* ------------------------------------------------------------- informe */

function ReportCard() {
  const { colors, spacing } = useTheme();
  const checks = useBodyChecks();
  const report = useMemo(
    () => buildBodyReport({ checks, goal: demoProfile.goal, screening: demoProfile.screening }),
    [checks],
  );
  const shopUrl = config.supplementsUrl;

  return (
    <Card style={{ gap: spacing.md }}>
      <Text variant="h3">{t(`body.trend.${report.trend}`)}</Text>
      {report.weeks > 0 ? (
        <Text variant="caption" color="muted">
          {t('body.weeksCompared', { n: report.weeks })}
        </Text>
      ) : null}

      {report.deltas.length > 0 ? (
        <View style={{ gap: spacing.xs }}>
          {report.deltas.map((d) => (
            <View key={d.measure} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="body">{t(MEASURE_LABEL[d.measure])}</Text>
              <Text variant="numeric" color={d.delta === 0 ? 'muted' : 'default'}>
                {d.delta > 0 ? '+' : ''}
                {d.delta} {MEASURE_UNIT[d.measure]}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={{ gap: spacing.xs }}>
        <Text variant="label" color="muted">
          {t('body.guidelines')}
        </Text>
        {report.guidelineKeys.map((k) => (
          <Text key={k} variant="body">
            · {t(k)}
          </Text>
        ))}
      </View>

      {report.supplementKeys.length > 0 ? (
        <View style={{ gap: spacing.xs }}>
          <Text variant="label" color="muted">
            {t('body.supplements')}
          </Text>
          {report.supplementKeys.map((k) => (
            <Text key={k} variant="body">
              · {t(k)}
            </Text>
          ))}
          <Text variant="caption" color="muted">
            {t('body.supplementsNote')}
          </Text>
          {shopUrl ? (
            <Button
              label={t('body.supplementsLink')}
              variant="secondary"
              icon={<Ionicons name="open-outline" size={18} color={colors.primary} />}
              onPress={() => {
                void Linking.openURL(shopUrl);
              }}
            />
          ) : null}
        </View>
      ) : null}

      {report.cautionKeys.map((k) => (
        <Text key={k} variant="caption" color="muted">
          {t(k)}
        </Text>
      ))}
    </Card>
  );
}

/* --------------------------------------------------------------- registro */

function CheckForm() {
  const { colors, radius, spacing } = useTheme();
  const upsert = useBodyStore((s) => s.upsert);
  const addPhoto = usePhotosStore((s) => s.add);
  const userId = useAuthStore((s) => s.user?.id ?? null);

  const [values, setValues] = useState<Record<BodyMeasure, string>>({
    weightKg: '',
    waistCm: '',
    hipCm: '',
    chestCm: '',
    armCm: '',
    thighCm: '',
    bodyFatPct: '',
  });
  const [photo, setPhoto] = useState<{ id: string; uri: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const [empty, setEmpty] = useState(false);

  const takePhoto = async (source: 'camera' | 'gallery') => {
    const asset = source === 'camera' ? await capturePhoto() : await pickPhoto();
    if (!asset) return;
    const stored = await storePhoto(asset, 'progress', userId);
    addPhoto(stored);
    setPhoto({ id: stored.id, uri: asset.uri });
  };

  const save = () => {
    const check: BodyCheck = { date: toDateKey(), photoId: photo?.id };
    for (const m of BODY_MEASURES) check[m] = parse(values[m]);
    const ok = upsert(check);
    setEmpty(!ok);
    setSaved(ok);
    if (ok) {
      setValues({ weightKg: '', waistCm: '', hipCm: '', chestCm: '', armCm: '', thighCm: '', bodyFatPct: '' });
      setPhoto(null);
    }
  };

  return (
    <Card style={{ gap: spacing.md }}>
      <Text variant="caption" color="muted">
        {t('body.subtitle')}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        {BODY_MEASURES.map((m) => (
          <View key={m} style={{ width: '47%' }}>
            <Input
              label={t(MEASURE_LABEL[m])}
              keyboardType="decimal-pad"
              value={values[m]}
              onChangeText={(text) => {
                setSaved(false);
                setValues((v) => ({ ...v, [m]: text }));
              }}
              suffix={MEASURE_UNIT[m]}
            />
          </View>
        ))}
      </View>
      <Text variant="caption" color="muted">
        {t('progress.bodyFatHint')}
      </Text>

      <Text variant="label" color="muted">
        {t('body.photoToday')}
      </Text>
      {photo ? (
        <Image
          source={{ uri: photo.uri }}
          style={{ width: '100%', aspectRatio: 3 / 4, borderRadius: radius.lg }}
          contentFit="cover"
          accessibilityLabel={t('body.photoToday')}
        />
      ) : null}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Button
            label={t('body.takePhoto')}
            variant="secondary"
            icon={<Ionicons name="camera-outline" size={18} color={colors.primary} />}
            onPress={() => void takePhoto('camera')}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label={t('body.pickPhoto')}
            variant="secondary"
            icon={<Ionicons name="images-outline" size={18} color={colors.primary} />}
            onPress={() => void takePhoto('gallery')}
          />
        </View>
      </View>

      <Button label={t('body.save')} onPress={save} />
      {saved ? (
        <Text variant="caption" color="success">
          {t('body.saved')}
        </Text>
      ) : null}
      {empty ? (
        <Text variant="caption" color="danger">
          {t('body.emptyForm')}
        </Text>
      ) : null}
    </Card>
  );
}

/* ----------------------------------------------------------------- fotos */

function PhotoGrid() {
  const { colors, radius, spacing } = useTheme();
  const photos = usePhotosOfKind('progress');
  const remove = usePhotosStore((s) => s.remove);

  if (photos.length === 0) {
    return <EmptyState body={t('body.noPhotos')} />;
  }

  const confirmDelete = (id: string) => {
    // Borrar es definitivo (no hay papelera): se pregunta siempre.
    Alert.alert(t('body.deletePhoto'), t('body.deletePhotoConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => void remove(id) },
    ]);
  };

  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="caption" color="muted">
        {t('progress.photosPrivate')}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {photos.map((p) => (
          <View key={p.id} style={{ width: '31%', gap: spacing.xs / 2 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t('body.deletePhoto')}: ${p.takenAt.slice(0, 10)}`}
              onLongPress={() => confirmDelete(p.id)}
              delayLongPress={400}
            >
              <Image
                source={{ uri: p.uri }}
                style={{ width: '100%', aspectRatio: 3 / 4, borderRadius: radius.md, backgroundColor: colors.border }}
                contentFit="cover"
              />
            </Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="caption" color="muted">
                {p.takenAt.slice(0, 10)}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('body.deletePhoto')}
                onPress={() => confirmDelete(p.id)}
                style={{ minWidth: minTouchTarget / 2, alignItems: 'flex-end' }}
              >
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/* --------------------------------------------------------------- historial */

function History() {
  const { spacing } = useTheme();
  const checks = useBodyChecks();
  if (checks.length === 0) return null;
  const recent = [...checks].reverse().slice(0, 8);
  return (
    <Card style={{ gap: spacing.sm }}>
      {recent.map((c) => (
        <View key={c.date} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
          <Text variant="caption" color="muted">
            {c.date}
          </Text>
          <Text variant="caption" style={{ flex: 1, textAlign: 'right' }}>
            {BODY_MEASURES.filter((m) => typeof c[m] === 'number')
              .map((m) => `${t(MEASURE_LABEL[m])} ${c[m]} ${MEASURE_UNIT[m]}`)
              .join(' · ')}
            {c.photoId ? ' · 📷' : ''}
          </Text>
        </View>
      ))}
    </Card>
  );
}

/* --------------------------------------------------------------- pestaña */

/**
 * Pestaña "Figura": monitoreo semanal con foto y medidas.
 *
 * El informe compara con hace ~4 semanas y da pautas generales; los
 * suplementos son categorías a considerar, con enlace a la tienda cuando
 * está configurada. Nada de esto sustituye a un profesional y así se dice.
 */
export function BodyTab() {
  const { spacing } = useTheme();
  return (
    <View style={{ gap: spacing.lg }}>
      <Section title={t('body.report')}>
        <ReportCard />
      </Section>
      <Section title={t('body.logToday')}>
        <CheckForm />
      </Section>
      <Section title={t('body.history')}>
        <History />
      </Section>
      <Section title={t('progress.photos')}>
        <PhotoGrid />
      </Section>
    </View>
  );
}
