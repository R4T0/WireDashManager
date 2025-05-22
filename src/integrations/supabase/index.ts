
import { supabase as supabaseRemote } from './client';
import { supabase as supabaseLocal } from './client.local';

// Use environment variable to determine which client to use
const USE_LOCAL = import.meta.env.VITE_USE_LOCAL_SUPABASE === 'true';

export const supabase = USE_LOCAL ? supabaseLocal : supabaseRemote;
