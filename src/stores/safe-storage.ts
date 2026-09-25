import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/**
 * Almacenamiento tolerante al render en servidor.
 *
 * Para web, Expo Router renderiza primero en Node, donde no existe `window`.
 * AsyncStorage lo toca al escribir, así que sin esta guarda el proceso muere
 * con "window is not defined" antes de pintar nada. En ese entorno no hay
 * nada que persistir: se devuelve un almacén vacío y la app arranca con los
 * valores por defecto, que es justo lo que debe pasar en un render de servidor.
 */
const isBrowserLike = typeof window !== 'undefined';

const noopStorage = {
  getItem: async (): Promise<string | null> => null,
  setItem: async (): Promise<void> => {},
  removeItem: async (): Promise<void> => {},
};

export const safeStorage = isBrowserLike ? AsyncStorage : noopStorage;

/** Storage listo para `persist`. Un solo sitio para no repetir la guarda. */
export const persistStorage = () => createJSONStorage(() => safeStorage);
