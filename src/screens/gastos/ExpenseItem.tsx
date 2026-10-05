import { CATEGORY_MAP, PEOPLE } from '../../domain/constants';
import type { Expense } from '../../domain/types';
import { CategoryTile } from '../../components/ui/CategoryTile';
import { Dot } from '../../components/ui/Dot';
import { StatusToggle } from '../../components/ui/StatusToggle';
import { formatBRL } from '../../lib/format';

interface ExpenseItemProps {
  expense: Expense;
  onClick: () => void;
  onToggleStatus: () => void;
}

/** Linha da lista: tile · descrição + "Pessoa · Categoria · Local · Pagamento" · valor · status. */
export function ExpenseItem({ expense: e, onClick, onToggleStatus }: ExpenseItemProps) {
  const cat = CATEGORY_MAP[e.cat] ?? CATEGORY_MAP.outros;
  const person = PEOPLE[e.who];
  const meta = [person.name, cat.name, e.place, e.pay].filter(Boolean).join(' · ');

  return (
    <div className="expense-item">
      <button type="button" className="expense-item__main" onClick={onClick}>
        <CategoryTile cat={e.cat} size={40} />
        <div className="expense-item__text">
          <div className="expense-item__desc">{e.desc}</div>
          <div className="expense-item__meta">
            <Dot color={person.color} size={7} />
            <span>{meta}</span>
          </div>
        </div>
        <span className="money expense-item__amount">{formatBRL(e.amount)}</span>
      </button>
      <StatusToggle value={e.status} label={e.desc} onToggle={onToggleStatus} />
    </div>
  );
}
