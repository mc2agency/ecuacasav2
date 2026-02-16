'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import {
  ClipboardList,
  Zap,
  MessageCircle,
  Star,
  UserPlus,
  ClipboardCheck,
  Briefcase,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';

export default function HowItWorksPage() {
  const { t, locale } = useTranslation();

  const clientSteps = [
    { icon: ClipboardList, titleKey: 'hiw.clients_step1', descKey: 'hiw.clients_step1_desc', number: 1 },
    { icon: Zap, titleKey: 'hiw.clients_step2', descKey: 'hiw.clients_step2_desc', number: 2 },
    { icon: MessageCircle, titleKey: 'hiw.clients_step3', descKey: 'hiw.clients_step3_desc', number: 3 },
    { icon: Star, titleKey: 'hiw.clients_step4', descKey: 'hiw.clients_step4_desc', number: 4 },
  ];

  const providerSteps = [
    { icon: UserPlus, titleKey: 'hiw.providers_step1', descKey: 'hiw.providers_step1_desc', number: 1 },
    { icon: ClipboardCheck, titleKey: 'hiw.providers_step2', descKey: 'hiw.providers_step2_desc', number: 2 },
    { icon: Briefcase, titleKey: 'hiw.providers_step3', descKey: 'hiw.providers_step3_desc', number: 3 },
    { icon: TrendingUp, titleKey: 'hiw.providers_step4', descKey: 'hiw.providers_step4_desc', number: 4 },
  ];

  const faqs = locale === 'en' ? [
    { q: 'How much does it cost?', a: 'EcuaCasa is completely free for clients. The price of the service is agreed directly with the professional.' },
    { q: 'How fast will I get a response?', a: 'We aim to connect you with a verified professional within 2 hours of your request.' },
    { q: 'What if I have a problem with the service?', a: 'Contact us directly and we\'ll help mediate. Your feedback helps us maintain quality.' },
    { q: 'Do the professionals speak English?', a: 'Many do! Look for the "Speaks English" badge, or mention it in your request and we\'ll match accordingly.' },
    { q: 'How do I pay?', a: 'Payment is agreed directly with the professional. Most accept cash, bank transfer, or mobile payments.' },
  ] : [
    { q: '¿Cuánto cuesta usar EcuaCasa?', a: 'EcuaCasa es completamente gratis para los clientes. El precio del servicio lo acuerdas directamente con el profesional.' },
    { q: '¿Qué tan rápido recibiré respuesta?', a: 'Buscamos conectarte con un profesional verificado en menos de 2 horas después de tu solicitud.' },
    { q: '¿Qué pasa si tengo un problema con el servicio?', a: 'Contáctanos directamente y te ayudaremos. Tu feedback nos ayuda a mantener la calidad.' },
    { q: '¿Los profesionales hablan inglés?', a: 'Muchos sí. Busca la insignia "Habla Inglés", o menciónalo en tu solicitud y te conectaremos adecuadamente.' },
    { q: '¿Cómo pago?', a: 'El pago se acuerda directamente con el profesional. La mayoría acepta efectivo, transferencia o pagos móviles.' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-pink-50 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            {t('hiw.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {locale === 'en'
              ? 'We match you with verified professionals for any home service need. Simple, fast, and trustworthy.'
              : 'Te conectamos con profesionales verificados para cualquier necesidad del hogar. Simple, rápido y confiable.'}
          </p>
        </div>
      </section>

      {/* For Clients */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              {t('hiw.clients_title')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {locale === 'en' ? 'How to get help' : 'Cómo obtener ayuda'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {clientSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-lg">
                    {step.number}
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t(step.titleKey)}</h3>
                  <p className="text-gray-600 text-sm">{t(step.descKey)}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/solicitar"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all text-lg"
            >
              {t('hiw.cta_request')}
            </Link>
          </div>
        </div>
      </section>

      {/* For Professionals */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              {t('hiw.providers_title')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {locale === 'en' ? 'How to grow your business' : 'Cómo hacer crecer tu negocio'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {providerSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto mb-4 shadow-lg">
                    {step.number}
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t(step.titleKey)}</h3>
                  <p className="text-gray-600 text-sm">{t(step.descKey)}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/for-providers"
              className="inline-block px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all text-lg"
            >
              {t('hiw.cta_join')}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('hiw.faq_title')}
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            {locale === 'en' ? 'Ready to get started?' : '¿Listo para empezar?'}
          </h2>
          <p className="text-xl text-purple-100 mb-10">
            {locale === 'en'
              ? 'Request a service or join as a professional today'
              : 'Solicita un servicio o únete como profesional hoy'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/solicitar"
              className="inline-block px-8 py-4 bg-white text-purple-600 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              {t('hiw.cta_request')}
            </Link>
            <Link
              href="/register"
              className="inline-block px-8 py-4 border-2 border-white text-white font-bold rounded-xl transition-all hover:bg-white/10"
            >
              {t('hiw.cta_join')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
