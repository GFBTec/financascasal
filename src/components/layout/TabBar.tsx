import { useEffect, useState } from 'react';
import { Plus, Receipt, Sparkle } from 'lucide-react';
import type { Screen } from '../../domain/types';
import { NAV_ITEMS } from './nav';

interface TabBarProps {
  screen: Screen;
  /** Algum formulário/conversa aberto: o "+" fica girado como "×". */
  composing: boolean;
  onNavigate: (screen: Screen) => void;
  onNewExpense: () => void;
  onOpenAssistant: () => void;
}

/**
 * Abas inferiores + botão flutuante "+" (visíveis só no mobile, via CSS).
 * O "+" abre um menu com duas ações: lançar gasto e falar com o assistente.
 */
export function TabBar({ screen, composing, onNavigate, onNewExpense, onOpenAssistant }: TabBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  // Cada abertura gera uma nova chave e reinicia as animações de anel e ondas.
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const toggleMenu = () => {
    if (!menuOpen) {
      setBurst((b) => b + 1);
      navigator.vibrate?.(12);
    }
    setMenuOpen((o) => !o);
  };

  const choose = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  return (
    <>
      {menuOpen && (
        <div className="fab-menu" role="presentation" onClick={() => setMenuOpen(false)}>
          <div className="fab-menu__items" role="menu" aria-label="Novo" onClick={(e) => e.stopPropagation()}>
            <button type="button" role="menuitem" className="fab-menu__item" onClick={() => choose(onOpenAssistant)}>
              <span className="fab-menu__label">Falar com Assistente</span>
              <span className="fab-menu__icon is-ai" aria-hidden="true">
                <Sparkle size={20} strokeWidth={2} />
              </span>
            </button>
            <button type="button" role="menuitem" className="fab-menu__item" onClick={() => choose(onNewExpense)}>
              <span className="fab-menu__label">Lançar novo gasto</span>
              <span className="fab-menu__icon" aria-hidden="true">
                <Receipt size={20} strokeWidth={1.75} />
              </span>
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className={menuOpen || composing ? 'fab is-open' : 'fab'}
        aria-label={menuOpen ? 'Fechar menu' : 'Novo'}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={toggleMenu}
      >
        {burst > 0 && (
          <span key={burst} className="fab__fx" aria-hidden="true">
            <span className="fab__spin" />
            <span className="fab__wave" />
            <span className="fab__wave fab__wave--late" />
          </span>
        )}
        <Plus className="fab__icon" size={26} strokeWidth={2.2} aria-hidden="true" />
      </button>

      <nav className="tabbar">
        {NAV_ITEMS.map((n) => {
          const Icon = n.icon;
          return (
            <button
              key={n.id}
              type="button"
              className="tabbar__item"
              aria-current={screen === n.id ? 'page' : undefined}
              onClick={() => onNavigate(n.id)}
            >
              <span className="tabbar__pill">
                <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
              </span>
              {n.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}
