import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { deletePhoto, type PhotoKind, type StoredPhoto } from '@/services/photo-storage';
import { persistStorage } from '@/stores/safe-storage';

/**
 * Índice de fotos del usuario: progreso corporal y comidas.
 *
 * Las fotos viven en el bucket privado (o en local en demo); aquí solo se
 * guarda el índice para poder volver a verlas. Borrar es definitivo y se
 * refleja al instante.
 */
export interface PhotosState {
  photos: StoredPhoto[];
  add(photo: StoredPhoto): void;
  remove(id: string): Promise<void>;
  reset(): void;
}

export const usePhotosStore = create<PhotosState>()(
  persist(
    (set, get) => ({
      photos: [],

      add: (photo) =>
        set((state) => ({
          // Más reciente primero: es lo que se quiere ver al abrir la galería.
          photos: [photo, ...state.photos.filter((p) => p.id !== photo.id)],
        })),

      async remove(id) {
        const photo = get().photos.find((p) => p.id === id);
        if (!photo) return;
        const ok = await deletePhoto(photo.uri);
        if (ok) set((state) => ({ photos: state.photos.filter((p) => p.id !== id) }));
      },

      reset: () => set({ photos: [] }),
    }),
    {
      name: 'nutrifit.photos',
      storage: persistStorage(),
      partialize: (state) => ({ photos: state.photos }),
    },
  ),
);

const EMPTY: StoredPhoto[] = [];

export function usePhotosOfKind(kind: PhotoKind): StoredPhoto[] {
  const photos = usePhotosStore((s) => s.photos);
  const filtered = photos.filter((p) => p.kind === kind);
  return filtered.length === 0 ? EMPTY : filtered;
}
