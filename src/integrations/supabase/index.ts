
import { supabase as supabaseLocal } from './client.local';
import { supabase as supabaseSelfHosted } from './client.selfhosted';

// Configuração simplificada para modo self-hosted
const USE_LOCAL = import.meta.env.VITE_USE_LOCAL_SUPABASE === 'true';
const SELF_HOSTED = import.meta.env.VITE_SELF_HOSTED !== 'false'; // Default para true
const NODE_ENV = import.meta.env.MODE;

console.log('Supabase Environment Check (Self-Hosted Mode):', {
  USE_LOCAL,
  SELF_HOSTED,
  NODE_ENV,
  VITE_USE_LOCAL_SUPABASE: import.meta.env.VITE_USE_LOCAL_SUPABASE,
  VITE_SELF_HOSTED: import.meta.env.VITE_SELF_HOSTED
});

// Lógica simplificada - prioriza self-hosted
export const supabase = SELF_HOSTED 
  ? supabaseSelfHosted 
  : supabaseLocal;

// Função para verificar o modo de operação
export const getOperationMode = () => {
  if (SELF_HOSTED) return 'self-hosted';
  if (USE_LOCAL) return 'local';
  return 'self-hosted'; // Default para self-hosted
};

// Função para verificar se está em modo self-hosted
export const isSelfHosted = () => SELF_HOSTED;

// Log do modo atual para debug
const currentMode = getOperationMode();
console.log('Supabase Operation Mode (Self-Hosted):', currentMode);
console.log('Selected client:', SELF_HOSTED ? 'Self-hosted' : 'Local Development');
