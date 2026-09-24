import { adherence, averageAdherence, movingAverage, weightTrend } from '@/utils/trends';

describe('movingAverage', () => {
  it('usa ventana parcial al principio de la serie', () => {
    expect(movingAverage([1, 2, 3, 4], 2)).toEqual([1, 1.5, 2.5, 3.5]);
  });

  it('suaviza el ruido de una serie de pesos', () => {
    const values = [80, 80.8, 79.6, 80.2, 79.4];
    const smoothed = movingAverage(values, 3);
    expect(smoothed).toHaveLength(values.length);
    // El último valor suavizado está entre el mínimo y el máximo de su ventana.
    expect(smoothed[4]).toBeGreaterThan(79.4);
    expect(smoothed[4]).toBeLessThan(80.2);
  });

  it('devuelve [] con entradas vacías o ventana inválida', () => {
    expect(movingAverage([], 3)).toEqual([]);
    expect(movingAverage([1, 2, 3], 0)).toEqual([]);
    expect(movingAverage([1, 2, 3], -5)).toEqual([]);
  });
});

describe('weightTrend con datos ruidosos', () => {
  it('detecta la bajada real pese a las oscilaciones diarias', () => {
    // Tendencia real: -0,5 kg por semana, con ruido de agua de +/- 0,4 kg.
    const points = [
      { date: '2026-09-01', weightKg: 80.0 },
      { date: '2026-09-02', weightKg: 80.4 },
      { date: '2026-09-03', weightKg: 79.7 },
      { date: '2026-09-08', weightKg: 79.6 },
      { date: '2026-09-09', weightKg: 79.9 },
      { date: '2026-09-15', weightKg: 79.0 },
      { date: '2026-09-16', weightKg: 79.3 },
      { date: '2026-09-22', weightKg: 78.6 },
    ];
    const trend = weightTrend(points);

    expect(trend.kgPerWeek).toBeLessThan(0);
    expect(trend.kgPerWeek).toBeGreaterThan(-0.9);
    expect(trend.kgPerWeek).toBeLessThan(-0.2);
    expect(trend.sampleSize).toBe(8);
    expect(trend.reliable).toBe(true);
  });

  it('marca como no fiable una serie corta', () => {
    const trend = weightTrend([
      { date: '2026-09-01', weightKg: 80 },
      { date: '2026-09-03', weightKg: 79 },
    ]);
    expect(trend.reliable).toBe(false);
  });

  it('devuelve 0 sin datos, con un solo punto o con todo el mismo día', () => {
    expect(weightTrend([]).kgPerWeek).toBe(0);
    expect(weightTrend([{ date: '2026-09-01', weightKg: 80 }]).kgPerWeek).toBe(0);
    expect(
      weightTrend([
        { date: '2026-09-01', weightKg: 80 },
        { date: '2026-09-01', weightKg: 81 },
      ]).kgPerWeek,
    ).toBe(0);
  });

  it('ignora puntos con fecha o peso inválidos', () => {
    const trend = weightTrend([
      { date: 'no-es-una-fecha', weightKg: 80 },
      { date: '2026-09-01', weightKg: 0 },
      { date: '2026-09-02', weightKg: 80 },
      { date: '2026-09-09', weightKg: 79 },
    ]);
    expect(trend.sampleSize).toBe(2);
    expect(trend.kgPerWeek).toBeCloseTo(-1, 2);
  });
});

describe('adherence', () => {
  it('calcula la fracción completada', () => {
    expect(adherence(3, 4)).toBe(0.75);
  });

  it('nunca divide entre cero', () => {
    expect(adherence(3, 0)).toBe(0);
    expect(adherence(3, -2)).toBe(0);
    expect(Number.isNaN(adherence(0, 0))).toBe(false);
  });

  it('no pasa de 1 aunque se haga de más', () => {
    expect(adherence(6, 4)).toBe(1);
  });

  it('promedia varias semanas', () => {
    expect(averageAdherence([1, 0.5, 0])).toBeCloseTo(0.5, 5);
    expect(averageAdherence([])).toBe(0);
  });
});
