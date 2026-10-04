import { STATUSES, STATUS_IDS } from '../../domain/constants';
import type { ExpenseStatus } from '../../domain/types';

interface StatusSelectProps {
  value: ExpenseStatus;
  onChange: (status: ExpenseStatus) => void;
  label?: string;
}

/** Lista suspensa PAGO / PENDENTE, colorida conforme o status atual. */
export function StatusSelect({ value, onChange, label = 'Status do pagamento' }: StatusSelectProps) {
  const s = STATUSES[value];
  return (
    <span className="status-select" style={{ color: s.color, background: s.bg }}>
      <select
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.value as ExpenseStatus)}
        onClick={(e) => e.stopPropagation()}
      >
        {STATUS_IDS.map((id) => (
          <option key={id} value={id}>
            {STATUSES[id].label}
          </option>
        ))}
      </select>
    </span>
  );
}
