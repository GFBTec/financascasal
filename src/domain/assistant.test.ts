import { describe, expect, it } from 'vitest';
import { assistantSummary, buildTips, daysBetween, nextPayday, paceIsOver, type TipsInput } from './assistant';
import { categorySummary, monthWindowEnd, previousPeriodTotal } from './calculations';
import { DEFAULT_BUDGETS } from './constants';
import type { Expense } from './types';

const exp = (p: Partial<Expense>): Expense => ({
  id: Math.random().toString(36),
  amount: 10,
  desc: 'Teste',
  place: '',
  who: 'casal',
  cat: 'comida',
  pay: 'Pix',
  status: 'pago',
  date: '2026-10-01',
  ...p,
});

const fmt = (v: number) => `R$ ${v.toFixed(2)}`;

describe('nextPayday', () => {
  it('usa o pagamento deste mês quando ainda não chegou', () => {
    expect(nextPayday(new Date(2026, 9, 3), 5)).toEqual(new Date(2026, 9, 5));
  });
  it('no próprio dia ou depois, pula para o mês seguinte', () => {
    expect(nextPayday(new Date(2026, 9, 5), 5)).toEqual(new Date(2026, 10, 5));
    expect(nextPayday(new Date(2026, 11, 20), 5)).toEqual(new Date(2027, 0, 5));
  });
  it('conta dias de calendário', () => {
    expect(daysBetween(new Date(2026, 9, 20, 23), new Date(2026, 10, 5))).toBe(16);
  });
});

describe('assistantSummary', () => {
  const today = new Date(2026, 9, 10); // 10/out, pagamento dia 5 → próximo 5/nov (26 dias)

  it('calcula saldo, ideal por dia e ritmo (sem moradia/contas)', () => {
    const s = assistantSummary({
      today,
      payday: 5,
      deposit: 4500,
      casalExpenses: [
        exp({ cat: 'moradia', amount: 2800 }),
        exp({ cat: 'contas', amount: 200 }),
        exp({ cat: 'mercado', amount: 300 }),
      ],
    });
    expect(s.used).toBe(3300);
    expect(s.balance).toBe(1200);
    expect(s.daysLeft).toBe(26);
    expect(s.perDay).toBeCloseTo(1200 / 26);
    expect(s.pace).toBe(30); // 300 / 10 dias
    expect(s.status).toBe('ok');
    expect(s.leftoverAtPayday).toBeCloseTo(1200 - 30 * 26);
  });

  it('pendentes contam como comprometidos', () => {
    const s = assistantSummary({ today, payday: 5, deposit: 1000, casalExpenses: [exp({ amount: 400, status: 'pendente' })] });
    expect(s.balance).toBe(600);
  });

  it('ritmo acima do ideal estima o dia em que o saldo acaba', () => {
    const s = assistantSummary({ today, payday: 5, deposit: 1000, casalExpenses: [exp({ cat: 'lazer', amount: 800 })] });
    expect(s.status).toBe('acima'); // ritmo 80/dia > ideal 200/26
    expect(s.runOutDate).toEqual(new Date(2026, 9, 12)); // 200 / 80 = 2 dias
    expect(paceIsOver(s)).toBe(true);
  });

  it('saldo zerado ou negativo', () => {
    const s = assistantSummary({ today, payday: 5, deposit: 100, casalExpenses: [exp({ amount: 150 })] });
    expect(s.status).toBe('acabou');
    expect(s.perDay).toBe(0);
  });
});

describe('buildTips', () => {
  const base = (over: Partial<TipsInput>): TipsInput => ({
    categories: categorySummary([], DEFAULT_BUDGETS),
    monthProgress: 50,
    daysRemaining: 15,
    pending: [],
    total: 0,
    prevTotal: 0,
    prevMonthName: 'setembro',
    fmt,
    ...over,
  });

  it('sem nada a apontar, diz que está tudo dentro do orçamento', () => {
    // Início do mês: nenhuma categoria tem folga suficiente para virar dica.
    const tips = buildTips(base({ monthProgress: 10 }));
    expect(tips).toHaveLength(1);
    expect(tips[0].kind).toBe('ok');
  });

  it('orçamento estourado vem primeiro, com texto da categoria', () => {
    const cats = categorySummary([exp({ cat: 'comida', amount: 1500 })], DEFAULT_BUDGETS);
    const tips = buildTips(base({ categories: cats, pending: [exp({ desc: 'Luz', status: 'pendente' })] }));
    expect(tips[0]).toMatchObject({ kind: 'over', sev: 3, title: 'Evitem delivery e restaurantes' });
    expect(tips[0].text).toContain('R$ 300.00');
  });

  it('alerta de ritmo ignora moradia e contas', () => {
    const cats = categorySummary(
      [exp({ cat: 'mercado', amount: 1200 }), exp({ cat: 'moradia', amount: 3000 })],
      DEFAULT_BUDGETS,
    );
    const tips = buildTips(base({ categories: cats, monthProgress: 30 }));
    expect(tips.map((t) => t.kind)).toContain('pace');
    expect(tips.find((t) => t.kind === 'pace')?.title).toBe('Segurem mercado');
    expect(tips.some((t) => t.title.includes('moradia'))).toBe(false);
  });

  it('lista até 3 contas pendentes', () => {
    const pending = ['Aluguel', 'Luz', 'Água', 'Internet'].map((desc) => exp({ desc, amount: 100, status: 'pendente' }));
    const tip = buildTips(base({ pending })).find((t) => t.kind === 'pending')!;
    expect(tip.title).toBe('Reservem R$ 400.00 para 4 contas pendentes');
    expect(tip.text).toBe('Aluguel, Luz, Água e mais 1.');
  });

  it('aponta a categoria com mais folga', () => {
    const tips = buildTips(base({ monthProgress: 60 }));
    expect(tips.filter((t) => t.kind === 'slack')).toHaveLength(1);
  });

  it('compara com o mesmo período do mês anterior', () => {
    expect(buildTips(base({ total: 1200, prevTotal: 1000 }))[0].kind).toBe('up');
    expect(buildTips(base({ total: 800, prevTotal: 1000 })).map((t) => t.kind)).toContain('down');
  });

  it('mostra no máximo 4 dicas, por severidade', () => {
    const cats = categorySummary(
      ['comida', 'mercado', 'lazer', 'pets', 'saude'].map((cat) => exp({ cat: cat as Expense['cat'], amount: 5000 })),
      DEFAULT_BUDGETS,
    );
    const tips = buildTips(base({ categories: cats }));
    expect(tips).toHaveLength(4);
    expect(tips.every((t) => t.sev === 3)).toBe(true);
    expect(tips[0].weight).toBeGreaterThanOrEqual(tips[1].weight);
  });
});

describe('monthWindowEnd', () => {
  it('fica ancorada no mês atual', () => {
    expect(monthWindowEnd('2026-08', '2026-10')).toBe('2026-10');
    expect(monthWindowEnd('2026-05', '2026-10')).toBe('2026-10');
  });
  it('desloca quando o mês escolhido fica antes da janela', () => {
    expect(monthWindowEnd('2026-03', '2026-10')).toBe('2026-08');
  });
});

describe('previousPeriodTotal', () => {
  const all = [exp({ date: '2026-09-02', amount: 50 }), exp({ date: '2026-09-25', amount: 70 })];
  it('no mês atual, compara até o mesmo dia', () => {
    expect(previousPeriodTotal(all, '2026-10', new Date(2026, 9, 10), true)).toBe(50);
  });
  it('em mês fechado, usa o mês anterior inteiro', () => {
    expect(previousPeriodTotal(all, '2026-10', new Date(2026, 10, 2), false)).toBe(120);
  });
});
