import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

/**
 * Create a Supabase client for server components/route handlers using cookies (anon key).
 * Used for auth session validation.
 * Returns null if environment variables are missing.
 */
export async function createAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  const cookieStore = cookies();

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Ignore - can't set cookies in server components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Ignore
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase admin client (service role) for server-side only operations.
 * Returns null if environment variables are missing.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return createClient(url, serviceKey);
}

/**
 * Validate that the current request has a valid admin session.
 * Returns the user if valid, null otherwise.
 */
export async function validateAdminSession() {
  const supabase = await createAuthClient();
  if (!supabase) {
    return null;
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.email) {
    return null;
  }

  // Check if user is in admin_users table
  const adminClient = createAdminClient();
  if (!adminClient) {
    return null;
  }

  const { data: adminUser, error: adminError } = await adminClient
    .from('admin_users')
    .select('id')
    .eq('email', user.email)
    .single();

  if (adminError || !adminUser) {
    return null;
  }

  return user;
}
