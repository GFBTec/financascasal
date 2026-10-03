import { CATEGORY_MAP, PEOPLE } from '../../domain/constants';
import type { Expense } from '../../domain/types';
import { withAlpha } from '../../lib/color';
import { formatBRL } from '../../lib/format';

interface ExpenseItemProps {
  expense: Expense;
  onClick: () => void;
}

export function ExpenseItem({ expense: e, onClick }: ExpenseItemProps) {
  const cat = CATEGORY_MAP[e.cat] ?? CATEGORY_MAP.outros;
  const person = PEOPLE[e.who];
  const meta = [cat.name, e.place, e.pay].filter(Boolean).join(' · ');

  return (
    <button type="button" className="expense-item" onClick={onClick}>
      <span className="expense-item__icon" style={{ background: withAlpha(cat.color), color: cat.color }}>
        {cat.name[0]}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="expense-item__desc">{e.desc}</div>
        <div className="expense-item__meta">{meta}</div>
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
  );
}
