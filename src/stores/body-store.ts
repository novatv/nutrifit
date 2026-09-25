import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { BODY_MEASURES, type BodyCheck } from '@/domain/progress/bodyMonitorEngine';
import { persistStorage } from '@/stores/safe-storage';

/**
 * Registros semanales de figura (peso y perímetros, con foto opcional).
 *
 * Se persisten en el dispositivo: sin historial no hay tendencia y el valor de
 * la función está justamente en comparar semanas. Con sesión, además se
 * sincronizan con `body_measurements` (una fila por día, RLS por usuario).
 */
export interface BodyState {
  checks: BodyCheck[];
  /** Guarda o sustituye el registro de ese día. Devuelve false si venía vacío. */
  upsert(check: BodyCheck): boolean;
  remove(date: string): void;
  reset(): void;
}

/** Un registro sin ninguna medida no aporta nada y no se guarda. */
export function hasAnyMeasure(check: BodyCheck): boolean {
  return BODY_MEASURES.some((m) => typeof check[m] === 'number') || Boolean(check.photoId);
}

export const useBodyStore = create<BodyState>()(
  persist(
    (set) => ({
      checks: [],

      upsert(check) {
        if (!hasAnyMeasure(check)) return false;
        set((state) => ({
          checks: [...state.checks.filter((c) => c.date !== check.date), check].sort((a, b) =>
            a.date.localeCompare(b.date),
          ),
        }));
        return true;
      },

      remove: (date) => set((state) => ({ checks: state.checks.filter((c) => c.date !== date) })),

      reset: () => set({ checks: [] }),
    }),
    {
      name: 'nutrifit.body',
      storage: persistStorage(),
      partialize: (state) => ({ checks: state.checks }),
    },
  ),
);

export const useBodyChecks = (): BodyCheck[] => useBodyStore((s) => s.checks);
