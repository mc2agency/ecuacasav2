'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Returns true if the current user is an authenticated admin.
 * Checks Supabase session first, then verifies against /api/admin/auth/check.
 * Result is cached for the lifetime of the component.
 */
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) return;

        const res = await fetch('/api/admin/auth/check');
        if (!cancelled && res.ok) {
          setIsAdmin(true);
        }
      } catch {
        // Not admin — leave false
      }
    }

    check();
    return () => { cancelled = true; };
  }, []);

  return isAdmin;
}
