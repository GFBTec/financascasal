import { useCallback, useEffect, useRef, useState } from 'react';

/** Aviso temporário (toast). Some sozinho após `duration` ms. */
export function useToast(duration = 2200) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback(
    (msg: string) => {
      window.clearTimeout(timer.current);
      setMessage(msg);
      timer.current = window.setTimeout(() => setMessage(null), duration);
    },
    [duration],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { message, show };
}
