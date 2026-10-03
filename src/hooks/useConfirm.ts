import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Ação destrutiva em dois toques: o primeiro arma, o segundo (dentro de `timeout` ms) executa.
 * Sem `timeout`, permanece armado até o segundo toque.
 */
export function useConfirm(action: () => void, timeout?: number) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const trigger = useCallback(() => {
    window.clearTimeout(timer.current);
    if (armed) {
      setArmed(false);
      action();
      return;
    }
    setArmed(true);
    if (timeout) timer.current = window.setTimeout(() => setArmed(false), timeout);
  }, [armed, action, timeout]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { armed, trigger };
}
