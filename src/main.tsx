import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Estilos globais antes dos componentes, para que o CSS deles venha depois na cascata.
import './styles/tokens.css';
import './styles/global.css';
import { supabaseConfigured } from './lib/supabase';
import { AuthGate } from './state/AuthContext';
import { GastosProvider } from './state/GastosContext';
import { FullScreen } from './components/layout/FullScreen';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {supabaseConfigured ? (
      <AuthGate>
        <GastosProvider>
          <App />
        </GastosProvider>
      </AuthGate>
    ) : (
      <FullScreen
        title="Falta configurar"
        message="Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY (veja .env.example)."
      />
    )}
  </StrictMode>,
);
