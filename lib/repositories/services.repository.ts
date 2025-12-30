import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export const servicesRepository = {
  /**
   * Get all active services
   */
  getActive: cache(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('services')
      .select('slug, name_es, name_en, description_es, description_en')
      .eq('status', 'active')
      .order('name_en');

    if (error) {
      console.error('Error fetching services:', error);
      return [];
    }

    return data || [];
  }),

  /**
   * Get service by slug
   */
  getBySlug: cache(async (slug: string) => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error(`Error fetching service ${slug}:`, error);
      return null;
    }

    return data;
  }),
};
