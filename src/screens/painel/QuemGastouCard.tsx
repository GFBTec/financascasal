import { PEOPLE, PERSON_IDS } from '../../domain/constants';
import type { PersonTotals } from '../../domain/calculations';
import { Card } from '../../components/ui/Card';
import { Dot } from '../../components/ui/Dot';
import { formatBRL, percent, plural } from '../../lib/format';

export function QuemGastouCard({ totals }: { totals: PersonTotals }) {
  const total = totals.enddy.total + totals.bento.total + totals.casal.total;
  const { enddy, bento } = totals;
  const diff = Math.abs(enddy.total - bento.total);
  const [more, less] = enddy.total > bento.total ? ['Enddy', 'Bento'] : ['Bento', 'Enddy'];

  const diffText = !total
    ? 'Nenhum gasto registrado ainda.'
    : diff < 1
      ? 'Empatados neste mês.'
      : `${more} gastou ${formatBRL(diff)} a mais que ${less}.`;

  return (
    <Card className="who-card">
      <div className="label">Quem gastou</div>

      <div className="who-card__bar">
        {PERSON_IDS.map((id) => (
          <div key={id} style={{ width: `${percent(totals[id].total, total)}%`, background: PEOPLE[id].color }} />
        ))}
      </div>

      <div className="stack" style={{ gap: 14 }}>
        {PERSON_IDS.map((id) => {
          const t = totals[id];
          const sub = `${plural(t.count, 'gasto')} · ${percent(t.total, total).toFixed(0)}%`;
          return (
            <div key={id} className="row" style={{ gap: 12 }}>
              <Dot color={PEOPLE[id].color} size={10} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-body)', fontWeight: 600 }}>{PEOPLE[id].name}</div>
                <div className="meta">{id === 'casal' ? `conta conjunta · ${sub}` : sub}</div>
              </div>
              <div className="value">{formatBRL(t.total)}</div>
            </div>
          );
        })}
      </div>

      <div className="who-card__diff">{diffText}</div>
    </Card>
  );
}
