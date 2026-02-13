import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { Property, PropertyType, ListingType, AgentRole } from '@/lib/properties/types';

// Map a Supabase row (with joined agent + photos) to the frontend Property type
function mapProperty(row: any): Property {
  const agent = row.agent;
  return {
    id: row.id,
    slug: row.slug,
    title_es: row.title_es,
    title_en: row.title_en || row.title_es,
    description_es: row.description_es,
    description_en: row.description_en || row.description_es,
    type: row.property_type as PropertyType,
    listingType: (row.listing_type as ListingType) || undefined,
    price: Number(row.price),
    pricePerM2: Number(row.price_per_m2 || 0),
    size: row.size_m2,
    bedrooms: row.bedrooms || 0,
    bathrooms: row.bathrooms || 0,
    sector: row.sector,
    address: row.address,
    coordinates: {
      lat: Number(row.latitude) || 0,
      lng: Number(row.longitude) || 0,
    },
    photos: (row.property_photos || [])
      .sort((a: any, b: any) => a.display_order - b.display_order)
      .map((p: any) => p.photo_url),
    utilities: {
      agua: row.has_agua || false,
      luz: row.has_luz || false,
      alcantarillado: row.has_alcantarillado || false,
      via: row.has_via || false,
    },
    documents: {
      iprus: row.doc_iprus || false,
      certificadoGravamenes: row.doc_certificado_gravamenes || false,
      escritura: row.doc_escritura || false,
      lineaFabrica: row.doc_linea_fabrica || false,
      levantamientoTopografico: row.doc_levantamiento_topografico || false,
    },
    agent: agent
      ? {
          id: agent.id,
          name: agent.name,
          phone: agent.phone,
          photo: agent.photo_url || undefined,
          role: (agent.role as AgentRole) || 'propietario',
          verified: agent.verified || false,
          responseTime: agent.response_time || '',
          rating: Number(agent.rating) || 0,
          totalSales: agent.total_sales || 0,
        }
      : {
          id: '',
          name: 'EcuaCasa',
          phone: '+19143973750',
          role: 'propietario' as AgentRole,
          verified: true,
          responseTime: '< 2 horas',
          rating: 0,
          totalSales: 0,
        },
    verified: row.verified || false,
    gpsVerified: row.gps_verified || false,
    featured: row.featured || false,
    createdAt: row.created_at,
  };
}

const PROPERTY_SELECT = `
  *,
  agent:property_agents(*),
  property_photos(id, photo_url, display_order, is_primary)
`;

export const propertiesRepository = {
  getAll: cache(async (): Promise<Property[]> => {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('properties')
      .select(PROPERTY_SELECT)
      .eq('status', 'active')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching properties:', error);
      return [];
    }

    return (data || []).map(mapProperty);
  }),

  getBySlug: cache(async (slug: string): Promise<Property | null> => {
    const supabase = await createClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('properties')
      .select(PROPERTY_SELECT)
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error(`Error fetching property ${slug}:`, error);
      return null;
    }

    return data ? mapProperty(data) : null;
  }),

  getAllSlugs: cache(async (): Promise<string[]> => {
    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('properties')
      .select('slug')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching property slugs:', error);
      return [];
    }

    return (data || []).map((row: any) => row.slug);
  }),
};
