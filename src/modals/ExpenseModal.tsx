import { useState } from 'react';
import {
  CATEGORIES,
  COLORS,
  DEFAULT_STATUS,
  PAYMENT_METHODS,
  PEOPLE,
  PERSON_IDS,
  STATUSES,
  STATUS_IDS,
} from '../domain/constants';
import type { CategoryId, Expense, ExpenseStatus, PaymentMethod, PersonId } from '../domain/types';
import { Modal } from '../components/ui/Modal';
import { Chip } from '../components/ui/Chip';
import { Dot } from '../components/ui/Dot';
import { useConfirm } from '../hooks/useConfirm';
import { maskCurrencyInput, parseAmount } from '../lib/money';
import { uid } from '../lib/id';
import './modals.css';

interface ExpenseForm {
  amount: string;
  desc: string;
  place: string;
  who: PersonId;
  cat: CategoryId;
  pay: PaymentMethod;
  status: ExpenseStatus;
  date: string;
}

interface ExpenseModalProps {
  /** Gasto em edição; ausente = novo gasto. */
  expense?: Expense;
  defaultWho: PersonId;
  defaultDate: string;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

function initialForm(expense: Expense | undefined, defaultWho: PersonId, defaultDate: string): ExpenseForm {
  if (expense) {
    return {
      amount: maskCurrencyInput(expense.amount.toFixed(2)),
      desc: expense.desc,
      place: expense.place || '',
      who: expense.who,
      cat: expense.cat,
      pay: expense.pay,
      status: expense.status,
      date: expense.date,
    };
  }
  return {
    amount: '',
    desc: '',
    place: '',
    who: defaultWho,
    cat: 'comida',
    pay: 'Crédito',
    status: DEFAULT_STATUS,
    date: defaultDate,
  };
}

export function ExpenseModal({ expense, defaultWho, defaultDate, onClose, onSave, onDelete }: ExpenseModalProps) {
  const [form, setForm] = useState(() => initialForm(expense, defaultWho, defaultDate));
  const [error, setError] = useState('');
  const del = useConfirm(() => expense && onDelete(expense.id));

  const set = (patch: Partial<ExpenseForm>) => {
    setError('');
    setForm((f) => ({ ...f, ...patch }));
  };

  const save = () => {
    const amount = parseAmount(form.amount);
    if (!(amount > 0)) return setError('Informe um valor maior que zero.');
    if (!form.desc.trim()) return setError('Descreva o gasto (ex: Jantar, Uber, Mercado).');
    if (!form.date) return setError('Escolha a data.');
    onSave({
      id: expense?.id ?? uid(),
      amount,
      desc: form.desc.trim(),
      place: form.place.trim(),
      who: form.who,
      cat: form.cat,
      pay: form.pay,
      status: form.status,
      date: form.date,
    });
  };

  return (
    <Modal title={expense ? 'Editar gasto' : 'Novo gasto'} onClose={onClose}>
      <div className="amount-field">
        <span>R$</span>
        <input
          value={form.amount}
          inputMode="numeric"
          placeholder="0,00"
          aria-label="Valor"
          autoFocus
          onChange={(e) => set({ amount: maskCurrencyInput(e.target.value) })}
        />
      </div>

      <div className="field">
        <div className="label label--small">Quem gastou</div>
        <div className="row">
          {PERSON_IDS.map((id) => {
            const p = PEOPLE[id];
            const on = form.who === id;
            return (
              <button
                key={id}
                type="button"
                className="who-option"
                aria-pressed={on}
                style={{ borderColor: on ? p.color : undefined, background: on ? p.soft : undefined }}
                onClick={() => set({ who: id })}
              >
                <Dot color={p.color} size={10} />
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="field">
        <div className="label label--small">O quê</div>
        <input
          className="text-input"
          value={form.desc}
          placeholder="ex: Jantar de sexta"
          onChange={(e) => set({ desc: e.target.value })}
        />
        <input
          className="text-input"
          value={form.place}
          placeholder="Local (opcional) — ex: Padaria Real"
          onChange={(e) => set({ place: e.target.value })}
        />
      </div>

      <div className="field">
        <div className="label label--small">Categoria</div>
        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              className="chip--lg"
              label={c.name}
              dot={c.color}
              selected={form.cat === c.id}
              onClick={() => set({ cat: c.id })}
            />
          ))}
        </div>
      </div>

      <div className="row" style={{ flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        <div className="field" style={{ flex: '1 1 160px' }}>
          <div className="label label--small">Quando</div>
          <input
            className="text-input"
            type="date"
            value={form.date}
            style={{ padding: '12px 14px' }}
            onChange={(e) => set({ date: e.target.value })}
          />
        </div>
        <div className="field" style={{ flex: '2 1 260px' }}>
          <div className="label label--small">Pagamento</div>
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
            {PAYMENT_METHODS.map((p) => (
              <Chip
                key={p}
                className="chip--pay"
                label={p}
                selected={form.pay === p}
                onClick={() => set({ pay: p })}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="field">
        <div className="label label--small">Status</div>
        <div className="row">
          {STATUS_IDS.map((id) => {
            const s = STATUSES[id];
            const on = form.status === id;
            return (
              <button
                key={id}
                type="button"
                className="status-option"
                aria-pressed={on}
                style={on ? { color: s.color, background: s.bg, borderColor: s.color } : undefined}
                onClick={() => set({ status: id })}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && <div style={{ fontSize: 14, color: COLORS.alertText }}>{error}</div>}

      <div className="row">
        {expense && (
          <button type="button" className="btn-danger" style={{ border: 'none', padding: '14px 16px' }} onClick={del.trigger}>
            {del.armed ? 'Confirmar exclusão' : 'Excluir'}
          </button>
        )}
        <button type="button" className="btn-primary" style={{ marginLeft: 'auto', padding: '15px 26px' }} onClick={save}>
          Salvar gasto
        </button>
      </div>
    </Modal>
  );
}
