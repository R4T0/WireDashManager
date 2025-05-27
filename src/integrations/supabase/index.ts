
import { supabase as supabaseRemote } from './client';
import { supabase as supabaseLocal } from './client.local';
import { supabase as supabaseSelfHosted } from './client.selfhosted';

// Determinar qual cliente usar baseado nas variáveis de ambiente
// Em produção, essas variáveis não devem existir ou devem ser 'false'
const USE_LOCAL = import.meta.env.VITE_USE_LOCAL_SUPABASE === 'true';
const SELF_HOSTED = import.meta.env.VITE_SELF_HOSTED === 'true';

console.log('Supabase Environment Check:', {
  USE_LOCAL,
  SELF_HOSTED,
  NODE_ENV: import.meta.env.MODE,
  VITE_USE_LOCAL_SUPABASE: import.meta.env.VITE_USE_LOCAL_SUPABASE,
  VITE_SELF_HOSTED: import.meta.env.VITE_SELF_HOSTED
});

// Forçar uso do cliente remoto em produção
const isProduction = import.meta.env.MODE === 'production';

export const supabase = isProduction 
  ? supabaseRemote  // Sempre usar remoto em produção
  : SELF_HOSTED 
    ? supabaseSelfHosted 
    : USE_LOCAL 
      ? supabaseLocal 
      : supabaseRemote;

// Função para verificar o modo de operação
export const getOperationMode = () => {
  if (isProduction) return 'production-remote';
  if (SELF_HOSTED) return 'self-hosted';
  if (USE_LOCAL) return 'local';
  return 'remote';
};

// Função para verificar se está em modo self-hosted
export const isSelfHosted = () => !isProduction && SELF_HOSTED;

// Log do modo atual para debug
console.log('Supabase Operation Mode:', getOperationMode());
