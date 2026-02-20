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
import { createClient } from '@/lib/supabase/client';
import { COVERAGE_SECTORS } from '@/lib/constants';
import { CheckCircle, ArrowLeft, ArrowRight, Loader2, Upload, Edit } from 'lucide-react';

const TOTAL_STEPS = 4;

const STEPS = [
  { title: 'Información básica', subtitle: 'Datos de contacto del profesional' },
  { title: 'Verificación de identidad', subtitle: 'Cédula y fotos del profesional' },
  { title: 'Servicios y cobertura', subtitle: 'Qué ofrece y dónde trabaja' },
  { title: 'Últimos detalles', subtitle: 'Precios, referencias y descripción' },
];

const providerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().min(9, 'Ingresa un número de teléfono válido').max(15, 'Número demasiado largo'),
  email: z.string().email('Ingresa un email válido').optional().or(z.literal('')),
  status: z.enum(['active', 'pending', 'inactive']).default('active'),
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

const STEP_FIELDS: (keyof ProviderForm)[][] = [
  ['name', 'phone'],    // Step 1
  [],                    // Step 2 — all optional
  ['services'],          // Step 3
  [],                    // Step 4 — all optional
];

interface Service {
  id: string;
  slug: string;
  name_es: string;
}

export default function EditProviderPage() {
  const router = useRouter();
  const params = useParams();
  const providerId = params.id as string;

  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [uploadingCedula, setUploadingCedula] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProviderForm>({
    resolver: zodResolver(providerSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      status: 'active',
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

      const { data: servicesData } = await supabase
        .from('services')
        .select('id, slug, name_es')
        .order('name_es');

      setServices(servicesData || []);

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

      const { data: providerServices } = await supabase
        .from('provider_services')
        .select('service_id, services(slug)')
        .eq('provider_id', providerId);

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

      reset({
        name: provider.name || '',
        phone: provider.phone || '',
        email: provider.email || '',
        status: provider.status || 'active',
        description_es: provider.description_es || '',
        description_en: provider.description_en || '',
        price_range: provider.price_range || '',
        response_time: provider.response_time || '',
        rating: provider.rating || 5,
        review_count: provider.review_count || 0,
        speaks_english: provider.speaks_english || false,
        verified: provider.verified || false,
        featured: provider.featured || false,
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
      setValue('services', current.filter((s) => s !== slug), { shouldValidate: true });
    } else {
      setValue('services', [...current, slug], { shouldValidate: true });
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

  const handleNext = async () => {
    const fields = STEP_FIELDS[step];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-purple-600"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Edit className="w-7 h-7 text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Profesional no encontrado</h1>
        <Link href="/admin/providers" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
          Volver a profesionales
        </Link>
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
          <Edit className="w-6 h-6 text-purple-600" />
          Editar Profesional
        </h1>
        <p className="text-sm text-gray-500 mt-1">Modificar datos del profesional</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Paso {step + 1} de {TOTAL_STEPS}</span>
          <span className="text-sm text-gray-500">{STEPS[step].title}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-3">
          {STEPS.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              className={`flex items-center justify-center w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                i < step
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-md'
                  : i === step
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white ring-4 ring-purple-100'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 sm:p-8">
          {/* Step Title */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">{STEPS[step].title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{STEPS[step].subtitle}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* ========== STEP 1: Información básica ========== */}
            <div className={step !== 0 ? 'hidden' : 'space-y-6'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nombre *</Label>
                    <Input id="name" {...register('name')} className="mt-1.5 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500" />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">WhatsApp *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      className="mt-1.5 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="+593991234567"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input id="email" type="email" {...register('email')} className="mt-1.5 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500" />
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700">Estado</Label>
                    <select
                      id="status"
                      {...register('status')}
                      className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                      <option value="active">Activo</option>
                      <option value="pending">Pendiente</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>
            </div>

            {/* ========== STEP 2: Verificación de identidad ========== */}
            <div className={step !== 1 ? 'hidden' : 'space-y-6'}>
                <div>
                  <Label htmlFor="cedula_number" className="text-sm font-medium text-gray-700">Número de cédula</Label>
                  <Input id="cedula_number" {...register('cedula_number')} className="mt-1.5 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500" placeholder="0101234567" />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Foto de cédula</Label>
                  {cedulaPhotoUrl && (
                    <a href={storageProxyUrl(cedulaPhotoUrl)} target="_blank" rel="noopener noreferrer" className="block mb-2">
                      <img src={storageProxyUrl(cedulaPhotoUrl)} alt="Foto de cédula" className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200 mt-1.5" />
                    </a>
                  )}
                  <label className={`flex items-center gap-3 px-4 py-3.5 border-2 border-dashed rounded-xl cursor-pointer transition-colors mt-1.5 ${uploadingCedula ? 'opacity-50' : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50/30'}`}>
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

                <div>
                  <Label className="text-sm font-medium text-gray-700">Foto de perfil</Label>
                  {profilePhotoUrl && (
                    <a href={storageProxyUrl(profilePhotoUrl)} target="_blank" rel="noopener noreferrer" className="block mb-2">
                      <img src={storageProxyUrl(profilePhotoUrl)} alt="Foto de perfil" className="w-24 h-24 object-cover rounded-full border-2 border-gray-200 mt-1.5" />
                    </a>
                  )}
                  <label className={`flex items-center gap-3 px-4 py-3.5 border-2 border-dashed rounded-xl cursor-pointer transition-colors mt-1.5 ${uploadingProfile ? 'opacity-50' : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50/30'}`}>
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
            </div>

            {/* ========== STEP 3: Servicios y cobertura ========== */}
            <div className={step !== 2 ? 'hidden' : 'space-y-6'}>
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

                <div>
                  <Label className="text-sm font-medium text-gray-700">Sectores donde trabaja</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {COVERAGE_SECTORS.map((sector) => (
                      <button
                        key={sector}
                        type="button"
                        onClick={() => toggleSector(sector)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          selectedSectors?.includes(sector)
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 pt-2">
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
            </div>

            {/* ========== STEP 4: Últimos detalles ========== */}
            <div className={step !== 3 ? 'hidden' : 'space-y-6'}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="price_range" className="text-sm font-medium text-gray-700">Rango de precios</Label>
                    <Input id="price_range" {...register('price_range')} className="mt-1.5 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500" placeholder="Ej: $25-50/hora" />
                  </div>

                  <div>
                    <Label htmlFor="response_time" className="text-sm font-medium text-gray-700">Tiempo de respuesta</Label>
                    <Input id="response_time" {...register('response_time')} className="mt-1.5 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500" placeholder="Ej: 30 min" />
                  </div>

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

                {/* References */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-100 rounded-2xl p-5 space-y-4 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900 text-sm">Referencia 1</h3>
                    <div>
                      <Label htmlFor="reference1_name" className="text-sm font-medium text-gray-700">Nombre</Label>
                      <Input id="reference1_name" {...register('reference1_name')} className="mt-1.5 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500 bg-white" />
                    </div>
                    <div>
                      <Label htmlFor="reference1_phone" className="text-sm font-medium text-gray-700">Teléfono</Label>
                      <Input id="reference1_phone" type="tel" {...register('reference1_phone')} className="mt-1.5 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500 bg-white" placeholder="09X XXX XXXX" />
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-2xl p-5 space-y-4 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900 text-sm">Referencia 2</h3>
                    <div>
                      <Label htmlFor="reference2_name" className="text-sm font-medium text-gray-700">Nombre</Label>
                      <Input id="reference2_name" {...register('reference2_name')} className="mt-1.5 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500 bg-white" />
                    </div>
                    <div>
                      <Label htmlFor="reference2_phone" className="text-sm font-medium text-gray-700">Teléfono</Label>
                      <Input id="reference2_phone" type="tel" {...register('reference2_phone')} className="mt-1.5 rounded-xl border-gray-200 focus:ring-purple-500 focus:border-purple-500 bg-white" placeholder="09X XXX XXXX" />
                    </div>
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
            </div>

            {/* ========== Navigation Buttons ========== */}
            <div className="flex items-center gap-3 pt-2">
              {step > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 py-5 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Atrás
                </Button>
              )}

              {step < TOTAL_STEPS - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className={`flex-1 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg shadow-purple-200 ${step === 0 ? 'w-full' : ''}`}
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg shadow-purple-200"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar cambios'
                  )}
                </Button>
              )}

              {step === TOTAL_STEPS - 1 && (
                <Link href="/admin/providers">
                  <Button type="button" variant="outline" className="py-5 rounded-xl">
                    Cancelar
                  </Button>
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
