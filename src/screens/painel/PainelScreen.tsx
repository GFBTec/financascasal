import { useMemo } from 'react';
import {
  categorySummary,
  contributionFor,
  lastMonths,
  monthWindowEnd,
  topExpenses,
  totalsByPerson,
} from '../../domain/calculations';
import type { Expense } from '../../domain/types';
import { useGastos } from '../../state/GastosContext';
import { currentMonthKey } from '../../lib/date';
import { CasalCard } from './CasalCard';
import { ContasStatusCard } from './ContasStatusCard';
import { QuemGastouCard } from './QuemGastouCard';
import { AssistenteCard } from './AssistenteCard';
import { EvolucaoDiariaCard } from './EvolucaoDiariaCard';
import { PorCategoriaCard } from './PorCategoriaCard';
import { MaioresGastosCard } from './MaioresGastosCard';
import { UltimosMesesCard } from './UltimosMesesCard';
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

/**
 * Ordem (v2):
 * 1. Conta do casal · Contas do mês · Quem gastou
 * 2. Assistente do mês
 * 3. Evolução diária
 * 4. Por categoria · Maiores gastos
 * 5. Últimos 6 meses
 */
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
  const totals = useMemo(() => totalsByPerson(monthExpenses), [monthExpenses]);
  const categories = useMemo(() => categorySummary(monthExpenses, budgets), [monthExpenses, budgets]);
  // Janela fixa no mês corrente; clicar numa barra só seleciona o mês.
  const months = useMemo(
    () => lastMonths(expenses, monthWindowEnd(monthKey, currentMonthKey())),
    [expenses, monthKey],
  );

  return (
    <div className="stack screen">
      <div className="cards-row">
        <CasalCard
          monthKey={monthKey}
          used={totals.casal.total}
          contribution={contributionFor(contribs, monthKey)}
          onEdit={onEditContribution}
        />
        <ContasStatusCard monthExpenses={monthExpenses} />
        <QuemGastouCard totals={totals} />
      </div>

      <AssistenteCard monthKey={monthKey} monthExpenses={monthExpenses} isCurrentMonth={isCurrentMonth} />

      <EvolucaoDiariaCard
        key={monthKey}
        monthKey={monthKey}
        monthExpenses={monthExpenses}
        isCurrentMonth={isCurrentMonth}
      />

      <div className="cards-row" style={{ alignItems: 'flex-start' }}>
        <PorCategoriaCard categories={categories} onEditBudget={onGoToBudget} />
        <MaioresGastosCard expenses={topExpenses(monthExpenses)} onEdit={onEditExpense} />
      </div>

      <UltimosMesesCard months={months} selectedKey={monthKey} onSelect={onSelectMonth} />
    </div>
  );
}
