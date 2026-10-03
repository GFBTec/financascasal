import type { ReactNode } from 'react';
import { Brand } from './Brand';
import './layout.css';

interface FullScreenProps {
  title?: string;
  message?: ReactNode;
  action?: { label: string; onClick: () => void };
  children?: ReactNode;
}

/** Tela centralizada com a marca: carregamento, erros, login. */
export function FullScreen({ title, message, action, children }: FullScreenProps) {
  return (
    <div className="fullscreen">
      <div className="fullscreen__box">
        <div className="stack" style={{ gap: 4 }}>
          <Brand />
          <div className="label label--small">gastos a dois</div>
        </div>
        {title && <h1 className="fullscreen__title serif">{title}</h1>}
        {message && <div className="muted" style={{ fontSize: 14.5, lineHeight: 1.45 }}>{message}</div>}
        {children}
        {action && (
          <button type="button" className="btn-primary" onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
