import {
  MIN_AGE_YEARS,
  calculateAge,
  canGenerateAutomatedPlan,
  hasImplausibleInput,
  mergeSafetyResults,
  runSafetyScreening,
  worstVerdict,
} from '@/domain/safety/healthScreening';
import { NOW, makeProfile } from './factories';

describe('calculateAge', () => {
  it('calcula la edad con el cumpleaños ya pasado', () => {
    expect(calculateAge('1996-01-15', NOW)).toBe(30);
  });

  it('resta un año si el cumpleaños aún no ha llegado', () => {
    expect(calculateAge('1996-12-31', NOW)).toBe(29);
  });

  it('devuelve -1 con fechas inválidas o futuras', () => {
    expect(calculateAge('no-es-fecha', NOW)).toBe(-1);
    expect(calculateAge('2030-01-01', NOW)).toBe(-1);
  });
});

describe('runSafetyScreening', () => {
  it('permite un perfil adulto sano sin hallazgos', () => {
    const result = runSafetyScreening(makeProfile(), NOW);
    expect(result.verdict).toBe('ALLOW');
    expect(result.findings).toHaveLength(0);
    expect(canGenerateAutomatedPlan(result)).toBe(true);
  });

  it('bloquea a menores de 18', () => {
    const profile = makeProfile({ birthDate: '2012-05-10', weightKg: 55, heightCm: 165 });
    const result = runSafetyScreening(profile, NOW);

    expect(calculateAge(profile.birthDate, NOW)).toBeLessThan(MIN_AGE_YEARS);
    expect(result.verdict).toBe('BLOCK_AUTOMATED_PLAN');
    expect(result.findings.map((f) => f.code)).toContain('UNDER_18');
    expect(result.findings.find((f) => f.code === 'UNDER_18')?.messageKey).toBe(
      'safety.under18',
    );
    expect(canGenerateAutomatedPlan(result)).toBe(false);
  });

  it('manda a revisión profesional si hay embarazo o lactancia', () => {
    const profile = makeProfile({
      sex: 'female',
      screening: { ...makeProfile().screening, pregnantOrBreastfeeding: true },
    });
    const result = runSafetyScreening(profile, NOW);

    expect(result.verdict).toBe('REQUIRES_PROFESSIONAL_REVIEW');
    expect(result.findings.map((f) => f.code)).toContain('PREGNANCY_OR_BREASTFEEDING');
    expect(result.findings[0].messageKey).toBe('safety.pregnancy');
    expect(canGenerateAutomatedPlan(result)).toBe(false);
  });

  it('manda a revisión profesional con TCA actual, terapia médica o ejercicio contraindicado', () => {
    const cases = [
      ['eatingDisorderCurrent', 'EATING_DISORDER', 'safety.eatingDisorder'],
      ['medicalNutritionTherapy', 'MEDICAL_NUTRITION_THERAPY', 'safety.medicalNutrition'],
      ['exerciseContraindicated', 'EXERCISE_CONTRAINDICATED', 'safety.exerciseContraindicated'],
    ] as const;

    for (const [flag, code, messageKey] of cases) {
      const profile = makeProfile({
        screening: { ...makeProfile().screening, [flag]: true },
      });
      const result = runSafetyScreening(profile, NOW);

      expect(result.verdict).toBe('REQUIRES_PROFESSIONAL_REVIEW');
      expect(result.findings.find((f) => f.code === code)?.messageKey).toBe(messageKey);
    }
  });

  it('permite con precaución si hay lesión importante', () => {
    const profile = makeProfile({
      screening: { ...makeProfile().screening, majorInjury: true },
    });
    const result = runSafetyScreening(profile, NOW);

    expect(result.verdict).toBe('ALLOW_WITH_CAUTION');
    expect(result.findings[0].code).toBe('MAJOR_INJURY');
    expect(canGenerateAutomatedPlan(result)).toBe(true);
  });

  it('bloquea entradas implausibles', () => {
    const tooTall = makeProfile({ heightCm: 400 });
    const tooLight = makeProfile({ weightKg: 12 });

    expect(hasImplausibleInput(tooTall, NOW)).toBe(true);
    expect(hasImplausibleInput(tooLight, NOW)).toBe(true);
    expect(runSafetyScreening(tooTall, NOW).findings[0].code).toBe('IMPLAUSIBLE_INPUT');
    expect(runSafetyScreening(tooLight, NOW).verdict).toBe('BLOCK_AUTOMATED_PLAN');
  });

  it('se queda con el veredicto más severo cuando hay varios hallazgos', () => {
    const profile = makeProfile({
      birthDate: '2012-05-10',
      screening: { ...makeProfile().screening, majorInjury: true },
    });
    expect(runSafetyScreening(profile, NOW).verdict).toBe('BLOCK_AUTOMATED_PLAN');
  });
});

describe('utilidades de veredicto', () => {
  it('worstVerdict devuelve ALLOW sin hallazgos', () => {
    expect(worstVerdict([])).toBe('ALLOW');
  });

  it('mergeSafetyResults no duplica códigos', () => {
    const a = runSafetyScreening(
      makeProfile({ screening: { ...makeProfile().screening, majorInjury: true } }),
      NOW,
    );
    const merged = mergeSafetyResults(a, a);
    expect(merged.findings).toHaveLength(1);
    expect(merged.verdict).toBe('ALLOW_WITH_CAUTION');
  });
});
