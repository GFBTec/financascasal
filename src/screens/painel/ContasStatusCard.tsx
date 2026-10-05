import { useMemo, useState } from 'react';
import { PEOPLE, STATUSES, STATUS_IDS } from '../../domain/constants';
import { totalsByStatus } from '../../domain/calculations';
import type { Expense, ExpenseStatus } from '../../domain/types';
import { Card } from '../../components/ui/Card';
import { Dot } from '../../components/ui/Dot';
import { PersonFilter, type PersonFilterValue } from '../../components/ui/PersonFilter';
import { formatBRL, plural } from '../../lib/format';

const SIZE = 104;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Espaço entre as fatias, em px ao longo do arco. */
const GAP = 3;

const contas = (n: number) => plural(n, 'conta');

/** Rosca PAGO × PENDENTE com o resumo de quantas contas faltam pagar no mês, filtrável por pessoa. */
export function ContasStatusCard({ monthExpenses }: { monthExpenses: Expense[] }) {
  const [hovered, setHovered] = useState<ExpenseStatus | null>(null);
  const [who, setWho] = useState<PersonFilterValue>('all');
  const totals = useMemo(
    () => totalsByStatus(who === 'all' ? monthExpenses : monthExpenses.filter((e) => e.who === who)),
    [monthExpenses, who],
  );
  const count = totals.pago.count + totals.pendente.count;
  const visible = STATUS_IDS.filter((id) => totals[id].count > 0);

  let offset = 0;
  const arcs = visible.map((id) => {
    const len = (totals[id].count / count) * CIRCUMFERENCE;
    const gap = visible.length > 1 ? GAP : 0;
    const arc = { id, dash: `${Math.max(len - gap, 0)} ${CIRCUMFERENCE - len + gap}`, offset: -offset };
    offset += len;
    return arc;
  });

  const whoName = who === 'all' ? '' : PEOPLE[who].name;
  const text = !count
    ? `Nenhuma conta ${whoName ? `de ${whoName} ` : ''}registrada neste mês.`
    : totals.pendente.count === 0
      ? `Todas as ${contas(count)} do mês estão pagas.`
      : `De ${contas(count)}, ${totals.pago.count === 1 ? '1 está paga' : `${totals.pago.count} estão pagas`} e ${
          totals.pendente.count === 1 ? 'existe 1 conta' : `existem ${totals.pendente.count} contas`
        } a pagar.`;
  const summary = whoName && count ? `${whoName}: ${text.charAt(0).toLowerCase()}${text.slice(1)}` : text;

  const center = hovered ? totals[hovered] : null;

  return (
    <Card className="contas-card" style={{ gap: 16 }}>
      <div className="label">Contas do mês</div>
      <PersonFilter small value={who} onChange={setWho} />

      <div className="status-chart">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={`${totals.pago.count} pagas e ${totals.pendente.count} pendentes`}
          onMouseLeave={() => setHovered(null)}
        >
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="rgba(30,26,21,.07)" strokeWidth={STROKE} />
          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
            {arcs.map((a) => (
              <circle
                key={a.id}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={STATUSES[a.id].color}
                strokeWidth={hovered === a.id ? STROKE + 3 : STROKE}
                strokeDasharray={a.dash}
                strokeDashoffset={a.offset}
                opacity={hovered && hovered !== a.id ? 0.35 : 1}
                style={{ cursor: 'pointer', transition: 'opacity .15s, stroke-width .15s' }}
                onMouseEnter={() => setHovered(a.id)}
                onClick={() => setHovered(a.id)}
              >
                <title>
                  {STATUSES[a.id].label}: {contas(totals[a.id].count)} · {formatBRL(totals[a.id].total)}
                </title>
              </circle>
            ))}
          </g>
          <text x="50%" y="51%" textAnchor="middle" className="status-chart__value">
            {center ? center.count : `${totals.pago.count}/${count}`}
          </text>
          <text x="50%" y="67%" textAnchor="middle" className="status-chart__caption">
            {hovered === 'pendente' ? (center!.count === 1 ? 'pendente' : 'pendentes') : center?.count === 1 ? 'paga' : 'pagas'}
          </text>
        </svg>

        <div className="status-chart__legend">
          {STATUS_IDS.map((id) => (
            <div
              key={id}
              className="status-chart__row"
              style={{ opacity: hovered && hovered !== id ? 0.5 : 1 }}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
            >
              <Dot color={STATUSES[id].color} size={10} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                  {STATUSES[id].label}{' '}
                  <span className="meta nowrap" style={{ fontWeight: 400 }}>
                    · {contas(totals[id].count)}
                  </span>
                </div>
                <div className="money" style={{ fontSize: 'var(--text-sm)', marginTop: 2 }}>
                  {formatBRL(totals[id].total)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="status-chart__summary">{summary}</div>
    </Card>
  );
}
