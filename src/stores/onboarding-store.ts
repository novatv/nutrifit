/**
 * Estado del onboarding: el borrador del perfil y por qué paso vamos.
 *
 * Vive en memoria a propósito. Son datos de salud a medio contestar: mientras
 * no haya un perfil válido y una decisión de seguridad, no se persisten.
 * Cuando exista cuenta real, el perfil completo se guarda una sola vez al
 * final del flujo, no paso a paso.
 */

import { create } from 'zustand';

import {
  evaluateOnboardingSafety,
  validateStep,
  type OnboardingDraft,
  type OnboardingStepId,
  type SafetyGate,
  type StepValidation,
} from '@/features/onboarding/onboarding-schema';
import { TOTAL_STEPS } from '@/features/onboarding/steps';

/**
 * Borrador inicial.
 *
 * Las listas arrancan vacías para poder distinguir "no ha contestado" de
 * "ha contestado que ninguna". El sistema de unidades por defecto es métrico;
 * Ajustes lo cambia más adelante y el paso 3 se adapta solo.
 */
const EMPTY_DRAFT: OnboardingDraft = {
  equipment: [],
  allergens: [],
  dislikedFoods: [],
  unitSystem: 'metric',
};

export interface OnboardingStore {
  draft: OnboardingDraft;
  /** Paso visible, 1..16. */
  currentStep: number;
  /** Escribe un trozo del borrador; no valida, de eso se encarga el paso. */
  update: (patch: Partial<OnboardingDraft>) => void;
  setStep: (order: number) => void;
  /** Avanza y devuelve el paso al que hay que navegar. */
  next: () => number;
  /** Retrocede y devuelve el paso al que hay que navegar. */
  previous: () => number;
  reset: () => void;
}

const clampStep = (order: number): number =>
  Math.min(TOTAL_STEPS, Math.max(1, Math.trunc(order)));

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  draft: EMPTY_DRAFT,
  currentStep: 1,

  update: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),

  setStep: (order) => set({ currentStep: clampStep(order) }),

  next: () => {
    const target = clampStep(get().currentStep + 1);
    set({ currentStep: target });
    return target;
  },

  previous: () => {
    const target = clampStep(get().currentStep - 1);
    set({ currentStep: target });
    return target;
  },

  reset: () => set({ draft: EMPTY_DRAFT, currentStep: 1 }),
}));

/* ------------------------------------------------------------- selectores */

/** Validación del paso indicado contra el borrador actual. */
export function useStepValidation(stepId: OnboardingStepId): StepValidation {
  const draft = useOnboardingStore((state) => state.draft);
  return validateStep(stepId, draft);
}

/** Resultado del cribado de seguridad con lo contestado hasta ahora. */
export function useSafetyGate(): SafetyGate {
  const draft = useOnboardingStore((state) => state.draft);
  return evaluateOnboardingSafety(draft);
}
