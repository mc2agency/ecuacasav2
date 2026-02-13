'use client';

import { useTranslation } from '@/hooks/use-translation';
import { ClipboardList, Zap, CheckCircle } from 'lucide-react';

export function HowItWorks() {
  const { t, locale } = useTranslation();

  const steps = [
    {
      icon: ClipboardList,
      titleKey: 'how_it_works.new_step1_title',
      descKey: 'how_it_works.new_step1_desc',
      number: 1,
    },
    {
      icon: Zap,
      titleKey: 'how_it_works.new_step2_title',
      descKey: 'how_it_works.new_step2_desc',
      number: 2,
    },
    {
      icon: CheckCircle,
      titleKey: 'how_it_works.new_step3_title',
      descKey: 'how_it_works.new_step3_desc',
      number: 3,
    },
  ];

  return (
    <section className="py-6 sm:py-20 bg-gradient-to-b from-white via-blue-50/40 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4 sm:mb-16">
          <h2 className="text-xl sm:text-4xl font-bold text-gray-900 mb-1 sm:mb-4">
            {t('how_it_works.title')}
          </h2>
          <p className="text-xs sm:text-lg text-gray-600 max-w-2xl mx-auto">
            {t('how_it_works.subtitle')}
          </p>
        </div>

        {/* Mobile: Compact horizontal layout */}
        <div className="grid grid-cols-3 sm:hidden gap-2">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="text-center">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-600 text-white rounded-lg flex items-center justify-center font-bold text-sm mx-auto mb-2">
                  {step.number}
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-primary-50 to-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="text-xs font-bold text-gray-900 leading-tight">
                  {t(step.titleKey)}
                </h3>
              </div>
            );
          })}
        </div>

        {/* Desktop: Full cards */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Enhanced Connector Line */}
          <div className="absolute top-16 left-0 right-0 h-1">
            <div className="relative max-w-[80%] mx-auto h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-200 via-accent-300 to-accent-200 rounded-full" />
            </div>
          </div>

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative">
                <div className="relative bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:border-accent-200 hover:shadow-xl transition-all duration-300 text-center group">
                  {/* Large Step Number */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg z-10 group-hover:scale-110 transition-transform">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 mt-4 group-hover:from-accent-50 group-hover:to-accent-100 transition-colors">
                    <Icon className="w-10 h-10 text-primary-600 group-hover:text-accent-600 transition-colors" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base">
                    {t(step.descKey)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-6 sm:mt-16">
          <a
            href="/solicitar"
            className="inline-block px-6 sm:px-10 py-2.5 sm:py-4 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold text-sm sm:text-base rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 duration-300"
          >
            {t('how_it_works.cta')}
          </a>
        </div>
      </div>
    </section>
  );
}
