import { describe, expect, it } from 'vitest';
import { parseAmount, parseInteger } from './money';

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
