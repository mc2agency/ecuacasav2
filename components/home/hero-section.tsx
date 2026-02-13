'use client';

import Link from 'next/link';
import { MapPin, ClipboardList, Zap, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export function HeroSection() {
  const { t } = useTranslation();

  const steps = [
    { icon: ClipboardList, text: t('hero.step1'), number: '1' },
    { icon: Zap, text: t('hero.step2'), number: '2' },
    { icon: CheckCircle, text: t('hero.step3'), number: '3' },
  ];

  return (
    <section className="pt-16 relative overflow-hidden">
      {/* Gradient Background with Animated Blobs */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-yellow-50">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Trending Badge */}
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4 sm:mb-8 border border-gray-200">
            <MapPin className="w-4 h-4 text-purple-600" />
            Cuenca, Ecuador
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-gray-900 mb-4 sm:mb-6">
            {t('hero.new_title')}{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t('hero.cuenca')}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-10 max-w-2xl mx-auto">
            {t('hero.new_subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-16">
            <Link
              href="/solicitar"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base sm:text-lg rounded-xl hover:shadow-xl hover:scale-105 transition-all"
            >
              {t('hero.cta_request')}
            </Link>
            <Link
              href="/providers"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-800 font-bold text-base sm:text-lg rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all"
            >
              {t('hero.cta_providers')}
            </Link>
            <Link
              href="/propiedades"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-800 font-bold text-base sm:text-lg rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all"
            >
              {t('hero.cta_properties')}
            </Link>
          </div>

          {/* 3-Step Visual - Always horizontal */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 max-w-3xl mx-auto">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 bg-white/80 backdrop-blur rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 shadow-lg border border-white/50">
                    <Icon className="w-5 h-5 sm:w-8 sm:h-8 text-purple-600" />
                  </div>
                  <p className="text-gray-700 font-medium text-xs sm:text-sm text-center leading-tight">{step.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
