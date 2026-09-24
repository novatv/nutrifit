import {
  findSubstitutes,
  hasAllergen,
  isDisliked,
  kcalForGrams,
  matchesDiet,
  scaleToMatchKcal,
  similarityScore,
} from '@/domain/nutrition/foodSubstitutions';
import { makeFood } from './factories';

const chicken = makeFood({
  id: 'chicken',
  name: 'Pechuga de pollo',
  servingGrams: 150,
  per100g: { kcal: 165, proteinG: 31, carbsG: 0, fatG: 3.6 },
  tags: ['carne', 'proteina'],
  allergens: [],
  dietPatterns: ['omnivore', 'pescatarian'],
});

const catalog = [
  chicken,
  makeFood({
    id: 'turkey',
    name: 'Pechuga de pavo',
    servingGrams: 150,
    per100g: { kcal: 157, proteinG: 29, carbsG: 0, fatG: 3.2 },
    tags: ['carne', 'proteina'],
    allergens: [],
    dietPatterns: ['omnivore', 'pescatarian'],
  }),
  makeFood({
    id: 'shrimp',
    name: 'Gambas',
    servingGrams: 120,
    per100g: { kcal: 99, proteinG: 24, carbsG: 0, fatG: 0.3 },
    tags: ['pescado', 'proteina'],
    allergens: ['shellfish'],
    dietPatterns: ['omnivore', 'pescatarian'],
  }),
  makeFood({
    id: 'tofu',
    name: 'Tofu firme',
    servingGrams: 150,
    per100g: { kcal: 144, proteinG: 17, carbsG: 3, fatG: 9 },
    tags: ['proteina', 'vegetal'],
    allergens: ['soy'],
    dietPatterns: ['omnivore', 'vegetarian', 'vegan', 'pescatarian'],
  }),
  makeFood({
    id: 'lentils',
    name: 'Lentejas cocidas',
    servingGrams: 200,
    per100g: { kcal: 116, proteinG: 9, carbsG: 20, fatG: 0.4 },
    tags: ['legumbre', 'proteina', 'vegetal'],
    allergens: [],
    dietPatterns: ['omnivore', 'vegetarian', 'vegan', 'pescatarian'],
  }),
  makeFood({
    id: 'rice',
    name: 'Arroz blanco cocido',
    servingGrams: 150,
    per100g: { kcal: 130, proteinG: 2.7, carbsG: 28, fatG: 0.3 },
    tags: ['cereal'],
    allergens: [],
    dietPatterns: ['omnivore', 'vegetarian', 'vegan', 'pescatarian'],
  }),
];

describe('scaleToMatchKcal', () => {
  it('recalcula los gramos para igualar las kcal', () => {
    // 150 g de pollo = 248 kcal; el tofu tiene 144 kcal/100 g -> ~172 g.
    const targetKcal = kcalForGrams(chicken, chicken.servingGrams);
    const tofu = catalog.find((f) => f.id === 'tofu')!;

    expect(targetKcal).toBe(248);
    expect(scaleToMatchKcal(tofu, targetKcal)).toBe(172);
    expect(kcalForGrams(tofu, scaleToMatchKcal(tofu, targetKcal))).toBe(248);
  });

  it('no divide entre cero con alimentos sin energía', () => {
    const water = makeFood({
      id: 'water',
      name: 'Agua',
      per100g: { kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 },
    });
    expect(scaleToMatchKcal(water, 200)).toBe(0);
  });
});

describe('filtros', () => {
  it('detecta alérgenos declarados', () => {
    const shrimp = catalog.find((f) => f.id === 'shrimp')!;
    expect(hasAllergen(shrimp, ['shellfish'])).toBe(true);
    expect(hasAllergen(shrimp, ['gluten'])).toBe(false);
    expect(hasAllergen(shrimp, [])).toBe(false);
  });

  it('respeta el patrón dietético', () => {
    expect(matchesDiet(chicken, 'vegan')).toBe(false);
    expect(matchesDiet(catalog.find((f) => f.id === 'tofu')!, 'vegan')).toBe(true);
  });

  it('detecta alimentos rechazados ignorando tildes y mayúsculas', () => {
    expect(isDisliked(makeFood({ name: 'Brócoli' }), ['BROCOLI'])).toBe(true);
  });
});

describe('findSubstitutes', () => {
  it('NUNCA propone un alimento con un alérgeno declarado', () => {
    const result = findSubstitutes(chicken, catalog, {
      diet: 'pescatarian',
      allergens: ['shellfish', 'soy'],
    });

    const ids = result.map((s) => s.food.id);
    expect(ids).not.toContain('shrimp');
    expect(ids).not.toContain('tofu');
    expect(ids).toContain('turkey');
  });

  it('ordena por parecido: el pavo antes que el arroz', () => {
    const result = findSubstitutes(chicken, catalog, { diet: 'omnivore', allergens: [] });
    expect(result[0].food.id).toBe('turkey');
    expect(similarityScore(chicken, catalog.find((f) => f.id === 'turkey')!)).toBeGreaterThan(
      similarityScore(chicken, catalog.find((f) => f.id === 'rice')!),
    );
  });

  it('devuelve gramos que igualan las kcal del original', () => {
    const result = findSubstitutes(chicken, catalog, { diet: 'omnivore', allergens: [] });
    for (const suggestion of result) {
      expect(kcalForGrams(suggestion.food, suggestion.grams)).toBeCloseTo(248, -1);
    }
  });

  it('filtra por dieta vegana y excluye el propio alimento', () => {
    const result = findSubstitutes(chicken, catalog, { diet: 'vegan', allergens: [] });
    const ids = result.map((s) => s.food.id);

    expect(ids).not.toContain('chicken');
    expect(ids).not.toContain('turkey');
    expect(ids).toEqual(expect.arrayContaining(['tofu', 'lentils']));
  });

  it('respeta alimentos excluidos, rechazados y el límite', () => {
    const result = findSubstitutes(chicken, catalog, {
      diet: 'omnivore',
      allergens: [],
      dislikedFoods: ['pavo'],
      excludedFoodIds: ['rice'],
      limit: 2,
    });
    const ids = result.map((s) => s.food.id);

    expect(result.length).toBeLessThanOrEqual(2);
    expect(ids).not.toContain('turkey');
    expect(ids).not.toContain('rice');
  });

  it('devuelve [] con catálogo vacío', () => {
    expect(findSubstitutes(chicken, [], { diet: 'omnivore', allergens: [] })).toEqual([]);
  });
});
