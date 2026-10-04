import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Expense, Screen } from './domain/types';
import { contributionFor, expensesInMonth } from './domain/calculations';
import { TWEAKS } from './config/tweaks';
import { useGastos } from './state/GastosContext';
import { useToast } from './hooks/useToast';
import { currentMonthKey, monthKeyOfISO, shiftMonth, todayISO } from './lib/date';
import { Sidebar } from './components/layout/Sidebar';
import { TabBar } from './components/layout/TabBar';
import { Brand } from './components/layout/Brand';
import { MonthPicker } from './components/layout/MonthPicker';
import { SCREEN_TITLES } from './components/layout/nav';
import { Toast } from './components/ui/Toast';
import { PainelScreen } from './screens/painel/PainelScreen';
import { GastosScreen } from './screens/gastos/GastosScreen';
import { OrcamentoScreen } from './screens/orcamento/OrcamentoScreen';
import { ExpenseModal } from './modals/ExpenseModal';
import { ContaCasalModal } from './modals/ContaCasalModal';
import './components/layout/layout.css';

/** null = fechado; { expense: undefined } = novo gasto. */
type ExpenseModalState = { expense?: Expense } | null;

export default function App() {
  const { expenses, contribs, saveExpense, deleteExpense, setContribution, syncError } = useGastos();
  const toast = useToast();

  const showToast = toast.show;
  useEffect(() => {
    if (syncError) showToast(syncError.message);
  }, [syncError, showToast]);

  const [screen, setScreen] = useState<Screen>(TWEAKS.startScreen);
  const [monthKey, setMonthKey] = useState(currentMonthKey);
  const [expenseModal, setExpenseModal] = useState<ExpenseModalState>(null);
  const [contribOpen, setContribOpen] = useState(false);

  const isCurrentMonth = monthKey === currentMonthKey();
  const monthExpenses = useMemo(() => expensesInMonth(expenses, monthKey), [expenses, monthKey]);

  const openNew = useCallback(() => setExpenseModal({}), []);
  const openEdit = useCallback((expense: Expense) => setExpenseModal({ expense }), []);
  const closeExpenseModal = useCallback(() => setExpenseModal(null), []);
  const closeContrib = useCallback(() => setContribOpen(false), []);

  const handleSave = (expense: Expense) => {
    const isEdit = !!expenseModal?.expense;
    saveExpense(expense);
    setMonthKey(monthKeyOfISO(expense.date));
    setExpenseModal(null);
    toast.show(isEdit ? 'Gasto atualizado' : 'Gasto salvo');
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
    setExpenseModal(null);
    toast.show('Gasto excluído');
  };

  return (
    <div className="app">
      <Sidebar screen={screen} monthCount={monthExpenses.length} onNavigate={setScreen} onNewExpense={openNew} />

      <main className="main">
        <header className="page-header">
          <div className="page-header__titles">
            <Brand small />
            <h1 className="page-title">{SCREEN_TITLES[screen]}</h1>
          </div>
          <MonthPicker
            monthKey={monthKey}
            canGoNext={!isCurrentMonth}
            onPrev={() => setMonthKey((k) => shiftMonth(k, -1))}
            onNext={() => !isCurrentMonth && setMonthKey((k) => shiftMonth(k, 1))}
          />
        </header>

        {screen === 'painel' && (
          <PainelScreen
            monthKey={monthKey}
            monthExpenses={monthExpenses}
            isCurrentMonth={isCurrentMonth}
            onSelectMonth={setMonthKey}
            onEditExpense={openEdit}
            onEditContribution={() => setContribOpen(true)}
            onGoToBudget={() => setScreen('orcamento')}
          />
        )}
        {screen === 'gastos' && (
          <GastosScreen
            monthKey={monthKey}
            monthExpenses={monthExpenses}
            onEditExpense={openEdit}
            onNewExpense={openNew}
          />
        )}
        {screen === 'orcamento' && (
          <OrcamentoScreen monthKey={monthKey} monthExpenses={monthExpenses} onToast={toast.show} />
        )}
      </main>

      <TabBar screen={screen} composing={!!expenseModal} onNavigate={setScreen} onNewExpense={openNew} />

      {expenseModal && (
        <ExpenseModal
          expense={expenseModal.expense}
          defaultWho={expenses.at(-1)?.who ?? 'enddy'}
          defaultDate={isCurrentMonth ? todayISO() : `${monthKey}-01`}
          onClose={closeExpenseModal}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {contribOpen && (
        <ContaCasalModal
          monthKey={monthKey}
          current={contributionFor(contribs, monthKey)}
          onClose={closeContrib}
          onSave={(value) => {
            setContribution(monthKey, value);
            setContribOpen(false);
            toast.show('Valor da conta atualizado');
          }}
        />
      )}

      <Toast message={toast.message} leaving={toast.leaving} />
    </div>
  );
}
