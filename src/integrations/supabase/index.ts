
import { supabase as supabaseRemote } from './client';
import { supabase as supabaseLocal } from './client.local';
import { supabase as supabaseSelfHosted } from './client.selfhosted';

// Determinar qual cliente usar baseado nas variáveis de ambiente
const USE_LOCAL = import.meta.env.VITE_USE_LOCAL_SUPABASE === 'true';
const SELF_HOSTED = import.meta.env.VITE_SELF_HOSTED === 'true';

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
