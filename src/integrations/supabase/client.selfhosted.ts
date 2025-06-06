
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Configuração para modo self-hosted
// Em modo self-hosted, o PostgreSQL está disponível no container da rede Docker
const SUPABASE_URL = 'http://postgres:5432'; // URL do PostgreSQL no container
const SUPABASE_ANON_KEY = 'local-development-key'; // Chave local para desenvolvimento

console.log('Self-hosted client configuration:', {
  url: SUPABASE_URL,
  mode: 'self-hosted'
});

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false, // Desabilitar persistência para self-hosted
  },
  db: {
    schema: 'public'
  }
});
