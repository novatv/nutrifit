import { Alert, Platform } from 'react-native';

/**
 * Diálogos que funcionan en todas las plataformas.
 *
 * `Alert.alert` de react-native-web es un no-op: en web un "¿Seguro que
 * quieres borrar?" nunca aparecería y la acción quedaría muerta. Aquí se usa
 * el diálogo nativo en móvil y `window.confirm` / `window.alert` en web.
 */

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
}

export function confirmDialog(o: ConfirmOptions): Promise<boolean> {
  if (Platform.OS === 'web') {
    const text = o.message ? `${o.title}\n\n${o.message}` : o.title;
    return Promise.resolve(typeof window !== 'undefined' && window.confirm(text));
  }
  return new Promise((resolve) => {
    Alert.alert(o.title, o.message, [
      { text: o.cancelLabel, style: 'cancel', onPress: () => resolve(false) },
      { text: o.confirmLabel, style: o.destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
    ]);
  });
}

export function notify(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

/** Elegir entre varias opciones. En web se pide el número de la opción. */
export function chooseDialog(title: string, options: string[], cancelLabel: string): Promise<number | null> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return Promise.resolve(null);
    const list = options.map((o, i) => `${i + 1}. ${o}`).join('\n');
    const answer = window.prompt(`${title}\n\n${list}`, '1');
    const index = answer ? Number(answer) - 1 : NaN;
    return Promise.resolve(Number.isInteger(index) && index >= 0 && index < options.length ? index : null);
  }
  return new Promise((resolve) => {
    Alert.alert(title, undefined, [
      ...options.map((text, index) => ({ text, onPress: () => resolve(index) })),
      { text: cancelLabel, style: 'cancel' as const, onPress: () => resolve(null) },
    ]);
  });
}
