'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { getLocalizedField } from '@/lib/i18n/helpers';

interface Service {
  slug: string;
  name_es: string;
  name_en: string;
  description_es: string;
  description_en: string;
}

interface ServiceGridProps {
  services: Service[];
}

// Colorful gradients for each service type
const SERVICE_GRADIENTS: Record<string, string> = {
  'plomeria': 'from-blue-500 to-blue-600',
  'electricidad': 'from-yellow-500 to-orange-500',
  'carpinteria': 'from-amber-600 to-orange-600',
  'pintura': 'from-green-500 to-emerald-600',
  'limpieza': 'from-cyan-500 to-blue-500',
  'jardineria': 'from-emerald-500 to-green-600',
  'aire': 'from-sky-500 to-blue-500',
  'handyman': 'from-orange-500 to-red-500',
};

// Emojis for each service
const SERVICE_EMOJIS: Record<string, string> = {
  'plomeria': '🔧',
  'electricidad': '⚡',
  'carpinteria': '🔨',
  'pintura': '🎨',
  'limpieza': '🧹',
  'jardineria': '🌿',
  'aire': '❄️',
  'handyman': '🛠️',
};

export function ServiceGrid({ services }: ServiceGridProps) {
  const { t, locale } = useTranslation();

  const getGradient = (slug: string) => {
    return SERVICE_GRADIENTS[slug] || 'from-purple-600 to-pink-600';
  };

  const getEmoji = (slug: string) => {
    return SERVICE_EMOJIS[slug] || '➕';
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
            {t('services.browse_title')}
          </h2>
          <p className="text-gray-600">
            {t('services.browse_subtitle')}
          </p>
        </div>

        {/* Compact Colorful Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {services.slice(0, 5).map((service) => (
            <Link
              key={service.slug}
              href={`/solicitar?servicio=${service.slug}`}
              className={`bg-gradient-to-br ${getGradient(service.slug)} text-white rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group text-center hover:scale-105`}
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {getEmoji(service.slug)}
              </div>
              <h3 className="font-bold text-sm">
                {getLocalizedField(service, 'name', locale)}
              </h3>
            </Link>
          ))}

          {/* View All Card */}
          <Link
            href="/services"
            className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group text-center hover:scale-105"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
              ➕
            </div>
            <h3 className="font-bold text-sm">
              {t('services.view_all')}
            </h3>
          </Link>
        </div>
      </div>
    </section>
  );
}
