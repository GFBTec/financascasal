import { supabase } from '../lib/supabase';
import { DEFAULT_CONTRIBUTION, DEFAULT_CONTRIBUTION_KEY } from '../domain/constants';
import type { Budgets, CategoryId, Contribution, Contributions, Expense } from '../domain/types';

/** Acesso ao Supabase. Converte entre as linhas do banco e os tipos do app. */

interface ExpenseRow {
  id: string;
  amount: number | string;
  description: string;
  place: string | null;
  who: Expense['who'];
  cat: Expense['cat'];
  pay: Expense['pay'];
  date: string;
}

const EXPENSE_COLUMNS = 'id, amount, description, place, who, cat, pay, date';
const PAGE_SIZE = 1000; // limite padrão de linhas por requisição no Supabase

const toExpense = (r: ExpenseRow): Expense => ({
  id: r.id,
  amount: Number(r.amount),
  desc: r.description,
  place: r.place ?? '',
  who: r.who,
  cat: r.cat,
  pay: r.pay,
  date: r.date,
});

const toRow = (e: Expense) => ({
  id: e.id,
  amount: e.amount,
  description: e.desc,
  place: e.place,
  who: e.who,
  cat: e.cat,
  pay: e.pay,
  date: e.date,
});

function check<T>(res: { data: T; error: unknown }): T {
  if (res.error) throw res.error;
  return res.data;
}

async function fetchExpenses(): Promise<Expense[]> {
  const rows: ExpenseRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const page = check(
      await supabase
        .from('expenses')
        .select(EXPENSE_COLUMNS)
        .order('created_at')
        .order('id')
        .range(from, from + PAGE_SIZE - 1),
    ) as ExpenseRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows.map(toExpense);
  }
}

export interface RemoteData {
  expenses: Expense[];
  /** Só as categorias salvas no banco; o restante usa o padrão. */
  budgets: Partial<Budgets>;
  contribs: Contributions;
}

export async function fetchAll(): Promise<RemoteData> {
  const [expenses, budgetRows, contribRows] = await Promise.all([
    fetchExpenses(),
    supabase.from('budgets').select('cat, amount').then(check),
    supabase.from('contributions').select('month_key, enddy, bento').then(check),
  ]);

  const budgets: Partial<Budgets> = {};
  for (const r of budgetRows as { cat: CategoryId; amount: number }[]) budgets[r.cat] = Number(r.amount);

  const contribs: Contributions = { [DEFAULT_CONTRIBUTION_KEY]: { ...DEFAULT_CONTRIBUTION } };
  for (const r of contribRows as { month_key: string; enddy: number; bento: number }[]) {
    contribs[r.month_key] = { enddy: Number(r.enddy), bento: Number(r.bento) };
  }

  return { expenses, budgets, contribs };
}

export async function upsertExpense(e: Expense) {
  check(await supabase.from('expenses').upsert(toRow(e)));
}

export async function deleteExpense(id: string) {
  check(await supabase.from('expenses').delete().eq('id', id));
}

export async function deleteAllExpenses() {
  check(await supabase.from('expenses').delete().not('id', 'is', null));
}

export async function insertExpenses(list: Expense[]) {
  for (let i = 0; i < list.length; i += 500) {
    check(await supabase.from('expenses').insert(list.slice(i, i + 500).map(toRow)));
  }
}

export async function upsertBudgets(budgets: Partial<Budgets>) {
  const rows = Object.entries(budgets).map(([cat, amount]) => ({ cat, amount }));
  check(await supabase.from('budgets').upsert(rows));
}

export async function upsertContribution(monthKey: string, c: Contribution) {
  check(await supabase.from('contributions').upsert({ month_key: monthKey, enddy: c.enddy, bento: c.bento }));
}

export async function isMember(): Promise<boolean> {
  return Boolean(check(await supabase.rpc('is_member')));
}

/** Chama `onChange` quando qualquer tabela muda (inclusive por outro aparelho). */
export function subscribeToChanges(onChange: () => void) {
  const channel = supabase.channel('gastos-a-dois');
  for (const table of ['expenses', 'budgets', 'contributions']) {
    channel.on('postgres_changes', { event: '*', schema: 'public', table }, onChange);
  }
  channel.subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
