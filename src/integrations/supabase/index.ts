
import { supabase as supabaseRemote } from './client';
import { supabase as supabaseLocal } from './client.local';
import { supabase as supabaseSelfHosted } from './client.selfhosted';

// Determinar qual cliente usar baseado nas variáveis de ambiente
const USE_LOCAL = import.meta.env.VITE_USE_LOCAL_SUPABASE === 'true';
const SELF_HOSTED = import.meta.env.VITE_SELF_HOSTED === 'true';
const NODE_ENV = import.meta.env.MODE;

console.log('Supabase Environment Check:', {
  USE_LOCAL,
  SELF_HOSTED,
  NODE_ENV,
  VITE_USE_LOCAL_SUPABASE: import.meta.env.VITE_USE_LOCAL_SUPABASE,
  VITE_SELF_HOSTED: import.meta.env.VITE_SELF_HOSTED
});

// Lógica de seleção do cliente - prioriza self-hosted e local sobre remoto
export const supabase = SELF_HOSTED 
  ? supabaseSelfHosted 
  : USE_LOCAL 
    ? supabaseLocal 
    : supabaseRemote;

// Função para verificar o modo de operação
export const getOperationMode = () => {
  if (SELF_HOSTED) return 'self-hosted';
  if (USE_LOCAL) return 'local';
  return 'remote';
};

// Função para verificar se está em modo self-hosted
export const isSelfHosted = () => SELF_HOSTED;

// Log do modo atual para debug
const currentMode = getOperationMode();
console.log('Supabase Operation Mode:', currentMode);
console.log('Selected client:', SELF_HOSTED ? 'Self-hosted' : USE_LOCAL ? 'Local' : 'Remote');
