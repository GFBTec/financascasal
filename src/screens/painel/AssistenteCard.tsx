import { useMemo, useState, type FormEvent } from 'react';
import {
  Check,
  Clock,
  Gauge,
  Minus,
  PiggyBank,
  Plus,
  Send,
  Sparkle,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import {
  assistantSummary,
  buildAssistantContext,
  buildTips,
  paceIsOver,
  type AssistantContext,
  type Tip,
  type TipKind,
  type TipSeverity,
} from '../../domain/assistant';
import {
  categorySummary,
  contributionFor,
  previousPeriodTotal,
  sumAmounts,
  topExpenses,
  totalsByPerson,
} from '../../domain/calculations';
import type { Expense } from '../../domain/types';
import { useGastos } from '../../state/GastosContext';
import { useHideValues } from '../../hooks/useHideValues';
import { askAssistant } from '../../data/repository';
import { answerLocally } from '../../domain/localAssistant';
import { formatBRL } from '../../lib/format';
import { MONTHS_SHORT, daysInMonth, monthLabel, monthName, shiftMonth } from '../../lib/date';

interface AssistenteCardProps {
  monthKey: string;
  monthExpenses: Expense[];
  isCurrentMonth: boolean;
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

const SUGGESTIONS = ['Dá pra jantar fora no sábado?', 'Onde podemos economizar?', 'Como estamos vs. mês passado?'];

const shortDate = (d: Date) => `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;

export function AssistenteCard({ monthKey, monthExpenses, isCurrentMonth }: AssistenteCardProps) {
  const { expenses, budgets, contribs, payday, setPayday } = useGastos();
  const { hidden, mask } = useHideValues();
  const money = (v: number) => mask(formatBRL(v));

  // "Hoje" de referência: o dia atual, ou o último dia de um mês já fechado.
  const today = useMemo(() => {
    const now = new Date();
    if (isCurrentMonth) return now;
    const [y, m] = monthKey.split('-').map(Number);
    return new Date(y, m - 1, daysInMonth(monthKey));
  }, [isCurrentMonth, monthKey]);

  const contribution = contributionFor(contribs, monthKey);
  const deposit = (Number(contribution.enddy) || 0) + (Number(contribution.bento) || 0);
  const casalExpenses = useMemo(() => monthExpenses.filter((e) => e.who === 'casal'), [monthExpenses]);
  const summary = assistantSummary({ today, payday, deposit, casalExpenses });

  const categories = useMemo(() => categorySummary(monthExpenses, budgets), [monthExpenses, budgets]);
  const pending = useMemo(() => monthExpenses.filter((e) => e.status === 'pendente'), [monthExpenses]);
  const total = sumAmounts(monthExpenses);
  const prevTotal = useMemo(
    () => previousPeriodTotal(expenses, monthKey, today, isCurrentMonth),
    [expenses, monthKey, today, isCurrentMonth],
  );
  const dim = daysInMonth(monthKey);
  const tips = buildTips({
    categories,
    monthProgress: (today.getDate() / dim) * 100,
    daysRemaining: Math.max(1, dim - today.getDate() + 1),
    pending,
    total,
    prevTotal,
    prevMonthName: monthName(shiftMonth(monthKey, -1)),
    fmt: money,
  });

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

      <AskAssistant
        money={money}
        buildContext={() =>
          buildAssistantContext({
            monthLabel: monthLabel(monthKey),
            isCurrentMonth,
            today,
            summary,
            contribution,
            byPerson: mapTotals(totalsByPerson(monthExpenses)),
            categories,
            pending,
            prevTotal,
            total,
            top: topExpenses(monthExpenses),
          })
        }
      />
    </section>
  );
}

const mapTotals = (t: ReturnType<typeof totalsByPerson>) => ({
  enddy: t.enddy.total,
  bento: t.bento.total,
  casal: t.casal.total,
});

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
  summary: ReturnType<typeof assistantSummary>;
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

// ---------------------------------------------------------------------------

interface AskAssistantProps {
  buildContext: () => AssistantContext;
  money: (v: number) => string;
}

function AskAssistant({ buildContext, money }: AskAssistantProps) {
  const [question, setQuestion] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [answer, setAnswer] = useState('');
  /** true = resposta das regras locais (IA indisponível ou sem chave). */
  const [local, setLocal] = useState(false);
  const loading = state === 'loading';

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setQuestion(q);
    setState('loading');
    const context = buildContext();
    try {
      setAnswer(await askAssistant(q, context));
      setLocal(false);
      setState('done');
    } catch (e) {
      // Sem IA configurada (ou fora do ar): responde com as regras locais.
      console.warn('Assistente com IA indisponível; usando respostas automáticas.', e);
      try {
        setAnswer(answerLocally(q, context, money));
        setLocal(true);
        setState('done');
      } catch (err) {
        console.error(err);
        setState('error');
      }
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(question);
  };

  return (
    <div className="ask">
      <div className="ask__chips">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" className="ask__chip" disabled={loading} onClick={() => ask(s)}>
            {s}
          </button>
        ))}
      </div>

      <form className="ask__form" onSubmit={submit}>
        <input
          className="ask__input"
          value={question}
          maxLength={300}
          placeholder="Pergunte ao assistente…"
          aria-label="Pergunta ao assistente"
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button type="submit" className="ask__send" aria-label="Enviar pergunta" disabled={loading || !question.trim()}>
          <Send size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </form>

      <div aria-live="polite">
        {state === 'loading' && <p className="ask__status">Analisando os gastos de vocês…</p>}
        {state === 'error' && (
          <p className="ask__status is-error">Não consegui responder agora. Tente de novo em instantes.</p>
        )}
        {state === 'done' && (
          <div className="ask__answer">
            <Sparkle size={16} strokeWidth={2} aria-hidden="true" />
            <div>
              <p>{answer}</p>
              {local && <span className="ask__note">Resposta automática · sem IA</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
