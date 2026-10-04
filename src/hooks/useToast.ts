import { useCallback, useEffect, useRef, useState } from 'react';

/** Duração da animação de saída (igual à transição de `.toast.is-leaving`). */
const LEAVE_MS = 260;

/** Aviso temporário (toast). Some sozinho após `duration` ms, com animação de saída. */
export function useToast(duration = 2200) {
  const [message, setMessage] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const show = useCallback(
    (msg: string) => {
      clearTimers();
      setMessage(msg);
      setLeaving(false);
      timers.current.push(
        window.setTimeout(() => {
          setLeaving(true);
          timers.current.push(window.setTimeout(() => setMessage(null), LEAVE_MS));
        }, duration),
      );
    },
    [duration],
  );

  useEffect(() => clearTimers, []);

  return { message, leaving, show };
}
