import { useMemo, useState } from 'react';
import { CATEGORIES, COLORS } from '../../domain/constants';
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
}

export function GastosScreen({ monthKey, monthExpenses, onEditExpense, onNewExpense }: GastosScreenProps) {
  const { saveExpense } = useGastos();
  const [filter, setFilter] = useState<ExpenseFilter>({ who: 'all', cat: 'all', query: '' });
  const update = (patch: Partial<ExpenseFilter>) => setFilter((f) => ({ ...f, ...patch }));

  const filtered = useMemo(() => filterExpenses(monthExpenses, filter), [monthExpenses, filter]);
  const groups = useMemo(() => groupByDay(filtered), [filtered]);
  const month = monthName(monthKey);

  return (
    <div className="stack screen" style={{ gap: 18 }}>
      <div className="row" style={{ flexWrap: 'wrap', gap: 12 }}>
        <PersonFilter value={filter.who} onChange={(who) => update({ who })} />
        <input
          className="search-input"
          value={filter.query}
          placeholder="Buscar descrição ou local"
          onChange={(e) => update({ query: e.target.value })}
        />
      </div>

      <div className="chips-scroll">
        <Chip label="Todas" dot={COLORS.neutralDot} selected={filter.cat === 'all'} onClick={() => update({ cat: 'all' })} />
        {CATEGORIES.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            dot={c.color}
            selected={filter.cat === c.id}
            onClick={() => update({ cat: c.id })}
          />
        ))}
      </div>

      <div className="list-summary">
        <span className="muted" style={{ fontSize: 14 }}>
          {plural(filtered.length, 'gasto')} em {month}
        </span>
        <span className="serif" style={{ fontSize: 30 }}>
          {formatBRL(sumAmounts(filtered))}
        </span>
      </div>

      {groups.length === 0 && (
        <div className="empty-state">
          <div className="serif" style={{ fontStyle: 'italic', fontSize: 28 }}>
            Nada por aqui.
          </div>
          <div className="muted" style={{ fontSize: 14.5 }}>
            {monthExpenses.length ? 'Nenhum gasto com esses filtros.' : `Nenhum gasto em ${month} ainda.`}
          </div>
          <button type="button" className="btn-primary" style={{ padding: '12px 18px' }} onClick={onNewExpense}>
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
                  onStatusChange={(status) => saveExpense({ ...e, status })}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
