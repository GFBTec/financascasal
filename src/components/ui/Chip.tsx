import { Dot } from './Dot';

interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  dot?: string;
  className?: string;
}

/** Pílula selecionável (filtros, categorias, pagamento). */
export function Chip({ label, selected, onClick, dot, className = '' }: ChipProps) {
  return (
    <button type="button" className={`chip ${className}`} aria-pressed={selected} onClick={onClick}>
      {dot && <Dot color={dot} square />}
      {label}
    </button>
  );
}
