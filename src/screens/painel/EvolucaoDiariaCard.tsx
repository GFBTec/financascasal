import { useMemo, useState } from 'react';
import { COLORS, PEOPLE } from '../../domain/constants';
import { dailyCap, dailySeries } from '../../domain/calculations';
import type { Expense, PersonId } from '../../domain/types';
import { TWEAKS } from '../../config/tweaks';
import { Card } from '../../components/ui/Card';
import { PeopleLegend } from '../../components/ui/PeopleLegend';
import { formatBRL, formatShortBRL } from '../../lib/format';
import { monthName, pad2, parseMonthKey } from '../../lib/date';

interface EvolucaoDiariaCardProps {
  monthKey: string;
  monthExpenses: Expense[];
  isCurrentMonth: boolean;
}

/** Ordem de empilhamento (de cima para baixo). */
const STACK: PersonId[] = ['bento', 'casal', 'enddy'];

export function EvolucaoDiariaCard({ monthKey, monthExpenses, isCurrentMonth }: EvolucaoDiariaCardProps) {
  const [hoverDay, setHoverDay] = useState<number | null>(null);
  const points = useMemo(() => dailySeries(monthExpenses, monthKey), [monthExpenses, monthKey]);
  const cap = dailyCap(points.map((p) => p.total));
  const today = isCurrentMonth ? new Date().getDate() : points.length;
  const monthTotal = points.reduce((t, p) => t + p.total, 0);
  const month = monthName(monthKey);

  const colorFor = (id: PersonId) => (TWEAKS.dailyMode === 'total' ? COLORS.ink : PEOPLE[id].color);

  const average = monthTotal / Math.max(1, today);
  // A linha de média só aparece se houver gastos e se couber na escala do gráfico.
  const showAverage = average > 0 && average <= cap;

  const hovered = hoverDay ? points[hoverDay - 1] : null;
  const info = hovered
    ? `${hovered.day} de ${month} · Enddy ${formatBRL(hovered.enddy)} · Bento ${formatBRL(hovered.bento)} · Casal ${formatBRL(hovered.casal)}`
    : `Média de ${formatBRL(average)} por dia`;

  return (
    <Card>
      <div className="row-between" style={{ alignItems: 'baseline' }}>
        <div className="label">Evolução diária</div>
        <div className="daily__info">{info}</div>
      </div>

      <div className="stack" style={{ gap: 8 }} onMouseLeave={() => setHoverDay(null)}>
        <div className="daily__plot">
          {showAverage && (
            <div className="daily__avg" style={{ bottom: `${(average / cap) * 100}%` }} aria-hidden="true">
              <span>média {formatShortBRL(average)}</span>
            </div>
          )}
          <div className="daily__bars">
          {points.map((p) => {
            const height = (Math.min(p.total, cap) / cap) * 100;
            const future = isCurrentMonth && p.day > today;
            const cls = ['daily__day', future && 'daily__day--future', hoverDay === p.day && 'daily__day--hover']
              .filter(Boolean)
              .join(' ');
            return (
              <div
                key={p.day}
                className={cls}
                title={`${p.day}/${pad2(parseMonthKey(monthKey).month)} — ${formatBRL(p.total)}`}
                onMouseEnter={() => setHoverDay(p.day)}
                onClick={() => setHoverDay(p.day)}
              >
                {p.total > cap && <div className="daily__clip">↑ {formatShortBRL(p.total)}</div>}
                {STACK.map((id) => (
                  <div
                    key={id}
                    style={{ height: `${p.total ? (height * p[id]) / p.total : 0}%`, background: colorFor(id) }}
                  />
                ))}
              </div>
            );
          })}
          </div>
        </div>
        <div className="daily__axis">
          {points.map((p) => {
            const isToday = isCurrentMonth && p.day === today;
            const show = p.day === 1 || p.day % 5 === 0 || isToday;
            return (
              <div key={p.day} className={isToday ? 'is-today' : undefined}>
                {show ? p.day : ''}
              </div>
            );
          })}
        </div>
      </div>

      <div className="row" style={{ flexWrap: 'wrap', gap: '8px 16px' }}>
        <PeopleLegend />
        <span className="legend daily__avg-legend">
          <span>
            <i aria-hidden="true" />
            Média diária
          </span>
        </span>
      </div>
    </Card>
  );
}
