import { COLORS } from '../../domain/constants';
import type { Contribution } from '../../domain/types';
import { Card } from '../../components/ui/Card';
import { Dot } from '../../components/ui/Dot';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { formatBRL, percent } from '../../lib/format';
import { monthName } from '../../lib/date';

interface CasalCardProps {
  monthKey: string;
  /** Total gasto pela conta conjunta no mês. */
  used: number;
  contribution: Contribution;
  onEdit: () => void;
}

export function CasalCard({ monthKey, used, contribution, onEdit }: CasalCardProps) {
  const enddy = Number(contribution.enddy) || 0;
  const bento = Number(contribution.bento) || 0;
  const deposited = enddy + bento;
  const over = used > deposited;
  const pct = percent(used, deposited);

  return (
    <Card dark className="casal-card">
      <div className="row-between">
        <div className="row label label--on-dark" style={{ gap: 8 }}>
          <Dot color={COLORS.casalOnDark} />
          Conta do casal · {monthName(monthKey)}
        </div>
        <button type="button" className="casal-card__edit" onClick={onEdit}>
          Editar valor
        </button>
      </div>

      <div className="stack" style={{ gap: 8 }}>
        <div className="casal-card__value">{formatBRL(deposited)}</div>
        <div className="casal-card__sub">
          Enddy {formatBRL(enddy)} + Bento {formatBRL(bento)}
        </div>
      </div>

      <div className="stack" style={{ gap: 10 }}>
        <ProgressBar
          value={pct}
          height={8}
          color={over ? COLORS.alertOnDark : COLORS.casalOnDark}
          track="rgba(251,248,241,.14)"
        />
        <div className="row-between casal-card__sub" style={{ color: 'rgba(251,248,241,.78)' }}>
          <span>
            Usado {formatBRL(used)} ({pct.toFixed(0)}%)
          </span>
          <span style={{ color: COLORS.card, fontWeight: 500 }}>
            {over ? `Passou ${formatBRL(used - deposited)}` : `Sobra ${formatBRL(deposited - used)}`}
          </span>
        </div>
      </div>
    </Card>
  );
}
