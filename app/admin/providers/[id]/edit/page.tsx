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
import { COVERAGE_SECTORS } from '@/lib/constants';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';

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
  cedula_number: z.string().optional(),
  cedula_photo_url: z.string().optional(),
  profile_photo_url: z.string().optional(),
  reference1_name: z.string().optional(),
  reference1_phone: z.string().optional(),
  reference2_name: z.string().optional(),
  reference2_phone: z.string().optional(),
  areas_served: z.array(z.string()).default([]),
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
  const [uploadingCedula, setUploadingCedula] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);

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
      cedula_number: '',
      cedula_photo_url: '',
      profile_photo_url: '',
      reference1_name: '',
      reference1_phone: '',
      reference2_name: '',
      reference2_phone: '',
      areas_served: [],
    },
  });

  const selectedServices = watch('services');
  const selectedSectors = watch('areas_served');
  const cedulaPhotoUrl = watch('cedula_photo_url');
  const profilePhotoUrl = watch('profile_photo_url');

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
        cedula_number: provider.cedula_number || '',
        cedula_photo_url: provider.cedula_photo_url || '',
        profile_photo_url: provider.profile_photo_url || '',
        reference1_name: provider.reference1_name || '',
        reference1_phone: provider.reference1_phone || '',
        reference2_name: provider.reference2_name || '',
        reference2_phone: provider.reference2_phone || '',
        areas_served: provider.areas_served || [],
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

  const toggleSector = (sector: string) => {
    const current = selectedSectors || [];
    if (current.includes(sector)) {
      setValue('areas_served', current.filter((s) => s !== sector));
    } else {
      setValue('areas_served', [...current, sector]);
    }
  };

  /** Upload a photo to registration-uploads bucket and set the form field */
  const handlePhotoUpload = async (
    file: File,
    field: 'cedula_photo_url' | 'profile_photo_url',
    setUploading: (v: boolean) => void,
  ) => {
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `providers/${providerId}/${field === 'cedula_photo_url' ? 'cedula' : 'profile'}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('registration-uploads').upload(path, file, { upsert: true });
      if (error) throw error;
      setValue(field, path);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const storageProxyUrl = (pathOrUrl: string) =>
    `/api/admin/storage?path=${encodeURIComponent(pathOrUrl)}`;

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

            {/* Información de Verificación */}
            <div className="border-2 border-gray-100 rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Información de Verificación</h3>

              {/* Cédula */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="cedula_number">Número de cédula</Label>
                  <Input id="cedula_number" {...register('cedula_number')} className="mt-1" placeholder="0101234567" />
                </div>
                <div>
                  <Label>Foto de cédula</Label>
                  {cedulaPhotoUrl && (
                    <a href={storageProxyUrl(cedulaPhotoUrl)} target="_blank" rel="noopener noreferrer" className="block mb-2">
                      <img src={storageProxyUrl(cedulaPhotoUrl)} alt="Foto de cédula" className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 mt-1" />
                    </a>
                  )}
                  <label className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors mt-1 ${uploadingCedula ? 'opacity-50' : 'border-gray-300 hover:border-primary-400'}`}>
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">{uploadingCedula ? 'Subiendo...' : 'Subir foto de cédula'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingCedula}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(file, 'cedula_photo_url', setUploadingCedula);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Foto de perfil */}
              <div>
                <Label>Foto de perfil</Label>
                {profilePhotoUrl && (
                  <a href={storageProxyUrl(profilePhotoUrl)} target="_blank" rel="noopener noreferrer" className="block mb-2">
                    <img src={storageProxyUrl(profilePhotoUrl)} alt="Foto de perfil" className="w-24 h-24 object-cover rounded-full border-2 border-gray-200 mt-1" />
                  </a>
                )}
                <label className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors mt-1 ${uploadingProfile ? 'opacity-50' : 'border-gray-300 hover:border-primary-400'}`}>
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{uploadingProfile ? 'Subiendo...' : 'Subir foto de perfil'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingProfile}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(file, 'profile_photo_url', setUploadingProfile);
                    }}
                  />
                </label>
              </div>

              {/* References */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Referencia 1</h4>
                  <div>
                    <Label htmlFor="reference1_name">Nombre</Label>
                    <Input id="reference1_name" {...register('reference1_name')} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="reference1_phone">Teléfono</Label>
                    <Input id="reference1_phone" type="tel" {...register('reference1_phone')} className="mt-1" placeholder="09X XXX XXXX" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Referencia 2</h4>
                  <div>
                    <Label htmlFor="reference2_name">Nombre</Label>
                    <Input id="reference2_name" {...register('reference2_name')} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="reference2_phone">Teléfono</Label>
                    <Input id="reference2_phone" type="tel" {...register('reference2_phone')} className="mt-1" placeholder="09X XXX XXXX" />
                  </div>
                </div>
              </div>

              {/* Sectors */}
              <div>
                <Label>Sectores donde trabaja</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {COVERAGE_SECTORS.map((sector) => (
                    <button
                      key={sector}
                      type="button"
                      onClick={() => toggleSector(sector)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedSectors?.includes(sector)
                          ? 'bg-accent-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {sector}
                    </button>
                  ))}
                </div>
              </div>
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
