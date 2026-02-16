// Database types
export type ProviderStatus = 'active' | 'pending' | 'inactive';
export type RegistrationStatus = 'pending' | 'contacted' | 'approved' | 'rejected';

export interface Service {
  id: string;
  slug: string;
  name_es: string;
  name_en: string;
  description_es?: string;
  description_en?: string;
  icon?: string;
  display_order: number;
  created_at: string;
}

export interface Location {
  id: string;
  slug: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface Provider {
  id: string;
  slug: string;
  name: string;
  email?: string;
  phone: string;
  photo_url?: string;
  description_es?: string;
  description_en?: string;
  price_range?: string;
  response_time?: string;
  speaks_english: boolean;
  years_experience?: number;
  verified: boolean;
  featured: boolean;
  rating: number;
  review_count: number;
  status: ProviderStatus;
  created_at: string;
  updated_at: string;
}

export interface ProviderWithRelations extends Provider {
  services?: Service[];
  locations?: Location[];
}

export interface RegistrationRequest {
  id: string;
  name: string;
  phone: string;
  email?: string;
  services_interested?: string[];
  areas_served?: string[];
  speaks_english: boolean;
  message?: string;
  cedula_number?: string;
  cedula_photo_url?: string;
  profile_photo_url?: string;
  reference1_name?: string;
  reference1_phone?: string;
  reference2_name?: string;
  reference2_phone?: string;
  status: RegistrationStatus;
  admin_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface Review {
  id: string;
  provider_id: string;
  customer_name: string;
  rating: number;
  comment?: string;
  service_type?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

// Form types
export interface ProviderFormData {
  name: string;
  email?: string;
  phone: string;
  photo_url?: string;
  description_es?: string;
  description_en?: string;
  price_range?: string;
  response_time?: string;
  speaks_english: boolean;
  years_experience?: number;
  verified: boolean;
  featured: boolean;
  status: ProviderStatus;
  service_ids: string[];
  location_ids: string[];
}

export interface RegistrationFormData {
  name: string;
  phone: string;
  email?: string;
  services_interested: string[];
  areas_served: string[];
  speaks_english: boolean;
  message?: string;
  cedula_number: string;
  reference1_name: string;
  reference1_phone: string;
  reference2_name: string;
  reference2_phone: string;
}

// Filter types
export interface ProviderFilters {
  serviceId?: string;
  locationId?: string;
  speaksEnglish?: boolean;
  priceRange?: string;
  search?: string;
}
