import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(url && key);

// Com variáveis ausentes o app mostra uma tela de configuração e o cliente nunca é usado.
export const supabase = createClient(url || 'http://localhost', key || 'missing-key');
