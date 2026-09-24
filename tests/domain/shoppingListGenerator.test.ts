import {
  CATEGORY_ORDER,
  categorizeFood,
  generateShoppingList,
  isLiquid,
} from '@/domain/nutrition/shoppingListGenerator';
import { makeDay, makeMeal, makeMealItem } from './factories';

const week = [
  makeDay({
    dayIndex: 0,
    meals: [
      makeMeal({
        id: 'm1',
        items: [
          makeMealItem({ foodId: 'chicken', name: 'Pechuga de pollo', grams: 150 }),
          makeMealItem({ foodId: 'rice', name: 'Arroz blanco', grams: 80 }),
          makeMealItem({ foodId: 'broccoli', name: 'Brócoli', grams: 200 }),
        ],
      }),
    ],
  }),
  makeDay({
    dayIndex: 1,
    meals: [
      makeMeal({
        id: 'm2',
        items: [
          makeMealItem({ foodId: 'chicken', name: 'Pechuga de pollo', grams: 900 }),
          makeMealItem({ foodId: 'milk', name: 'Leche semidesnatada', grams: 1200 }),
          makeMealItem({ foodId: 'apple', name: 'Manzana', grams: 180 }),
          makeMealItem({ foodId: 'oil', name: 'Aceite de oliva', grams: 30 }),
          makeMealItem({ foodId: 'lentils', name: 'Lentejas', grams: 120 }),
          makeMealItem({ foodId: 'peas', name: 'Guisantes congelados', grams: 250 }),
        ],
      }),
    ],
  }),
];

describe('categorizeFood', () => {
  it('clasifica por nombre', () => {
    expect(categorizeFood('Manzana')).toBe('fruits');
    expect(categorizeFood('Brócoli')).toBe('vegetables');
    expect(categorizeFood('Pechuga de pollo')).toBe('meat_fish');
    expect(categorizeFood('Tofu firme')).toBe('plant_protein');
    expect(categorizeFood('Yogur natural')).toBe('dairy');
    expect(categorizeFood('Arroz blanco')).toBe('grains');
    expect(categorizeFood('Aceite de oliva')).toBe('pantry');
    expect(categorizeFood('Guisantes congelados')).toBe('frozen');
    expect(categorizeFood('Algo rarísimo')).toBe('other');
  });

  it('usa las etiquetas del catálogo si las hay', () => {
    expect(categorizeFood('Producto X', ['congelado'])).toBe('frozen');
  });

  it('detecta líquidos', () => {
    expect(isLiquid('Leche semidesnatada')).toBe(true);
    expect(isLiquid('Pechuga de pollo')).toBe(false);
  });
});

describe('generateShoppingList', () => {
  const list = generateShoppingList(week);
  const allItems = list.groups.flatMap((g) => g.items);

  it('combina el mismo ingrediente de varios días', () => {
    const chicken = allItems.find((i) => i.foodId === 'chicken');
    expect(chicken).toBeDefined();
    expect(chicken?.totalGrams).toBe(1050);
    // Ya en kg porque pasa de 1000 g.
    expect(chicken?.quantity).toBe(1.05);
    expect(chicken?.unit).toBe('kg');
  });

  it('normaliza los líquidos a litros', () => {
    const milk = allItems.find((i) => i.foodId === 'milk');
    expect(milk?.unit).toBe('L');
    expect(milk?.quantity).toBe(1.2);
  });

  it('mantiene gramos por debajo del kilo', () => {
    const apple = allItems.find((i) => i.foodId === 'apple');
    expect(apple).toEqual(
      expect.objectContaining({ quantity: 180, unit: 'g', category: 'fruits' }),
    );
  });

  it('agrupa por categoría y en el orden del supermercado', () => {
    const categories = list.groups.map((g) => g.category);
    const expectedOrder = CATEGORY_ORDER.filter((c) => categories.includes(c));

    expect(categories).toEqual(expectedOrder);
    expect(list.groups.every((g) => g.items.length > 0)).toBe(true);
    expect(list.groups.find((g) => g.category === 'frozen')?.items[0].name).toBe(
      'Guisantes congelados',
    );
  });

  it('usa claves i18n para los títulos de categoría', () => {
    for (const group of list.groups) {
      expect(group.labelKey).toBe(`shopping.category.${group.category}`);
    }
  });

  it('cuenta los ingredientes únicos', () => {
    expect(list.totalItems).toBe(8);
    expect(allItems).toHaveLength(8);
  });

  it('ignora cantidades nulas o negativas', () => {
    const noisy = [
      makeDay({
        meals: [
          makeMeal({
            items: [
              makeMealItem({ foodId: 'x', name: 'Cosa', grams: 0 }),
              makeMealItem({ foodId: 'y', name: 'Otra cosa', grams: -50 }),
            ],
          }),
        ],
      }),
    ];
    expect(generateShoppingList(noisy).totalItems).toBe(0);
  });

  it('no se rompe con una semana vacía', () => {
    expect(generateShoppingList([])).toEqual({ groups: [], totalItems: 0 });
  });
});
