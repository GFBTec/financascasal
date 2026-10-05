import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'gastos-a-dois:ocultar-valores';
export const MASKED_VALUE = 'R$ ••••';

function read(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

// Estado compartilhado entre todos os cartões que usam o "olho".
let hidden = read();
const listeners = new Set<() => void>();

function setHidden(value: boolean) {
  hidden = value;
  try {
    localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  } catch {
    // Sem armazenamento (modo privado): vale só nesta sessão.
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/**
 * Preferência "ocultar valores" (botão olho), salva neste aparelho.
 * `mask` troca um valor formatado por "R$ ••••" quando os valores estão ocultos.
 */
export function useHideValues() {
  const isHidden = useSyncExternalStore(subscribe, () => hidden, () => false);
  const toggle = useCallback(() => setHidden(!hidden), []);
  const mask = useCallback((formatted: string) => (isHidden ? MASKED_VALUE : formatted), [isHidden]);
  return { hidden: isHidden, toggle, mask };
}
