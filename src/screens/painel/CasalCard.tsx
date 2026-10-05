import { Eye, EyeOff, Pencil } from 'lucide-react';
import { COLORS } from '../../domain/constants';
import type { Contribution } from '../../domain/types';
import { Card } from '../../components/ui/Card';
import { Dot } from '../../components/ui/Dot';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useHideValues } from '../../hooks/useHideValues';
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
  const { hidden, toggle, mask } = useHideValues();
  const enddy = Number(contribution.enddy) || 0;
  const bento = Number(contribution.bento) || 0;
  const deposited = enddy + bento;
  const over = used > deposited;
  const pct = percent(used, deposited);
  const money = (v: number) => mask(formatBRL(v));
  // Leitores de tela também não devem ler o valor oculto.
  const a11y = (v: number) => (hidden ? 'valor oculto' : formatBRL(v));

  return (
    <Card dark className="casal-card">
      <div className="casal-card__head">
        <div className="row label label--on-dark" style={{ gap: 8 }}>
          <Dot color={COLORS.casalOnDark} />
          Conta do casal · {monthName(monthKey)}
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button
            type="button"
            className="casal-card__eye"
            aria-label={hidden ? 'Mostrar valores' : 'Ocultar valores'}
            aria-pressed={hidden}
            onClick={toggle}
          >
            {hidden ? <EyeOff size={17} strokeWidth={1.75} /> : <Eye size={17} strokeWidth={1.75} />}
          </button>
          <button type="button" className="casal-card__edit" onClick={onEdit}>
            <Pencil size={14} strokeWidth={2} aria-hidden="true" />
            Editar valor
          </button>
        </div>
      </div>

      <div className="stack" style={{ gap: 8 }}>
        <div className="casal-card__value" aria-label={a11y(deposited)}>
          {money(deposited)}
        </div>
        <div className="casal-card__sub">
          Enddy {money(enddy)} + Bento {money(bento)}
        </div>
      </div>

      <div className="stack" style={{ gap: 10 }}>
        <ProgressBar
          value={pct}
          fill={over ? COLORS.alertOnDark : COLORS.casalOnDark}
          track="rgba(251,248,241,.14)"
        />
        <div className="row-between casal-card__sub">
          <span className="nowrap">
            Usado {money(used)} ({pct.toFixed(0)}%)
          </span>
          <span className="nowrap" style={{ color: 'var(--card)', fontWeight: 600 }}>
            {over ? `Passou ${money(used - deposited)}` : `Sobra ${money(deposited - used)}`}
          </span>
        </div>
      </div>
    </Card>
  );
}
