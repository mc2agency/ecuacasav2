import { z } from 'zod';

// Ecuador cédula validation (Registro Civil modulus 10 algorithm)
const FAKE_CEDULAS = [
  '0000000000', '1111111111', '2222222222', '3333333333', '4444444444',
  '5555555555', '6666666666', '7777777777', '8888888888', '9999999999',
  '1234567890', '0123456789',
];

export function isValidEcuadorCedula(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false;
  if (FAKE_CEDULAS.includes(cedula)) return false;

  const province = parseInt(cedula.substring(0, 2), 10);
  // Provinces 01-24 + 30 (foreign residents)
  if ((province < 1 || province > 24) && province !== 30) return false;

  const thirdDigit = parseInt(cedula[2], 10);
  if (thirdDigit > 5) return false;

  // Modulus 10 check digit algorithm
  const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let total = 0;
  for (let i = 0; i < 9; i++) {
    let value = parseInt(cedula[i], 10) * coefficients[i];
    if (value >= 10) value -= 9;
    total += value;
  }

  const checkDigit = (10 - (total % 10)) % 10;
  return checkDigit === parseInt(cedula[9], 10);
}

// Ecuador phone number validation — accepts 09XXXXXXXX or +593XXXXXXXXX
const ecuadorPhoneRegex = /^(09\d{8}|\+593\d{9})$/;

export function isValidEcuadorPhone(phone: string): boolean {
  return ecuadorPhoneRegex.test(phone.replace(/\s/g, ''));
}

// Normalize Ecuador phone to comparable format (strip +593 prefix, leading 0)
export function normalizeEcuadorPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.startsWith('+593')) return cleaned.substring(4);
  if (cleaned.startsWith('0')) return cleaned.substring(1);
  return cleaned;
}

// Provider form validation schema
export const providerFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().regex(/^\+593[0-9]{9}$/, 'Phone must be in format +593XXXXXXXXX'),
  photo_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  description_es: z.string().optional(),
  description_en: z.string().optional(),
  price_range: z.enum(['$', '$$', '$$$']).optional(),
  response_time: z.string().optional(),
  speaks_english: z.boolean().default(false),
  years_experience: z.number().int().min(0).max(100).optional(),
  verified: z.boolean().default(false),
  featured: z.boolean().default(false),
  status: z.enum(['active', 'pending', 'inactive']).default('pending'),
  service_ids: z.array(z.string()).min(1, 'Select at least one service'),
  location_ids: z.array(z.string()).min(1, 'Select at least one location'),
});

export type ProviderFormValues = z.infer<typeof providerFormSchema>;

// Registration form validation schema
export const registrationFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+593[0-9]{9}$/, 'Phone must be in format +593XXXXXXXXX'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  cedula_number: z.string()
    .regex(/^\d{10}$/, 'La cédula debe tener exactamente 10 dígitos')
    .refine(isValidEcuadorCedula, 'Número de cédula inválido'),
  services_interested: z.array(z.string()).min(1, 'Select at least one service'),
  areas_served: z.array(z.string()).min(1, 'Select at least one area'),
  speaks_english: z.boolean().default(false),
  reference1_name: z.string().optional(),
  reference1_phone: z.string().optional()
    .refine((v) => !v || isValidEcuadorPhone(v), 'Formato inválido. Usa 09XXXXXXXX o +593XXXXXXXXX'),
  reference2_name: z.string().optional(),
  reference2_phone: z.string().optional()
    .refine((v) => !v || isValidEcuadorPhone(v), 'Formato inválido. Usa 09XXXXXXXX o +593XXXXXXXXX'),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

// Admin login validation schema
export const loginFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

// Review form validation schema (for future use)
export const reviewFormSchema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
  service_type: z.string().optional(),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

// Service request form validation schema
export const serviceRequestSchema = z.object({
  service_slug: z.string().min(1, 'Selecciona un servicio'),
  service_other: z.string().optional(),
  description: z.string().max(1000).optional(),
  sector: z.string().min(1, 'Selecciona tu sector'),
  urgency: z.string().min(1, 'Selecciona cuándo lo necesitas'),
  client_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  client_whatsapp: z.string().min(9, 'Ingresa un número válido').max(10),
  client_email: z.string().email('Email inválido').optional().or(z.literal('')),
});

export type ServiceRequestFormValues = z.infer<typeof serviceRequestSchema>;

// Recommendation form validation schema
export const recommendationSchema = z.object({
  pro_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  pro_service_type: z.string().min(1, 'Selecciona un tipo de servicio'),
  pro_phone: z.string().min(9, 'Ingresa un número válido').max(10),
  relationship: z.string().min(1, 'Selecciona cómo lo conoces'),
  why_recommend: z.string().min(10, 'Cuéntanos por qué lo recomiendas').max(500),
  recommender_name: z.string().optional(),
  recommender_email: z.string().email('Email inválido').optional().or(z.literal('')),
});

export type RecommendationFormValues = z.infer<typeof recommendationSchema>;
