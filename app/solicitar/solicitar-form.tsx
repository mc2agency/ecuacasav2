'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { serviceRequestSchema, type ServiceRequestFormValues } from '@/lib/validations';
import { useTranslation } from '@/hooks/use-translation';
import { CheckCircle, Shield, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { getLocalizedField } from '@/lib/i18n/helpers';

interface Service {
  slug: string;
  name_es: string;
  name_en: string;
}

const SECTORS = [
  'El Centro',
  'Gringolandia / Ordoñez Lasso',
  'El Vergel',
  'San Sebastián',
  'Baños',
  'Challuabamba',
  'Ricaurte',
  'San Joaquín',
  'Turi',
  'El Valle',
  'Otro',
];

export function SolicitarForm() {
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const preSelectedService = searchParams.get('service') || searchParams.get('servicio') || '';

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestNumber, setRequestNumber] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ServiceRequestFormValues>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      service_slug: preSelectedService,
      service_other: '',
      description: '',
      sector: '',
      urgency: '',
      client_name: '',
      client_whatsapp: '',
      client_email: '',
    },
  });

  const selectedService = watch('service_slug');

  useEffect(() => {
    async function fetchServices() {
      const supabase = createClient();
      const { data } = await supabase
        .from('services')
        .select('slug, name_es, name_en')
        .order('display_order');
      setServices(data || []);
      setLoading(false);
    }
    fetchServices();
  }, []);

  // Update service_slug when preSelectedService changes and services are loaded
  useEffect(() => {
    if (preSelectedService && services.length > 0) {
      setValue('service_slug', preSelectedService);
    }
  }, [preSelectedService, services, setValue]);

  const onSubmit = async (data: ServiceRequestFormValues) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/solicitar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_slug: data.service_slug,
          service_other: data.service_slug === 'otro' ? data.service_other : null,
          description: data.description || null,
          sector: data.sector,
          urgency: data.urgency,
          client_name: data.client_name,
          client_whatsapp: data.client_whatsapp,
          client_email: data.client_email || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Request failed');
      }

      setRequestNumber(result.request_number);
      setSuccess(true);
    } catch (error) {
      console.error('Error submitting request:', error);
      alert(locale === 'en'
        ? 'There was an error sending your request. Please try again.'
        : 'Hubo un error al enviar tu solicitud. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    const serviceName = selectedService === 'otro'
      ? (watch('service_other') || t('solicitar.otro'))
      : services.find(s => s.slug === selectedService)
        ? getLocalizedField(services.find(s => s.slug === selectedService)!, 'name', locale)
        : selectedService;

    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('solicitar.success_title')}
            </h1>
            <p className="text-gray-600 mb-4">
              {t('solicitar.success_message').replace('[service type]', serviceName)}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">{t('solicitar.success_request_number')}</p>
              <p className="text-lg font-bold text-primary-600">{requestNumber}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="flex-1 inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-center"
              >
                {t('solicitar.success_back')}
              </Link>
              <Link
                href="/providers"
                className="flex-1 inline-block px-6 py-3 border-2 border-gray-200 hover:border-primary-300 text-gray-700 font-medium rounded-lg transition-colors text-center"
              >
                {t('solicitar.success_browse')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')}
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('solicitar.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('solicitar.subtitle')}
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-xl border-2 border-gray-100">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Service Type */}
              <div>
                <Label htmlFor="service_slug">{t('solicitar.service_type')} *</Label>
                <select
                  id="service_slug"
                  {...register('service_slug')}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">{t('solicitar.service_select')}</option>
                  {services.map((service) => (
                    <option key={service.slug} value={service.slug}>
                      {getLocalizedField(service, 'name', locale)}
                    </option>
                  ))}
                  <option value="otro">{t('solicitar.otro')}</option>
                </select>
                {errors.service_slug && (
                  <p className="text-sm text-red-500 mt-1">{errors.service_slug.message}</p>
                )}
              </div>

              {/* Conditional "Other" field */}
              {selectedService === 'otro' && (
                <div>
                  <Label htmlFor="service_other">{t('solicitar.service_other')} *</Label>
                  <Input
                    id="service_other"
                    {...register('service_other')}
                    className="mt-1"
                    placeholder={t('solicitar.service_other')}
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <Label htmlFor="description">{t('solicitar.description')}</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  className="mt-1"
                  rows={3}
                  placeholder={t('solicitar.description_placeholder')}
                />
              </div>

              {/* Sector */}
              <div>
                <Label htmlFor="sector">{t('solicitar.sector')} *</Label>
                <select
                  id="sector"
                  {...register('sector')}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">{t('solicitar.sector_select')}</option>
                  {SECTORS.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
                {errors.sector && (
                  <p className="text-sm text-red-500 mt-1">{errors.sector.message}</p>
                )}
              </div>

              {/* Urgency */}
              <div>
                <Label htmlFor="urgency">{t('solicitar.urgency')} *</Label>
                <select
                  id="urgency"
                  {...register('urgency')}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">{t('solicitar.urgency_select')}</option>
                  <option value="hoy">{t('solicitar.urgency_today')}</option>
                  <option value="esta_semana">{t('solicitar.urgency_this_week')}</option>
                  <option value="este_mes">{t('solicitar.urgency_this_month')}</option>
                  <option value="solo_cotizacion">{t('solicitar.urgency_quote_only')}</option>
                  <option value="flexible">{t('solicitar.urgency_flexible')}</option>
                </select>
                {errors.urgency && (
                  <p className="text-sm text-red-500 mt-1">{errors.urgency.message}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="client_name">{t('solicitar.name')} *</Label>
                <Input
                  id="client_name"
                  {...register('client_name')}
                  className="mt-1"
                  placeholder="Ej: María López"
                />
                {errors.client_name && (
                  <p className="text-sm text-red-500 mt-1">{errors.client_name.message}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <Label htmlFor="client_whatsapp">{t('solicitar.whatsapp')} *</Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-4 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-600 font-medium">
                    +593
                  </span>
                  <Input
                    id="client_whatsapp"
                    type="tel"
                    {...register('client_whatsapp')}
                    className="rounded-l-none"
                    placeholder="99 123 4567"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('solicitar.whatsapp_hint')}</p>
                {errors.client_whatsapp && (
                  <p className="text-sm text-red-500 mt-1">{errors.client_whatsapp.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="client_email">{t('solicitar.email')}</Label>
                <Input
                  id="client_email"
                  type="email"
                  {...register('client_email')}
                  className="mt-1"
                  placeholder="tu@email.com"
                />
                {errors.client_email && (
                  <p className="text-sm text-red-500 mt-1">{errors.client_email.message}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('solicitar.submitting')}
                  </>
                ) : (
                  t('solicitar.submit')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">{t('solicitar.trust_verified')}</p>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">{t('solicitar.trust_fast')}</p>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">{t('solicitar.trust_free')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
