import { CATEGORY_MAP, PEOPLE } from '../../domain/constants';
import type { Expense, ExpenseStatus } from '../../domain/types';
import { StatusSelect } from '../../components/ui/StatusSelect';
import { withAlpha } from '../../lib/color';
import { formatBRL } from '../../lib/format';

interface ExpenseItemProps {
  expense: Expense;
  onClick: () => void;
  onStatusChange: (status: ExpenseStatus) => void;
}

export function ExpenseItem({ expense: e, onClick, onStatusChange }: ExpenseItemProps) {
  const cat = CATEGORY_MAP[e.cat] ?? CATEGORY_MAP.outros;
  const person = PEOPLE[e.who];
  const meta = [cat.name, e.place, e.pay].filter(Boolean).join(' · ');

  return (
    <div className="expense-item">
      <button type="button" className="expense-item__main" onClick={onClick}>
        <span className="expense-item__icon" style={{ background: withAlpha(cat.color), color: cat.color }}>
          {cat.name[0]}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="expense-item__desc">{e.desc}</div>
          <div className="expense-item__meta">
            <span className="expense-item__who-dot" style={{ background: person.color }} title={person.name} />
            {meta}
          </div>
        </div>
        <div className="stack" style={{ gap: 4, alignItems: 'flex-end', flex: 'none' }}>
          <span className="mono" style={{ fontSize: 14 }}>
            {formatBRL(e.amount)}
          </span>
          <span className="expense-item__badge" style={{ background: person.soft, color: person.color }}>
            {person.name}
          </span>
        </div>
      </button>
      <StatusSelect value={e.status} onChange={onStatusChange} label={`Status de ${e.desc}`} />
    </div>
  );
}
