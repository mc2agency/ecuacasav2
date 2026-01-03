'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Loader2 } from 'lucide-react';

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
  status: z.enum(['active', 'pending', 'inactive']).default('active'),
  services: z.array(z.string()).min(1, 'Selecciona al menos un servicio'),
});

type ProviderForm = z.infer<typeof providerSchema>;

interface Service {
  id: string;
  slug: string;
  name_es: string;
}

export default function EditProviderPage() {
  const router = useRouter();
  const params = useParams();
  const providerId = params.id as string;

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

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
      status: 'active',
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

      // Fetch provider data
      const { data: provider, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single();

      if (error || !provider) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Fetch provider's services
      const { data: providerServices } = await supabase
        .from('provider_services')
        .select('service_id, services(slug)')
        .eq('provider_id', providerId);

      // Extract service slugs from the joined data
      const serviceSlugs: string[] = [];
      if (providerServices) {
        for (const ps of providerServices) {
          const services = ps.services as { slug: string } | { slug: string }[] | null;
          if (services) {
            if (Array.isArray(services)) {
              services.forEach((s) => s.slug && serviceSlugs.push(s.slug));
            } else if (services.slug) {
              serviceSlugs.push(services.slug);
            }
          }
        }
      }

      // Pre-fill form with existing data
      reset({
        name: provider.name || '',
        phone: provider.phone || '',
        email: provider.email || '',
        description_es: provider.description_es || '',
        description_en: provider.description_en || '',
        price_range: provider.price_range || '',
        response_time: provider.response_time || '',
        rating: provider.rating || 5,
        review_count: provider.review_count || 0,
        speaks_english: provider.speaks_english || false,
        verified: provider.verified || false,
        featured: provider.featured || false,
        status: provider.status || 'active',
        services: serviceSlugs,
      });

      setLoading(false);
    }

    fetchData();
  }, [providerId, reset]);

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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: providerId,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Update failed');
      }

      router.push('/admin/providers');
    } catch (error) {
      console.error('Error updating provider:', error);
      alert('Hubo un error al actualizar el profesional');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Profesional no encontrado</h1>
        <Link href="/admin/providers" className="text-primary-600 hover:underline">
          Volver a profesionales
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/providers"
        className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a profesionales
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Editar Profesional</h1>

      <Card>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" {...register('name')} className="mt-1" />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone">WhatsApp *</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className="mt-1"
                  placeholder="+593991234567"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} className="mt-1" />
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  {...register('status')}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="active">Activo</option>
                  <option value="pending">Pendiente</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <Label htmlFor="price_range">Rango de precios</Label>
                <Input id="price_range" {...register('price_range')} className="mt-1" placeholder="$25-50/hora" />
              </div>

              {/* Response Time */}
              <div>
                <Label htmlFor="response_time">Tiempo de respuesta</Label>
                <Input id="response_time" {...register('response_time')} className="mt-1" placeholder="30 min" />
              </div>

              {/* Rating */}
              <div>
                <Label htmlFor="rating">Rating (0-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  {...register('rating', { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>

              {/* Review Count */}
              <div>
                <Label htmlFor="review_count">Número de reseñas</Label>
                <Input
                  id="review_count"
                  type="number"
                  min="0"
                  {...register('review_count', { valueAsNumber: true })}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Description ES */}
            <div>
              <Label htmlFor="description_es">Descripción (Español)</Label>
              <Textarea id="description_es" {...register('description_es')} className="mt-1" rows={3} />
            </div>

            {/* Description EN */}
            <div>
              <Label htmlFor="description_en">Descripción (English)</Label>
              <Textarea id="description_en" {...register('description_en')} className="mt-1" rows={3} />
            </div>

            {/* Services */}
            <div>
              <Label>Servicios *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {services.map((service) => (
                  <button
                    key={service.slug}
                    type="button"
                    onClick={() => toggleService(service.slug)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedServices?.includes(service.slug)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('speaks_english')}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-5 h-5"
                />
                <span>Habla inglés</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('verified')}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-5 h-5"
                />
                <span>Verificado</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('featured')}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-5 h-5"
                />
                <span>Destacado</span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="submit" disabled={submitting} className="bg-primary-600 hover:bg-primary-700">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar cambios'
                )}
              </Button>
              <Link href="/admin/providers">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
