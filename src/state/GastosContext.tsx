import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DEFAULT_BUDGETS } from '../domain/constants';
import type { Budgets, CategoryId, Contribution, Contributions, Expense } from '../domain/types';
import * as repo from '../data/repository';
import { seedData } from '../data/seed';
import { FullScreen } from '../components/layout/FullScreen';

interface GastosData {
  expenses: Expense[];
  budgets: Budgets;
  contribs: Contributions;
  /** Dia em que a conta do casal é abastecida (1–28). */
  payday: number;
}

interface GastosActions {
  setPayday: (day: number) => void;
  /** Cria ou substitui (mesmo id) um gasto. */
  saveExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  setBudget: (cat: CategoryId, value: number) => void;
  /** Define o depósito a partir de `monthKey`; meses anteriores mantêm o valor antigo. */
  setContribution: (monthKey: string, value: Contribution) => void;
  resetSample: () => void;
  clearExpenses: () => void;
}

/** Erro ao gravar no Supabase. `id` muda a cada ocorrência para o aviso reaparecer. */
export interface SyncError {
  id: number;
  message: string;
}

export type GastosContextValue = GastosData & GastosActions & { syncError: SyncError | null };

/** Exportado para montar telas com dados de exemplo em testes visuais. */
export const GastosContext = createContext<GastosContextValue | null>(null);

const BUDGET_SAVE_DELAY = 600;
const RELOAD_DELAY = 400;

/**
 * Estado compartilhado do casal, guardado no Supabase.
 * Atualiza a tela na hora (otimista) e grava em segundo plano; se a gravação falhar,
 * avisa e recarrega do banco. Mudanças feitas em outro aparelho chegam via Realtime.
 */
export function GastosProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<GastosData | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [syncError, setSyncError] = useState<SyncError | null>(null);
  const reloadTimer = useRef<number | undefined>(undefined);
  const budgetTimers = useRef<Partial<Record<CategoryId, number>>>({});
  const paydayTimer = useRef<number | undefined>(undefined);

  const reload = useCallback(async () => {
    try {
      const remote = await repo.fetchAll();
      setData({ ...remote, budgets: { ...DEFAULT_BUDGETS, ...remote.budgets } });
      setLoadFailed(false);
    } catch (e) {
      console.error(e);
      setLoadFailed(true);
    }
  }, []);

  useEffect(() => {
    reload();
    const unsubscribe = repo.subscribeToChanges(() => {
      window.clearTimeout(reloadTimer.current);
      reloadTimer.current = window.setTimeout(reload, RELOAD_DELAY);
    });
    const timers = budgetTimers.current;
    return () => {
      unsubscribe();
      window.clearTimeout(reloadTimer.current);
      window.clearTimeout(paydayTimer.current);
      Object.values(timers).forEach((t) => window.clearTimeout(t));
    };
  }, [reload]);

  const actions = useMemo<GastosActions>(() => {
    const update = (fn: (d: GastosData) => GastosData) => setData((d) => d && fn(d));
    const sync = (op: Promise<unknown>) =>
      op.catch((e) => {
        console.error(e);
        setSyncError({ id: Date.now(), message: 'Não foi possível salvar. Verifique a conexão.' });
        reload();
      });

    return {
      saveExpense: (expense) => {
        update((d) => ({
          ...d,
          expenses: d.expenses.some((e) => e.id === expense.id)
            ? d.expenses.map((e) => (e.id === expense.id ? expense : e))
            : [...d.expenses, expense],
        }));
        sync(repo.upsertExpense(expense));
      },
      deleteExpense: (id) => {
        update((d) => ({ ...d, expenses: d.expenses.filter((e) => e.id !== id) }));
        sync(repo.deleteExpense(id));
      },
      setBudget: (cat, value) => {
        update((d) => ({ ...d, budgets: { ...d.budgets, [cat]: value } }));
        // Grava só quando a pessoa para de digitar.
        window.clearTimeout(budgetTimers.current[cat]);
        budgetTimers.current[cat] = window.setTimeout(
          () => sync(repo.upsertBudgets({ [cat]: value })),
          BUDGET_SAVE_DELAY,
        );
      },
      setPayday: (day) => {
        const payday = Math.min(28, Math.max(1, Math.round(day)));
        update((d) => ({ ...d, payday }));
        // Os botões − / + costumam ser tocados em sequência: grava só o valor final.
        window.clearTimeout(paydayTimer.current);
        paydayTimer.current = window.setTimeout(() => sync(repo.upsertPayday(payday)), BUDGET_SAVE_DELAY);
      },
      setContribution: (monthKey, value) => {
        update((d) => ({ ...d, contribs: { ...d.contribs, [monthKey]: value } }));
        sync(repo.upsertContribution(monthKey, value));
      },
      resetSample: () => {
        const expenses = seedData();
        update((d) => ({ ...d, expenses, budgets: { ...DEFAULT_BUDGETS } }));
        sync(
          (async () => {
            await repo.deleteAllExpenses();
            await repo.insertExpenses(expenses);
            await repo.upsertBudgets(DEFAULT_BUDGETS);
          })(),
        );
      },
      clearExpenses: () => {
        update((d) => ({ ...d, expenses: [] }));
        sync(repo.deleteAllExpenses());
      },
    };
  }, [reload]);

  const value = useMemo(() => data && { ...data, ...actions, syncError }, [data, actions, syncError]);

  if (!value) {
    return loadFailed ? (
      <FullScreen
        title="Não deu para carregar"
        message="Verifique sua conexão e tente de novo."
        action={{ label: 'Tentar de novo', onClick: reload }}
      />
    ) : (
      <FullScreen message="Carregando gastos…" />
    );
  }

  return <GastosContext.Provider value={value}>{children}</GastosContext.Provider>;
}

export function useGastos() {
  const ctx = useContext(GastosContext);
  if (!ctx) throw new Error('useGastos precisa estar dentro de <GastosProvider>');
  return ctx;
}
