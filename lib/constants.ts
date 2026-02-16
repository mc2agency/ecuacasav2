import type { LucideIcon } from 'lucide-react';
import {
  Zap,
  Droplet,
  Wrench,
  Paintbrush,
  Hammer,
  Sparkles,
  Trees,
  Car,
  Shirt,
  Bug
} from 'lucide-react';

// Re-export translations from new i18n structure
export { TRANSLATIONS } from './i18n/translations';

// Service icons mapping
export const SERVICE_ICONS: Record<string, LucideIcon> = {
  'electricidad': Zap,
  'plomeria': Droplet,
  'reparaciones-generales': Wrench,
  'pintura': Paintbrush,
  'carpinteria': Hammer,
  'limpieza': Sparkles,
  'jardineria': Trees,
  'mecanica': Car,
  'lavanderia': Shirt,
  'control-de-plagas': Bug,
};

export const DEFAULT_SERVICE_ICON: LucideIcon = Wrench;

// Placeholder testimonials (to be replaced with real user testimonials)
export const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    avatar: '/images/testimonials/sarah.jpg',
    quote: 'Found a great electrician who spoke English. Super helpful!',
  },
  {
    name: 'John D.',
    avatar: '/images/testimonials/john.jpg',
    quote: 'The verified providers gave me peace of mind as a new expat.',
  },
  {
    name: 'Maria C.',
    avatar: '/images/testimonials/maria.jpg',
    quote: 'Quick responses and quality work. Highly recommend!',
  },
];

// Price range options
export const PRICE_RANGES = [
  { value: '$', label: '$ (Económico / Budget)', labelEn: '$ (Budget)', labelEs: '$ (Económico)' },
  { value: '$$', label: '$$ (Moderado / Moderate)', labelEn: '$$ (Moderate)', labelEs: '$$ (Moderado)' },
  { value: '$$$', label: '$$$ (Premium)', labelEn: '$$$ (Premium)', labelEs: '$$$ (Premium)' },
];

// Provider status options
export const PROVIDER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active / Activo' },
  { value: 'pending', label: 'Pending / Pendiente' },
  { value: 'inactive', label: 'Inactive / Inactivo' },
];

// Registration status options
export const REGISTRATION_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending / Pendiente' },
  { value: 'contacted', label: 'Contacted / Contactado' },
  { value: 'approved', label: 'Approved / Aprobado' },
  { value: 'rejected', label: 'Rejected / Rechazado' },
];

// Common response time options
export const RESPONSE_TIME_OPTIONS = [
  '< 2 hours',
  'Same day',
  '24 hours',
  '2-3 days',
];

// Coverage sectors in Cuenca
export const COVERAGE_SECTORS = [
  'El Centro',
  'San Sebastián',
  'Challuabamba',
  'Ricaurte',
  'Yanuncay',
  'Misicata',
  'Baños',
  'Gringolandia / Ordoñez Lasso',
  'El Vergel',
  'San Joaquín',
  'Turi',
  'El Valle',
  'Totoracocha',
  'Miraflores',
  'Todas las Zonas',
];
