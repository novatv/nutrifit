import {
  clamp,
  cmToFeetInches,
  cmToInches,
  displayWeight,
  feetInchesToCm,
  kgToLb,
  lToMl,
  lbToKg,
  mlToL,
  normalizeMass,
  normalizeVolume,
  roundTo,
  roundToNearest,
  safeNumber,
} from '@/utils/units';

describe('conversión de peso kg/lb', () => {
  it('convierte kg a libras', () => {
    expect(roundTo(kgToLb(100), 2)).toBe(220.46);
    expect(roundTo(kgToLb(80), 1)).toBe(176.4);
  });

  it('convierte libras a kg', () => {
    expect(roundTo(lbToKg(220.46), 2)).toBe(100);
    expect(roundTo(lbToKg(150), 2)).toBe(68.04);
  });

  it('es reversible', () => {
    expect(roundTo(lbToKg(kgToLb(73.5)), 4)).toBe(73.5);
  });

  it('no devuelve NaN con entradas inválidas', () => {
    expect(kgToLb(Number.NaN)).toBe(0);
    expect(lbToKg(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe('conversión de altura cm/ft-in', () => {
  it('convierte cm a pulgadas', () => {
    expect(roundTo(cmToInches(180), 2)).toBe(70.87);
  });

  it('convierte cm a pies y pulgadas', () => {
    expect(cmToFeetInches(180)).toEqual({ feet: 5, inches: 11 });
    expect(cmToFeetInches(152.4)).toEqual({ feet: 5, inches: 0 });
  });

  it('sube un pie cuando el redondeo llega a 12 pulgadas', () => {
    // 182,7 cm ≈ 71,93" -> 5 pies y 12 pulgadas, que debe volverse 6'0".
    expect(cmToFeetInches(182.7)).toEqual({ feet: 6, inches: 0 });
  });

  it('vuelve a centímetros', () => {
    expect(roundTo(feetInchesToCm(5, 11), 1)).toBe(180.3);
  });
});

describe('volumen y normalización', () => {
  it('convierte ml y litros', () => {
    expect(mlToL(1500)).toBe(1.5);
    expect(lToMl(0.75)).toBe(750);
  });

  it('normaliza masa a kg por encima de 1000 g', () => {
    expect(normalizeMass(850)).toEqual({ value: 850, unit: 'g' });
    expect(normalizeMass(1250)).toEqual({ value: 1.25, unit: 'kg' });
  });

  it('normaliza volumen a litros por encima de 1000 ml', () => {
    expect(normalizeVolume(500)).toEqual({ value: 500, unit: 'ml' });
    expect(normalizeVolume(2400)).toEqual({ value: 2.4, unit: 'L' });
  });

  it('nunca devuelve cantidades negativas', () => {
    expect(normalizeMass(-50)).toEqual({ value: 0, unit: 'g' });
  });
});

describe('redondeos y acotado', () => {
  it('redondea a la decena', () => {
    expect(roundToNearest(2314, 10)).toBe(2310);
    expect(roundToNearest(2316, 10)).toBe(2320);
  });

  it('no divide entre cero si el paso es 0', () => {
    expect(roundToNearest(123, 0)).toBe(123);
  });

  it('acota valores', () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(Number.NaN, 1, 5)).toBe(1);
  });

  it('safeNumber neutraliza NaN e Infinity', () => {
    expect(safeNumber(Number.NaN)).toBe(0);
    expect(safeNumber(42)).toBe(42);
  });
});

describe('peso mostrado al usuario', () => {
  it('usa libras en sistema imperial', () => {
    expect(displayWeight(80, 'imperial')).toEqual({ value: 176.4, unit: 'lb' });
  });

  it('usa kg en sistema métrico', () => {
    expect(displayWeight(80.44, 'metric')).toEqual({ value: 80.4, unit: 'kg' });
  });
});
