
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get variables from .env.local file
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
