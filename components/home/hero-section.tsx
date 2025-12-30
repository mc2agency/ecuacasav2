'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { SearchBar } from '@/components/shared/search-bar';
import { getLocalizedField } from '@/lib/i18n/helpers';
import { getHeroImage, getBlurDataURL } from '@/lib/utils/placeholders';

interface HeroSectionProps {
  services: Array<{
    slug: string;
    name_es: string;
    name_en: string;
  }>;
  locations: Array<{
    slug: string;
    name: string;
  }>;
}

export function HeroSection({ services, locations }: HeroSectionProps) {
  const { t, locale } = useTranslation();

  return (
    <section className="relative bg-gradient-to-b from-white via-blue-50/30 to-white overflow-hidden">
      {/* Hero Image - Right side on desktop, background on mobile */}
      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 opacity-40 lg:opacity-100">
        <Image
          src={getHeroImage()}
          alt="Cuenca, Ecuador"
          fill
          className="object-cover"
          priority
          placeholder="blur"
          blurDataURL={getBlurDataURL()}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 lg:via-white/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="max-w-2xl">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-50 border border-accent-200 rounded-full mb-6 shadow-sm">
            <CheckCircle className="w-4 h-4 text-accent-600" />
            <span className="text-sm font-medium text-accent-900">
              {t('hero.trust_badge')}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('hero.title')}
          </h1>

          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* Search Bar - Elevated */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 p-2 hover:border-accent-200 transition-colors">
            <SearchBar services={services} locations={locations} />
          </div>

          {/* Popular Services */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">{t('hero.popular')}:</span>
            {services.slice(0, 4).map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="px-3 py-1.5 bg-gray-100 hover:bg-accent-50 hover:text-accent-700 text-gray-700 text-sm font-medium rounded-full transition-all shadow-sm hover:shadow"
              >
                {getLocalizedField(service, 'name', locale)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
