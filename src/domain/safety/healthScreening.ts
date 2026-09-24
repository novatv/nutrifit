/**
 * Cribado de seguridad del perfil (paso 15 del onboarding).
 *
 * Esta app NO diagnostica ni trata nada. El cribado solo decide si el
 * generador automático puede seguir, si debe avisar, o si hay que mandar a la
 * persona a un profesional sanitario. Ante la duda, se es conservador.
 */

import type {
  SafetyFinding,
  SafetyResult,
  SafetyVerdict,
  UserProfile,
} from '@/types/domain';

/* ------------------------------------------------------------ constantes */

/** Edad mínima para generar planes automáticos de dieta y entrenamiento. */
export const MIN_AGE_YEARS = 18;

/**
 * Rangos humanos plausibles. Fuera de aquí el dato es un error de tecleo
 * (cm/pies confundidos, kg/lb confundidos) y calcular sería peligroso.
 */
export const PLAUSIBLE_RANGES = {
  heightCm: { min: 120, max: 250 },
  weightKg: { min: 30, max: 300 },
  ageYears: { min: 10, max: 100 },
} as const;

/** Severidad de cada veredicto: se queda siempre el más severo. */
const VERDICT_SEVERITY: Record<SafetyVerdict, number> = {
  ALLOW: 0,
  ALLOW_WITH_CAUTION: 1,
  REQUIRES_PROFESSIONAL_REVIEW: 2,
  BLOCK_AUTOMATED_PLAN: 3,
};

/* --------------------------------------------------------------- helpers */

/** Edad en años a partir de la fecha ISO de nacimiento. -1 si no es parseable. */
export function calculateAge(birthDate: string, now: Date = new Date()): number {
  const birth = new Date(birthDate);
  const time = birth.getTime();
  if (!Number.isFinite(time)) return -1;
  if (time > now.getTime()) return -1; // nacido en el futuro: dato inválido

  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

/** Devuelve el veredicto más severo de una lista de hallazgos. */
export function worstVerdict(findings: SafetyFinding[]): SafetyVerdict {
  return findings.reduce<SafetyVerdict>(
    (worst, f) =>
      VERDICT_SEVERITY[f.verdict] > VERDICT_SEVERITY[worst] ? f.verdict : worst,
    'ALLOW',
  );
}

/** Combina varios resultados de seguridad en uno, sin duplicar códigos. */
export function mergeSafetyResults(...results: SafetyResult[]): SafetyResult {
  const findings: SafetyFinding[] = [];
  const seen = new Set<string>();
  for (const result of results) {
    for (const finding of result.findings) {
      if (seen.has(finding.code)) continue;
      seen.add(finding.code);
      findings.push(finding);
    }
  }
  return { verdict: worstVerdict(findings), findings };
}

/** true si el veredicto permite generar un plan automático. */
export function canGenerateAutomatedPlan(result: SafetyResult): boolean {
  return result.verdict === 'ALLOW' || result.verdict === 'ALLOW_WITH_CAUTION';
}

/* ---------------------------------------------------------------- cribado */

/** true si altura, peso o edad están fuera del rango humano plausible. */
export function hasImplausibleInput(profile: UserProfile, now: Date = new Date()): boolean {
  const { heightCm, weightKg } = PLAUSIBLE_RANGES;
  const age = calculateAge(profile.birthDate, now);

  if (!Number.isFinite(profile.heightCm) || !Number.isFinite(profile.weightKg)) return true;
  if (profile.heightCm < heightCm.min || profile.heightCm > heightCm.max) return true;
  if (profile.weightKg < weightKg.min || profile.weightKg > weightKg.max) return true;
  if (age < 0 || age > PLAUSIBLE_RANGES.ageYears.max) return true;
  return false;
}

/**
 * Ejecuta el cribado completo del perfil.
 *
 * - Menor de 18 -> BLOCK_AUTOMATED_PLAN (no generamos planes a menores).
 * - Datos implausibles -> BLOCK_AUTOMATED_PLAN (no se calcula sobre basura).
 * - Embarazo/lactancia, TCA actual, terapia nutricional médica o ejercicio
 *   contraindicado -> REQUIRES_PROFESSIONAL_REVIEW.
 * - Lesión importante -> ALLOW_WITH_CAUTION.
 */
export function runSafetyScreening(profile: UserProfile, now: Date = new Date()): SafetyResult {
  const findings: SafetyFinding[] = [];

  if (hasImplausibleInput(profile, now)) {
    findings.push({
      code: 'IMPLAUSIBLE_INPUT',
      verdict: 'BLOCK_AUTOMATED_PLAN',
      messageKey: 'safety.implausibleInput',
    });
  }

  const age = calculateAge(profile.birthDate, now);
  if (age >= 0 && age < MIN_AGE_YEARS) {
    findings.push({
      code: 'UNDER_18',
      verdict: 'BLOCK_AUTOMATED_PLAN',
      messageKey: 'safety.under18',
    });
  }

  const screening = profile.screening;

  if (screening?.pregnantOrBreastfeeding) {
    findings.push({
      code: 'PREGNANCY_OR_BREASTFEEDING',
      verdict: 'REQUIRES_PROFESSIONAL_REVIEW',
      messageKey: 'safety.pregnancy',
    });
  }

  if (screening?.eatingDisorderCurrent) {
    findings.push({
      code: 'EATING_DISORDER',
      verdict: 'REQUIRES_PROFESSIONAL_REVIEW',
      messageKey: 'safety.eatingDisorder',
    });
  }

  if (screening?.medicalNutritionTherapy) {
    findings.push({
      code: 'MEDICAL_NUTRITION_THERAPY',
      verdict: 'REQUIRES_PROFESSIONAL_REVIEW',
      messageKey: 'safety.medicalNutrition',
    });
  }

  if (screening?.exerciseContraindicated) {
    findings.push({
      code: 'EXERCISE_CONTRAINDICATED',
      verdict: 'REQUIRES_PROFESSIONAL_REVIEW',
      messageKey: 'safety.exerciseContraindicated',
    });
  }

  if (screening?.majorInjury) {
    findings.push({
      code: 'MAJOR_INJURY',
      verdict: 'ALLOW_WITH_CAUTION',
      messageKey: 'safety.majorInjury',
    });
  }

  return { verdict: worstVerdict(findings), findings };
}
