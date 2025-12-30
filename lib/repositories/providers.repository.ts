import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

/**
 * Transform Supabase provider response to clean domain model
 */
function transformProviderData(providers: any[]) {
  return providers.map(provider => ({
    ...provider,
    services: provider.services?.map((ps: any) => ps.service) || [],
    neighborhoods: provider.neighborhoods?.map((pn: any) => pn.neighborhood) || [],
  }));
}

export const providersRepository = {
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
        ),
        neighborhoods:provider_neighborhoods(
          neighborhood:neighborhoods(name)
        )
      `)
      .eq('status', 'active')
      .eq('featured', true)
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured providers:', error);
      return [];
    }

    return transformProviderData(data || []);
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
        ),
        neighborhoods:provider_neighborhoods(
          neighborhood:neighborhoods(name)
        )
      `)
      .eq('status', 'active')
      .eq('services.service.slug', serviceSlug)
      .order('rating', { ascending: false });

    if (error) {
      console.error(`Error fetching providers for service ${serviceSlug}:`, error);
      return [];
    }

    return transformProviderData(data || []);
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
        ),
        neighborhoods:provider_neighborhoods(
          neighborhood:neighborhoods(*)
        )
      `)
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error(`Error fetching provider ${slug}:`, error);
      return null;
    }

    return transformProviderData([data])[0];
  }),
};
