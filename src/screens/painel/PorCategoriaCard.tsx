import { COLORS } from '../../domain/constants';
import type { CategorySummary } from '../../domain/calculations';
import { Card } from '../../components/ui/Card';
import { Dot } from '../../components/ui/Dot';
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
              <div className="cat-row__head">
                <span style={{ alignSelf: 'center', display: 'flex' }}>
                  <Dot color={c.color} size={9} square />
                </span>
                <span className="cat-row__name">{c.name}</span>
                <span className="mono" style={{ fontSize: 13 }}>
                  {formatBRL(c.spent)}
                </span>
                <span className="cat-row__sub" style={{ color: c.over ? COLORS.alertText : COLORS.muted }}>
                  {sub}
                </span>
              </div>
              <ProgressBar value={progress} color={c.over ? COLORS.alert : c.color} />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
