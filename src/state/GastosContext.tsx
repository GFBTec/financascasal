import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_BUDGETS, DEFAULT_CONTRIBUTION, DEFAULT_CONTRIBUTION_KEY } from '../domain/constants';
import type { Budgets, CategoryId, Contribution, Contributions, Expense } from '../domain/types';
import { loadData, saveData } from '../data/storage';
import { seedData } from '../data/seed';

interface GastosData {
  expenses: Expense[];
  budgets: Budgets;
  contribs: Contributions;
}

interface GastosActions {
  /** Cria ou substitui (mesmo id) um gasto. */
  saveExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  setBudget: (cat: CategoryId, value: number) => void;
  /** Define o depósito a partir de `monthKey`; meses anteriores mantêm o valor antigo. */
  setContribution: (monthKey: string, value: Contribution) => void;
  resetSample: () => void;
  clearExpenses: () => void;
}

type GastosContextValue = GastosData & GastosActions;

const GastosContext = createContext<GastosContextValue | null>(null);

function initialData(): GastosData {
  const data = loadData();
  return {
    expenses: data?.expenses ?? seedData(),
    budgets: { ...DEFAULT_BUDGETS, ...data?.budgets },
    contribs: data?.contribs ?? { [DEFAULT_CONTRIBUTION_KEY]: { ...DEFAULT_CONTRIBUTION } },
  };
}

export function GastosProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(initialData);

  useEffect(() => saveData(data), [data]);

  const actions = useMemo<GastosActions>(
    () => ({
      saveExpense: (expense) =>
        setData((d) => ({
          ...d,
          expenses: d.expenses.some((e) => e.id === expense.id)
            ? d.expenses.map((e) => (e.id === expense.id ? expense : e))
            : [...d.expenses, expense],
        })),
      deleteExpense: (id) => setData((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) })),
      setBudget: (cat, value) => setData((d) => ({ ...d, budgets: { ...d.budgets, [cat]: value } })),
      setContribution: (monthKey, value) =>
        setData((d) => ({ ...d, contribs: { ...d.contribs, [monthKey]: value } })),
      resetSample: () => setData((d) => ({ ...d, expenses: seedData(), budgets: { ...DEFAULT_BUDGETS } })),
      clearExpenses: () => setData((d) => ({ ...d, expenses: [] })),
    }),
    [],
  );

  const value = useMemo(() => ({ ...data, ...actions }), [data, actions]);
  return <GastosContext.Provider value={value}>{children}</GastosContext.Provider>;
}

export function useGastos() {
  const ctx = useContext(GastosContext);
  if (!ctx) throw new Error('useGastos precisa estar dentro de <GastosProvider>');
  return ctx;
}
