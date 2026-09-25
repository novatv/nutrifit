import {
  buildBodyReport,
  computeDeltas,
  supplementsAllowed,
  type BodyCheck,
} from '@/domain/progress/bodyMonitorEngine';
import type { HealthScreening } from '@/types/domain';

const clean: HealthScreening = {
  pregnantOrBreastfeeding: false,
  eatingDisorderCurrent: false,
  majorInjury: false,
  medicalNutritionTherapy: false,
  exerciseContraindicated: false,
};

const check = (date: string, weightKg: number, waistCm?: number, extra: Partial<BodyCheck> = {}): BodyCheck => ({
  date,
  weightKg,
  waistCm,
  ...extra,
});

describe('monitoreo de figura', () => {
  it('con un solo registro no concluye nada', () => {
    const r = buildBodyReport({ checks: [check('2026-09-01', 80)], goal: 'lose_fat', screening: clean });
    expect(r.trend).toBe('insufficient');
    expect(r.guidelineKeys).toEqual(['body.guideline.keepMeasuring']);
    expect(r.supplementKeys).toEqual([]);
  });

  it('dos registros a menos de 7 días tampoco cuentan', () => {
    const r = buildBodyReport({
      checks: [check('2026-09-01', 80), check('2026-09-04', 79)],
      goal: 'lose_fat',
      screening: clean,
    });
    expect(r.trend).toBe('insufficient');
  });

  it('perder grasa a ritmo razonable va en camino', () => {
    const r = buildBodyReport({
      checks: [check('2026-08-01', 90, 95), check('2026-08-29', 88, 93)],
      goal: 'lose_fat',
      screening: clean,
    });
    expect(r.trend).toBe('on_track');
    expect(r.weeks).toBe(4);
    expect(r.guidelineKeys).toContain('body.guideline.keepGoing');
    expect(r.supplementKeys).toContain('body.supplement.protein');
  });

  it('perder más del 1 % semanal es demasiado rápido y se avisa', () => {
    const r = buildBodyReport({
      checks: [check('2026-08-01', 90), check('2026-08-29', 84)],
      goal: 'lose_fat',
      screening: clean,
    });
    expect(r.trend).toBe('too_fast');
    expect(r.cautionKeys).toContain('body.caution.tooFast');
    expect(r.guidelineKeys).toContain('body.guideline.slowDown');
  });

  it('peso y cintura planos al perder grasa es estancamiento', () => {
    const r = buildBodyReport({
      checks: [check('2026-08-01', 90, 95), check('2026-08-29', 89.9, 95)],
      goal: 'lose_fat',
      screening: clean,
    });
    expect(r.trend).toBe('stalled');
    expect(r.guidelineKeys).toContain('body.guideline.checkPortions');
  });

  it('la cintura que baja cuenta como progreso aunque el peso no se mueva', () => {
    const r = buildBodyReport({
      checks: [check('2026-08-01', 90, 95), check('2026-08-29', 90, 93)],
      goal: 'lose_fat',
      screening: clean,
    });
    expect(r.trend).toBe('on_track');
  });

  it('ganar músculo: brazo que crece con peso estable va en camino', () => {
    const r = buildBodyReport({
      checks: [check('2026-08-01', 70, 80, { armCm: 34 }), check('2026-08-29', 70.5, 80, { armCm: 34.6 })],
      goal: 'gain_muscle',
      screening: clean,
    });
    expect(r.trend).toBe('on_track');
    expect(r.supplementKeys).toContain('body.supplement.creatine');
  });

  it('ganar músculo con la cintura disparada se desvía', () => {
    const r = buildBodyReport({
      checks: [check('2026-08-01', 70, 80), check('2026-08-29', 71, 83)],
      goal: 'gain_muscle',
      screening: clean,
    });
    expect(r.trend).toBe('off_track');
  });

  it('mantener: ±1 % en un mes es estar en camino', () => {
    const ok = buildBodyReport({
      checks: [check('2026-08-01', 70), check('2026-08-29', 70.5)],
      goal: 'maintain',
      screening: clean,
    });
    const drift = buildBodyReport({
      checks: [check('2026-08-01', 70), check('2026-08-29', 72)],
      goal: 'maintain',
      screening: clean,
    });
    expect(ok.trend).toBe('on_track');
    expect(drift.trend).toBe('off_track');
  });

  it('elige como base el registro más cercano a la ventana', () => {
    const r = buildBodyReport({
      checks: [
        check('2026-06-01', 100),
        check('2026-08-01', 90),
        check('2026-08-22', 89),
        check('2026-08-29', 88.5),
      ],
      goal: 'lose_fat',
      screening: clean,
    });
    expect(r.weeks).toBe(4);
    expect(r.deltas.find((d) => d.measure === 'weightKg')?.from).toBe(90);
  });

  it('sin suplementos con embarazo, TCA o terapia médica', () => {
    for (const flag of ['pregnantOrBreastfeeding', 'eatingDisorderCurrent', 'medicalNutritionTherapy'] as const) {
      const screening = { ...clean, [flag]: true };
      expect(supplementsAllowed(screening)).toBe(false);
      const r = buildBodyReport({
        checks: [check('2026-08-01', 90, 95), check('2026-08-29', 88, 93)],
        goal: 'lose_fat',
        screening,
      });
      expect(r.supplementKeys).toEqual([]);
      expect(r.cautionKeys).toContain('body.caution.noSupplements');
    }
    expect(supplementsAllowed({ ...clean, majorInjury: true })).toBe(true);
  });

  it('siempre recuerda que no es consejo médico', () => {
    const r = buildBodyReport({
      checks: [check('2026-08-01', 90), check('2026-08-29', 89)],
      goal: 'lose_fat',
      screening: clean,
    });
    expect(r.cautionKeys[0]).toBe('body.caution.notMedical');
  });

  it('los deltas solo incluyen medidas presentes en ambos registros', () => {
    const d = computeDeltas(check('2026-08-01', 90, 95), check('2026-08-15', 89, undefined, { armCm: 35 }));
    expect(d.map((x) => x.measure)).toEqual(['weightKg']);
    expect(d[0]).toEqual({ measure: 'weightKg', from: 90, to: 89, delta: -1, perWeek: -0.5 });
  });

  it('es determinista', () => {
    const input = {
      checks: [check('2026-08-01', 90, 95), check('2026-08-29', 88, 93)],
      goal: 'lose_fat' as const,
      screening: clean,
    };
    expect(buildBodyReport(input)).toEqual(buildBodyReport(input));
  });
});
