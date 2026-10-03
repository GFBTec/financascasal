import { TWEAKS } from '../config/tweaks';

export function formatBRL(value: number, showCents = TWEAKS.showCents) {
  const digits = showCents ? 2 : 0;
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

/** Valor compacto para eixos e selos: 'R$ 840' / 'R$ 1,2 mil'. */
export function formatShortBRL(value: number) {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`;
  }
  return `R$ ${Math.round(value)}`;
}

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export const percent = (part: number, whole: number) => (whole ? (part / whole) * 100 : 0);
