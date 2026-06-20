/**
 * Why this file exists:
 * Singleton Supabase client instance shared across the entire app.
 * Uses Vite's import.meta.env to read environment variables at build time.
 * The anon key is safe to expose client-side — Row Level Security in
 * Supabase controls actual data access.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Guard against missing configuration to fail fast during development
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — ' +
    'falling back to local data. Set these in your .env file.'
  );
}

/**
 * The Supabase client instance (or null if env vars are missing)
 * @type {import('@supabase/supabase-js').SupabaseClient | null}
 */
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
