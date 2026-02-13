import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export const locationsRepository = {
  /**
   * Get all active neighborhoods/locations
   */
  getActive: cache(async () => {
    const supabase = await createClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('locations')
      .select('slug, name')
      .order('name');

    if (error) {
      console.error('Error fetching locations:', error);
      return [];
    }

    return data || [];
  }),

  /**
   * Get location by slug
   */
  getBySlug: cache(async (slug: string) => {
    const supabase = await createClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error(`Error fetching location ${slug}:`, error);
      return null;
    }

    return data;
  }),
};
