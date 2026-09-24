/**
 * Lista de la compra.
 *
 * La lista SALE DEL PLAN: `generateShoppingList` suma los ingredientes de la
 * semana y normaliza unidades. Esta capa solo añade lo que el dominio no debe
 * saber — qué ha marcado ya el usuario, qué ha borrado y qué ha añadido a
 * mano — y lo mantiene separado para que "Regenerar" pueda rehacer la lista
 * sin perder lo que el usuario escribió.
 */

import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import {
  CATEGORY_ORDER,
  categorizeFood,
  generateShoppingList,
  type ShoppingCategory,
  type ShoppingList,
} from '@/domain/nutrition';
import { demoWeekPlan } from '@/services/demo-data';

/* ------------------------------------------------------------------ tipos */

export type ShoppingStatus = 'loading' | 'error' | 'empty' | 'success';

/**
 * Traducción de la categoría del dominio a su clave de `shopping.categories`.
 *
 * El generador emite `shopping.category.<slug>` en `labelKey`, pero el
 * diccionario tiene el grupo en `shopping.categories.*` y en camelCase. Se
 * mapea aquí en vez de tocar el dominio o el diccionario.
 */
export const CATEGORY_LABEL_KEYS: Record<ShoppingCategory, string> = {
  fruits: 'shopping.categories.fruit',
  vegetables: 'shopping.categories.vegetables',
  meat_fish: 'shopping.categories.meatFish',
  plant_protein: 'shopping.categories.plantProtein',
  dairy: 'shopping.categories.dairy',
  grains: 'shopping.categories.grains',
  pantry: 'shopping.categories.pantry',
  frozen: 'shopping.categories.frozen',
  other: 'shopping.categories.other',
};

export interface ShoppingEntry {
  id: string;
  name: string;
  category: ShoppingCategory;
  /** Cantidad ya normalizada, vacía en los productos añadidos a mano. */
  quantityLabel: string;
  checked: boolean;
  /** true si lo escribió el usuario y no viene del plan. */
  custom: boolean;
}

export type ShoppingRow =
  | { type: 'category'; key: string; category: ShoppingCategory; labelKey: string; count: number }
  | { type: 'item'; key: string; entry: ShoppingEntry };

export interface UseShoppingListResult {
  status: ShoppingStatus;
  rows: ShoppingRow[];
  totalItems: number;
  checkedItems: number;
  error: Error | null;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  /** Añade un producto escrito a mano. Devuelve false si el nombre está vacío. */
  add: (name: string) => boolean;
  regenerate: () => void;
  isRefetching: boolean;
}

/* -------------------------------------------------------- funciones puras */

/** Id estable de una línea del plan: el alimento, o su nombre si no tiene id. */
export function entryIdFor(foodId: string, name: string): string {
  return foodId || `name:${name.trim().toLowerCase()}`;
}

/** Cantidad legible. Vacía si no hay cantidad que enseñar. */
export function formatQuantity(quantity: number, unit: string): string {
  if (!Number.isFinite(quantity) || quantity <= 0) return '';
  return `${quantity} ${unit}`;
}

/** Aplana la lista del dominio y los añadidos a mano en filas para la vista. */
export function buildRows(
  list: ShoppingList | null,
  extras: ShoppingEntry[],
  checked: ReadonlySet<string>,
  removed: ReadonlySet<string>,
): ShoppingRow[] {
  const byCategory = new Map<ShoppingCategory, ShoppingEntry[]>();

  for (const group of list?.groups ?? []) {
    for (const item of group.items) {
      const id = entryIdFor(item.foodId, item.name);
      if (removed.has(id)) continue;
      const bucket = byCategory.get(group.category) ?? [];
      bucket.push({
        id,
        name: item.name,
        category: group.category,
        quantityLabel: formatQuantity(item.quantity, item.unit),
        checked: checked.has(id),
        custom: false,
      });
      byCategory.set(group.category, bucket);
    }
  }

  for (const extra of extras) {
    if (removed.has(extra.id)) continue;
    const bucket = byCategory.get(extra.category) ?? [];
    bucket.push({ ...extra, checked: checked.has(extra.id) });
    byCategory.set(extra.category, bucket);
  }

  const rows: ShoppingRow[] = [];
  for (const category of CATEGORY_ORDER) {
    const items = byCategory.get(category);
    if (!items || items.length === 0) continue;
    // Lo ya comprado baja al final del grupo: la lista se va vaciando sola.
    items.sort((a, b) =>
      a.checked === b.checked ? a.name.localeCompare(b.name) : a.checked ? 1 : -1,
    );
    rows.push({
      type: 'category',
      key: `cat-${category}`,
      category,
      labelKey: CATEGORY_LABEL_KEYS[category],
      count: items.length,
    });
    for (const entry of items) {
      rows.push({ type: 'item', key: `item-${entry.id}`, entry });
    }
  }
  return rows;
}

/* ------------------------------------------------------------- obtención */

/** Genera la lista a partir de la semana planificada. */
export async function fetchShoppingList(): Promise<ShoppingList> {
  return generateShoppingList(demoWeekPlan);
}

/* ------------------------------------------------------------------- hook */

export function useShoppingList(): UseShoppingListResult {
  const query = useQuery<ShoppingList, Error>({
    queryKey: ['shopping-list'],
    queryFn: fetchShoppingList,
    staleTime: 5 * 60_000,
  });

  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [removed, setRemoved] = useState<Set<string>>(() => new Set());
  const [extras, setExtras] = useState<ShoppingEntry[]>([]);

  const rows = useMemo(
    () => buildRows(query.data ?? null, extras, checked, removed),
    [query.data, extras, checked, removed],
  );

  const toggle = useCallback((id: string) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setRemoved((current) => new Set(current).add(id));
    setExtras((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const add = useCallback((name: string) => {
    const clean = name.trim();
    if (clean.length === 0) return false;
    const id = `custom:${clean.toLowerCase()}:${Date.now().toString(36)}`;
    setExtras((current) => [
      ...current,
      {
        id,
        name: clean,
        // Se clasifica con el mismo criterio que el plan: un producto escrito
        // a mano cae en su pasillo, no en "Otros".
        category: categorizeFood(clean),
        quantityLabel: '',
        checked: false,
        custom: true,
      },
    ]);
    return true;
  }, []);

  const regenerate = useCallback(() => {
    // Se rehace la lista del plan y se olvidan las marcas y los borrados,
    // pero NO lo que el usuario añadió a mano: eso no lo puso el plan.
    setChecked(new Set());
    setRemoved(new Set());
    void query.refetch();
  }, [query]);

  const itemRows = rows.filter((row) => row.type === 'item');
  const status: ShoppingStatus = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : itemRows.length === 0
        ? 'empty'
        : 'success';

  return {
    status,
    rows,
    totalItems: itemRows.length,
    checkedItems: itemRows.filter((row) => row.type === 'item' && row.entry.checked).length,
    error: query.error ?? null,
    toggle,
    remove,
    add,
    regenerate,
    isRefetching: query.isRefetching,
  };
}
