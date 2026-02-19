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
import { ArrowLeft, Loader2, Check, ShieldOff, ImageIcon } from 'lucide-react';

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

interface PhotoItem {
  url: string;
  storage_path: string;
  label: string;
  type: 'profile' | 'cedula';
  selectable: boolean;
}

export default function EditProviderPage() {
  const router = useRouter();
  const params = useParams();
  const providerId = params.id as string;

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Photo state
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selectedPhotoPath, setSelectedPhotoPath] = useState<string | null>(null);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoSaved, setPhotoSaved] = useState(false);

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

  // Fetch photos separately
  useEffect(() => {
    async function fetchPhotos() {
      try {
        const res = await fetch(`/api/admin/providers/${providerId}/photos`);
        if (res.ok) {
          const data = await res.json();
          setPhotos(data.photos || []);
          setSelectedPhotoPath(data.selected_photo_url || null);
        }
      } catch {
        // Photos not available
      } finally {
        setPhotosLoading(false);
      }
    }

    fetchPhotos();
  }, [providerId]);

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

  const selectPhoto = (photo: PhotoItem) => {
    if (!photo.selectable) return;
    setSelectedPhotoPath(photo.storage_path);
    setPhotoSaved(false);
  };

  const savePhoto = async () => {
    if (!selectedPhotoPath) return;
    setPhotoSaving(true);
    setPhotoSaved(false);

    try {
      const res = await fetch(`/api/admin/providers/${providerId}/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_url: selectedPhotoPath }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }

      setPhotoSaved(true);
    } catch (error) {
      console.error('Error saving photo:', error);
      alert('Error al guardar la foto');
    } finally {
      setPhotoSaving(false);
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

  const selectablePhotos = photos.filter((p) => p.selectable);
  const cedulaPhotos = photos.filter((p) => p.type === 'cedula');

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

      {/* Step 1: Basic Information */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Paso 1 — Información</h2>
      </div>

      <Card className="mb-8">
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
                <Label htmlFor="price_range">Rango de precios (opcional)</Label>
                <Input id="price_range" {...register('price_range')} className="mt-1" placeholder="Ej: $25-50/hora - Dejar vacío si no aplica" />
              </div>

              {/* Response Time */}
              <div>
                <Label htmlFor="response_time">Tiempo de respuesta (opcional)</Label>
                <Input id="response_time" {...register('response_time')} className="mt-1" placeholder="Ej: 30 min - Dejar vacío si no aplica" />
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

      {/* Step 2: Card Photo */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Paso 2 — Foto del perfil (tarjeta)</h2>
        <p className="text-sm text-gray-500">
          Selecciona la foto que aparecerá en la tarjeta pública del profesional en /providers
        </p>
      </div>

      <Card>
        <CardContent className="p-8">
          {photosLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                No hay fotos disponibles. El profesional no subió fotos al registrarse.
              </p>
            </div>
          ) : (
            <>
              {/* Selectable Photos */}
              {selectablePhotos.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Fotos disponibles — haz clic para seleccionar
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectablePhotos.map((photo) => {
                      const isSelected = selectedPhotoPath === photo.storage_path;
                      return (
                        <button
                          key={photo.storage_path}
                          type="button"
                          onClick={() => selectPhoto(photo)}
                          className={`relative group rounded-xl overflow-hidden border-3 transition-all ${
                            isSelected
                              ? 'border-green-500 ring-2 ring-green-200 shadow-lg'
                              : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
                          }`}
                        >
                          <div className="aspect-square bg-gray-100">
                            <img
                              src={photo.url}
                              alt={photo.label}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className={`px-3 py-2 text-xs font-medium text-center ${
                            isSelected ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
                          }`}>
                            {photo.label}
                            {isSelected && ' (seleccionada)'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cedula Photos — Verification Only */}
              {cedulaPhotos.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <ShieldOff className="w-4 h-4" />
                    Cédula — solo verificación (no seleccionable)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {cedulaPhotos.map((photo) => (
                      <div
                        key={photo.storage_path}
                        className="relative rounded-xl overflow-hidden border-2 border-dashed border-gray-300 opacity-75"
                      >
                        <div className="aspect-square bg-gray-100">
                          <img
                            src={photo.url}
                            alt={photo.label}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="px-3 py-2 text-xs font-medium text-center bg-gray-100 text-gray-500">
                          {photo.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              {selectablePhotos.length > 0 && (
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    onClick={savePhoto}
                    disabled={!selectedPhotoPath || photoSaving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {photoSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Guardar foto seleccionada
                      </>
                    )}
                  </Button>
                  {photoSaved && (
                    <span className="text-sm text-green-600 font-medium">
                      Foto guardada correctamente
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
