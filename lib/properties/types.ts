// Property types for the real estate marketplace

export type PropertyType = 'terreno' | 'casa' | 'departamento';
export type ListingType = 'venta' | 'arriendo';

export interface PropertyUtilities {
  agua: boolean;
  luz: boolean;
  alcantarillado: boolean;
  via: boolean;
}

export interface PropertyDocuments {
  iprus: boolean;
  certificadoGravamenes: boolean;
  escritura: boolean;
  lineaFabrica: boolean;
  levantamientoTopografico: boolean;
}

export interface PropertyAgent {
  id: string;
  name: string;
  phone: string;
  photo?: string;
  verified: boolean;
  responseTime: string;
  rating: number;
  totalSales: number;
}

export interface Property {
  id: string;
  slug: string;
  title_es: string;
  title_en: string;
  description_es: string;
  description_en: string;
  type: PropertyType;
  listingType?: ListingType;
  price: number;
  pricePerM2: number;
  size: number; // in m²
  bedrooms?: number;
  bathrooms?: number;
  sector: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  photos: string[];
  utilities: PropertyUtilities;
  documents: PropertyDocuments;
  agent: PropertyAgent;
  verified: boolean;
  gpsVerified: boolean;
  featured: boolean;
  createdAt: string;
}

export interface PropertyFilter {
  type?: PropertyType | '';
  listingType?: ListingType | '';
  priceMin?: number;
  priceMax?: number;
  sizeMin?: number;
  sizeMax?: number;
  sector?: string;
  verifiedOnly?: boolean;
  hasAgua?: boolean;
  hasLuz?: boolean;
  hasAlcantarillado?: boolean;
  hasVia?: boolean;
}

// Cuenca sectors
export const CUENCA_SECTORS = [
  'El Centro',
  'San Joaquín',
  'Baños',
  'Ricaurte',
  'Challuabamba',
  'Turi',
  'El Valle',
  'Sayausí',
  'Nulti',
] as const;

export type CuencaSector = typeof CUENCA_SECTORS[number];

// Property type labels
export const PROPERTY_TYPE_LABELS: Record<PropertyType, { es: string; en: string }> = {
  terreno: { es: 'Terreno', en: 'Land' },
  casa: { es: 'Casa', en: 'House' },
  departamento: { es: 'Departamento', en: 'Apartment' },
};

export const LISTING_TYPE_LABELS: Record<ListingType, { es: string; en: string }> = {
  venta: { es: 'En Venta', en: 'For Sale' },
  arriendo: { es: 'En Arriendo', en: 'For Rent' },
};
