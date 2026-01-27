'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

export function AnalyticsProvider() {
  const pathname = usePathname();
  const lastPath = useRef('');

  useEffect(() => {
    if (pathname && pathname !== lastPath.current) {
      lastPath.current = pathname;
      trackPageView(pathname);
    }
  }, [pathname]);

  return null;
}
