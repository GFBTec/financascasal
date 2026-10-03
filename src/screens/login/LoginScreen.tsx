import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../domain/constants';
import { FullScreen } from '../../components/layout/FullScreen';

function loginErrorMessage(code: string | undefined, message: string) {
  switch (code) {
    case 'invalid_credentials':
      return 'E-mail ou senha incorretos.';
    case 'email_not_confirmed':
      return 'E-mail ainda não confirmado. Confirme o usuário no painel do Supabase.';
    case 'over_request_rate_limit':
    case 'over_email_send_rate_limit':
      return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.';
    default:
      return `Não foi possível entrar: ${message}`;
  }
}

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) setError(loginErrorMessage(error.code, error.message));
  };

  return (
    <FullScreen title="Entrar">
      <form className="stack" style={{ gap: 12 }} onSubmit={submit}>
        <input
          className="text-input"
          type="email"
          autoComplete="email"
          placeholder="E-mail"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="text-input"
          type="password"
          autoComplete="current-password"
          placeholder="Senha"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div style={{ fontSize: 14, color: COLORS.alertText }}>{error}</div>}
        <button type="submit" className="btn-primary" disabled={loading} style={{ opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </FullScreen>
  );
}
