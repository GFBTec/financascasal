import { STATUSES } from '../../domain/constants';
import type { ExpenseStatus } from '../../domain/types';

interface StatusToggleProps {
  value: ExpenseStatus;
  onToggle: () => void;
  /** Descrição do gasto, para o leitor de tela. */
  label: string;
}

/**
 * Status do gasto: um toque alterna PAGO ↔ PENDENTE.
 * Desktop: pílula de 118px com ícone e texto. Celular: círculo só com ícone (via CSS).
 */
export function StatusToggle({ value, onToggle, label }: StatusToggleProps) {
  const s = STATUSES[value];
  const Icon = s.icon;
  const next = value === 'pago' ? 'pendente' : 'pago';
  return (
    <button
      type="button"
      className="status-toggle"
      aria-label={`${label}: ${s.label}. Tocar para marcar como ${STATUSES[next].label.toLowerCase()}`}
      onClick={onToggle}
    >
      <span className={`status-pill is-${value}`}>
        {/* `key` reinicia a animação do ícone a cada troca. */}
        <Icon key={value} size={14} strokeWidth={2} aria-hidden="true" />
        <span className="status-pill__text">{s.label}</span>
      </span>
    </button>
  );
}
