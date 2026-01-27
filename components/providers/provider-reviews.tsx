'use client';

import { useState } from 'react';
import { ReviewsList } from './reviews-list';
import { ReviewForm } from './review-form';

interface ProviderReviewsProps {
  providerId: string;
}

export function ProviderReviews({ providerId }: ProviderReviewsProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Reseñas / Reviews</h2>
      <ReviewsList providerId={providerId} refreshKey={refreshKey} />
      <ReviewForm providerId={providerId} onSubmitted={() => setRefreshKey(k => k + 1)} />
    </div>
  );
}
