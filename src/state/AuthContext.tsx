import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { isMember } from '../data/repository';
import { FullScreen } from '../components/layout/FullScreen';
import { LoginScreen } from '../screens/login/LoginScreen';

interface AuthContextValue {
  email: string;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const signOut = () => {
  supabase.auth.signOut();
};

/** Só renderiza `children` com sessão ativa de um e-mail cadastrado em `members`. */
export function AuthGate({ children }: { children: ReactNode }) {
  // undefined = ainda verificando
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [member, setMember] = useState<boolean | undefined>(undefined);
  const userId = session?.user.id;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMember(undefined);
    if (!userId) return;
    let active = true;
    isMember()
      .then((m) => active && setMember(m))
      // Falha de rede: segue adiante e deixa o carregamento dos dados mostrar o erro.
      .catch(() => active && setMember(true));
    return () => {
      active = false;
    };
  }, [userId]);

  if (session === undefined) return <FullScreen message="Carregando…" />;
  if (!session) return <LoginScreen />;
  if (member === undefined) return <FullScreen message="Verificando acesso…" />;
  if (!member) {
    return (
      <FullScreen
        title="Sem acesso"
        message={`O e-mail ${session.user.email} não está liberado neste app.`}
        action={{ label: 'Sair', onClick: signOut }}
      />
    );
  }

  return (
    <AuthContext.Provider value={{ email: session.user.email ?? '', signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthGate>');
  return ctx;
}
