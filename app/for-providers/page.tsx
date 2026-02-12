'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/hooks/use-translation';
import { getLocalizedField } from '@/lib/i18n/helpers';
import {
  MessageCircle,
  Shield,
  Star,
  DollarSign,
  UserPlus,
  ClipboardCheck,
  Send,
  TrendingUp,
  CheckCircle,
  Loader2,
} from 'lucide-react';

const providerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().min(9, 'Ingresa un número válido').max(10),
  service: z.string().min(1, 'Selecciona un servicio'),
  description: z.string().optional(),
});

type ProviderForm = z.infer<typeof providerSchema>;

interface Service {
  slug: string;
  name_es: string;
  name_en: string;
}

export default function ForProvidersPage() {
  const { t, locale } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderForm>({
    resolver: zodResolver(providerSchema),
    defaultValues: { name: '', phone: '', service: '', description: '' },
  });

  useEffect(() => {
    async function fetchServices() {
      const supabase = createClient();
      const { data } = await supabase.from('services').select('slug, name_es, name_en').order('display_order');
      setServices(data || []);
    }
    fetchServices();
  }, []);

  const onSubmit = async (data: ProviderForm) => {
    setSubmitting(true);
    try {
      let fullPhone = data.phone.replace(/\s/g, '');
      if (fullPhone.startsWith('0')) fullPhone = fullPhone.substring(1);
      fullPhone = `+593${fullPhone}`;

      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: fullPhone,
          services: [data.service],
          speaks_english: false,
          message: data.description || null,
        }),
      });
      setSuccess(true);
    } catch {
      alert(locale === 'en' ? 'Error submitting. Please try again.' : 'Error al enviar. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const benefits = [
    { icon: MessageCircle, titleKey: 'for_providers.benefit1_title', descKey: 'for_providers.benefit1_desc' },
    { icon: Shield, titleKey: 'for_providers.benefit2_title', descKey: 'for_providers.benefit2_desc' },
    { icon: Star, titleKey: 'for_providers.benefit3_title', descKey: 'for_providers.benefit3_desc' },
    { icon: DollarSign, titleKey: 'for_providers.benefit4_title', descKey: 'for_providers.benefit4_desc' },
  ];

  const steps = [
    { icon: UserPlus, titleKey: 'for_providers.step1_title', descKey: 'for_providers.step1_desc', number: 1 },
    { icon: ClipboardCheck, titleKey: 'for_providers.step2_title', descKey: 'for_providers.step2_desc', number: 2 },
    { icon: Send, titleKey: 'for_providers.step3_title', descKey: 'for_providers.step3_desc', number: 3 },
    { icon: TrendingUp, titleKey: 'for_providers.step4_title', descKey: 'for_providers.step4_desc', number: 4 },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              {t('for_providers.title')}
            </h1>
            <p className="text-xl text-purple-100 mb-10">
              {t('for_providers.subtitle')}
            </p>
            <a
              href="#registro"
              className="inline-block px-8 py-4 bg-white text-purple-600 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 text-lg"
            >
              {t('for_providers.cta')}
            </a>
            <p className="mt-4 text-purple-200 text-sm">
              {locale === 'en' ? 'No commissions • No monthly fees • 100% free' : 'Sin comisiones • Sin cuotas mensuales • 100% gratis'}
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('for_providers.why_title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all group text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mb-5 mx-auto group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
                    <Icon className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t(benefit.titleKey)}</h3>
                  <p className="text-gray-600 text-sm">{t(benefit.descKey)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('for_providers.how_title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="text-center relative">
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
        </div>
      </section>

      {/* Registration Form */}
      <section id="registro" className="py-20 bg-white">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('for_providers.form_title')}
            </h2>
          </div>

          {success ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {locale === 'en' ? 'Application sent!' : '¡Solicitud enviada!'}
                </h3>
                <p className="text-gray-600">
                  {locale === 'en'
                    ? 'We\'ll contact you within 24-48 hours to verify your information.'
                    : 'Te contactaremos en las próximas 24-48 horas para verificar tu información.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-xl border-2 border-gray-100">
              <CardContent className="p-6 sm:p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="fp-name">{t('register.name')} *</Label>
                    <Input id="fp-name" {...register('name')} className="mt-1" placeholder="Ej: Juan García" />
                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="fp-service">{t('register.services')} *</Label>
                    <select
                      id="fp-service"
                      {...register('service')}
                      className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">{locale === 'en' ? 'Select a service' : 'Selecciona un servicio'}</option>
                      {services.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {getLocalizedField(s, 'name', locale)}
                        </option>
                      ))}
                    </select>
                    {errors.service && <p className="text-sm text-red-500 mt-1">{errors.service.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="fp-phone">{t('register.phone')} *</Label>
                    <div className="flex mt-1">
                      <span className="inline-flex items-center px-4 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-600 font-medium">
                        +593
                      </span>
                      <Input id="fp-phone" type="tel" {...register('phone')} className="rounded-l-none" placeholder="99 123 4567" />
                    </div>
                    {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="fp-desc">{t('register.message')}</Label>
                    <Textarea id="fp-desc" {...register('description')} className="mt-1" rows={3} placeholder={locale === 'en' ? 'Brief description of your experience...' : 'Breve descripción de tu experiencia...'} />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {submitting ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{locale === 'en' ? 'Sending...' : 'Enviando...'}</>
                    ) : (
                      t('for_providers.cta')
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
