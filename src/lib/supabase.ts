import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://qjixkjsmeysdfewdezqo.supabase.co';
const FALLBACK_ANON_KEY = 'sb_publishable_qgN-4vMHVqGCNCn67DKPAw_W7pKC9Db';

function resolveSupabaseUrl(): string {
  try {
    let candidate = '';
    if (typeof import.meta !== 'undefined' && (import.meta as any)?.env) {
      const metaEnv = (import.meta as any).env;
      candidate = metaEnv.VITE_SUPABASE_URL || metaEnv.NEXT_PUBLIC_SUPABASE_URL || '';
    }
    if (!candidate && typeof process !== 'undefined' && process?.env) {
      candidate = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    }

    if (typeof candidate === 'string') {
      const trimmed = candidate.trim().replace(/^['"]|['"]$/g, '');
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        new URL(trimmed);
        return trimmed;
      }
    }
  } catch {
    // URL parsing failed, use fallback
  }
  return FALLBACK_URL;
}

function resolveSupabaseKey(): string {
  try {
    let candidate = '';
    if (typeof import.meta !== 'undefined' && (import.meta as any)?.env) {
      const metaEnv = (import.meta as any).env;
      candidate = metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
    }
    if (!candidate && typeof process !== 'undefined' && process?.env) {
      candidate = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
    }

    if (typeof candidate === 'string') {
      const trimmed = candidate.trim().replace(/^['"]|['"]$/g, '');
      if (trimmed.length > 5 && !trimmed.includes('MY_SUPABASE')) {
        return trimmed;
      }
    }
  } catch {
    // Failed, use fallback
  }
  return FALLBACK_ANON_KEY;
}

export const SUPABASE_URL: string = resolveSupabaseUrl();
export const SUPABASE_ANON_KEY: string = resolveSupabaseKey();

export const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const createClient = () => supabase;
