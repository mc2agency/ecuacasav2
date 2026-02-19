'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RatingStars } from '@/components/shared/rating-stars';
import { WhatsAppButton } from '@/components/shared/whatsapp-button';
import { useTranslation } from '@/hooks/use-translation';
import { getLocalizedField } from '@/lib/i18n/helpers';
import { getProviderPlaceholder, getBlurDataURL } from '@/lib/utils/placeholders';
import { CheckCircle, Clock, Filter, X } from 'lucide-react';

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
  featured: boolean;
  phone: string;
  services: Array<{ slug: string; name_es: string; name_en: string }>;
}

interface Service {
  slug: string;
  name_es: string;
  name_en: string;
}

interface ProvidersFilterProps {
  providers: Provider[];
  services: Service[];
  initialService?: string;
}

export function ProvidersFilter({ providers, services, initialService = '' }: ProvidersFilterProps) {
  const { locale } = useTranslation();
  const [filters, setFilters] = useState({
    service: initialService,
    speaksEnglish: false,
    verified: false,
  });

  const filteredProviders = providers.filter((provider) => {
    if (filters.speaksEnglish && !provider.speaks_english) return false;
    if (filters.verified && !provider.verified) return false;
    if (filters.service && !provider.services.some((s) => s.slug === filters.service)) return false;
    return true;
  });

  const activeFiltersCount = [filters.service, filters.speaksEnglish, filters.verified].filter(Boolean).length;
  const clearFilters = () => setFilters({ service: '', speaksEnglish: false, verified: false });

  return (
    <>
      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filters.service}
            onChange={(e) => setFilters({ ...filters, service: e.target.value })}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            <option value="">Todos los servicios</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {getLocalizedField(service, 'name', locale)}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.speaksEnglish}
              onChange={(e) => setFilters({ ...filters, speaksEnglish: e.target.checked })}
              className="rounded border-gray-300 text-accent-600 focus:ring-accent-500"
            />
            <span className="text-sm text-gray-700">Habla Inglés</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.verified}
              onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
              className="rounded border-gray-300 text-accent-600 focus:ring-accent-500"
            />
            <span className="text-sm text-gray-700">Verificado</span>
          </label>

          {activeFiltersCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4" />
              Limpiar filtros
            </button>
          )}

          <div className="ml-auto text-sm text-gray-500">
            {filteredProviders.length} profesionales
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      {filteredProviders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <Card key={provider.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-accent-200">
              <CardContent className="p-0">
                <Link href={`/providers/${provider.slug}`}>
                  <div className="relative h-48 w-full bg-gradient-to-br from-primary-50 to-blue-100 overflow-hidden">
                    {provider.photo_url ? (
                      <img
                        src={`/api/providers/${provider.id}/photo`}
                        alt={provider.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Image
                        src={getProviderPlaceholder(provider.name)}
                        alt={provider.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        placeholder="blur"
                        blurDataURL={getBlurDataURL()}
                      />
                    )}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      {provider.verified && (
                        <div className="bg-success text-white px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-medium shadow-lg">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verificado
                        </div>
                      )}
                      {provider.featured && (
                        <div className="bg-accent-500 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-lg">
                          Destacado
                        </div>
                      )}
                    </div>
                  </div>
                </Link>

                <div className="p-5">
                  <Link href={`/providers/${provider.slug}`}>
                    <h3 className="text-xl font-bold text-gray-900 hover:text-accent-600 transition-colors mb-2">
                      {provider.name}
                    </h3>
                  </Link>

                  {provider.services.length > 0 && (
                    <p className="text-sm text-gray-600 mb-3">
                      {getLocalizedField(provider.services[0], 'name', locale)}
                      {provider.services.length > 1 && ` +${provider.services.length - 1}`}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <RatingStars rating={provider.rating} size="sm" showValue />
                      <span className="text-sm text-gray-500">({provider.review_count})</span>
                    </div>

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

                    {provider.speaks_english && (
                      <Badge variant="outline" className="text-xs border-accent-300 text-accent-700 bg-accent-50">
                        Habla Inglés
                      </Badge>
                    )}
                  </div>

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
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No se encontraron profesionales
          </h3>
          <p className="text-gray-600 mb-6">
            Intenta ajustar los filtros para ver más resultados
          </p>
          <Button onClick={clearFilters} variant="outline">
            Limpiar filtros
          </Button>
        </div>
      )}
    </>
  );
}
