import type { CSSProperties } from 'react';

interface MoneyFieldProps {
  value: string;
  onChange: (value: string) => void;
  width?: number;
  label?: string;
}

/** Campo numérico inteiro com prefixo "R$" (orçamento, depósitos). */
export function MoneyField({ value, onChange, width = 72, label }: MoneyFieldProps) {
  return (
    <div className="money-field" style={{ '--money-w': `${width}px` } as CSSProperties}>
      <span>R$</span>
      <input value={value} inputMode="numeric" aria-label={label} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
