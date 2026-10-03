/**
 * Converte texto digitado em número com 2 casas.
 * Aceita '1.234,56', '1234,56' e '1234.56'. Retorna 0 se inválido.
 */
export function parseAmount(input: string): number {
  let t = String(input).trim().replace(/[^\d.,]/g, '');
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
  const v = parseFloat(t);
  return Number.isFinite(v) ? Math.round(v * 100) / 100 : 0;
}

export const onlyDigits = (input: string) => String(input).replace(/\D/g, '');

/** Inteiro a partir de um campo numérico ('1.500' → 1500). */
export const parseInteger = (input: string) => parseInt(onlyDigits(input), 10) || 0;
