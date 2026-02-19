'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Returns true if the current user is an authenticated admin.
 * Re-checks on every route change so the gear icon appears
 * after logging in at /admin and navigating back to the site.
 */
export function useIsAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    fetch('/api/admin/auth/check')
      .then((res) => {
        if (!cancelled) setIsAdmin(res.ok);
      })
      .catch(() => {
        if (!cancelled) setIsAdmin(false);
      });

    return () => { cancelled = true; };
  }, [pathname]);

  return isAdmin;
}
