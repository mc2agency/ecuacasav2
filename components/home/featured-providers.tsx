'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RatingStars } from '@/components/shared/rating-stars';
import { WhatsAppButton } from '@/components/shared/whatsapp-button';
import { useTranslation } from '@/hooks/use-translation';
import { getLocalizedField } from '@/lib/i18n/helpers';
import { CheckCircle, Clock } from 'lucide-react';

interface Provider {
  id: string;
  slug: string;
  name: string;
  photo_url?: string | null;
  description_es: string;
  description_en: string;
  rating: number;
  review_count: number;
  price_range: string;
  response_time: string;
  verified: boolean;
  speaks_english: boolean;
  phone: string;
  services: Array<{
    name_es: string;
    name_en: string;
  }>;
  neighborhoods: Array<{
    name: string;
  }>;
}

interface FeaturedProvidersProps {
  providers: Provider[];
}

export function FeaturedProviders({ providers }: FeaturedProvidersProps) {
  const { t, locale } = useTranslation();

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('providers.featured_title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('providers.featured_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider, i) => (
            <Card key={provider.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-purple-300">
              <CardContent className="p-0">
                {/* Provider Header with Avatar */}
                <Link href={`/providers/${provider.slug}`}>
                  <div className="relative h-48 w-full bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden flex items-center justify-center">
                    {provider.photo_url ? (
                      <img
                        src={`/api/providers/${provider.id}/photo`}
                        alt={provider.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl group-hover:scale-110 transition-transform">
                        {provider.name?.charAt(0) || 'P'}
                      </div>
                    )}
                    {/* Verified Badge Overlay */}
                    {provider.verified && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-medium shadow-lg">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {t('providers.verified')}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Content */}
                <div className="p-5">
                  <Link href={`/providers/${provider.slug}`}>
                    <h3 className="text-xl font-bold text-gray-900 hover:text-accent-600 transition-colors mb-2">
                      {provider.name}
                    </h3>
                  </Link>

                  {/* Primary Service */}
                  {provider.services.length > 0 && (
                    <p className="text-sm text-gray-600 mb-3">
                      {getLocalizedField(provider.services[0], 'name', locale)}
                      {provider.services.length > 1 && ` +${provider.services.length - 1}`}
                    </p>
                  )}

                  {/* Key Stats - Only 5 data points */}
                  <div className="space-y-2 mb-4">
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <RatingStars rating={provider.rating} size="sm" showValue />
                      <span className="text-sm text-gray-500">({provider.review_count})</span>
                    </div>

                    {/* Response Time & Price */}
                    <div className="flex items-center justify-between text-sm">
                      {provider.response_time && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{provider.response_time}</span>
                        </div>
                      )}
                      {provider.price_range && (
                        <span className="font-semibold text-gray-900">{provider.price_range}</span>
                      )}
                    </div>

                    {/* Speaks English Badge */}
                    {provider.speaks_english && (
                      <Badge variant="outline" className="text-xs border-accent-300 text-accent-700 bg-accent-50">
                        {t('providers.speaks_english')}
                      </Badge>
                    )}
                  </div>

                  {/* WhatsApp Button */}
                  <WhatsAppButton
                    providerName={provider.name}
                    phoneNumber={provider.phone}
                    providerId={provider.id}
                    serviceName={provider.services[0]?.name_en}
                    size="sm"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/providers"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl hover:shadow-xl transition-all hover:scale-105"
          >
            {t('providers.view_all')}
          </Link>
        </div>
      </div>
    </section>
  );
}
