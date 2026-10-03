import type { Screen } from '../../domain/types';
import { NAV_ITEMS } from './nav';

interface TabBarProps {
  screen: Screen;
  onNavigate: (screen: Screen) => void;
  onNewExpense: () => void;
}

/** Abas inferiores + botão flutuante "+" (visíveis só no mobile, via CSS). */
export function TabBar({ screen, onNavigate, onNewExpense }: TabBarProps) {
  return (
    <>
      <button type="button" className="fab" aria-label="Novo gasto" onClick={onNewExpense}>
        +
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
