import { describe, expect, it } from 'vitest';
import {
  contributionFor,
  dailyCap,
  dailySeries,
  filterExpenses,
  groupByDay,
  lastMonths,
  totalsByPerson,
  totalsByStatus,
} from './calculations';
import type { Expense } from './types';

const exp = (p: Partial<Expense>): Expense => ({
  id: Math.random().toString(36),
  amount: 10,
  desc: 'Teste',
  place: '',
  who: 'enddy',
  cat: 'comida',
  pay: 'Crédito',
  status: 'pago',
  date: '2026-10-01',
  ...p,
});

describe('contributionFor', () => {
  const contribs = {
    '0000-00': { enddy: 2500, bento: 2000 },
    '2026-08': { enddy: 3000, bento: 2000 },
  };

  it('usa o padrão antes de qualquer alteração', () => {
    expect(contributionFor(contribs, '2026-07')).toEqual({ enddy: 2500, bento: 2000 });
  });

  it('vale a partir do mês alterado, inclusive meses seguintes', () => {
    expect(contributionFor(contribs, '2026-08')).toEqual({ enddy: 3000, bento: 2000 });
    expect(contributionFor(contribs, '2026-12')).toEqual({ enddy: 3000, bento: 2000 });
  });
});

describe('totalsByPerson', () => {
  it('soma valores e contagens por pessoa', () => {
    const t = totalsByPerson([exp({ amount: 5 }), exp({ amount: 7 }), exp({ who: 'casal', amount: 100 })]);
    expect(t.enddy).toEqual({ total: 12, count: 2 });
    expect(t.bento).toEqual({ total: 0, count: 0 });
    expect(t.casal).toEqual({ total: 100, count: 1 });
  });
});

describe('totalsByStatus', () => {
  it('conta e soma pagas e pendentes', () => {
    const t = totalsByStatus([
      exp({ amount: 100 }),
      exp({ amount: 50, status: 'pendente' }),
      exp({ amount: 25, status: 'pendente' }),
    ]);
    expect(t.pago).toEqual({ total: 100, count: 1 });
    expect(t.pendente).toEqual({ total: 75, count: 2 });
  });
});

describe('dailySeries', () => {
  it('cria um ponto por dia do mês e soma por pessoa', () => {
    const s = dailySeries([exp({ date: '2026-02-03', amount: 4 }), exp({ date: '2026-02-03', who: 'bento', amount: 6 })], '2026-02');
    expect(s).toHaveLength(28);
    expect(s[2]).toMatchObject({ day: 3, enddy: 4, bento: 6, total: 10 });
  });
});

describe('dailyCap', () => {
  it('usa o maior valor quando não há pico', () => {
    expect(dailyCap([100, 80, 10])).toBe(100);
  });
  it('corta picos acima de 2,2× o segundo maior', () => {
    expect(dailyCap([1000, 100, 10])).toBeCloseTo(130);
  });
});

describe('lastMonths', () => {
  it('retorna 6 meses terminando no mês informado', () => {
    const rows = lastMonths([exp({ date: '2026-06-10', amount: 50 })], '2026-10');
    expect(rows.map((r) => r.key)).toEqual(['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10']);
    expect(rows[1].total).toBe(50);
  });
});

describe('filterExpenses + groupByDay', () => {
  const list = [
    exp({ desc: 'Uber', place: 'Uber', cat: 'transporte', date: '2026-10-01' }),
    exp({ desc: 'Jantar', place: 'Coco Bambu', who: 'bento', date: '2026-10-02', amount: 200 }),
    exp({ desc: 'Pizza', place: 'Bráz', who: 'bento', date: '2026-10-02', amount: 90 }),
  ];

  it('filtra por pessoa, categoria e busca (descrição ou local)', () => {
    expect(filterExpenses(list, { who: 'bento', cat: 'all', query: '' })).toHaveLength(2);
    expect(filterExpenses(list, { who: 'all', cat: 'transporte', query: '' })).toHaveLength(1);
    expect(filterExpenses(list, { who: 'all', cat: 'all', query: 'bambu' })[0].desc).toBe('Jantar');
  });

  it('agrupa por dia, mais recente primeiro', () => {
    const groups = groupByDay(filterExpenses(list, { who: 'all', cat: 'all', query: '' }));
    expect(groups.map((g) => g.date)).toEqual(['2026-10-02', '2026-10-01']);
    expect(groups[0].total).toBe(290);
    expect(groups[0].items[0].desc).toBe('Jantar');
  });
});
