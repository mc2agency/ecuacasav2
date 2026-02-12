'use client';

import { useTranslation } from '@/hooks/use-translation';
import { ClipboardList, Clock, ShieldCheck, Heart } from 'lucide-react';

export function TrustSignals() {
  const { t } = useTranslation();

  const signals = [
    {
      icon: ClipboardList,
      titleKey: 'trust.request_title',
      descKey: 'trust.request_desc',
    },
    {
      icon: Clock,
      titleKey: 'trust.response_title',
      descKey: 'trust.response_desc',
    },
    {
      icon: ShieldCheck,
      titleKey: 'trust.verified_title',
      descKey: 'trust.verified_desc',
    },
    {
      icon: Heart,
      titleKey: 'trust.commitment_title',
      descKey: 'trust.commitment_desc',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('trust.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('trust.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {signals.map((signal, idx) => {
            const Icon = signal.icon;
            return (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t(signal.titleKey)}
                </h3>
                <p className="text-gray-600 text-sm">
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
