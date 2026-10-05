import type { LucideIcon } from 'lucide-react';
import { Dot } from './Dot';

interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  /** Ícone à esquerda (categorias). */
  icon?: LucideIcon;
  /** Ponto colorido à esquerda (pessoas). */
  dot?: string;
  className?: string;
}

/** Pílula selecionável (filtros). Selecionada: fundo tinta, texto claro. */
export function Chip({ label, selected, onClick, icon: Icon, dot, className = '' }: ChipProps) {
  return (
    <button type="button" className={`chip ${className}`} aria-pressed={selected} onClick={onClick}>
      {Icon && <Icon size={15} strokeWidth={2} aria-hidden="true" />}
      {dot && <Dot color={dot} />}
      {label}
    </button>
  );
}
