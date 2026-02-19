'use client';

import { useState, useEffect } from 'react';
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
import { isValidEcuadorCedula, isValidEcuadorPhone, normalizeEcuadorPhone } from '@/lib/validations';
import { CheckCircle, ArrowLeft, ArrowRight, Loader2, Upload } from 'lucide-react';

const TOTAL_STEPS = 4;

const STEPS = [
  { title: 'Información básica', subtitle: 'Tu nombre y datos de contacto' },
  { title: 'Verificación de identidad', subtitle: 'Para garantizar confianza en la plataforma' },
  { title: 'Tus servicios', subtitle: 'Qué ofreces y dónde trabajas' },
  { title: 'Últimos detalles', subtitle: 'Referencias y más sobre ti' },
];

const registrationSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().min(9, 'Ingresa un número de teléfono válido').max(10, 'Número demasiado largo'),
  email: z.string().email('Ingresa un email válido').optional().or(z.literal('')),
  cedula_number: z.string()
    .regex(/^\d{10}$/, 'La cédula debe tener exactamente 10 dígitos')
    .refine(isValidEcuadorCedula, 'Número de cédula inválido'),
  services: z.array(z.string()).min(1, 'Selecciona al menos un servicio'),
  areas_served: z.array(z.string()).min(1, 'Selecciona al menos un sector'),
  speaks_english: z.boolean(),
  reference1_name: z.string().optional(),
  reference1_phone: z.string().optional()
    .refine((v) => !v || isValidEcuadorPhone(v), 'Formato inválido. Usa 09XXXXXXXX o +593XXXXXXXXX'),
  reference2_name: z.string().optional(),
  reference2_phone: z.string().optional()
    .refine((v) => !v || isValidEcuadorPhone(v), 'Formato inválido. Usa 09XXXXXXXX o +593XXXXXXXXX'),
  message: z.string().optional(),
}).superRefine((data, ctx) => {
  const ownPhone = normalizeEcuadorPhone(data.phone);
  const ref1Phone = data.reference1_phone ? normalizeEcuadorPhone(data.reference1_phone) : '';
  const ref2Phone = data.reference2_phone ? normalizeEcuadorPhone(data.reference2_phone) : '';

  if (ref1Phone && ownPhone && ref1Phone === ownPhone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'No puede ser tu propio número',
      path: ['reference1_phone'],
    });
  }
  if (ref2Phone && ownPhone && ref2Phone === ownPhone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'No puede ser tu propio número',
      path: ['reference2_phone'],
    });
  }
  if (ref1Phone && ref2Phone && ref1Phone === ref2Phone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Las referencias deben tener números diferentes',
      path: ['reference2_phone'],
    });
  }
});

type RegistrationForm = z.infer<typeof registrationSchema>;

// Fields that must be valid before advancing from each step
const STEP_FIELDS: (keyof RegistrationForm)[][] = [
  ['name', 'phone'],           // Step 1
  ['cedula_number'],           // Step 2
  ['services', 'areas_served'],// Step 3
  [],                          // Step 4 — all optional
];

interface Service {
  slug: string;
  name_es: string;
}

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cedulaPhoto, setCedulaPhoto] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      cedula_number: '',
      services: [],
      areas_served: [],
      speaks_english: false,
      reference1_name: '',
      reference1_phone: '',
      reference2_name: '',
      reference2_phone: '',
      message: '',
    },
  });

  const selectedServices = watch('services');
  const selectedSectors = watch('areas_served');

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data } = await supabase.from('services').select('slug, name_es').order('name_es');
      setServices(data || []);
      setLoading(false);
    }

    fetchData();
  }, []);

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
      setValue('areas_served', current.filter((s) => s !== sector), { shouldValidate: true });
    } else {
      setValue('areas_served', [...current, sector], { shouldValidate: true });
    }
  };

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

  const onSubmit = async (data: RegistrationForm) => {
    setFileError(null);
    setPhoneError(null);
    setSubmitting(true);

    try {
      // Normalize phone number
      let fullPhone = data.phone.replace(/\s/g, '');
      if (fullPhone.startsWith('+593')) {
        // Already has prefix
      } else if (fullPhone.startsWith('593')) {
        fullPhone = `+${fullPhone}`;
      } else {
        if (fullPhone.startsWith('0')) {
          fullPhone = fullPhone.substring(1);
        }
        fullPhone = `+593${fullPhone}`;
      }

      // Check for duplicate WhatsApp number
      const supabase = createClient();
      const { data: existing } = await supabase
        .from('registration_requests')
        .select('id')
        .eq('phone', fullPhone)
        .limit(1);

      if (existing && existing.length > 0) {
        setPhoneError('Este número de WhatsApp ya está registrado en EcuaCasa. Si tienes problemas con tu cuenta contáctanos en info@ecuacasa.com');
        setStep(0);
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('phone', fullPhone);
      formData.append('email', data.email || '');
      formData.append('cedula_number', data.cedula_number);
      formData.append('services', JSON.stringify(data.services));
      formData.append('areas_served', JSON.stringify(data.areas_served));
      formData.append('speaks_english', String(data.speaks_english));
      formData.append('reference1_name', data.reference1_name || '');
      formData.append('reference1_phone', data.reference1_phone || '');
      formData.append('reference2_name', data.reference2_name || '');
      formData.append('reference2_phone', data.reference2_phone || '');
      formData.append('message', data.message || '');
      if (cedulaPhoto) formData.append('cedula_photo', cedulaPhoto);
      if (profilePhoto) formData.append('profile_photo', profilePhoto);

      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      setSuccess(true);
    } catch (error) {
      console.error('Error submitting registration:', error);
      alert('Hubo un error al enviar tu solicitud. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Solicitud enviada!
            </h1>
            <p className="text-gray-600 mb-6">
              Gracias por tu interés en unirte a EcuaCasa. Te contactaremos en las próximas
              24-48 horas para verificar tu información.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              Volver al inicio
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
          href="/for-providers"
          className="inline-flex items-center text-gray-600 hover:text-accent-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Registrate como profesional
          </h1>
          <p className="text-lg text-gray-600">
            Completa el formulario y te contactaremos para verificar tu información
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Paso {step + 1} de {TOTAL_STEPS}</span>
            <span className="text-sm text-gray-500">{STEPS[step].title}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          {/* Step indicators */}
          <div className="flex justify-between mt-3">
            {STEPS.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { if (i < step) setStep(i); }}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                  i < step
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white cursor-pointer hover:shadow-md'
                    : i === step
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white ring-4 ring-purple-100'
                    : 'bg-gray-200 text-gray-500'
                }`}
                disabled={i > step}
              >
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-xl border-2 border-gray-100">
          <CardContent className="p-6 sm:p-8">
            {/* Step Title */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">{STEPS[step].title}</h2>
              <p className="text-sm text-gray-500 mt-1">{STEPS[step].subtitle}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* ========== STEP 1: Información básica ========== */}
              {step === 0 && (
                <>
                  {/* Name */}
                  <div>
                    <Label htmlFor="name">Nombre completo *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      className="mt-1"
                      placeholder="Ej: Juan García"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone">Número de WhatsApp *</Label>
                    <div className="flex mt-1">
                      <span className="inline-flex items-center px-4 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-600 font-medium">
                        +593
                      </span>
                      <Input
                        id="phone"
                        type="tel"
                        {...register('phone')}
                        className="rounded-l-none"
                        placeholder="99 123 4567"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                    )}
                    {phoneError && (
                      <p className="text-sm text-red-500 mt-1">{phoneError}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email">Email (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      className="mt-1"
                      placeholder="tu@email.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </>
              )}

              {/* ========== STEP 2: Verificación de identidad ========== */}
              {step === 1 && (
                <>
                  {/* Cédula Number */}
                  <div>
                    <Label htmlFor="cedula_number">Número de cédula *</Label>
                    <Input
                      id="cedula_number"
                      {...register('cedula_number')}
                      className="mt-1"
                      placeholder="0101234567"
                    />
                    {errors.cedula_number && (
                      <p className="text-sm text-red-500 mt-1">{errors.cedula_number.message}</p>
                    )}
                  </div>

                  {/* Cédula Photo Upload */}
                  <div>
                    <Label htmlFor="cedula_photo">Foto de cédula (opcional)</Label>
                    <p className="text-sm text-gray-500 mb-2">Sube una foto clara de tu cédula de identidad</p>
                    <label
                      htmlFor="cedula_photo"
                      className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        cedulaPhoto ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {cedulaPhoto ? cedulaPhoto.name : 'Seleccionar archivo...'}
                      </span>
                      <input
                        id="cedula_photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          setCedulaPhoto(e.target.files?.[0] || null);
                          setFileError(null);
                        }}
                      />
                    </label>
                  </div>

                  {/* Profile Photo Upload */}
                  <div>
                    <Label htmlFor="profile_photo">Foto de perfil (opcional)</Label>
                    <p className="text-sm text-gray-500 mb-2">Una foto tuya profesional para tu perfil</p>
                    <label
                      htmlFor="profile_photo"
                      className={`flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        profilePhoto ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {profilePhoto ? profilePhoto.name : 'Seleccionar archivo...'}
                      </span>
                      <input
                        id="profile_photo"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          setProfilePhoto(e.target.files?.[0] || null);
                          setFileError(null);
                        }}
                      />
                    </label>
                  </div>

                  {fileError && (
                    <p className="text-sm text-red-500">{fileError}</p>
                  )}
                </>
              )}

              {/* ========== STEP 3: Tus servicios ========== */}
              {step === 2 && (
                <>
                  {/* Services */}
                  <div>
                    <Label>Servicios que ofreces *</Label>
                    <p className="text-sm text-gray-500 mb-3">Selecciona todos los que apliquen</p>
                    <div className="flex flex-wrap gap-2">
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

                  {/* Sectors */}
                  <div>
                    <Label>Sectores donde trabajas *</Label>
                    <p className="text-sm text-gray-500 mb-3">Selecciona todos los sectores que cubres</p>
                    <div className="flex flex-wrap gap-2">
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
                    {errors.areas_served && (
                      <p className="text-sm text-red-500 mt-2">{errors.areas_served.message}</p>
                    )}
                  </div>

                  {/* Speaks English */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="speaks_english"
                      {...register('speaks_english')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-5 h-5"
                    />
                    <Label htmlFor="speaks_english" className="cursor-pointer">
                      Hablo inglés
                    </Label>
                  </div>
                </>
              )}

              {/* ========== STEP 4: Últimos detalles ========== */}
              {step === 3 && (
                <>
                  {/* Reference 1 */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-gray-900">Referencia 1 (opcional)</h3>
                    <div>
                      <Label htmlFor="reference1_name">Nombre completo</Label>
                      <Input
                        id="reference1_name"
                        {...register('reference1_name')}
                        className="mt-1"
                        placeholder="Nombre de tu referencia"
                      />
                      {errors.reference1_name && (
                        <p className="text-sm text-red-500 mt-1">{errors.reference1_name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="reference1_phone">Teléfono</Label>
                      <Input
                        id="reference1_phone"
                        type="tel"
                        {...register('reference1_phone')}
                        className="mt-1"
                        placeholder="09X XXX XXXX"
                      />
                      {errors.reference1_phone && (
                        <p className="text-sm text-red-500 mt-1">{errors.reference1_phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Reference 2 */}
                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-semibold text-gray-900">Referencia 2 (opcional)</h3>
                    <div>
                      <Label htmlFor="reference2_name">Nombre completo</Label>
                      <Input
                        id="reference2_name"
                        {...register('reference2_name')}
                        className="mt-1"
                        placeholder="Nombre de tu referencia"
                      />
                      {errors.reference2_name && (
                        <p className="text-sm text-red-500 mt-1">{errors.reference2_name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="reference2_phone">Teléfono</Label>
                      <Input
                        id="reference2_phone"
                        type="tel"
                        {...register('reference2_phone')}
                        className="mt-1"
                        placeholder="09X XXX XXXX"
                      />
                      {errors.reference2_phone && (
                        <p className="text-sm text-red-500 mt-1">{errors.reference2_phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message">Cuéntanos sobre ti (opcional)</Label>
                    <Textarea
                      id="message"
                      {...register('message')}
                      className="mt-1"
                      rows={4}
                      placeholder="Tu experiencia, especialidades, lo que te hace diferente..."
                    />
                  </div>
                </>
              )}

              {/* ========== Navigation Buttons ========== */}
              <div className="flex items-center gap-4 pt-2">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 py-5"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Atrás
                  </Button>
                )}

                {step < TOTAL_STEPS - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className={`flex-1 py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white ${step === 0 ? 'w-full' : ''}`}
                  >
                    Siguiente
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-5 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar solicitud'
                    )}
                  </Button>
                )}
              </div>

              {step === TOTAL_STEPS - 1 && (
                <p className="text-center text-sm text-gray-500">
                  Al registrarte aceptas nuestros{' '}
                  <Link href="/terms" className="text-primary-600 hover:underline">
                    Términos de servicio
                  </Link>{' '}
                  y{' '}
                  <Link href="/privacy" className="text-primary-600 hover:underline">
                    Política de privacidad
                  </Link>
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
