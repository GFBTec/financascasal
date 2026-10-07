import {
  Check,
  ChevronRight,
  Clock,
  Gauge,
  Minus,
  PiggyBank,
  Plus,
  Sparkle,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import { paceIsOver, type AssistantSummary, type Tip, type TipKind, type TipSeverity } from '../../domain/assistant';
import type { Expense } from '../../domain/types';
import { useGastos } from '../../state/GastosContext';
import { useAssistantData } from '../../hooks/useAssistantData';
import { MONTHS_SHORT, monthName } from '../../lib/date';

interface AssistenteCardProps {
  monthKey: string;
  monthExpenses: Expense[];
  isCurrentMonth: boolean;
  /** Abre a conversa com o assistente. */
  onAsk: () => void;
}

const TIP_ICONS: Record<TipKind, LucideIcon> = {
  over: TriangleAlert,
  pace: Gauge,
  pending: Clock,
  up: TrendingUp,
  down: TrendingDown,
  slack: PiggyBank,
  ok: Check,
};
const SEVERITY_CLASS: Record<TipSeverity, string> = { 3: 'bad', 2: 'warn', 1: 'info', 0: 'ok' };

const shortDate = (d: Date) => `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;

/** Resumo da conta do casal + dicas do mês. As perguntas ficam na conversa (botão no rodapé). */
export function AssistenteCard({ monthKey, monthExpenses, isCurrentMonth, onAsk }: AssistenteCardProps) {
  const { payday, setPayday } = useGastos();
  const { summary, tips, deposit, money, hidden } = useAssistantData(monthKey, monthExpenses, isCurrentMonth);

  return (
    <section className="card assistant-card">
      <div className="assistant__head">
        <div className="row" style={{ gap: 10 }}>
          <span className="assistant__badge" aria-hidden="true">
            <Sparkle size={16} strokeWidth={2} />
          </span>
          <span className="label">Assistente do mês</span>
        </div>
        <PaydayControl value={payday} onChange={setPayday} />
      </div>

      <div className="assistant__body">
        <div className="assistant__summary">
          {isCurrentMonth ? (
            <CurrentSummary summary={summary} money={money} hidden={hidden} />
          ) : (
            <PastSummary month={monthName(monthKey)} balance={summary.balance} deposit={deposit} used={summary.used} money={money} />
          )}
        </div>

        <ul className="assistant__tips" aria-label="Dicas do mês">
          {tips.map((t) => (
            <TipItem key={`${t.kind}-${t.title}`} tip={t} />
          ))}
        </ul>
      </div>

      <button type="button" className="assistant__ask" onClick={onAsk}>
        <span className="assistant__ask-icon" aria-hidden="true">
          <Sparkle size={15} strokeWidth={2} />
        </span>
        <span className="assistant__ask-text">
          <strong>Perguntar ao assistente</strong>
          <span>“Dá pra jantar fora no sábado?”</span>
        </span>
        <ChevronRight size={18} strokeWidth={2} aria-hidden="true" />
      </button>
    </section>
  );
}

// ---------------------------------------------------------------------------

function PaydayControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="payday" role="group" aria-label="Dia do pagamento">
      <span className="payday__label">Pagamento todo dia</span>
      <button type="button" aria-label="Diminuir dia do pagamento" disabled={value <= 1} onClick={() => onChange(value - 1)}>
        <Minus size={16} strokeWidth={2} aria-hidden="true" />
      </button>
      <span className="payday__value" aria-live="polite">
        {value}
      </span>
      <button type="button" aria-label="Aumentar dia do pagamento" disabled={value >= 28} onClick={() => onChange(value + 1)}>
        <Plus size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}

interface CurrentSummaryProps {
  summary: AssistantSummary;
  money: (v: number) => string;
  hidden: boolean;
}

function CurrentSummary({ summary: s, money, hidden }: CurrentSummaryProps) {
  const over = paceIsOver(s);
  const max = Math.max(s.perDay, s.pace, 1);

  const paceText =
    s.status === 'acabou'
      ? 'O saldo da conta conjunta já acabou. Evitem novos gastos em conjunto até o pagamento.'
      : s.status === 'acima'
        ? `No ritmo atual, o saldo acaba por volta de ${shortDate(s.runOutDate!)}, antes do pagamento.`
        : `No ritmo atual, ainda sobram cerca de ${money(s.leftoverAtPayday!)} no dia do pagamento.`;

  return (
    <>
      <p className="assistant__lead">Com o que sobra na conta do casal, vocês podem gastar até</p>
      <div className="assistant__perday">
        <span className="assistant__perday-value" aria-label={hidden ? 'valor oculto' : undefined}>
          {money(s.perDay)}
        </span>
        <span className="assistant__perday-unit">por dia</span>
      </div>
      <p className="meta" style={{ margin: 0 }}>
        até o pagamento em {shortDate(s.nextPayday)} · faltam {s.daysLeft} {s.daysLeft === 1 ? 'dia' : 'dias'} · saldo{' '}
        {money(s.balance)}
      </p>

      <div className="pace">
        <PaceBar label="Ideal" value={money(s.perDay)} width={(s.perDay / max) * 100} fill="var(--grad-tech)" glow="var(--glow-tech)" />
        <PaceBar
          label="Ritmo atual"
          value={money(s.pace)}
          width={(s.pace / max) * 100}
          fill={over ? 'var(--grad-over)' : 'var(--grad-good)'}
          glow={over ? 'var(--glow-over)' : undefined}
        />
      </div>

      <p className={s.status === 'ok' ? 'assistant__pace-text is-good' : 'assistant__pace-text is-bad'}>{paceText}</p>
    </>
  );
}

function PaceBar(props: { label: string; value: string; width: number; fill: string; glow?: string }) {
  return (
    <div className="pace__row">
      <span className="pace__label">{props.label}</span>
      <div className="pace__track">
        <span style={{ width: `${Math.max(props.width, 2)}%`, background: props.fill, boxShadow: props.glow }} />
      </div>
      <span className="pace__value">{props.value}/dia</span>
    </div>
  );
}

interface PastSummaryProps {
  month: string;
  balance: number;
  deposit: number;
  used: number;
  money: (v: number) => string;
}

function PastSummary({ month, balance, deposit, used, money }: PastSummaryProps) {
  const negative = balance < 0;
  return (
    <>
      <p className="assistant__lead">Resumo de {month}</p>
      <div className="assistant__perday">
        <span className="assistant__perday-value" style={negative ? { color: 'var(--pendente-text)' } : undefined}>
          {money(Math.abs(balance))}
        </span>
        <span className="assistant__perday-unit">{negative ? 'no negativo' : 'de sobra'}</span>
      </div>
      <p className="meta" style={{ margin: 0 }}>
        Depósito {money(deposit)} · usado {money(used)}
      </p>
    </>
  );
}

function TipItem({ tip }: { tip: Tip }) {
  const Icon = TIP_ICONS[tip.kind];
  return (
    <li className="tip">
      <span className={`tip__icon sev-${SEVERITY_CLASS[tip.sev]}`} aria-hidden="true">
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div className="tip__title">{tip.title}</div>
        <div className="tip__text">{tip.text}</div>
      </div>
    </li>
  );
}
