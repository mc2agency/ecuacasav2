import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

interface ProviderData {
  id: string;
  slug: string;
  name: string;
  description_es?: string;
  description_en?: string;
  rating: number;
  review_count: number;
  price_range?: string;
  response_time?: string;
  verified: boolean;
  speaks_english: boolean;
  featured?: boolean;
  phone: string;
  services?: any[];
  neighborhoods?: any[];
}

export const providersRepository = {
  /**
   * Get all active providers
   */
  getAll: cache(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('providers')
      .select(`
        id,
        slug,
        name,
        description_es,
        description_en,
        rating,
        review_count,
        price_range,
        response_time,
        verified,
        speaks_english,
        featured,
        phone,
        services:provider_services(
          service:services(slug, name_es, name_en)
        )
      `)
      .eq('status', 'active')
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching all providers:', error);
      return [];
    }

    return (data || []).map((provider: any) => ({
      ...provider,
      services: provider.services?.map((ps: any) => ps.service) || [],
      neighborhoods: [],
    }));
  }),

  /**
   * Get featured providers (highlighted on homepage)
   */
  getFeatured: cache(async (limit = 6) => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('providers')
      .select(`
        id,
        slug,
        name,
        description_es,
        description_en,
        rating,
        review_count,
        price_range,
        response_time,
        verified,
        speaks_english,
        phone,
        services:provider_services(
          service:services(name_es, name_en)
        )
      `)
      .eq('featured', true)
      .eq('status', 'active')
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured providers:', error);
      return [];
    }

    // Transform data without neighborhoods for now
    return (data || []).map((provider: any) => ({
      ...provider,
      services: provider.services?.map((ps: any) => ps.service) || [],
      neighborhoods: [], // Empty for now until DB schema is fixed
    }));
  }),

  /**
   * Get providers by service slug
   */
  getByService: cache(async (serviceSlug: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('providers')
      .select(`
        id,
        slug,
        name,
        description_es,
        description_en,
        rating,
        review_count,
        price_range,
        response_time,
        verified,
        speaks_english,
        phone,
        services:provider_services!inner(
          service:services!inner(slug, name_es, name_en)
        )
      `)
      .eq('services.service.slug', serviceSlug)
      .order('rating', { ascending: false });

    if (error) {
      console.error(`Error fetching providers for service ${serviceSlug}:`, error);
      return [];
    }

    return (data || []).map((provider: any) => ({
      ...provider,
      services: provider.services?.map((ps: any) => ps.service) || [],
      neighborhoods: [],
    }));
  }),

  /**
   * Get provider by slug
   */
  getBySlug: cache(async (slug: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('providers')
      .select(`
        *,
        services:provider_services(
          service:services(*)
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error(`Error fetching provider ${slug}:`, error);
      return null;
    }

    const providerData = data as any;
    return {
      ...providerData,
      services: providerData.services?.map((ps: any) => ps.service) || [],
      neighborhoods: [],
    };
  }),
};
