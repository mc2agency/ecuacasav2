'use client';

import { useTranslation } from '@/hooks/use-translation';
import { ClipboardList, Clock, Shield, Heart } from 'lucide-react';

export function TrustSignals() {
  const { t } = useTranslation();

  const signals = [
    {
      icon: ClipboardList,
      titleKey: 'trust.concierge_title',
      descKey: 'trust.concierge_desc',
    },
    {
      icon: Clock,
      titleKey: 'trust.fast_title',
      descKey: 'trust.fast_desc',
    },
    {
      icon: Shield,
      titleKey: 'trust.verified_title',
      descKey: 'trust.verified_desc',
    },
    {
      icon: Heart,
      titleKey: 'trust.free_title',
      descKey: 'trust.free_desc',
    },
  ];

  return (
    <section className="py-8 sm:py-20 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            {t('trust.title')}
          </h2>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
            {t('trust.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {signals.map((signal, idx) => {
            const Icon = signal.icon;
            return (
              <div key={idx} className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4">
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
                </div>
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                  {t(signal.titleKey)}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  {t(signal.descKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
