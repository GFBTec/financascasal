import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import './Modal.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  maxWidth?: number;
  children: ReactNode;
}

/** Duração da animação de saída (igual a `.is-closing` em Modal.css). */
const CLOSE_MS = 220;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Centralizado no desktop; bottom sheet no mobile. Fecha com ×, clique fora ou Esc,
 * tocando a animação de saída antes de desmontar.
 */
export function Modal({ title, onClose, maxWidth = 540, children }: ModalProps) {
  const [closing, setClosing] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const requestClose = useCallback(() => {
    if (closing) return;
    if (prefersReducedMotion()) return onClose();
    setClosing(true);
    timer.current = window.setTimeout(onClose, CLOSE_MS);
  }, [closing, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && requestClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [requestClose]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div className={closing ? 'modal-overlay is-closing' : 'modal-overlay'} onClick={requestClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="row-between">
          <h2 className="modal-title serif">{title}</h2>
          <button type="button" className="icon-btn modal-close" aria-label="Fechar" onClick={requestClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
