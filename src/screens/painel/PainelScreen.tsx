import { useMemo } from 'react';
import {
  categorySummary,
  contributionFor,
  lastMonths,
  topExpenses,
  totalsByPerson,
} from '../../domain/calculations';
import type { Expense } from '../../domain/types';
import { useGastos } from '../../state/GastosContext';
import { CasalCard } from './CasalCard';
import { QuemGastouCard } from './QuemGastouCard';
import { EvolucaoDiariaCard } from './EvolucaoDiariaCard';
import { PorCategoriaCard } from './PorCategoriaCard';
import { UltimosMesesCard } from './UltimosMesesCard';
import { MaioresGastosCard } from './MaioresGastosCard';
import { ContasStatusCard } from './ContasStatusCard';
import './painel.css';

interface PainelScreenProps {
  monthKey: string;
  monthExpenses: Expense[];
  isCurrentMonth: boolean;
  onSelectMonth: (monthKey: string) => void;
  onEditExpense: (expense: Expense) => void;
  onEditContribution: () => void;
  onGoToBudget: () => void;
}

export function PainelScreen({
  monthKey,
  monthExpenses,
  isCurrentMonth,
  onSelectMonth,
  onEditExpense,
  onEditContribution,
  onGoToBudget,
}: PainelScreenProps) {
  const { expenses, budgets, contribs } = useGastos();
  const totals = useMemo(() => totalsByPerson(monthExpenses), [monthExpenses]);  const categories = useMemo(() => categorySummary(monthExpenses, budgets), [monthExpenses, budgets]);
  const months = useMemo(() => lastMonths(expenses, monthKey), [expenses, monthKey]);

  return (
    <div className="stack">
      <div className="cards-row">
        <CasalCard
          monthKey={monthKey}
          used={totals.casal.total}
          contribution={contributionFor(contribs, monthKey)}
          onEdit={onEditContribution}
        />
        <QuemGastouCard totals={totals} />
      </div>

      <EvolucaoDiariaCard
        key={monthKey}
        monthKey={monthKey}
        monthExpenses={monthExpenses}
        isCurrentMonth={isCurrentMonth}
      />

      <div className="cards-row" style={{ alignItems: 'flex-start' }}>
        <PorCategoriaCard categories={categories} onEditBudget={onGoToBudget} />
        <div className="stack" style={{ flex: '1 1 320px', minWidth: 0 }}>
          <ContasStatusCard monthExpenses={monthExpenses} />
          <UltimosMesesCard months={months} selectedKey={monthKey} onSelect={onSelectMonth} />
          <MaioresGastosCard expenses={topExpenses(monthExpenses)} onEdit={onEditExpense} />
        </div>
      </div>
    </div>
  );
}
