import { useMemo, useState } from 'react';
import { LayoutGrid, Search } from 'lucide-react';
import { CATEGORIES } from '../../domain/constants';
import { filterExpenses, groupByDay, sumAmounts, type ExpenseFilter } from '../../domain/calculations';
import type { Expense } from '../../domain/types';
import { useGastos } from '../../state/GastosContext';
import { Chip } from '../../components/ui/Chip';
import { PersonFilter } from '../../components/ui/PersonFilter';
import { formatBRL, plural } from '../../lib/format';
import { longDayLabel, monthName } from '../../lib/date';
import { ExpenseItem } from './ExpenseItem';
import './gastos.css';

interface GastosScreenProps {
  monthKey: string;
  monthExpenses: Expense[];
  onEditExpense: (expense: Expense) => void;
  onNewExpense: () => void;
  onToast: (message: string) => void;
}

export function GastosScreen({ monthKey, monthExpenses, onEditExpense, onNewExpense, onToast }: GastosScreenProps) {
  const { saveExpense } = useGastos();
  const [filter, setFilter] = useState<ExpenseFilter>({ who: 'all', cat: 'all', query: '' });
  const update = (patch: Partial<ExpenseFilter>) => setFilter((f) => ({ ...f, ...patch }));

  const filtered = useMemo(() => filterExpenses(monthExpenses, filter), [monthExpenses, filter]);
  const groups = useMemo(() => groupByDay(filtered), [filtered]);
  const month = monthName(monthKey);

  const toggleStatus = (e: Expense) => {
    const status = e.status === 'pago' ? 'pendente' : 'pago';
    saveExpense({ ...e, status });
    onToast(`${e.desc} marcado como ${status}`);
  };

  return (
    <div className="stack screen" style={{ gap: 18 }}>
      <div className="filters-row">
        <div className="person-filter-scroll">
          <PersonFilter value={filter.who} onChange={(who) => update({ who })} />
        </div>
        <label className="search">
          <Search size={18} strokeWidth={1.75} aria-hidden="true" />
          <input
            value={filter.query}
            placeholder="Buscar descrição ou local"
            aria-label="Buscar descrição ou local"
            onChange={(e) => update({ query: e.target.value })}
          />
        </label>
      </div>

      <div className="chips-scroll">
        <Chip label="Todas" icon={LayoutGrid} selected={filter.cat === 'all'} onClick={() => update({ cat: 'all' })} />
        {CATEGORIES.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            icon={c.icon}
            selected={filter.cat === c.id}
            onClick={() => update({ cat: c.id })}
          />
        ))}
      </div>

      <div className="list-summary">
        <span className="meta" style={{ fontSize: 'var(--text-sm)' }}>
          {plural(filtered.length, 'gasto')} em {month}
        </span>
        <span className="serif nowrap" style={{ fontSize: 'var(--text-title)', lineHeight: 1 }}>
          {formatBRL(sumAmounts(filtered))}
        </span>
      </div>

      {groups.length === 0 && (
        <div className="empty-state">
          <div className="serif" style={{ fontStyle: 'italic', fontSize: 28 }}>
            Nada por aqui.
          </div>
          <div className="meta" style={{ fontSize: 'var(--text-sm)' }}>
            {monthExpenses.length ? 'Nenhum gasto com esses filtros.' : `Nenhum gasto em ${month} ainda.`}
          </div>
          <button type="button" className="btn-primary" onClick={onNewExpense}>
            Adicionar gasto
          </button>
        </div>
      )}

      <div className="stack" style={{ gap: 20 }}>
        {groups.map((g) => (
          <div key={g.date} className="stack" style={{ gap: 6 }}>
            <div className="day-group__head">
              <span>{longDayLabel(g.date)}</span>
              <span>{formatBRL(g.total)}</span>
            </div>
            <div className="day-group__list">
              {g.items.map((e) => (
                <ExpenseItem
                  key={e.id}
                  expense={e}
                  onClick={() => onEditExpense(e)}
                  onToggleStatus={() => toggleStatus(e)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
