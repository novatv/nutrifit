import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, View } from 'react-native';

import {
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  Input,
  Skeleton,
  Text,
} from '@/components/ui';
import { useFoodSearch, useFoodsByIds } from '@/features/log/use-food-search';
import { t } from '@/i18n';
import { useTheme } from '@/providers';
import { manualFoodId, nutrientsForGrams } from '@/services/food-provider';
import { MEAL_TYPE_KEYS, toDateKey, useLogStore } from '@/stores/log-store';
import { minTouchTarget, screenPadding } from '@/theme';
import type { Food, MealType, Nutrients } from '@/types/domain';
import { safeNumber } from '@/utils/units';

/* ------------------------------------------------------------------ tipos */

type Tab = 'search' | 'recent' | 'favorites' | 'manual';

const TABS: { id: Tab; labelKey: string }[] = [
  { id: 'search', labelKey: 'log.searchFood' },
  { id: 'recent', labelKey: 'log.recent' },
  { id: 'favorites', labelKey: 'log.favorites' },
  { id: 'manual', labelKey: 'log.manual' },
];

/** Gramajes de acceso rápido. Cubren la mayoría de los registros reales. */
const QUICK_GRAMS = [30, 50, 100, 150, 200];

const VALID_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

function parseNumber(value: string): number {
  return safeNumber(Number(value.replace(',', '.')));
}

/* ------------------------------------------------------------- fila lista */

interface FoodRowProps {
  food: Food;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

function FoodRow({ food, isFavorite, onSelect, onToggleFavorite }: FoodRowProps) {
  const { colors, spacing } = useTheme();
  const perServing = nutrientsForGrams(food, food.servingGrams);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${food.name}. ${Math.round(food.per100g.kcal)} kcal / 100 g`}
        accessibilityHint={t('log.addFood')}
        onPress={onSelect}
        style={({ pressed }) => ({
          flex: 1,
          minHeight: minTouchTarget + 12,
          justifyContent: 'center',
          paddingVertical: spacing.sm,
          gap: spacing.xs / 2,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Text variant="bodyStrong" numberOfLines={1}>
          {food.name}
        </Text>
        <Text variant="caption" color="muted" numberOfLines={1}>
          {food.brand ? `${food.brand} · ` : ''}
          {Math.round(food.per100g.kcal)} kcal/100 g · {food.servingLabel} ({food.servingGrams} g,{' '}
          {Math.round(perServing.kcal)} kcal)
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t('log.favorites')}: ${food.name}`}
        accessibilityState={{ selected: isFavorite }}
        onPress={onToggleFavorite}
        style={({ pressed }) => ({
          minWidth: minTouchTarget,
          minHeight: minTouchTarget,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Ionicons
          name={isFavorite ? 'star' : 'star-outline'}
          size={20}
          color={isFavorite ? colors.primary : colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

/* ----------------------------------------------------- detalle + gramaje */

interface FoodDetailProps {
  food: Food;
  mealType: MealType;
  onBack: () => void;
  onConfirm: (grams: number) => void;
}

/** Ajuste de cantidad con recálculo en vivo de kcal y macros. */
function FoodDetail({ food, mealType, onBack, onConfirm }: FoodDetailProps) {
  const { colors, spacing } = useTheme();
  const [gramsText, setGramsText] = useState(String(food.servingGrams));

  const grams = Math.max(0, Math.round(parseNumber(gramsText)));
  const nutrients: Nutrients = useMemo(
    () => nutrientsForGrams(food, grams),
    [food, grams],
  );

  const rows: { label: string; value: string; color: string }[] = [
    {
      label: t('today.protein'),
      value: `${nutrients.proteinG} g`,
      color: colors.macroProtein,
    },
    { label: t('today.carbs'), value: `${nutrients.carbsG} g`, color: colors.macroCarbs },
    { label: t('today.fat'), value: `${nutrients.fatG} g`, color: colors.macroFat },
  ];
  if (nutrients.fiberG !== undefined) {
    rows.push({
      label: t('today.fiber'),
      value: `${nutrients.fiberG} g`,
      color: colors.macroFiber,
    });
  }

  const showsOrientativos =
    nutrients.sugarG !== undefined || nutrients.sodiumMg !== undefined;

  return (
    <ScrollView
      contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing['4xl'] }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ gap: spacing.xs }}>
        <Text variant="h2">{food.name}</Text>
        <Text variant="caption" color="muted">
          {t(MEAL_TYPE_KEYS[mealType])} · {food.servingLabel} ({food.servingGrams} g)
        </Text>
      </View>

      <Input
        label={t('log.grams')}
        value={gramsText}
        onChangeText={setGramsText}
        keyboardType="numeric"
        suffix="g"
        accessibilityLabel={t('log.grams')}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        <Chip
          label={`${food.servingGrams} g`}
          selected={grams === food.servingGrams}
          onPress={() => setGramsText(String(food.servingGrams))}
        />
        {QUICK_GRAMS.filter((value) => value !== food.servingGrams).map((value) => (
          <Chip
            key={value}
            label={`${value} g`}
            selected={grams === value}
            onPress={() => setGramsText(String(value))}
          />
        ))}
      </View>

      <Card style={{ gap: spacing.md }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          }}
        >
          <Text variant="label" color="muted">
            {t('today.calories')}
          </Text>
          <Text variant="h2">{nutrients.kcal} kcal</Text>
        </View>

        {rows.map((row) => (
          <View
            key={row.label}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: spacing.sm,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              {/* El punto de color acompaña al texto; nunca lo sustituye. */}
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: row.color,
                }}
              />
              <Text variant="body">{row.label}</Text>
            </View>
            <Text variant="numeric">{row.value}</Text>
          </View>
        ))}

        {showsOrientativos ? (
          <View style={{ gap: spacing.xs }}>
            {nutrients.sugarG !== undefined ? (
              <Text variant="caption" color="muted">
                {`${nutrients.sugarG} g`}
              </Text>
            ) : null}
            {nutrients.sodiumMg !== undefined ? (
              <Text variant="caption" color="muted">
                {`${nutrients.sodiumMg} mg Na`}
              </Text>
            ) : null}
            <Text variant="caption" color="muted">
              {t('disclaimer.estimate')}
            </Text>
          </View>
        ) : null}
      </Card>

      <Button
        label={t('common.add')}
        disabled={grams <= 0}
        onPress={() => onConfirm(grams)}
        accessibilityHint={`${food.name}, ${grams} g`}
      />
      <Button label={t('common.back')} variant="ghost" onPress={onBack} haptic={false} />
    </ScrollView>
  );
}

/* --------------------------------------------------------- alta manual */

interface ManualFormProps {
  onCreate: (food: Food) => void;
}

/**
 * Alta de un alimento que no está en el catálogo.
 * Solo se piden kcal y macros por 100 g: pedir micronutrientes daría una
 * sensación de precisión que el dato introducido a mano no tiene.
 */
function ManualForm({ onCreate }: ManualFormProps) {
  const { spacing } = useTheme();
  const [name, setName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const isValid = name.trim().length > 1 && parseNumber(kcal) > 0;

  const submit = () => {
    const food: Food = {
      id: manualFoodId(name),
      name: name.trim(),
      servingLabel: '100 g',
      servingGrams: 100,
      per100g: {
        kcal: Math.round(parseNumber(kcal)),
        proteinG: parseNumber(protein),
        carbsG: parseNumber(carbs),
        fatG: parseNumber(fat),
      },
      source: 'manual',
    };
    onCreate(food);
  };

  return (
    <ScrollView
      contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing['4xl'] }}
      keyboardShouldPersistTaps="handled"
    >
      <Input
        label={t('log.manual')}
        value={name}
        onChangeText={setName}
        autoCapitalize="sentences"
        accessibilityLabel={t('log.manual')}
      />
      <Input
        label={`${t('today.calories')} / 100 g`}
        value={kcal}
        onChangeText={setKcal}
        keyboardType="numeric"
        suffix="kcal"
      />
      <Input
        label={`${t('today.protein')} / 100 g`}
        value={protein}
        onChangeText={setProtein}
        keyboardType="numeric"
        suffix="g"
        hint={t('common.optional')}
      />
      <Input
        label={`${t('today.carbs')} / 100 g`}
        value={carbs}
        onChangeText={setCarbs}
        keyboardType="numeric"
        suffix="g"
        hint={t('common.optional')}
      />
      <Input
        label={`${t('today.fat')} / 100 g`}
        value={fat}
        onChangeText={setFat}
        keyboardType="numeric"
        suffix="g"
        hint={t('common.optional')}
      />

      <Text variant="caption" color="muted">
        {t('disclaimer.estimate')}
      </Text>

      <Button label={t('common.save')} disabled={!isValid} onPress={submit} />
    </ScrollView>
  );
}

/* ------------------------------------------------------------- pantalla */

/**
 * Hoja de añadir alimento.
 *
 * Cuatro caminos hacia lo mismo: buscar, recientes, favoritos o darlo de alta
 * a mano. Elegido el alimento, se ajustan los gramos con las cifras
 * recalculándose en vivo antes de confirmar.
 */
export default function AddMealScreen() {
  const { spacing } = useTheme();
  const params = useLocalSearchParams<{ mealType?: string; date?: string }>();

  const mealType: MealType = VALID_MEAL_TYPES.includes(params.mealType as MealType)
    ? (params.mealType as MealType)
    : 'breakfast';
  const dateKey = params.date ?? toDateKey();

  const [tab, setTab] = useState<Tab>('search');
  const [selected, setSelected] = useState<Food | null>(null);

  const addItem = useLogStore((state) => state.addItem);
  const addManualFood = useLogStore((state) => state.addManualFood);
  const toggleFavorite = useLogStore((state) => state.toggleFavorite);
  const recentFoodIds = useLogStore((state) => state.recentFoodIds);
  const favoriteFoodIds = useLogStore((state) => state.favoriteFoodIds);

  const search = useFoodSearch({ enabled: tab === 'search' });
  const recent = useFoodsByIds(recentFoodIds, { enabled: tab === 'recent' });
  const favorites = useFoodsByIds(favoriteFoodIds, { enabled: tab === 'favorites' });

  const confirm = useCallback(
    (grams: number) => {
      if (!selected) return;
      addItem(dateKey, mealType, selected, grams);
      router.back();
    },
    [addItem, dateKey, mealType, selected],
  );

  const handleManualCreate = useCallback(
    (food: Food) => {
      setSelected(addManualFood(food));
    },
    [addManualFood],
  );

  /* ---------------------------------------------------------- listados */

  const listData = tab === 'recent' ? recent.foods : tab === 'favorites' ? favorites.foods : search.items;
  const isListLoading =
    tab === 'search' ? search.status === 'loading' : tab === 'recent' ? recent.isLoading : favorites.isLoading;

  const renderList = () => {
    // LOADING
    if (isListLoading) {
      return (
        <View
          accessibilityLabel={t('common.loading')}
          style={{ gap: spacing.md, paddingTop: spacing.lg }}
        >
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <Skeleton key={row} height={44} />
          ))}
        </View>
      );
    }

    // ERROR (solo la búsqueda puede fallar: recientes y favoritos son locales)
    if (tab === 'search' && search.status === 'error') {
      return <ErrorState onRetry={search.retry} />;
    }

    // EMPTY
    if (listData.length === 0) {
      // En recientes y favoritos el vacío tiene salida: ir a buscar. En la
      // búsqueda no la hay, así que no se ofrece un botón que no lleva a nada.
      return tab === 'search' ? (
        <EmptyState />
      ) : (
        <EmptyState actionLabel={t('log.searchFood')} onAction={() => setTab('search')} />
      );
    }

    // SUCCESS
    return (
      <FlatList
        data={listData}
        keyExtractor={(food) => food.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing['4xl'] }}
        onEndReachedThreshold={0.5}
        onEndReached={tab === 'search' ? search.loadMore : undefined}
        renderItem={({ item }) => (
          <FoodRow
            food={item}
            isFavorite={favoriteFoodIds.includes(item.id)}
            onSelect={() => setSelected(item)}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        )}
        ListFooterComponent={
          tab === 'search' && search.isLoadingMore ? (
            <View style={{ paddingVertical: spacing.lg }}>
              <ActivityIndicator accessibilityLabel={t('common.loading')} />
            </View>
          ) : null
        }
      />
    );
  };

  /* ------------------------------------------------------------ render */

  return (
    <View style={{ flex: 1, paddingHorizontal: screenPadding, paddingTop: spacing.lg }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: spacing.lg,
        }}
      >
        <Text variant="h2">{t('log.addFood')}</Text>
        <Button
          label={t('common.cancel')}
          variant="ghost"
          size="md"
          fullWidth={false}
          haptic={false}
          onPress={() => router.back()}
        />
      </View>

      {selected ? (
        <FoodDetail
          food={selected}
          mealType={mealType}
          onBack={() => setSelected(null)}
          onConfirm={confirm}
        />
      ) : (
        <>
          {tab === 'search' ? (
            <View style={{ marginBottom: spacing.md }}>
              <Input
                value={search.query}
                onChangeText={search.setQuery}
                placeholder={t('log.searchFood')}
                accessibilityLabel={t('log.searchFood')}
                autoCorrect={false}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
            </View>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.md }}
            style={{ flexGrow: 0 }}
          >
            {TABS.map((entry) => (
              <Chip
                key={entry.id}
                label={t(entry.labelKey)}
                selected={tab === entry.id}
                onPress={() => setTab(entry.id)}
              />
            ))}
          </ScrollView>

          <View style={{ flex: 1 }}>
            {tab === 'manual' ? <ManualForm onCreate={handleManualCreate} /> : renderList()}
          </View>
        </>
      )}
    </View>
  );
}
