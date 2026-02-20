'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Loader2, UserCheck, UserPlus } from 'lucide-react';

const providerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().min(9, 'Ingresa un número de teléfono válido').max(15, 'Número demasiado largo'),
  email: z.string().email('Ingresa un email válido').optional().or(z.literal('')),
  description_es: z.string().optional(),
  description_en: z.string().optional(),
  price_range: z.string().optional(),
  response_time: z.string().optional(),
  rating: z.number().min(0).max(5).default(5),
  review_count: z.number().min(0).default(0),
  speaks_english: z.boolean().default(false),
  verified: z.boolean().default(false),
  featured: z.boolean().default(false),
  services: z.array(z.string()).min(1, 'Selecciona al menos un servicio'),
});

type ProviderForm = z.infer<typeof providerSchema>;

interface Service {
  id: string;
  slug: string;
  name_es: string;
}

export default function NewProviderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [fromRegistration, setFromRegistration] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProviderForm>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      description_es: '',
      description_en: '',
      price_range: '',
      response_time: '',
      rating: 5,
      review_count: 0,
      speaks_english: false,
      verified: false,
      featured: false,
      services: [],
    },
  });

  const selectedServices = watch('services');

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      // Fetch services list
      const { data: servicesData } = await supabase
        .from('services')
        .select('id, slug, name_es')
        .order('name_es');

      setServices(servicesData || []);

      // Check if coming from registration approval
      const from = searchParams.get('from');
      const regId = searchParams.get('id');

      if (from === 'registration' && regId) {
        setRegistrationId(regId);
        setFromRegistration(true);

        // Fetch registration data via API (bypasses RLS)
        try {
          const response = await fetch(`/api/admin/registrations/${regId}`);
          if (response.ok) {
            const registration = await response.json();

            // Extract phone number without +593 prefix for the form
            let phoneNumber = registration.phone || '';
            if (phoneNumber.startsWith('+593')) {
              phoneNumber = phoneNumber.substring(4);
            }

            // Pre-fill form with registration data
            reset({
              name: registration.name || '',
              phone: phoneNumber,
              email: registration.email || '',
              description_es: registration.message || '',
              description_en: '',
              price_range: '',
              response_time: '',
              rating: 5,
              review_count: 0,
              speaks_english: registration.speaks_english || false,
              verified: false,
              featured: false,
              services: registration.services_interested || [],
            });
          }
        } catch (error) {
          console.error('Error fetching registration:', error);
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [searchParams, reset]);

  const toggleService = (slug: string) => {
    const current = selectedServices || [];
    if (current.includes(slug)) {
      setValue('services', current.filter((s) => s !== slug));
    } else {
      setValue('services', [...current, slug]);
    }
  };

  const onSubmit = async (data: ProviderForm) => {
    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          registrationId: registrationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create provider');
      }

      router.push('/admin/providers');
    } catch (error) {
      console.error('Error creating provider:', error);
      alert('Hubo un error al crear el profesional');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin/providers"
        className="inline-flex items-center text-sm text-gray-500 hover:text-purple-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Volver a profesionales
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-purple-600" />
          Nuevo Profesional
        </h1>
        <p className="text-sm text-gray-500 mt-1">Crear un nuevo perfil de profesional</p>
      </div>

      {fromRegistration && (
        <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
          <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-green-800 text-sm">
            Pre-llenado desde solicitud de registro. Al guardar, la solicitud se marcará como aprobada.
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nombre *</Label>
                <Input id="name" {...register('name')} className="mt-1.5 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500" />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">WhatsApp *</Label>
                <div className="flex mt-1.5">
                  <span className="inline-flex items-center px-4 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-medium">
                    +593
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    className="rounded-l-none rounded-r-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="99 123 4567"
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input id="email" type="email" {...register('email')} className="mt-1.5 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500" />
              </div>

              {/* Price Range */}
              <div>
                <Label htmlFor="price_range" className="text-sm font-medium text-gray-700">Rango de precios</Label>
                <Input id="price_range" {...register('price_range')} className="mt-1.5 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500" placeholder="Ej: $25-50/hora" />
              </div>

              {/* Response Time */}
              <div>
                <Label htmlFor="response_time" className="text-sm font-medium text-gray-700">Tiempo de respuesta</Label>
                <Input id="response_time" {...register('response_time')} className="mt-1.5 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500" placeholder="Ej: 30 min" />
              </div>

              {/* Rating */}
              <div>
                <Label htmlFor="rating" className="text-sm font-medium text-gray-700">Rating (0-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  {...register('rating', { valueAsNumber: true })}
                  className="mt-1.5 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Review Count */}
              <div>
                <Label htmlFor="review_count" className="text-sm font-medium text-gray-700">Número de reseñas</Label>
                <Input
                  id="review_count"
                  type="number"
                  min="0"
                  {...register('review_count', { valueAsNumber: true })}
                  className="mt-1.5 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Description ES */}
            <div>
              <Label htmlFor="description_es" className="text-sm font-medium text-gray-700">Descripción (Español)</Label>
              <Textarea id="description_es" {...register('description_es')} className="mt-1.5 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500" rows={3} />
            </div>

            {/* Description EN */}
            <div>
              <Label htmlFor="description_en" className="text-sm font-medium text-gray-700">Descripción (English)</Label>
              <Textarea id="description_en" {...register('description_en')} className="mt-1.5 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500" rows={3} />
            </div>

            {/* Services */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Servicios *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {services.map((service) => (
                  <button
                    key={service.slug}
                    type="button"
                    onClick={() => toggleService(service.slug)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedServices?.includes(service.slug)
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {service.name_es}
                  </button>
                ))}
              </div>
              {errors.services && (
                <p className="text-sm text-red-500 mt-2">{errors.services.message}</p>
              )}
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-6 py-2">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register('speaks_english')}
                  className="rounded-lg border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Habla inglés</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register('verified')}
                  className="rounded-lg border-gray-300 text-green-600 focus:ring-green-500 w-5 h-5"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Verificado</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register('featured')}
                  className="rounded-lg border-gray-300 text-orange-600 focus:ring-orange-500 w-5 h-5"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">Destacado</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg shadow-purple-200 py-5 px-8"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : fromRegistration ? (
                  'Aprobar y crear profesional'
                ) : (
                  'Crear profesional'
                )}
              </Button>
              <Link href="/admin/providers">
                <Button type="button" variant="outline" className="rounded-xl py-5">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
