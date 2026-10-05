import { useState } from 'react';
import { Calendar, ChevronDown, CreditCard, type LucideIcon } from 'lucide-react';
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
import { Dot } from '../components/ui/Dot';
import { useConfirm } from '../hooks/useConfirm';
import { maskCurrencyInput, parseAmount } from '../lib/money';
import { uid } from '../lib/id';
import { MONTHS_SHORT, WEEKDAYS, dateFromISO, toISODate } from '../lib/date';
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

type DetailPanel = 'date' | 'pay' | 'status';

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

/** Rótulo completo ("Hoje, 5 out" · "sáb, 3 out") e curto para telas estreitas ("Hoje" · "3 out"). */
function dateChipLabel(iso: string): { full: string; short: string } {
  if (!iso) return { full: 'Escolher data', short: 'Data' };
  const d = dateFromISO(iso);
  const base = `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
  const now = new Date();
  const today = toISODate(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = toISODate(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (iso === today) return { full: `Hoje, ${base}`, short: 'Hoje' };
  if (iso === yesterday) return { full: `Ontem, ${base}`, short: 'Ontem' };
  return { full: `${WEEKDAYS[d.getDay()]}, ${base}`, short: base };
}

export function ExpenseModal({ expense, defaultWho, defaultDate, onClose, onSave, onDelete }: ExpenseModalProps) {
  const [form, setForm] = useState(() => initialForm(expense, defaultWho, defaultDate));
  const [error, setError] = useState('');
  const [panel, setPanel] = useState<DetailPanel | null>(null);
  const del = useConfirm(() => expense && onDelete(expense.id));

  const set = (patch: Partial<ExpenseForm>) => {
    setError('');
    setForm((f) => ({ ...f, ...patch }));
  };
  const togglePanel = (p: DetailPanel) => setPanel((cur) => (cur === p ? null : p));

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

  const status = STATUSES[form.status];

  return (
    <Modal title={expense ? 'Editar gasto' : 'Novo gasto'} onClose={onClose}>
      {/* 1. Valor */}
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

      {/* 2. Quem gastou */}
      <div className="field">
        <div className="label">Quem gastou</div>
        <div className="who-options">
          {PERSON_IDS.map((id) => {
            const p = PEOPLE[id];
            const on = form.who === id;
            return (
              <button
                key={id}
                type="button"
                className="who-option"
                aria-pressed={on}
                style={on ? { borderColor: p.color, background: p.soft } : undefined}
                onClick={() => set({ who: id })}
              >
                <Dot color={p.color} size={10} />
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. O quê + Local */}
      <div className="field">
        <div className="label">O quê</div>
        <input
          className="text-input"
          value={form.desc}
          placeholder="ex: Jantar de sexta"
          aria-label="Descrição"
          onChange={(e) => set({ desc: e.target.value })}
        />
        <input
          className="text-input"
          value={form.place}
          placeholder="Local (opcional) — ex: Padaria Real"
          aria-label="Local"
          onChange={(e) => set({ place: e.target.value })}
        />
      </div>

      {/* 4. Categoria: grade de 4 colunas */}
      <div className="field">
        <div className="label">Categoria</div>
        <div className="cat-grid" role="radiogroup" aria-label="Categoria">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const on = form.cat === c.id;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={on}
                className="cat-option"
                onClick={() => set({ cat: c.id })}
              >
                <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Detalhes: data · pagamento · status */}
      <div className="field">
        <div className="label">Detalhes</div>
        <div className="details">
          <DetailButton
            icon={Calendar}
            label={dateChipLabel(form.date).full}
            shortLabel={dateChipLabel(form.date).short}
            ariaLabel="Data"
            open={panel === 'date'}
            onClick={() => togglePanel('date')}
          />
          <DetailButton
            icon={CreditCard}
            label={form.pay}
            ariaLabel="Pagamento"
            open={panel === 'pay'}
            onClick={() => togglePanel('pay')}
          />
          <DetailButton
            icon={status.icon}
            label={status.label}
            ariaLabel="Status"
            open={panel === 'status'}
            pending={form.status === 'pendente'}
            onClick={() => togglePanel('status')}
          />
        </div>

        {panel === 'date' && (
          <div className="detail-panel">
            <input
              className="text-input"
              type="date"
              value={form.date}
              aria-label="Data do gasto"
              onChange={(e) => set({ date: e.target.value })}
            />
          </div>
        )}
        {panel === 'pay' && (
          <div className="detail-panel pay-grid">
            {PAYMENT_METHODS.map((p) => (
              <button
                key={p}
                type="button"
                className="option-btn"
                aria-pressed={form.pay === p}
                onClick={() => {
                  set({ pay: p });
                  setPanel(null);
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
        {panel === 'status' && (
          <div className="detail-panel status-grid">
            {STATUS_IDS.map((id) => {
              const s = STATUSES[id];
              const Icon = s.icon;
              return (
                <button
                  key={id}
                  type="button"
                  className={`option-btn is-${id}`}
                  aria-pressed={form.status === id}
                  onClick={() => {
                    set({ status: id });
                    setPanel(null);
                  }}
                >
                  <Icon size={16} strokeWidth={2} aria-hidden="true" />
                  {s.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <div role="alert" style={{ fontSize: 'var(--text-sm)', color: COLORS.alertText }}>
          {error}
        </div>
      )}

      {/* 6. Ações */}
      <div className="row modal-actions">
        {expense && (
          <button type="button" className="btn-danger modal-actions__delete" onClick={del.trigger}>
            {del.armed ? 'Confirmar exclusão' : 'Excluir'}
          </button>
        )}
        <button type="button" className="btn-primary modal-actions__save" onClick={save}>
          Salvar gasto
        </button>
      </div>
    </Modal>
  );
}

interface DetailButtonProps {
  icon: LucideIcon;
  label: string;
  /** Versão curta do rótulo para telas estreitas. */
  shortLabel?: string;
  ariaLabel: string;
  open: boolean;
  pending?: boolean;
  onClick: () => void;
}

function DetailButton({ icon: Icon, label, shortLabel, ariaLabel, open, pending, onClick }: DetailButtonProps) {
  return (
    <button
      type="button"
      className={['detail-btn', open && 'is-open', pending && 'is-pending'].filter(Boolean).join(' ')}
      aria-expanded={open}
      aria-label={`${ariaLabel}: ${label}`}
      onClick={onClick}
    >
      <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
      <span className="detail-btn__text">
        {shortLabel ? (
          <>
            <span className="detail-btn__full">{label}</span>
            <span className="detail-btn__short">{shortLabel}</span>
          </>
        ) : (
          label
        )}
      </span>
      <ChevronDown className="detail-btn__chevron" size={14} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
