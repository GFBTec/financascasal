import { CATEGORY_MAP, PEOPLE } from '../../domain/constants';
import type { Expense } from '../../domain/types';
import { Card } from '../../components/ui/Card';
import { CategoryTile } from '../../components/ui/CategoryTile';
import { Dot } from '../../components/ui/Dot';
import { formatBRL } from '../../lib/format';
import { shortDayLabel } from '../../lib/date';

interface MaioresGastosCardProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
}

export function MaioresGastosCard({ expenses, onEdit }: MaioresGastosCardProps) {
  return (
    <Card className="top-card" style={{ gap: 6 }}>
      <div className="label" style={{ marginBottom: 8 }}>
        Maiores gastos
      </div>

      {expenses.map((e, i) => (
        <button key={e.id} type="button" className="top-item" onClick={() => onEdit(e)}>
          <span className="top-item__rank">{i + 1}</span>
          <CategoryTile cat={e.cat} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="top-item__desc">{e.desc}</div>
            <div className="top-item__meta">
              <Dot color={PEOPLE[e.who].color} size={7} />
              <span>
                {PEOPLE[e.who].name} · {shortDayLabel(e.date)} · {CATEGORY_MAP[e.cat]?.name}
              </span>
            </div>
          </div>
          <span className="money" style={{ fontSize: 'var(--text-sm)' }}>
            {formatBRL(e.amount)}
          </span>
        </button>
      ))}

      {expenses.length === 0 && (
        <div className="meta" style={{ fontSize: 'var(--text-sm)', padding: '8px 0' }}>
          Nenhum gasto neste mês.
        </div>
      )}
    </Card>
  );
}
