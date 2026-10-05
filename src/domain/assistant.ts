import { CATEGORY_MAP } from './constants';
import type { CategorySummary } from './calculations';
import type { CategoryId, Expense } from './types';

/** Gastos fixos: não entram no "ritmo" nem nas dicas de economia. */
export const FIXED_CATEGORIES: CategoryId[] = ['moradia', 'contas'];
const isFixed = (cat: CategoryId) => FIXED_CATEGORIES.includes(cat);

const DAY_MS = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const daysBetween = (a: Date, b: Date) => Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS);
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** Próxima ocorrência do dia de pagamento estritamente depois de hoje. */
export function nextPayday(today: Date, payday: number): Date {
  const y = today.getFullYear();
  const m = today.getMonth();
  return today.getDate() < payday ? new Date(y, m, payday) : new Date(y, m + 1, payday);
}

// ---------------------------------------------------------------------------
// Resumo da conta do casal
// ---------------------------------------------------------------------------

export type PaceStatus = 'acabou' | 'acima' | 'ok';

export interface AssistantSummary {
  deposit: number;
  /** Tudo que saiu da conta do casal no mês (pendentes contam como comprometidos). */
  used: number;
  /** depósito − usado */
  balance: number;
  nextPayday: Date;
  daysLeft: number;
  /** "Ideal": quanto podem gastar por dia até o pagamento. */
  perDay: number;
  /** Ritmo atual: gastos variáveis do casal por dia decorrido. */
  pace: number;
  status: PaceStatus;
  /** Ritmo acima do ideal: dia aproximado em que o saldo acaba. */
  runOutDate?: Date;
  /** Ritmo ok: quanto deve sobrar no dia do pagamento. */
  leftoverAtPayday?: number;
}

interface SummaryInput {
  today: Date;
  payday: number;
  deposit: number;
  /** Gastos do mês com quem = casal. */
  casalExpenses: Expense[];
}

export function assistantSummary({ today, payday, deposit, casalExpenses }: SummaryInput): AssistantSummary {
  const used = casalExpenses.reduce((t, e) => t + e.amount, 0);
  const balance = deposit - used;
  const pay = nextPayday(today, payday);
  const daysLeft = Math.max(1, daysBetween(today, pay));
  const perDay = Math.max(balance, 0) / daysLeft;
  const variable = casalExpenses.filter((e) => !isFixed(e.cat)).reduce((t, e) => t + e.amount, 0);
  const pace = variable / Math.max(1, today.getDate());

  const base = { deposit, used, balance, nextPayday: pay, daysLeft, perDay, pace };
  if (balance <= 0) return { ...base, status: 'acabou' };
  if (pace > perDay) return { ...base, status: 'acima', runOutDate: addDays(today, Math.floor(balance / pace)) };
  return { ...base, status: 'ok', leftoverAtPayday: balance - pace * daysLeft };
}

/** O ritmo merece alerta visual (barra laranja/vermelha) quando passa 5% do ideal. */
export const paceIsOver = (s: Pick<AssistantSummary, 'pace' | 'perDay'>) => s.pace > s.perDay * 1.05;

// ---------------------------------------------------------------------------
// Dicas automáticas (regras locais, sem IA)
// ---------------------------------------------------------------------------

/** [o que evitar, conselho] por categoria. */
export const CATEGORY_ADVICE: Record<CategoryId, [string, string]> = {
  comida: ['delivery e restaurantes', 'Cozinhar em casa nos próximos dias ajuda bastante.'],
  mercado: ['compras por impulso no mercado', 'Façam lista antes de ir e evitem ir com fome.'],
  transporte: ['corridas curtas de app', 'Prefiram transporte público, caronas ou caminhar.'],
  lazer: ['programas pagos', 'Que tal programas gratuitos neste fim de semana?'],
  viagem: ['novas reservas', 'Deixem novas reservas para o próximo mês.'],
  moradia: ['gastos extras com a casa', 'Adiem compras para a casa que não sejam urgentes.'],
  contas: ['desperdício de luz e água', 'Fiquem de olho no consumo até o fim do mês.'],
  saude: ['gastos de saúde não urgentes', 'Priorizem o essencial e comparem preços na farmácia.'],
  presentes: ['presentes não planejados', 'Combinem um valor máximo para os próximos presentes.'],
  pets: ['extras no pet shop', 'Fiquem só com o essencial do pet até o pagamento.'],
  outros: ['compras não planejadas', 'Esperem 24h antes de compras que não estavam no plano.'],
};

export type TipKind = 'over' | 'pace' | 'pending' | 'up' | 'down' | 'slack' | 'ok';
export type TipSeverity = 0 | 1 | 2 | 3;

export interface Tip {
  kind: TipKind;
  sev: TipSeverity;
  /** Desempate dentro da mesma severidade (maior primeiro). */
  weight: number;
  title: string;
  text: string;
}

export interface TipsInput {
  categories: CategorySummary[];
  /** Quanto do mês já passou, 0–100 (mês fechado = 100). */
  monthProgress: number;
  /** Dias até o fim do mês, contando hoje (mínimo 1). */
  daysRemaining: number;
  pending: Expense[];
  total: number;
  /** Total do mesmo período do mês anterior. */
  prevTotal: number;
  prevMonthName: string;
  /** Formatação de valores (permite mascarar com o "olho"). */
  fmt: (value: number) => string;
}

const MAX_TIPS = 4;
const pct = (part: number, whole: number) => (whole ? (part / whole) * 100 : 0);

/** "a, b e c" / "a, b, c e mais 2" */
function listNames(names: string[], max = 3) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  if (rest > 0) return `${shown.join(', ')} e mais ${rest}`;
  if (shown.length <= 1) return shown.join('');
  return `${shown.slice(0, -1).join(', ')} e ${shown[shown.length - 1]}`;
}

export function buildTips(input: TipsInput): Tip[] {
  const { categories, monthProgress, daysRemaining, pending, total, prevTotal, prevMonthName, fmt } = input;
  const tips: Tip[] = [];

  for (const c of categories) {
    const [avoid, advice] = CATEGORY_ADVICE[c.id];
    const used = pct(c.spent, c.budget);

    // Sev. 3 — estourou o orçamento
    if (c.budget > 0 && c.spent > c.budget) {
      const excess = c.spent - c.budget;
      tips.push({
        kind: 'over',
        sev: 3,
        weight: excess,
        title: `Evitem ${avoid}`,
        text: `${c.name} já passou ${fmt(excess)} do orçamento. ${advice}`,
      });
      continue;
    }

    // Sev. 2 — gastando rápido demais para o ponto do mês
    if (c.budget > 0 && !isFixed(c.id) && used > 60 && used > monthProgress + 20) {
      const perDay = Math.max(c.budget - c.spent, 0) / Math.max(1, daysRemaining);
      tips.push({
        kind: 'pace',
        sev: 2,
        weight: used,
        title: `Segurem ${c.name.toLowerCase()}`,
        text: `Já foi ${used.toFixed(0)}% do orçamento com ${monthProgress.toFixed(0)}% do mês. Para fechar no limite, até ${fmt(perDay)}/dia. ${advice}`,
      });
    }
  }

  // Sev. 2 — contas pendentes
  if (pending.length) {
    const reserved = pending.reduce((t, e) => t + e.amount, 0);
    const n = pending.length;
    tips.push({
      kind: 'pending',
      sev: 2,
      weight: reserved,
      title: `Reservem ${fmt(reserved)} para ${n} ${n === 1 ? 'conta pendente' : 'contas pendentes'}`,
      text: `${listNames(pending.map((e) => e.desc))}.`,
    });
  }

  // Sev. 1 / 0 — comparação com o mesmo período do mês anterior
  if (prevTotal > 0) {
    const diff = ((total - prevTotal) / prevTotal) * 100;
    if (diff > 15) {
      tips.push({
        kind: 'up',
        sev: 1,
        weight: diff,
        title: `Gastos ${diff.toFixed(0)}% acima de ${prevMonthName}`,
        text: `Comparando com o mesmo período de ${prevMonthName}. Vale revisar os gastos variáveis.`,
      });
    } else if (diff < -10) {
      tips.push({
        kind: 'down',
        sev: 0,
        weight: -diff,
        title: `${Math.abs(diff).toFixed(0)}% abaixo de ${prevMonthName}`,
        text: `Bom ritmo comparado ao mesmo período de ${prevMonthName}.`,
      });
    }
  }

  // Sev. 0 — categoria com folga (a de maior folga)
  const slack = categories
    .filter((c) => !isFixed(c.id) && c.budget >= 400 && pct(c.spent, c.budget) < monthProgress - 25)
    .map((c) => ({ c, gap: monthProgress - pct(c.spent, c.budget) }))
    .sort((a, b) => b.gap - a.gap)[0];
  if (slack) {
    tips.push({
      kind: 'slack',
      sev: 0,
      weight: slack.gap,
      title: `${slack.c.name} está abaixo do previsto`,
      text: `Usaram ${pct(slack.c.spent, slack.c.budget).toFixed(0)}% do orçamento com ${monthProgress.toFixed(0)}% do mês.`,
    });
  }

  if (!tips.length) {
    tips.push({
      kind: 'ok',
      sev: 0,
      weight: 0,
      title: 'Tudo dentro do orçamento',
      text: 'Nenhuma categoria preocupa por enquanto. Continuem assim.',
    });
  }

  return tips.sort((a, b) => b.sev - a.sev || b.weight - a.weight).slice(0, MAX_TIPS);
}

// ---------------------------------------------------------------------------
// Contexto enviado ao assistente com IA
// ---------------------------------------------------------------------------

interface ContextInput {
  monthLabel: string;
  isCurrentMonth: boolean;
  today: Date;
  summary: AssistantSummary;
  contribution: { enddy: number; bento: number };
  byPerson: { enddy: number; bento: number; casal: number };
  categories: CategorySummary[];
  pending: Expense[];
  prevTotal: number;
  total: number;
  top: Expense[];
}

const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const round = (v: number) => Math.round(v * 100) / 100;

/** JSON com os números do mês para a IA responder só com base nos dados. */
export function buildAssistantContext(i: ContextInput) {
  return {
    mes: i.monthLabel,
    mesAtual: i.isCurrentMonth,
    hoje: isoDay(i.today),
    proximoPagamento: isoDay(i.summary.nextPayday),
    diasAtePagamento: i.summary.daysLeft,
    contaDoCasal: {
      depositoMensal: round(i.summary.deposit),
      enddy: round(i.contribution.enddy),
      bento: round(i.contribution.bento),
      usado: round(i.summary.used),
      saldo: round(i.summary.balance),
      podeGastarPorDia: round(i.summary.perDay),
      ritmoAtualPorDia: round(i.summary.pace),
    },
    gastosPorPessoa: {
      enddy: round(i.byPerson.enddy),
      bento: round(i.byPerson.bento),
      casal: round(i.byPerson.casal),
    },
    categorias: i.categories.map((c) => ({ categoria: c.name, gasto: round(c.spent), orcamento: round(c.budget) })),
    contasPendentes: i.pending.map((e) => ({ desc: e.desc, valor: round(e.amount), data: e.date })),
    mesmoPeriodoMesAnterior: round(i.prevTotal),
    totalDoMes: round(i.total),
    maioresGastos: i.top.map((e) => ({
      desc: e.desc,
      valor: round(e.amount),
      quem: e.who,
      categoria: CATEGORY_MAP[e.cat]?.name ?? e.cat,
    })),
  };
}

export type AssistantContext = ReturnType<typeof buildAssistantContext>;
