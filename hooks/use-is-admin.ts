'use client';

import { useState, useEffect } from 'react';

/**
 * Returns true if the current user is an authenticated admin.
 * Calls the server-side auth check endpoint which validates
 * the session cookie against the admin_users table.
 */
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/admin/auth/check')
      .then((res) => {
        if (!cancelled && res.ok) {
          setIsAdmin(true);
        }
      })
      .catch(() => {
        // Not admin — leave false
      });

    return () => { cancelled = true; };
  }, []);

  return isAdmin;
}
