import { useEffect, type ReactNode } from 'react';
import './Modal.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  maxWidth?: number;
  children: ReactNode;
}

/** Centralizado no desktop; bottom sheet no mobile. Fecha com ×, clique fora ou Esc. */
export function Modal({ title, onClose, maxWidth = 540, children }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
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
          <button type="button" className="icon-btn" aria-label="Fechar" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
