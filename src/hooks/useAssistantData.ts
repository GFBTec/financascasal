import { useCallback, useMemo } from 'react';
import { assistantSummary, buildAssistantContext, buildTips } from '../domain/assistant';
import {
  categorySummary,
  contributionFor,
  previousPeriodTotal,
  sumAmounts,
  topExpenses,
  totalsByPerson,
} from '../domain/calculations';
import type { Expense } from '../domain/types';
import { useGastos } from '../state/GastosContext';
import { useHideValues } from './useHideValues';
import { formatBRL } from '../lib/format';
import { daysInMonth, monthLabel, monthName, shiftMonth } from '../lib/date';

/**
 * Números do Assistente do mês, compartilhados entre o cartão do Painel e a conversa.
 * `money` respeita o "olho" (ocultar valores).
 */
export function useAssistantData(monthKey: string, monthExpenses: Expense[], isCurrentMonth: boolean) {
  const { expenses, budgets, contribs, payday } = useGastos();
  const { hidden, mask } = useHideValues();
  const money = useCallback((v: number) => mask(formatBRL(v)), [mask]);

  // "Hoje" de referência: o dia atual, ou o último dia de um mês já fechado.
  const today = useMemo(() => {
    if (isCurrentMonth) return new Date();
    const [y, m] = monthKey.split('-').map(Number);
    return new Date(y, m - 1, daysInMonth(monthKey));
  }, [isCurrentMonth, monthKey]);

  const contribution = contributionFor(contribs, monthKey);
  const deposit = (Number(contribution.enddy) || 0) + (Number(contribution.bento) || 0);
  const casalExpenses = useMemo(() => monthExpenses.filter((e) => e.who === 'casal'), [monthExpenses]);
  const summary = useMemo(
    () => assistantSummary({ today, payday, deposit, casalExpenses }),
    [today, payday, deposit, casalExpenses],
  );

  const categories = useMemo(() => categorySummary(monthExpenses, budgets), [monthExpenses, budgets]);
  const pending = useMemo(() => monthExpenses.filter((e) => e.status === 'pendente'), [monthExpenses]);
  const total = sumAmounts(monthExpenses);
  const prevTotal = useMemo(
    () => previousPeriodTotal(expenses, monthKey, today, isCurrentMonth),
    [expenses, monthKey, today, isCurrentMonth],
  );

  const tips = useMemo(() => {
    const dim = daysInMonth(monthKey);
    return buildTips({
      categories,
      monthProgress: (today.getDate() / dim) * 100,
      daysRemaining: Math.max(1, dim - today.getDate() + 1),
      pending,
      total,
      prevTotal,
      prevMonthName: monthName(shiftMonth(monthKey, -1)),
      fmt: money,
    });
  }, [categories, monthKey, today, pending, total, prevTotal, money]);

  /** JSON com os números do mês, enviado à IA (ou usado pelas respostas automáticas). */
  const buildContext = useCallback(() => {
    const byPerson = totalsByPerson(monthExpenses);
    return buildAssistantContext({
      monthLabel: monthLabel(monthKey),
      isCurrentMonth,
      today,
      summary,
      contribution,
      byPerson: { enddy: byPerson.enddy.total, bento: byPerson.bento.total, casal: byPerson.casal.total },
      categories,
      pending,
      prevTotal,
      total,
      top: topExpenses(monthExpenses),
    });
  }, [monthKey, isCurrentMonth, today, summary, contribution, monthExpenses, categories, pending, prevTotal, total]);

  return { summary, tips, deposit, money, hidden, buildContext };
}
