import { createClient } from '@supabase/supabase-js';

/**
 * ============================================================================
 *  SUPABASE CLIENT
 * ============================================================================
 *  Reads the project URL and anon (public) key from Vite env vars — see
 *  .env.local.example for what to put in .env.local for local dev, and set
 *  the same two vars in the Vercel project's Environment Variables for prod.
 *
 *  The anon key is safe to ship to the browser: it can only do what the
 *  database's Row Level Security policies (supabase/schema.sql) allow it to.
 *  Public reads (site content, gallery) and public inserts (leads, page
 *  views) are intentional; everything else requires a signed-in session.
 * ============================================================================
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Loud in dev, harmless in prod once the env vars are set on Vercel.
  console.warn(
    'Supabase env vars are missing — VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. ' +
      'See .env.local.example.'
  );
}

export const supabase = createClient(url ?? '', anonKey ?? '');
