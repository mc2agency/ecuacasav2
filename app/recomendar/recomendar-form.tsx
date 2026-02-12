'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { recommendationSchema, type RecommendationFormValues } from '@/lib/validations';
import { useTranslation } from '@/hooks/use-translation';
import { CheckCircle, ArrowLeft, Loader2, Heart } from 'lucide-react';
import { getLocalizedField } from '@/lib/i18n/helpers';

interface Service {
  slug: string;
  name_es: string;
  name_en: string;
}

export function RecomendarForm() {
  const { t, locale } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [proName, setProName] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      pro_name: '',
      pro_service_type: '',
      pro_phone: '',
      relationship: '',
      why_recommend: '',
      recommender_name: '',
      recommender_email: '',
    },
  });

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

  const onSubmit = async (data: RecommendationFormValues) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/recomendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pro_name: data.pro_name,
          pro_service_type: data.pro_service_type,
          pro_phone: data.pro_phone,
          relationship: data.relationship,
          why_recommend: data.why_recommend,
          recommender_name: data.recommender_name || null,
          recommender_email: data.recommender_email || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Recommendation failed');
      }

      setProName(data.pro_name);
      setSuccess(true);
    } catch (error) {
      console.error('Error submitting recommendation:', error);
      alert(locale === 'en'
        ? 'There was an error sending your recommendation. Please try again.'
        : 'Hubo un error al enviar tu recomendación. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t('recomendar.success_title')}
            </h1>
            <p className="text-gray-600 mb-6">
              {t('recomendar.success_message').replace('{name}', proName)}
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              {t('recomendar.success_back')}
            </Link>
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
            {t('recomendar.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('recomendar.subtitle')}
          </p>
        </div>

        {/* Form */}
        <Card className="shadow-xl border-2 border-gray-100">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Professional's Name */}
              <div>
                <Label htmlFor="pro_name">{t('recomendar.pro_name')} *</Label>
                <Input
                  id="pro_name"
                  {...register('pro_name')}
                  className="mt-1"
                  placeholder="Ej: Carlos Méndez"
                />
                {errors.pro_name && (
                  <p className="text-sm text-red-500 mt-1">{errors.pro_name.message}</p>
                )}
              </div>

              {/* Service Type */}
              <div>
                <Label htmlFor="pro_service_type">{t('recomendar.pro_service')} *</Label>
                <select
                  id="pro_service_type"
                  {...register('pro_service_type')}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">{t('recomendar.pro_service_select')}</option>
                  {services.map((service) => (
                    <option key={service.slug} value={service.slug}>
                      {getLocalizedField(service, 'name', locale)}
                    </option>
                  ))}
                  <option value="otro">{t('solicitar.otro')}</option>
                </select>
                {errors.pro_service_type && (
                  <p className="text-sm text-red-500 mt-1">{errors.pro_service_type.message}</p>
                )}
              </div>

              {/* Phone/WhatsApp */}
              <div>
                <Label htmlFor="pro_phone">{t('recomendar.pro_phone')} *</Label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-4 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-600 font-medium">
                    +593
                  </span>
                  <Input
                    id="pro_phone"
                    type="tel"
                    {...register('pro_phone')}
                    className="rounded-l-none"
                    placeholder="99 123 4567"
                  />
                </div>
                {errors.pro_phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.pro_phone.message}</p>
                )}
              </div>

              {/* Relationship */}
              <div>
                <Label htmlFor="relationship">{t('recomendar.relationship')} *</Label>
                <select
                  id="relationship"
                  {...register('relationship')}
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">{t('recomendar.relationship_select')}</option>
                  <option value="lo_contrate">{t('recomendar.relationship_hired')}</option>
                  <option value="amigo_vecino">{t('recomendar.relationship_friend')}</option>
                  <option value="encontre_localmente">{t('recomendar.relationship_found')}</option>
                  <option value="otro">{t('recomendar.relationship_other')}</option>
                </select>
                {errors.relationship && (
                  <p className="text-sm text-red-500 mt-1">{errors.relationship.message}</p>
                )}
              </div>

              {/* Why Recommend */}
              <div>
                <Label htmlFor="why_recommend">{t('recomendar.why')} *</Label>
                <Textarea
                  id="why_recommend"
                  {...register('why_recommend')}
                  className="mt-1"
                  rows={4}
                  placeholder={t('recomendar.why_placeholder')}
                />
                {errors.why_recommend && (
                  <p className="text-sm text-red-500 mt-1">{errors.why_recommend.message}</p>
                )}
              </div>

              {/* Your Name */}
              <div>
                <Label htmlFor="recommender_name">{t('recomendar.your_name')}</Label>
                <Input
                  id="recommender_name"
                  {...register('recommender_name')}
                  className="mt-1"
                />
              </div>

              {/* Your Email */}
              <div>
                <Label htmlFor="recommender_email">{t('recomendar.your_email')}</Label>
                <Input
                  id="recommender_email"
                  type="email"
                  {...register('recommender_email')}
                  className="mt-1"
                  placeholder="tu@email.com"
                />
                {errors.recommender_email && (
                  <p className="text-sm text-red-500 mt-1">{errors.recommender_email.message}</p>
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
                    {t('recomendar.submitting')}
                  </>
                ) : (
                  t('recomendar.submit')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
