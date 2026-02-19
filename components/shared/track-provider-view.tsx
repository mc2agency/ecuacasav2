'use client';

import { useEffect } from 'react';
import { trackProviderView } from '@/lib/analytics';

export function TrackProviderView({ slug }: { slug: string }) {
  useEffect(() => {
    trackProviderView(slug);
  }, [slug]);

  return null;
}
