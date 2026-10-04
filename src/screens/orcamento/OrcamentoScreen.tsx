import { useMemo } from 'react';
import { CATEGORIES, COLORS } from '../../domain/constants';
import { budgetTotal, sumAmounts } from '../../domain/calculations';
import type { Expense } from '../../domain/types';
import { useGastos } from '../../state/GastosContext';
import { useAuth } from '../../state/AuthContext';
import { useConfirm } from '../../hooks/useConfirm';
import { Card } from '../../components/ui/Card';
import { Dot } from '../../components/ui/Dot';
import { MoneyField } from '../../components/ui/MoneyField';
import { formatBRL } from '../../lib/format';
import { monthName } from '../../lib/date';
import { parseInteger } from '../../lib/money';

interface OrcamentoScreenProps {
  monthKey: string;
  monthExpenses: Expense[];
  onToast: (message: string) => void;
}

export function OrcamentoScreen({ monthKey, monthExpenses, onToast }: OrcamentoScreenProps) {
  const { budgets, setBudget, resetSample, clearExpenses } = useGastos();
  const { email, signOut } = useAuth();
  const month = monthName(monthKey);

  const spentByCat = useMemo(
    () => Object.fromEntries(CATEGORIES.map((c) => [c.id, sumAmounts(monthExpenses.filter((e) => e.cat === c.id))])),
    [monthExpenses],
  );

  const clear = useConfirm(() => {
    clearExpenses();
    onToast('Todos os gastos apagados');
  }, 3000);

  // Os dados agora são compartilhados: substituir pelo exemplo também pede confirmação.
  const reset = useConfirm(() => {
    resetSample();
    onToast('Dados de exemplo restaurados');
  }, 3000);

  return (
    <div className="stack screen" style={{ maxWidth: 760 }}>
      <Card dark style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div className="stack" style={{ gap: 8 }}>
          <div className="label label--on-dark">Orçamento mensal</div>
          <div className="serif" style={{ fontSize: 'clamp(44px,6vw,64px)', lineHeight: 0.9 }}>
            {formatBRL(budgetTotal(budgets))}
          </div>
        </div>
        <div style={{ fontSize: 14, color: 'rgba(251,248,241,.78)', maxWidth: 280, textWrap: 'pretty' }}>
          Vale para todos os meses. Em {month}, já foram {formatBRL(sumAmounts(monthExpenses))}.
        </div>
      </Card>

      <Card style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
        {CATEGORIES.map((c, i) => {
          const spent = spentByCat[c.id];
          const budget = Number(budgets[c.id]) || 0;
          const over = budget > 0 && spent > budget;
          return (
            <div
              key={c.id}
              className="row"
              style={{ gap: 14, padding: '12px 18px', borderTop: i ? '1px solid rgba(30,26,21,.08)' : 'none' }}
            >
              <Dot color={c.color} size={10} square />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: 12.5, color: over ? COLORS.alertText : COLORS.muted }}>
                  {over
                    ? `${formatBRL(spent)} gastos · passou ${formatBRL(spent - budget)}`
                    : `${formatBRL(spent)} gastos em ${month}`}
                </div>
              </div>
              <MoneyField
                label={`Orçamento de ${c.name}`}
                value={budget ? String(budget) : ''}
                onChange={(v) => setBudget(c.id, parseInteger(v))}
              />
            </div>
          );
        })}
      </Card>

      <section className="row" style={{ flexWrap: 'wrap', padding: '6px 2px' }}>
        <span className="muted" style={{ fontSize: 13, flex: '1 1 200px' }}>
          Conectado como {email} ·{' '}
          <button type="button" className="btn-link" onClick={signOut}>
            Sair
          </button>
        </span>
        <button type="button" className="btn-outline" onClick={reset.trigger}>
          {reset.armed ? 'Toque de novo para substituir' : 'Restaurar exemplo'}
        </button>
        <button type="button" className="btn-danger" onClick={clear.trigger}>
          {clear.armed ? 'Toque de novo para apagar' : 'Apagar todos os gastos'}
        </button>
      </section>
    </div>
  );
}
