import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function createClient() {
  // Use non-NEXT_PUBLIC_ env vars for server-side to ensure availability at runtime
  // NEXT_PUBLIC_ vars are for client-side and may not be available in serverless functions
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables:', {
      url: !!supabaseUrl,
      key: !!supabaseKey,
      envKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
    });
    throw new Error('Missing Supabase environment variables');
  }

  return createSupabaseClient(supabaseUrl, supabaseKey);
}
