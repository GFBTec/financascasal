import { useEffect, useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { Send, Sparkle } from 'lucide-react';
import type { Expense } from '../domain/types';
import { Modal } from '../components/ui/Modal';
import { useAssistantData } from '../hooks/useAssistantData';
import { askAssistant } from '../data/repository';
import { answerLocally } from '../domain/localAssistant';
import { monthName } from '../lib/date';
import { uid } from '../lib/id';
import './chat.css';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** Resposta das regras locais (IA indisponível ou sem chave). */
  local?: boolean;
  error?: boolean;
}

interface AssistantChatProps {
  monthKey: string;
  monthExpenses: Expense[];
  isCurrentMonth: boolean;
  /** Histórico fica no App para sobreviver ao fechar e abrir a conversa. */
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  onClose: () => void;
}

const SUGGESTIONS = [
  'Dá pra jantar fora no sábado?',
  'Onde podemos economizar?',
  'Como estamos vs. mês passado?',
  'O que falta pagar?',
];

export function AssistantChat({ monthKey, monthExpenses, isCurrentMonth, messages, setMessages, onClose }: AssistantChatProps) {
  const { buildContext, money } = useAssistantData(monthKey, monthExpenses, isCurrentMonth);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mantém a última mensagem visível.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages, loading]);

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setQuestion('');
    setLoading(true);
    setMessages((m) => [...m, { id: uid(), role: 'user', text: q }]);

    const context = buildContext();
    let reply: ChatMessage;
    try {
      reply = { id: uid(), role: 'assistant', text: await askAssistant(q, context) };
    } catch (e) {
      // Sem IA configurada (ou fora do ar): responde com as regras locais.
      console.warn('Assistente com IA indisponível; usando respostas automáticas.', e);
      try {
        reply = { id: uid(), role: 'assistant', text: answerLocally(q, context, money), local: true };
      } catch (err) {
        console.error(err);
        reply = {
          id: uid(),
          role: 'assistant',
          text: 'Não consegui responder agora. Tente de novo em instantes.',
          error: true,
        };
      }
    }
    setMessages((m) => [...m, reply]);
    setLoading(false);
    inputRef.current?.focus();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(question);
  };

  const empty = messages.length === 0;

  return (
    <Modal title="Assistente" onClose={onClose} maxWidth={560}>
      <div className="chat">
        {empty && (
          <div className="chat__intro">
            <span className="chat__intro-badge" aria-hidden="true">
              <Sparkle size={22} strokeWidth={2} />
            </span>
            <p>
              Pergunte sobre os gastos de <strong>{monthName(monthKey)}</strong>. Eu respondo com os números de vocês.
            </p>
          </div>
        )}

        <div className="chat__messages" aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={`chat__msg is-${m.role}${m.error ? ' is-error' : ''}`}>
              {m.role === 'assistant' && (
                <span className="chat__avatar" aria-hidden="true">
                  <Sparkle size={13} strokeWidth={2} />
                </span>
              )}
              <div className="chat__bubble">
                <p>{m.text}</p>
                {m.local && <span className="chat__note">Resposta automática · sem IA</span>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="chat__msg is-assistant">
              <span className="chat__avatar" aria-hidden="true">
                <Sparkle size={13} strokeWidth={2} />
              </span>
              <div className="chat__bubble chat__typing" aria-label="Analisando os gastos de vocês">
                <i />
                <i />
                <i />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="chat__footer">
        <div className="chat__chips">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="chat__chip" disabled={loading} onClick={() => ask(s)}>
              {s}
            </button>
          ))}
        </div>
        <form className="chat__form" onSubmit={submit}>
          <input
            ref={inputRef}
            className="chat__input"
            value={question}
            maxLength={300}
            placeholder="Pergunte ao assistente…"
            aria-label="Pergunta ao assistente"
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button type="submit" className="chat__send" aria-label="Enviar pergunta" disabled={loading || !question.trim()}>
            <Send size={18} strokeWidth={2} aria-hidden="true" />
          </button>
        </form>
      </div>
    </Modal>
  );
}
