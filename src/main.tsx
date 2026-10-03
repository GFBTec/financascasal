import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Estilos globais antes dos componentes, para que o CSS deles venha depois na cascata.
import './styles/tokens.css';
import './styles/global.css';
import { GastosProvider } from './state/GastosContext';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GastosProvider>
      <App />
    </GastosProvider>
  </StrictMode>,
);
