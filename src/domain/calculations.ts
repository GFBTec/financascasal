import { CATEGORIES, DEFAULT_CONTRIBUTION } from './constants';
import type {
  Budgets,
  Category,
  CategoryId,
  Contribution,
  Contributions,
  Expense,
  ExpenseStatus,
  PersonId,
} from './types';
import { dayOfISO, daysInMonth, monthKeyOfISO, shiftMonth } from '../lib/date';

export const sumAmounts = (list: Expense[]) => list.reduce((t, e) => t + e.amount, 0);

export const expensesInMonth = (all: Expense[], monthKey: string) =>
  all.filter((e) => monthKeyOfISO(e.date) === monthKey);

export type PersonTotals = Record<PersonId, { total: number; count: number }>;

export function totalsByPerson(list: Expense[]): PersonTotals {
  const r: PersonTotals = {
    enddy: { total: 0, count: 0 },
    bento: { total: 0, count: 0 },
    casal: { total: 0, count: 0 },
  };
  for (const e of list) {
    r[e.who].total += e.amount;
    r[e.who].count += 1;
  }
  return r;
}

/** Depósito vigente no mês: o registro mais recente com chave <= monthKey. */
export function contributionFor(contribs: Contributions, monthKey: string): Contribution {
  const key = Object.keys(contribs)
    .filter((k) => k <= monthKey)
    .sort()
    .pop();
  return key ? contribs[key] : DEFAULT_CONTRIBUTION;
}

export interface DailyPoint {
  day: number;
  enddy: number;
  bento: number;
  casal: number;
  total: number;
}

export function dailySeries(monthExpenses: Expense[], monthKey: string): DailyPoint[] {
  const points: DailyPoint[] = Array.from({ length: daysInMonth(monthKey) }, (_, i) => ({
    day: i + 1,
    enddy: 0,
    bento: 0,
    casal: 0,
    total: 0,
  }));
  for (const e of monthExpenses) {
    const p = points[dayOfISO(e.date) - 1];
    if (!p) continue;
    p[e.who] += e.amount;
    p.total += e.amount;
  }
  return points;
}

/**
 * Altura máxima do gráfico diário. Se o maior dia passar de 2,2× o segundo maior,
 * a escala usa 1,3× o segundo maior e o pico é "cortado".
 */
export function dailyCap(totals: number[]) {
  const sorted = [...totals].sort((a, b) => b - a);
  if (sorted[1] && sorted[0] > sorted[1] * 2.2) return sorted[1] * 1.3;
  return sorted[0] || 1;
}

export interface CategorySummary extends Category {
  spent: number;
  budget: number;
  over: boolean;
}

/** Todas as categorias com gasto e orçamento do mês, ordenadas pelo gasto. */
export function categorySummary(monthExpenses: Expense[], budgets: Budgets): CategorySummary[] {
  return CATEGORIES.map((c) => {
    const spent = sumAmounts(monthExpenses.filter((e) => e.cat === c.id));
    const budget = Number(budgets[c.id]) || 0;
    return { ...c, spent, budget, over: budget > 0 && spent > budget };
  }).sort((a, b) => b.spent - a.spent);
}

export const budgetTotal = (budgets: Budgets) =>
  Object.values(budgets).reduce((a, b) => a + (Number(b) || 0), 0);

export interface MonthTotals {
  key: string;
  enddy: number;
  bento: number;
  casal: number;
  total: number;
}

/** Totais por pessoa dos `count` meses terminando em `monthKey` (mais antigo primeiro). */
export function lastMonths(all: Expense[], monthKey: string, count = 6): MonthTotals[] {
  const rows: MonthTotals[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const key = shiftMonth(monthKey, -i);
    const t = totalsByPerson(expensesInMonth(all, key));
    rows.push({
      key,
      enddy: t.enddy.total,
      bento: t.bento.total,
      casal: t.casal.total,
      total: t.enddy.total + t.bento.total + t.casal.total,
    });
  }
  return rows;
}

export type StatusTotals = Record<ExpenseStatus, { total: number; count: number }>;

/** Quantidade e valor de contas pagas e pendentes. */
export function totalsByStatus(list: Expense[]): StatusTotals {
  const r: StatusTotals = { pago: { total: 0, count: 0 }, pendente: { total: 0, count: 0 } };
  for (const e of list) {
    r[e.status].total += e.amount;
    r[e.status].count += 1;
  }
  return r;
}

export const topExpenses =(list: Expense[], n = 5) => [...list].sort((a, b) => b.amount - a.amount).slice(0, n);

export interface ExpenseFilter {
  who: PersonId | 'all';
  cat: CategoryId | 'all';
  query: string;
}

/** Aplica filtros e ordena por data (mais recente) e valor. */
export function filterExpenses(list: Expense[], f: ExpenseFilter) {
  const q = f.query.trim().toLowerCase();
  return list
    .filter(
      (e) =>
        (f.who === 'all' || e.who === f.who) &&
        (f.cat === 'all' || e.cat === f.cat) &&
        (!q || `${e.desc} ${e.place || ''}`.toLowerCase().includes(q)),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || b.amount - a.amount);
}

export interface DayGroup {
  date: string;
  items: Expense[];
  total: number;
}

/** Agrupa por dia, mais recente primeiro. Espera a lista já ordenada. */
export function groupByDay(list: Expense[]): DayGroup[] {
  const map = new Map<string, Expense[]>();
  for (const e of list) {
    const arr = map.get(e.date);
    if (arr) arr.push(e);
    else map.set(e.date, [e]);
  }
  return [...map.keys()]
    .sort()
    .reverse()
    .map((date) => {
      const items = map.get(date)!;
      return { date, items, total: sumAmounts(items) };
    });
}
