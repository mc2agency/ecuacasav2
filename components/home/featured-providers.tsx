'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RatingStars } from '@/components/shared/rating-stars';
import { WhatsAppButton } from '@/components/shared/whatsapp-button';
import { useTranslation } from '@/hooks/use-translation';
import { getLocalizedField } from '@/lib/i18n/helpers';
import { CheckCircle, MapPin, Clock } from 'lucide-react';

interface Provider {
  id: string;
  slug: string;
  name: string;
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
    <section className="py-16 sm:py-20 bg-white">
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
          {providers.map((provider) => (
            <Card key={provider.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <Link href={`/providers/${provider.slug}`}>
                      <h3 className="text-xl font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                        {provider.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      <RatingStars rating={provider.rating} size="sm" showValue />
                      <span className="text-sm text-gray-500">
                        ({provider.review_count})
                      </span>
                    </div>
                  </div>
                  {provider.verified && (
                    <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {getLocalizedField(provider, 'description', locale)}
                </p>

                <div className="space-y-2 mb-4">
                  {provider.services.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {provider.services.slice(0, 2).map((service, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {getLocalizedField(service, 'name', locale)}
                        </Badge>
                      ))}
                      {provider.services.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{provider.services.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {provider.neighborhoods.length > 0 && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{provider.neighborhoods[0].name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{provider.response_time}</span>
                    </div>
                    <span className="font-medium">{provider.price_range}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {provider.speaks_english && (
                    <Badge variant="outline" className="text-xs border-primary-300 text-primary-700">
                      {t('providers.speaks_english')}
                    </Badge>
                  )}
                  {provider.verified && (
                    <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                      {t('providers.verified')}
                    </Badge>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
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
            className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            {t('providers.view_all')}
          </Link>
        </div>
      </div>
    </section>
  );
}
