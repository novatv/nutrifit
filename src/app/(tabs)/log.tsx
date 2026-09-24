import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, View } from 'react-native';

import { Button, Card, EmptyState, ProgressBar, Screen, Text } from '@/components/ui';
import { t } from '@/i18n';
import { useTheme } from '@/providers';
import { demoTargets } from '@/services/demo-data';
import {
  MEAL_TYPES,
  MEAL_TYPE_KEYS,
  emptyMealLog,
  sumNutrients,
  toDateKey,
  useLogStore,
  type LoggedItem,
} from '@/stores/log-store';
import { minTouchTarget } from '@/theme';
import type { MealType, Nutrients } from '@/types/domain';

/* ------------------------------------------------------------- utilidades */

/** Resumen de macros de una línea o de una comida, en una sola frase. */
function macroSummary(n: Nutrients): string {
  return [
    `${Math.round(n.proteinG)} g ${t('today.protein').toLowerCase()}`,
    `${Math.round(n.carbsG)} g ${t('today.carbs').toLowerCase()}`,
    `${Math.round(n.fatG)} g ${t('today.fat').toLowerCase()}`,
  ].join(' · ');
}

/* --------------------------------------------------------------- una línea */

interface ItemRowProps {
  item: LoggedItem;
  onRemove: () => void;
}

function ItemRow({ item, onRemove }: ItemRowProps) {
  const { colors, spacing } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <View style={{ flex: 1, gap: spacing.xs / 2 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {item.name}
        </Text>
        <Text variant="caption" color="muted">
          {item.grams} g · {macroSummary(item.nutrients)}
        </Text>
      </View>

      <Text variant="numeric">{Math.round(item.nutrients.kcal)} kcal</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t('common.delete')}: ${item.name}`}
        onPress={onRemove}
        hitSlop={spacing.sm}
        style={({ pressed }) => ({
          minWidth: minTouchTarget,
          minHeight: minTouchTarget,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

/* ------------------------------------------------------------ una comida */

interface MealSectionProps {
  dateKey: string;
  type: MealType;
  items: LoggedItem[];
  totals: Nutrients;
  onAdd: () => void;
  onRemoveItem: (itemId: string) => void;
  onRepeatYesterday: () => void;
  onCopy: () => void;
  onSaveAsMeal: () => void;
}

function MealSection({
  type,
  items,
  totals,
  onAdd,
  onRemoveItem,
  onRepeatYesterday,
  onCopy,
  onSaveAsMeal,
}: MealSectionProps) {
  const { colors, spacing } = useTheme();
  const title = t(MEAL_TYPE_KEYS[type]);

  return (
    <Card style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <Text variant="h3">{title}</Text>
          <Text variant="caption" color="muted">
            {Math.round(totals.kcal)} kcal · {macroSummary(totals)}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${t('log.addFood')}: ${title}`}
          onPress={onAdd}
          style={({ pressed }) => ({
            minWidth: minTouchTarget,
            minHeight: minTouchTarget,
            borderRadius: minTouchTarget / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primarySubtle,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {items.length === 0 ? (
        <Text variant="caption" color="muted">
          {t('states.emptyBody')}
        </Text>
      ) : (
        items.map((item) => (
          <ItemRow key={item.id} item={item} onRemove={() => onRemoveItem(item.id)} />
        ))
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {type === 'breakfast' ? (
          <Button
            label={t('log.repeatYesterday')}
            variant="ghost"
            size="md"
            fullWidth={false}
            haptic={false}
            onPress={onRepeatYesterday}
          />
        ) : null}
        {items.length > 0 ? (
          <>
            <Button
              label={t('log.copyMeal')}
              variant="ghost"
              size="md"
              fullWidth={false}
              haptic={false}
              onPress={onCopy}
            />
            <Button
              label={t('log.saveAsMeal')}
              variant="ghost"
              size="md"
              fullWidth={false}
              haptic={false}
              onPress={onSaveAsMeal}
            />
          </>
        ) : null}
      </View>
    </Card>
  );
}

/* ------------------------------------------------------------- pantalla */

/**
 * Pantalla Registrar.
 *
 * Lo primero es el total del día contra el objetivo, porque es la pregunta
 * que trae aquí al usuario ("¿cuánto me queda?"). Debajo, una tarjeta por
 * comida con su contenido y su botón de añadir.
 *
 * Los objetivos vienen del modo demostración mientras no haya perfil real
 * guardado; en cuanto lo haya, se sustituyen por `buildNutritionTargets`.
 */
export default function LogScreen() {
  const { colors, spacing } = useTheme();
  const [dateKey] = useState(() => toDateKey());

  const days = useLogStore((state) => state.days);
  const removeItem = useLogStore((state) => state.removeItem);
  const repeatYesterday = useLogStore((state) => state.repeatYesterday);
  const copyMeal = useLogStore((state) => state.copyMeal);
  const saveAsMeal = useLogStore((state) => state.saveAsMeal);

  const dayLog = days[dateKey];

  const { totalsByMeal, dayTotals, hasAnyItem } = useMemo(() => {
    const log = dayLog ?? emptyMealLog();
    const byMeal = {
      breakfast: sumNutrients(log.breakfast),
      lunch: sumNutrients(log.lunch),
      dinner: sumNutrients(log.dinner),
      snack: sumNutrients(log.snack),
    } as Record<MealType, Nutrients>;
    const all = MEAL_TYPES.flatMap((type) => log[type]);
    return {
      totalsByMeal: byMeal,
      dayTotals: sumNutrients(all),
      hasAnyItem: all.length > 0,
    };
  }, [dayLog]);

  const openAdd = useCallback(
    (type: MealType) => {
      router.push({ pathname: '/meal/add', params: { mealType: type, date: dateKey } });
    },
    [dateKey],
  );

  const handleCopy = useCallback(
    (type: MealType) => {
      // Copiar a otra comida del mismo día: se pregunta destino en lugar de
      // adivinarlo, porque duplicar calorías por error es caro de deshacer.
      const targets = MEAL_TYPES.filter((candidate) => candidate !== type);
      Alert.alert(
        t('log.copyMeal'),
        t(MEAL_TYPE_KEYS[type]),
        [
          ...targets.map((target) => ({
            text: t(MEAL_TYPE_KEYS[target]),
            onPress: () => copyMeal(dateKey, type, target),
          })),
          { text: t('common.cancel'), style: 'cancel' as const },
        ],
      );
    },
    [copyMeal, dateKey],
  );

  const handleSaveAsMeal = useCallback(
    (type: MealType) => {
      saveAsMeal(dateKey, type, t(MEAL_TYPE_KEYS[type]));
    },
    [saveAsMeal, dateKey],
  );

  const kcalLeft = Math.max(0, demoTargets.kcal - dayTotals.kcal);

  const header = (
    <View style={{ paddingTop: spacing.lg, gap: spacing.lg }}>
      <Text variant="h1">{t('log.title')}</Text>

      <Card style={{ gap: spacing.md }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          }}
        >
          <Text variant="label" color="muted">
            {t('today.dailyGoal')}
          </Text>
          <Text variant="numeric" color="muted">
            {Math.round(dayTotals.kcal)} / {demoTargets.kcal} kcal
          </Text>
        </View>

        <ProgressBar
          value={dayTotals.kcal}
          max={demoTargets.kcal}
          label={t('today.calories')}
          accessibilityLabel={`${t('today.calories')}: ${Math.round(dayTotals.kcal)} ${t('common.of')} ${demoTargets.kcal} kcal`}
        />

        <Text variant="caption" color="muted">
          {kcalLeft} kcal · {macroSummary(dayTotals)}
        </Text>
        <Text variant="caption" color="muted">
          {t('disclaimer.estimate')}
        </Text>
      </Card>

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Button
          label={t('log.addFood')}
          size="md"
          fullWidth={false}
          style={{ flex: 1 }}
          onPress={() => openAdd('breakfast')}
          icon={<Ionicons name="add" size={18} color={colors.onPrimary} />}
        />
        <Button
          label={t('log.searchFood')}
          variant="secondary"
          size="md"
          fullWidth={false}
          style={{ flex: 1 }}
          onPress={() => openAdd('lunch')}
        />
      </View>
    </View>
  );

  return (
    <Screen scroll={false} bottomInset={0}>
      <FlatList
        data={MEAL_TYPES}
        keyExtractor={(type) => type}
        ListHeaderComponent={header}
        ListHeaderComponentStyle={{ marginBottom: spacing.lg }}
        contentContainerStyle={{ paddingBottom: spacing['4xl'] }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: type }) => (
          <MealSection
            dateKey={dateKey}
            type={type}
            items={dayLog?.[type] ?? []}
            totals={totalsByMeal[type]}
            onAdd={() => openAdd(type)}
            onRemoveItem={(itemId) => removeItem(dateKey, type, itemId)}
            onRepeatYesterday={() => repeatYesterday(dateKey, type)}
            onCopy={() => handleCopy(type)}
            onSaveAsMeal={() => handleSaveAsMeal(type)}
          />
        )}
        ListFooterComponent={
          hasAnyItem ? (
            <Text variant="caption" color="muted">
              {t('disclaimer.general')}
            </Text>
          ) : (
            <EmptyState
              actionLabel={t('log.addFood')}
              onAction={() => openAdd('breakfast')}
            />
          )
        }
      />
    </Screen>
  );
}
