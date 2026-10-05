import type { AssistantContext } from './assistant';

/**
 * Respostas do assistente sem IA: regras locais sobre os mesmos dados enviados à IA.
 * Usado quando a função com IA não está configurada (sem chave) ou falha.
 * Entende as perguntas mais comuns por palavras-chave; no máximo 3 frases.
 */

type Fmt = (value: number) => string;

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/** Primeiro valor em reais citado na pergunta ("R$ 120", "150,50", "200 reais"). */
export function amountInQuestion(question: string): number | null {
  const m = question.match(/(?:r\$\s*)?(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?/i);
  if (!m) return null;
  const value = Number(m[1].replace(/\./g, '')) + (m[2] ? Number(m[2].padEnd(2, '0')) / 100 : 0);
  return value > 0 ? value : null;
}

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

const shortDate = (iso: string) => {
  const [, m, d] = iso.split('-').map(Number);
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${d} ${months[m - 1]}`;
};

function affordAnswer(c: AssistantContext, fmt: Fmt, amount: number | null) {
  const { saldo, podeGastarPorDia } = c.contaDoCasal;
  const until = `até o pagamento em ${shortDate(c.proximoPagamento)}`;
  if (saldo <= 0) {
    return `O saldo da conta do casal já acabou (${fmt(saldo)}). O ideal é segurar novos gastos em conjunto ${until}.`;
  }
  if (amount) {
    if (amount > saldo) {
      return `Um gasto de ${fmt(amount)} passa do saldo da conta do casal, que é ${fmt(saldo)}. Melhor deixar para depois do pagamento ou dividir entre vocês.`;
    }
    const days = amount / Math.max(podeGastarPorDia, 0.01);
    const restante = (saldo - amount) / Math.max(1, c.diasAtePagamento);
    return `Cabe: ${fmt(amount)} é cerca de ${days < 1 ? 'menos de 1 dia' : `${Math.round(days)} ${Math.round(days) === 1 ? 'dia' : 'dias'}`} do limite diário de ${fmt(podeGastarPorDia)}. Depois disso, sobram ${fmt(restante)} por dia ${until}.`;
  }
  return `Vocês podem gastar até ${fmt(podeGastarPorDia)} por dia ${until} (saldo de ${fmt(saldo)}). Se o programa couber nesse valor, dá sim.`;
}

function saveAnswer(c: AssistantContext, fmt: Fmt) {
  const fixed = ['Moradia', 'Contas'];
  const over = c.categorias
    .filter((x) => x.orcamento > 0 && x.gasto > x.orcamento)
    .sort((a, b) => b.gasto - b.orcamento - (a.gasto - a.orcamento));
  if (over.length) {
    const names = over.slice(0, 2).map((x) => `${x.categoria} (+${fmt(x.gasto - x.orcamento)})`);
    return `O que mais pesa é ${names.join(' e ')}, já acima do orçamento. Segurar essas categorias até o fim do mês é o caminho mais rápido.`;
  }
  const variable = c.categorias.filter((x) => !fixed.includes(x.categoria) && x.gasto > 0).sort((a, b) => b.gasto - a.gasto);
  if (!variable.length) return 'Ainda não há gastos variáveis neste mês para sugerir cortes.';
  const top = variable[0];
  const pct = top.orcamento ? ` (${Math.round((top.gasto / top.orcamento) * 100)}% do orçamento)` : '';
  return `A maior despesa variável é ${top.categoria}, com ${fmt(top.gasto)}${pct}. Reduzir um pouco aí é o que mais ajuda.`;
}

function compareAnswer(c: AssistantContext, fmt: Fmt) {
  const prev = c.mesmoPeriodoMesAnterior;
  if (!prev) return `Neste mês vocês já gastaram ${fmt(c.totalDoMes)}. Não há dados do mês anterior para comparar.`;
  const diff = ((c.totalDoMes - prev) / prev) * 100;
  const period = c.mesAtual ? 'no mesmo período do mês passado' : 'no mês anterior';
  if (Math.abs(diff) < 3) return `Estão praticamente iguais: ${fmt(c.totalDoMes)} agora contra ${fmt(prev)} ${period}.`;
  return diff > 0
    ? `Estão gastando ${Math.round(diff)}% a mais: ${fmt(c.totalDoMes)} contra ${fmt(prev)} ${period}. Vale olhar os gastos variáveis.`
    : `Bom sinal: ${Math.round(-diff)}% a menos, ${fmt(c.totalDoMes)} contra ${fmt(prev)} ${period}.`;
}

function pendingAnswer(c: AssistantContext, fmt: Fmt) {
  const list = c.contasPendentes;
  if (!list.length) return 'Não há contas pendentes neste mês. Tudo pago!';
  const total = list.reduce((t, e) => t + e.valor, 0);
  const names = list.slice(0, 3).map((e) => `${e.desc} (${fmt(e.valor)})`);
  return `Há ${list.length} ${list.length === 1 ? 'conta pendente' : 'contas pendentes'}, somando ${fmt(total)}: ${names.join(', ')}${list.length > 3 ? ' e outras' : ''}.`;
}

function whoAnswer(c: AssistantContext, fmt: Fmt) {
  const { enddy, bento, casal } = c.gastosPorPessoa;
  const diff = Math.abs(enddy - bento);
  const lead = diff < 1 ? 'Enddy e Bento estão empatados' : `${enddy > bento ? 'Enddy' : 'Bento'} gastou ${fmt(diff)} a mais`;
  return `${lead} neste mês: Enddy ${fmt(enddy)}, Bento ${fmt(bento)} e a conta do casal ${fmt(casal)}.`;
}

function summaryAnswer(c: AssistantContext, fmt: Fmt) {
  const { saldo, podeGastarPorDia } = c.contaDoCasal;
  return `Neste mês vocês gastaram ${fmt(c.totalDoMes)}. A conta do casal tem saldo de ${fmt(saldo)}, o que dá ${fmt(podeGastarPorDia)} por dia até o pagamento em ${shortDate(c.proximoPagamento)}.`;
}

export function answerLocally(question: string, context: AssistantContext, fmt: Fmt): string {
  const q = normalize(question);
  if (has(q, 'economiz', 'cortar', 'reduzir', 'gastando muito', 'onde podemos', 'dica')) return saveAnswer(context, fmt);
  if (has(q, 'mes passado', 'mes anterior', 'compar', ' vs', 'como estamos', 'evolu')) return compareAnswer(context, fmt);
  if (has(q, 'pendente', 'falta pagar', 'a pagar', 'contas para pagar', 'vencer')) return pendingAnswer(context, fmt);
  if (has(q, 'quem gastou', 'quem gasta', 'quem esta', 'enddy', 'bento')) return whoAnswer(context, fmt);
  if (has(q, 'jantar', 'sair', 'pode', 'da pra', 'cabe', 'comprar', 'gastar', 'restaurante', 'viajar', 'presente', 'quanto')) {
    return affordAnswer(context, fmt, amountInQuestion(question));
  }
  return summaryAnswer(context, fmt);
}
