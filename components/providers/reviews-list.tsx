'use client';

import { useEffect, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface ReviewsListProps {
  providerId: string;
  refreshKey?: number;
}

export function ReviewsList({ providerId, refreshKey }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reviews?provider_id=${providerId}`)
      .then(r => r.json())
      .then(data => setReviews(data.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [providerId, refreshKey]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="bg-gray-100 rounded-xl h-24" />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-xl">
        <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No hay reseñas aún — ¡sé el primero!</p>
        <p className="text-gray-400 text-sm">No reviews yet — be the first!</p>
      </div>
    );
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          <span className="font-bold text-gray-900">{avgRating.toFixed(1)}</span>
        </div>
        <span className="text-gray-500 text-sm">({reviews.length} reseña{reviews.length !== 1 ? 's' : ''})</span>
      </div>

      <div className="space-y-3">
        {reviews.map(review => (
          <div key={review.id} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{review.customer_name}</span>
              <span className="text-xs text-gray-400">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            {review.comment && (
              <p className="text-gray-600 text-sm">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
