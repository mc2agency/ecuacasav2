import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client for server-side use with the ANON key.
 * This respects RLS policies. Use createAdminClient() from admin.ts for service role access.
 * Returns null if environment variables are missing (e.g., during build time).
 */
export async function createClient(): Promise<SupabaseClient | null> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase environment variables - returning null client');
    return null;
  }

  return createSupabaseClient(supabaseUrl, supabaseKey);
}
