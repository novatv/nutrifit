import {
  MEAL_SCORE_WEIGHTS,
  mealHasDislikedFood,
  rankMeals,
  scoreMeal,
  scoreMealBreakdown,
  type MealScoringContext,
} from '@/domain/nutrition/mealScoring';
import { makeMeal, makeMealItem, makeNutrients } from './factories';

const context: MealScoringContext = {
  targetKcal: 600,
  targetProteinG: 45,
  budget: 'medium',
  cookingTime: 'normal',
};

describe('scoreMeal', () => {
  it('devuelve siempre un número entre 0 y 1', () => {
    const meals = [
      makeMeal(),
      makeMeal({ nutrients: makeNutrients({ kcal: 0, proteinG: 0, carbsG: 0, fatG: 0 }) }),
      makeMeal({ nutrients: makeNutrients({ kcal: 5000, proteinG: 300, carbsG: 0, fatG: 0 }) }),
    ];
    for (const meal of meals) {
      const score = scoreMeal(meal, context);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    }
  });

  it('puntúa alto una comida que encaja con los objetivos', () => {
    expect(scoreMeal(makeMeal(), context)).toBeGreaterThan(0.9);
  });

  it('NO premia saltarse comidas: una comida casi vacía puntúa muy bajo', () => {
    const skipped = makeMeal({
      nutrients: makeNutrients({ kcal: 40, proteinG: 2, carbsG: 5, fatG: 1 }),
    });
    const complete = makeMeal();

    expect(scoreMeal(skipped, context)).toBeLessThan(scoreMeal(complete, context));
    expect(scoreMealBreakdown(skipped, context).kcalFit).toBe(0);
  });

  it('penaliza igual quedarse corto que pasarse de kcal', () => {
    const under = makeMeal({ nutrients: makeNutrients({ kcal: 480, proteinG: 45 }) });
    const over = makeMeal({ nutrients: makeNutrients({ kcal: 720, proteinG: 45 }) });

    expect(scoreMealBreakdown(under, context).kcalFit).toBeCloseTo(
      scoreMealBreakdown(over, context).kcalFit,
      5,
    );
  });

  it('penaliza repetir la misma comida', () => {
    const meal = makeMeal();
    const fresh = scoreMeal(meal, context);
    const repeated = scoreMeal(meal, { ...context, recentMealKeys: [meal.id, meal.id] });

    expect(repeated).toBeLessThan(fresh);
    expect(fresh - repeated).toBeLessThanOrEqual(MEAL_SCORE_WEIGHTS.variety + 1e-9);
  });

  it('penaliza tardar más de lo que la persona quiere cocinar', () => {
    const slow = makeMeal({ prepMinutes: 90 });
    expect(scoreMeal(slow, { ...context, cookingTime: 'minimal' })).toBeLessThan(
      scoreMeal(slow, { ...context, cookingTime: 'enjoys' }),
    );
  });

  it('penaliza pasarse del presupuesto y es neutro si no se conoce el coste', () => {
    const meal = makeMeal();
    const cheap = scoreMeal(meal, { ...context, budget: 'low', estimatedCostEur: 2 });
    const pricey = scoreMeal(meal, { ...context, budget: 'low', estimatedCostEur: 6 });
    const unknown = scoreMeal(meal, { ...context, budget: 'low' });

    expect(pricey).toBeLessThan(cheap);
    expect(unknown).toBe(cheap);
  });

  it('descarta una comida con un alimento rechazado', () => {
    const meal = makeMeal({
      items: [makeMealItem({ name: 'Brócoli al vapor' })],
    });
    expect(mealHasDislikedFood(meal, ['brocoli'])).toBe(true);
    expect(scoreMeal(meal, { ...context, dislikedFoods: ['brócoli'] })).toBe(0);
  });

  it('no penaliza si no hay objetivo definido', () => {
    const neutral = scoreMealBreakdown(makeMeal(), {
      ...context,
      targetKcal: 0,
      targetProteinG: 0,
    });
    expect(neutral.kcalFit).toBe(1);
    expect(neutral.proteinFit).toBe(1);
  });
});

describe('rankMeals', () => {
  it('ordena de mejor a peor sin mutar la entrada', () => {
    const good = makeMeal({ id: 'a' });
    const bad = makeMeal({
      id: 'b',
      nutrients: makeNutrients({ kcal: 100, proteinG: 3, carbsG: 10, fatG: 2 }),
    });
    const input = [bad, good];
    const ranked = rankMeals(input, context);

    expect(ranked[0].meal.id).toBe('a');
    expect(input[0].id).toBe('b');
  });
});
