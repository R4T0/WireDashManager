
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Configuração para modo self-hosted
// Conecta diretamente ao PostgreSQL do container Docker
const SUPABASE_URL = 'http://localhost:5432'; // PostgreSQL direto
const SUPABASE_ANON_KEY = 'self-hosted-key'; // Chave local para self-hosted

console.log('Self-hosted client configuration:', {
  url: SUPABASE_URL,
  mode: 'self-hosted',
  note: 'Conectando diretamente ao PostgreSQL'
});

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // Habilitar persistência para self-hosted
    storage: localStorage,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'wiredash-selfhosted'
    }
  }
});
