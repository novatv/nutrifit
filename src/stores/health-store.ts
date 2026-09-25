import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { logger } from '@/services/logger';
import { resolveHealthProvider, type DailyHealth, type HealthSource } from '@/services/health';
import { persistStorage } from '@/stores/safe-storage';

/**
 * Estado de la conexión con el reloj.
 *
 * Se persiste la preferencia (conectado o no) y la última copia de los días
 * leídos, para que Hoy y Progreso pinten algo aunque la sincronización de
 * turno falle. Los datos se leen del sistema de salud; aquí no se escribe nada.
 */
export type HealthStatus = 'idle' | 'connecting' | 'syncing' | 'connected' | 'unavailable' | 'denied' | 'error';

export interface HealthState {
  status: HealthStatus;
  source: HealthSource;
  connected: boolean;
  lastSyncAt: string | null;
  days: Record<string, DailyHealth>;
  latestWeight: { kg: number; date: string } | null;

  connect(): Promise<boolean>;
  disconnect(): void;
  /** Lee los últimos `daysBack` días (por defecto 28). */
  sync(daysBack?: number): Promise<void>;
}

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      source: 'none',
      connected: false,
      lastSyncAt: null,
      days: {},
      latestWeight: null,

      async connect() {
        set({ status: 'connecting' });
        const provider = await resolveHealthProvider();
        if (!provider) {
          set({ status: 'unavailable', connected: false, source: 'none' });
          return false;
        }
        const granted = await provider.requestAccess();
        if (!granted) {
          set({ status: 'denied', connected: false, source: provider.source });
          return false;
        }
        set({ status: 'connected', connected: true, source: provider.source });
        await get().sync();
        return true;
      },

      disconnect() {
        // Los permisos se revocan desde Ajustes del sistema; aquí solo se deja de leer.
        set({ status: 'idle', connected: false, source: 'none', days: {}, lastSyncAt: null, latestWeight: null });
      },

      async sync(daysBack = 28) {
        if (!get().connected) return;
        const provider = await resolveHealthProvider();
        if (!provider) {
          set({ status: 'unavailable' });
          return;
        }
        set({ status: 'syncing' });
        try {
          const to = new Date();
          const from = new Date();
          from.setDate(to.getDate() - (daysBack - 1));
          const list = await provider.readDays(isoDay(from), isoDay(to));
          const days = { ...get().days };
          for (const d of list) days[d.date] = d;
          const latestWeight = (await provider.latestWeightKg()) ?? get().latestWeight;
          set({ days, latestWeight, lastSyncAt: new Date().toISOString(), status: 'connected', source: provider.source });
        } catch (error) {
          logger.error('Sincronización de salud fallida', error);
          set({ status: 'error' });
        }
      },
    }),
    {
      name: 'nutrifit.health',
      storage: persistStorage(),
      partialize: (s) => ({
        connected: s.connected,
        source: s.source,
        lastSyncAt: s.lastSyncAt,
        days: s.days,
        latestWeight: s.latestWeight,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.connected) useHealthStore.setState({ status: 'connected' });
      },
    },
  ),
);

const EMPTY: DailyHealth[] = [];

export function useHealthDays(): DailyHealth[] {
  const days = useHealthStore((s) => s.days);
  const list = Object.values(days);
  return list.length === 0 ? EMPTY : list;
}

export const useHealthConnected = (): boolean => useHealthStore((s) => s.connected);
