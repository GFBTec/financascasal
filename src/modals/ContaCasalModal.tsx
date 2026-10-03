import { useState } from 'react';
import { PEOPLE } from '../domain/constants';
import type { Contribution } from '../domain/types';
import { Modal } from '../components/ui/Modal';
import { Dot } from '../components/ui/Dot';
import { MoneyField } from '../components/ui/MoneyField';
import { formatBRL } from '../lib/format';
import { monthLabel } from '../lib/date';
import { onlyDigits } from '../lib/money';

interface ContaCasalModalProps {
  monthKey: string;
  current: Contribution;
  onClose: () => void;
  onSave: (value: Contribution) => void;
}

const CONTRIBUTORS = ['enddy', 'bento'] as const;

export function ContaCasalModal({ monthKey, current, onClose, onSave }: ContaCasalModalProps) {
  const [values, setValues] = useState({ enddy: String(current.enddy), bento: String(current.bento) });
  const enddy = Number(values.enddy) || 0;
  const bento = Number(values.bento) || 0;

  return (
    <Modal title="Conta do casal" onClose={onClose} maxWidth={440}>
      <div className="muted" style={{ fontSize: 14, textWrap: 'pretty' }}>
        Depósito mensal de cada um. Vale a partir de {monthLabel(monthKey)}.
      </div>

      {CONTRIBUTORS.map((id) => (
        <div key={id} className="row" style={{ gap: 12 }}>
          <Dot color={PEOPLE[id].color} size={10} />
          <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>{PEOPLE[id].name}</span>
          <MoneyField
            label={`Depósito de ${PEOPLE[id].name}`}
            width={90}
            value={values[id]}
            onChange={(v) => setValues((s) => ({ ...s, [id]: onlyDigits(v) }))}
          />
        </div>
      ))}

      <div
        className="row-between"
        style={{ alignItems: 'baseline', borderTop: '1px solid var(--line-strong)', paddingTop: 14 }}
      >
        <span className="muted" style={{ fontSize: 14 }}>
          Total na conta
        </span>
        <span className="serif" style={{ fontSize: 30 }}>
          {formatBRL(enddy + bento)}
        </span>
      </div>

      <button type="button" className="btn-primary" style={{ padding: '15px 26px' }} onClick={() => onSave({ enddy, bento })}>
        Salvar valor
      </button>
    </Modal>
  );
}
