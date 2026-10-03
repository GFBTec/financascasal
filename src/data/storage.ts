import { STORAGE_KEY, STORAGE_VERSION } from '../domain/constants';
import type { Budgets, Contributions, Expense } from '../domain/types';

export interface StoredData {
  v?: number;
  expenses: Expense[];
  budgets: Budgets;
  contribs: Contributions;
}

/** Gastos fixos que, na versão 1, eram atribuídos a uma pessoa e passaram para a conta do casal. */
const FIXED_EXPENSES_V1 = ['Aluguel', 'Condomínio', 'Luz', 'Água', 'Internet'];

export function loadData(): Partial<StoredData> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<StoredData>;
    if (!data.v && data.expenses) {
      data.expenses = data.expenses.map((e) => (FIXED_EXPENSES_V1.includes(e.desc) ? { ...e, who: 'casal' } : e));
    }
    return data;
  } catch {
    return null;
  }
}

export function saveData(data: Omit<StoredData, 'v'>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: STORAGE_VERSION, ...data }));
  } catch {
    // Armazenamento indisponível (modo privado, cota cheia): o app segue funcionando em memória.
  }
}
