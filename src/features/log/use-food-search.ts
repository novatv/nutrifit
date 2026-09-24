/**
 * Búsqueda de alimentos con TanStack Query.
 *
 * Responsabilidades:
 * - Antirrebote del texto para no lanzar una consulta por pulsación.
 * - Paginación incremental (el catálogo tiene cientos de entradas).
 * - Un único `status` explícito para que la pantalla no tenga que deducir
 *   si está cargando, vacía o rota.
 */

import { useInfiniteQuery, useQuery, type InfiniteData } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DEFAULT_PAGE_SIZE,
  SEARCH_DEBOUNCE_MS,
  getFoodProvider,
  type FoodProvider,
  type FoodSearchResult,
} from '@/services/food-provider';
import type { Food } from '@/types/domain';

/* ------------------------------------------------------------------ tipos */

/**
 * Estado de la pantalla. Nunca hay un quinto caso: si aparece algo que no
 * encaja aquí, es un bug, no un estado nuevo.
 */
export type FoodSearchStatus = 'loading' | 'error' | 'empty' | 'success';

export interface UseFoodSearchOptions {
  /** Texto inicial del buscador. */
  initialQuery?: string;
  pageSize?: number;
  debounceMs?: number;
  /** Inyectable en tests o en modo demostración. */
  provider?: FoodProvider;
  /** Desactiva la consulta (por ejemplo, mientras la hoja está cerrada). */
  enabled?: boolean;
}

export interface UseFoodSearchResult {
  /** Texto tal y como lo ve el usuario (se actualiza en cada pulsación). */
  query: string;
  setQuery: (next: string) => void;
  clearQuery: () => void;
  /** Texto ya antirrebotado, que es el que dispara la consulta. */
  debouncedQuery: string;
  /** true mientras el texto visible y el antirrebotado no coinciden. */
  isTyping: boolean;

  status: FoodSearchStatus;
  items: Food[];
  total: number;
  error: Error | null;

  hasMore: boolean;
  loadMore: () => void;
  isLoadingMore: boolean;
  isRefetching: boolean;
  retry: () => void;
}

/* ---------------------------------------------------------------- helpers */

/** Valor antirrebotado. Se limpia el temporizador al desmontar. */
export function useDebouncedValue<T>(value: T, delayMs: number = SEARCH_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

/* -------------------------------------------------------------------- hook */

export function useFoodSearch(options: UseFoodSearchOptions = {}): UseFoodSearchResult {
  const {
    initialQuery = '',
    pageSize = DEFAULT_PAGE_SIZE,
    debounceMs = SEARCH_DEBOUNCE_MS,
    enabled = true,
  } = options;

  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebouncedValue(query, debounceMs);

  // El proveedor se fija una vez: cambiarlo a mitad de sesión invalidaría la
  // caché de consultas sin avisar.
  const [provider] = useState<FoodProvider>(() => options.provider ?? getFoodProvider());

  const result = useInfiniteQuery<
    FoodSearchResult,
    Error,
    InfiniteData<FoodSearchResult>,
    [string, string, string, number],
    number
  >({
    queryKey: ['food-search', provider.id, debouncedQuery.trim(), pageSize],
    initialPageParam: 0,
    enabled,
    queryFn: ({ pageParam, signal }) =>
      provider.searchFoods(debouncedQuery.trim(), {
        page: pageParam,
        pageSize,
        signal,
      }),
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
    // El catálogo local no cambia solo; refrescarlo al volver a la pantalla
    // sería gastar batería para nada.
    staleTime: 5 * 60_000,
  });

  const items = useMemo(
    () => (result.data?.pages ?? []).flatMap((page) => page.items),
    [result.data],
  );

  const total = result.data?.pages[0]?.total ?? 0;
  const isTyping = query.trim() !== debouncedQuery.trim();

  const status: FoodSearchStatus = !enabled
    ? 'empty'
    : result.isPending || (isTyping && items.length === 0)
      ? 'loading'
      : result.isError
        ? 'error'
        : items.length === 0
          ? 'empty'
          : 'success';

  const loadMore = useCallback(() => {
    if (result.hasNextPage && !result.isFetchingNextPage) {
      void result.fetchNextPage();
    }
  }, [result]);

  const retry = useCallback(() => {
    void result.refetch();
  }, [result]);

  const clearQuery = useCallback(() => setQuery(''), []);

  return {
    query,
    setQuery,
    clearQuery,
    debouncedQuery,
    isTyping,
    status,
    items,
    total,
    error: result.error ?? null,
    hasMore: Boolean(result.hasNextPage),
    loadMore,
    isLoadingMore: result.isFetchingNextPage,
    isRefetching: result.isRefetching,
    retry,
  };
}

/* ------------------------------------------------- alimentos por id (lista) */

/**
 * Resuelve una lista de ids contra el proveedor. Lo usan "recientes" y
 * "favoritos", que guardan ids y no alimentos completos.
 */
export function useFoodsByIds(
  ids: string[],
  options: { provider?: FoodProvider; enabled?: boolean } = {},
): { foods: Food[]; isLoading: boolean; isError: boolean; retry: () => void } {
  const [provider] = useState<FoodProvider>(() => options.provider ?? getFoodProvider());

  // La clave se compone por contenido: el array llega nuevo en cada render del
  // store y compararlo por referencia recargaría siempre.
  const key = ids.join('|');
  const enabled = options.enabled !== false && ids.length > 0;

  const query = useQuery<Food[], Error>({
    queryKey: ['foods-by-id', provider.id, key],
    enabled,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const resolved = await Promise.all(ids.map((id) => provider.getFood(id)));
      // Un id que ya no existe (alimento manual borrado) se descarta en lugar
      // de dejar un hueco en la lista.
      return resolved.filter((food): food is Food => food !== null);
    },
  });

  return {
    foods: query.data ?? [],
    isLoading: enabled && query.isPending,
    isError: query.isError,
    retry: () => void query.refetch(),
  };
}
