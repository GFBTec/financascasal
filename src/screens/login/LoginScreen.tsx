import { useState, type FormEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../domain/constants';
import { FullScreen } from '../../components/layout/FullScreen';

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
    if (error) {
      setError(
        error.message.includes('Invalid login credentials')
          ? 'E-mail ou senha incorretos.'
          : 'Não foi possível entrar. Tente de novo.',
      );
    }
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
