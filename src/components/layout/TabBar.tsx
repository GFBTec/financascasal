import { useState } from 'react';
import type { Screen } from '../../domain/types';
import { NAV_ITEMS } from './nav';

interface TabBarProps {
  screen: Screen;
  /** Formulário de novo gasto aberto: o "+" fica girado como "×". */
  composing: boolean;
  onNavigate: (screen: Screen) => void;
  onNewExpense: () => void;
}

/** Abas inferiores + botão flutuante "+" (visíveis só no mobile, via CSS). */
export function TabBar({ screen, composing, onNavigate, onNewExpense }: TabBarProps) {
  // Cada toque gera uma nova chave e reinicia as animações de anel e ondas.
  const [burst, setBurst] = useState(0);

  const handleNew = () => {
    setBurst((b) => b + 1);
    navigator.vibrate?.(12);
    onNewExpense();
  };

  return (
    <>
      <button
        type="button"
        className={composing ? 'fab is-open' : 'fab'}
        aria-label="Novo gasto"
        onClick={handleNew}
      >
        {burst > 0 && (
          <span key={burst} className="fab__fx" aria-hidden="true">
            <span className="fab__spin" />
            <span className="fab__wave" />
            <span className="fab__wave fab__wave--late" />
          </span>
        )}
        <svg className="fab__icon" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </svg>
      </button>
      <nav className="tabbar">
        {NAV_ITEMS.map((n) => (
          <button
            key={n.id}
            type="button"
            className="tabbar__item"
            aria-current={screen === n.id ? 'page' : undefined}
            onClick={() => onNavigate(n.id)}
          >
            {n.label}
          </button>
        ))}
      </nav>
    </>
  );
}
