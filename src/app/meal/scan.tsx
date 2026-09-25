import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Button, Card, Chip, Input, Screen, Section, Text } from '@/components/ui';
import { t } from '@/i18n';
import { useTheme } from '@/providers';
import { foodScan, type ScannedItem } from '@/services/food-scan';
import { manualFoodId } from '@/services/food-provider';
import { capturePhoto, pickPhoto, storePhoto } from '@/services/photo-storage';
import { useAuthStore } from '@/stores/auth-store';
import { MEAL_TYPE_KEYS, MEAL_TYPES, toDateKey, useLogStore } from '@/stores/log-store';
import { usePhotosStore } from '@/stores/photos-store';
import { useAppLocale } from '@/stores/settings-store';
import { minTouchTarget } from '@/theme';
import type { Food, MealType } from '@/types/domain';
import { safeNumber } from '@/utils/units';

/* ------------------------------------------------------------------ tipos */

type Step = 'capture' | 'scanning' | 'review' | 'unavailable' | 'error';

interface ReviewItem extends ScannedItem {
  id: string;
  /** Gramos tal como los ha dejado el usuario; los macros se reescalan. */
  gramsText: string;
}

/** Reescala kcal y macros a los gramos editados. */
function scaled(item: ReviewItem): { grams: number; kcal: number; proteinG: number; carbsG: number; fatG: number } {
  const grams = safeNumber(Number(item.gramsText.replace(',', '.')));
  const factor = item.grams > 0 ? grams / item.grams : 0;
  return {
    grams,
    kcal: Math.round(item.kcal * factor),
    proteinG: Math.round(item.proteinG * factor * 10) / 10,
    carbsG: Math.round(item.carbsG * factor * 10) / 10,
    fatG: Math.round(item.fatG * factor * 10) / 10,
  };
}

/** Convierte una estimación en un alimento manual (por 100 g) para el registro. */
function toFood(item: ReviewItem): Food {
  const per = item.grams > 0 ? 100 / item.grams : 0;
  return {
    id: manualFoodId(`scan-${item.name}`),
    name: item.name,
    servingLabel: '100 g',
    servingGrams: 100,
    per100g: {
      kcal: Math.round(item.kcal * per),
      proteinG: Math.round(item.proteinG * per * 10) / 10,
      carbsG: Math.round(item.carbsG * per * 10) / 10,
      fatG: Math.round(item.fatG * per * 10) / 10,
    },
    source: 'manual',
    tags: ['scan'],
  };
}

/* ---------------------------------------------------------------- pantalla */

/**
 * Escanear comida por foto.
 *
 * La foto va al servidor, que devuelve una estimación por alimento. Aquí se
 * revisa y se corrige antes de registrar nada: la app nunca apunta calorías
 * sin que el usuario las vea. En demo (sin servidor) se guarda la foto y se
 * dice claramente que no hay modelo, en vez de inventar cifras.
 */
export default function ScanMealScreen() {
  const { colors, radius, spacing } = useTheme();
  const params = useLocalSearchParams<{ mealType?: string; date?: string }>();
  const locale = useAppLocale();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const addPhoto = usePhotosStore((s) => s.add);
  const addItem = useLogStore((s) => s.addItem);
  const addManualFood = useLogStore((s) => s.addManualFood);

  const dateKey = params.date ?? toDateKey();
  const [mealType, setMealType] = useState<MealType>(
    MEAL_TYPES.includes(params.mealType as MealType) ? (params.mealType as MealType) : 'lunch',
  );
  const [step, setStep] = useState<Step>('capture');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [note, setNote] = useState<string | undefined>();
  const [reasonKey, setReasonKey] = useState('scan.failed');

  const scan = useCallback(
    async (source: 'camera' | 'gallery') => {
      const asset = source === 'camera' ? await capturePhoto({ base64: true }) : await pickPhoto({ base64: true });
      if (!asset) return;
      setPhotoUri(asset.uri);
      setStep('scanning');

      // La foto de la comida se guarda siempre, haya o no modelo: el usuario
      // pidió ver qué comió, no solo cuántas calorías.
      const stored = await storePhoto(asset, 'meal', userId);
      addPhoto(stored);

      if (!asset.base64) {
        setReasonKey('scan.failed');
        setStep('error');
        return;
      }
      const outcome = await foodScan.scan(asset.base64, locale);
      if (outcome.status === 'ok') {
        setItems(
          outcome.result.items.map((it, i) => ({ ...it, id: `${i}-${it.name}`, gramsText: String(it.grams) })),
        );
        setNote(outcome.result.note);
        setStep('review');
      } else {
        setReasonKey(outcome.reasonKey);
        setStep(outcome.status === 'unavailable' ? 'unavailable' : 'error');
      }
    },
    [addPhoto, locale, userId],
  );

  const confirm = useCallback(() => {
    for (const item of items) {
      const { grams } = scaled(item);
      if (grams <= 0) continue;
      const food = addManualFood(toFood(item));
      addItem(dateKey, mealType, food, grams);
    }
    router.back();
  }, [addItem, addManualFood, dateKey, items, mealType]);

  const totalKcal = items.reduce((sum, it) => sum + scaled(it).kcal, 0);

  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          onPress={() => router.back()}
          style={{ width: minTouchTarget, height: minTouchTarget, justifyContent: 'center' }}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text variant="h2" style={{ flex: 1 }}>
          {t('scan.title')}
        </Text>
      </View>

      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: radius.lg, marginTop: spacing.md }}
          contentFit="cover"
          accessibilityLabel={t('scan.title')}
        />
      ) : null}

      {step === 'capture' ? (
        <Section>
          <Card style={{ gap: spacing.md }}>
            <Text variant="body" color="muted">
              {t('scan.subtitle')}
            </Text>
            <Button
              label={t('scan.takePhoto')}
              icon={<Ionicons name="camera-outline" size={18} color={colors.onPrimary} />}
              onPress={() => void scan('camera')}
            />
            <Button
              label={t('scan.pickPhoto')}
              variant="secondary"
              icon={<Ionicons name="images-outline" size={18} color={colors.primary} />}
              onPress={() => void scan('gallery')}
            />
          </Card>
        </Section>
      ) : null}

      {step === 'scanning' ? (
        <Section>
          <Card style={{ alignItems: 'center', gap: spacing.md }}>
            <ActivityIndicator color={colors.primary} />
            <Text variant="body" color="muted">
              {t('scan.scanning')}
            </Text>
          </Card>
        </Section>
      ) : null}

      {step === 'unavailable' || step === 'error' ? (
        <Section>
          <Card style={{ gap: spacing.md }}>
            <Text variant="bodyStrong">{t('scan.photoSaved')}</Text>
            <Text variant="body" color="muted">
              {t(reasonKey)}
            </Text>
            {step === 'error' ? (
              <Button label={t('scan.retry')} variant="secondary" onPress={() => setStep('capture')} />
            ) : null}
            <Button
              label={t('scan.addManually')}
              onPress={() =>
                router.replace({ pathname: '/meal/add', params: { mealType, date: dateKey } })
              }
            />
          </Card>
        </Section>
      ) : null}

      {step === 'review' ? (
        <>
          <Section title={t('scan.results')}>
            <Text variant="caption" color="muted">
              {t('scan.estimateNote')}
            </Text>
            {note ? (
              <Card style={{ borderColor: colors.warning, marginTop: spacing.sm }}>
                <Text variant="caption">{note}</Text>
              </Card>
            ) : null}
            {items.length === 0 ? (
              <Card style={{ marginTop: spacing.md }}>
                <Text variant="body" color="muted">
                  {t('scan.noItems')}
                </Text>
              </Card>
            ) : null}
            <View style={{ gap: spacing.md, marginTop: spacing.md }}>
              {items.map((item) => {
                const s = scaled(item);
                return (
                  <Card key={item.id} style={{ gap: spacing.sm }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyStrong">{item.name}</Text>
                        {item.confidence < 0.5 ? (
                          <Text variant="caption" color="muted">
                            {t('scan.confidenceLow')}
                          </Text>
                        ) : null}
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${t('scan.remove')}: ${item.name}`}
                        onPress={() => setItems((prev) => prev.filter((p) => p.id !== item.id))}
                        style={{ width: minTouchTarget, height: minTouchTarget, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Ionicons name="trash-outline" size={20} color={colors.danger} />
                      </Pressable>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md }}>
                      <View style={{ flex: 1 }}>
                        <Input
                          label={t('scan.grams')}
                          keyboardType="decimal-pad"
                          value={item.gramsText}
                          onChangeText={(text) =>
                            setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, gramsText: text } : p)))
                          }
                          suffix="g"
                        />
                      </View>
                      <View style={{ flex: 1, paddingBottom: spacing.sm }}>
                        <Text variant="numeric">{s.kcal} kcal</Text>
                        <Text variant="caption" color="muted">
                          P {s.proteinG} · C {s.carbsG} · G {s.fatG}
                        </Text>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </View>
          </Section>

          <Section title={t('scan.mealType')}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {MEAL_TYPES.map((type) => (
                <Chip
                  key={type}
                  label={t(MEAL_TYPE_KEYS[type])}
                  selected={mealType === type}
                  onPress={() => setMealType(type)}
                />
              ))}
            </View>
          </Section>

          <Section>
            <Card style={{ gap: spacing.md }}>
              <Text variant="h3">
                {t('scan.total')}: {totalKcal} kcal
              </Text>
              <Button label={t('scan.addToLog')} onPress={confirm} disabled={items.length === 0} />
              <Button label={t('scan.retry')} variant="secondary" onPress={() => setStep('capture')} />
            </Card>
          </Section>
        </>
      ) : null}
    </Screen>
  );
}
