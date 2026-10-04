import type { CSSProperties } from 'react';
import { onlyDigits } from '../../lib/money';

interface MoneyFieldProps {
  value: string;
  onChange: (value: string) => void;
  width?: number;
  label?: string;
}

/** Exibe só os dígitos com separador de milhar: '1500' → '1.500'. */
const formatThousands = (value: string) => {
  const digits = onlyDigits(value);
  return digits ? Number(digits).toLocaleString('pt-BR') : '';
};

/** Campo de valor inteiro com prefixo "R$" (orçamento, depósitos). Aceita só dígitos. */
export function MoneyField({ value, onChange, width = 72, label }: MoneyFieldProps) {
  return (
    <div className="money-field" style={{ '--money-w': `${width}px` } as CSSProperties}>
      <span>R$</span>
      <input
        value={formatThousands(value)}
        inputMode="numeric"
        aria-label={label}
        onChange={(e) => onChange(onlyDigits(e.target.value).slice(0, 9))}
      />
    </div>
  );
}
