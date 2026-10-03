import { PEOPLE } from '../../domain/constants';
import type { Screen } from '../../domain/types';
import { useAuth } from '../../state/AuthContext';
import { Dot } from '../ui/Dot';
import { Brand } from './Brand';
import { NAV_ITEMS } from './nav';

interface SidebarProps {
  screen: Screen;
  monthCount: number;
  onNavigate: (screen: Screen) => void;
  onNewExpense: () => void;
}

export function Sidebar({ screen, monthCount, onNavigate, onNewExpense }: SidebarProps) {
  const { email, signOut } = useAuth();
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <Brand />
        <div className="label label--small">gastos a dois</div>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((n) => (
          <button
            key={n.id}
            type="button"
            className="sidebar__item"
            aria-current={screen === n.id ? 'page' : undefined}
            onClick={() => onNavigate(n.id)}
          >
            <span>{n.label}</span>
            <span className="sidebar__hint">{n.id === 'gastos' ? monthCount : ''}</span>
          </button>
        ))}
      </nav>

      <button type="button" className="btn-primary sidebar__new" onClick={onNewExpense}>
        <span>Novo gasto</span>
        <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
      </button>

      <div className="sidebar__legend">
        <div className="row">
          <Dot color={PEOPLE.enddy.color} size={10} />
          Enddy
        </div>
        <div className="row">
          <Dot color={PEOPLE.bento.color} size={10} />
          Bento
        </div>
        <div className="row">
          <Dot color={PEOPLE.casal.color} size={10} />
          Casal · conta conjunta
        </div>
        <div className="sidebar__account">
          <span title={email}>{email}</span>
          <button type="button" className="btn-link" onClick={signOut}>
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
