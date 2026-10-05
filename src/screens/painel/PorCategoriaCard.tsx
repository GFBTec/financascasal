import type { CategorySummary } from '../../domain/calculations';
import { Card } from '../../components/ui/Card';
import { CategoryTile } from '../../components/ui/CategoryTile';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { formatBRL, formatShortBRL } from '../../lib/format';

interface PorCategoriaCardProps {
  categories: CategorySummary[];
  onEditBudget: () => void;
}

export function PorCategoriaCard({ categories, onEditBudget }: PorCategoriaCardProps) {
  return (
    <Card className="cats-card">
      <div className="row-between" style={{ alignItems: 'baseline' }}>
        <div className="label">Por categoria</div>
        <button type="button" className="btn-link" onClick={onEditBudget}>
          Editar orçamento
        </button>
      </div>

      <div className="stack">
        {categories.map((c) => {
          const progress = c.budget ? (c.spent / c.budget) * 100 : c.spent > 0 ? 100 : 0;
          const sub = c.over
            ? `+${formatShortBRL(c.spent - c.budget)}`
            : c.budget
              ? `de ${formatShortBRL(c.budget)}`
              : 'sem limite';
          return (
            <div key={c.id} className="cat-row" style={{ opacity: c.spent > 0 ? 1 : 0.55 }}>
              <CategoryTile cat={c.id} />
              <div className="cat-row__body">
                <div className="cat-row__head">
                  <span className="cat-row__name">{c.name}</span>
                  <span className="money" style={{ fontSize: 'var(--text-sm)' }}>
                    {formatBRL(c.spent)}
                  </span>
                  <span className={c.over ? 'cat-row__sub is-over' : 'cat-row__sub'}>{sub}</span>
                </div>
                <ProgressBar
                  value={progress}
                  fill={c.over ? 'var(--grad-over)' : 'var(--grad-tech)'}
                  glow={c.spent > 0 ? (c.over ? 'var(--glow-over)' : 'var(--glow-tech)') : undefined}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
