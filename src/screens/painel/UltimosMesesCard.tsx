import { PEOPLE } from '../../domain/constants';
import type { MonthTotals } from '../../domain/calculations';
import { Card } from '../../components/ui/Card';
import { PeopleLegend } from '../../components/ui/PeopleLegend';
import { formatBRL, formatShortBRL } from '../../lib/format';
import { monthName, monthShortName } from '../../lib/date';

interface UltimosMesesCardProps {
  months: MonthTotals[];
  selectedKey: string;
  onSelect: (monthKey: string) => void;
}

export function UltimosMesesCard({ months, selectedKey, onSelect }: UltimosMesesCardProps) {
  const max = Math.max(1, ...months.map((m) => m.total));

  return (
    <Card style={{ gap: 16 }}>
      <div className="stack" style={{ gap: 10 }}>
        <div className="label">Últimos 6 meses</div>
        <div className="muted" style={{ fontSize: 13 }}>
          Total gasto por mês, dividido por quem pagou
        </div>
        <PeopleLegend casalLabel="Casal (conta conjunta)" />
      </div>

      <div className="months__bars">
        {months.map((m) => (
          <button
            key={m.key}
            type="button"
            className="months__bar"
            aria-pressed={m.key === selectedKey}
            title={`${monthName(m.key)}: Enddy ${formatBRL(m.enddy)} · Bento ${formatBRL(m.bento)} · Casal ${formatBRL(m.casal)}`}
            onClick={() => onSelect(m.key)}
          >
            <div className="months__value">{m.total ? formatShortBRL(m.total) : '—'}</div>
            <div
              className="months__stack"
              style={{ height: `${Math.max((m.total / max) * 100 * 0.78, m.total ? 3 : 0)}%` }}
            >
              <div style={{ flex: m.bento, background: PEOPLE.bento.color }} />
              <div style={{ flex: m.casal, background: PEOPLE.casal.color }} />
              <div style={{ flex: m.enddy, background: PEOPLE.enddy.color }} />
            </div>
            <div className="months__label">{monthShortName(m.key)}</div>
          </button>
        ))}
      </div>
    </Card>
  );
}
