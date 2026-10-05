import { describe, expect, it } from 'vitest';
import { amountInQuestion, answerLocally } from './localAssistant';
import type { AssistantContext } from './assistant';

const fmt = (v: number) => `R$ ${v.toFixed(2)}`;

const ctx = (over: Partial<AssistantContext> = {}): AssistantContext => ({
  mes: 'outubro 2026',
  mesAtual: true,
  hoje: '2026-10-10',
  proximoPagamento: '2026-11-05',
  diasAtePagamento: 26,
  contaDoCasal: { depositoMensal: 4500, enddy: 2500, bento: 2000, usado: 3200, saldo: 1300, podeGastarPorDia: 50, ritmoAtualPorDia: 40 },
  gastosPorPessoa: { enddy: 300, bento: 500, casal: 3200 },
  categorias: [
    { categoria: 'Comida', gasto: 1500, orcamento: 1200 },
    { categoria: 'Moradia', gasto: 2800, orcamento: 3500 },
    { categoria: 'Lazer', gasto: 100, orcamento: 500 },
  ],
  contasPendentes: [{ desc: 'Luz', valor: 180, data: '2026-10-12' }],
  mesmoPeriodoMesAnterior: 3000,
  totalDoMes: 4000,
  maioresGastos: [],
  ...over,
});

describe('amountInQuestion', () => {
  it.each([
    ['Dá pra gastar R$ 120 no jantar?', 120],
    ['posso comprar algo de 1.250,50?', 1250.5],
    ['jantar de 80 reais', 80],
    ['Dá pra jantar fora no sábado?', null],
  ])('%s → %s', (q, expected) => {
    expect(amountInQuestion(q)).toBe(expected);
  });
});

describe('answerLocally', () => {
  it('"dá pra jantar" usa o limite por dia', () => {
    expect(answerLocally('Dá pra jantar fora no sábado?', ctx(), fmt)).toContain('R$ 50.00 por dia');
  });

  it('com valor, diz se cabe no saldo', () => {
    expect(answerLocally('Dá pra jantar de R$ 120?', ctx(), fmt)).toMatch(/^Cabe/);
    expect(answerLocally('Dá pra comprar algo de 2000?', ctx(), fmt)).toContain('passa do saldo');
  });

  it('economizar aponta a categoria estourada', () => {
    expect(answerLocally('Onde podemos economizar?', ctx(), fmt)).toContain('Comida (+R$ 300.00)');
  });

  it('compara com o mês passado', () => {
    expect(answerLocally('Como estamos vs. mês passado?', ctx(), fmt)).toContain('33% a mais');
  });

  it('lista pendentes', () => {
    expect(answerLocally('O que falta pagar?', ctx(), fmt)).toContain('Luz');
  });

  it('saldo zerado avisa para segurar', () => {
    const c = ctx({ contaDoCasal: { ...ctx().contaDoCasal, saldo: -50, podeGastarPorDia: 0 } });
    expect(answerLocally('Dá pra jantar fora?', c, fmt)).toContain('já acabou');
  });

  it('pergunta desconhecida vira resumo', () => {
    expect(answerLocally('oi', ctx(), fmt)).toContain('saldo de R$ 1300.00');
  });
});
