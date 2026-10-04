import { describe, expect, it } from 'vitest';
import { maskCurrencyInput, parseAmount, parseInteger } from './money';

describe('maskCurrencyInput', () => {
  it.each([
    ['5', '0,05'],
    ['58', '0,58'],
    ['8750', '87,50'],
    ['123456', '1.234,56'],
    ['87,5', '8,75'], // apagar o último dígito de '87,50'
    ['abc12', '0,12'], // texto é descartado
    ['000', ''],
    ['', ''],
  ])('%s → %s', (input, expected) => {
    expect(maskCurrencyInput(input)).toBe(expected);
  });

  it('o resultado volta a ser lido como número', () => {
    expect(parseAmount(maskCurrencyInput('123456'))).toBe(1234.56);
  });
});

describe('parseAmount', () => {
  it.each([
    ['1.234,56', 1234.56],
    ['1234,56', 1234.56],
    ['1234.56', 1234.56],
    ['R$ 45', 45],
    ['0,1', 0.1],
    ['', 0],
    ['abc', 0],
  ])('%s → %d', (input, expected) => {
    expect(parseAmount(input)).toBe(expected);
  });
});

describe('parseInteger', () => {
  it('ignora tudo que não é dígito', () => {
    expect(parseInteger('1.500')).toBe(1500);
    expect(parseInteger('')).toBe(0);
  });
});
