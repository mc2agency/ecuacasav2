'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';

export function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 relative overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto text-center px-4">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
          {t('cta.new_title')}
        </h2>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          {t('cta.new_subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/solicitar">
            <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all shadow-xl hover:shadow-2xl">
              {t('cta.request_service')}
            </button>
          </Link>
          <Link href="/providers">
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all">
              {t('cta.browse_providers')}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
