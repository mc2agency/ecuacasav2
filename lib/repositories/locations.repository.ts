import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export const locationsRepository = {
  /**
   * Get all active neighborhoods/locations
   */
  getActive: cache(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('slug, name')
      .eq('status', 'active')
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
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error(`Error fetching location ${slug}:`, error);
      return null;
    }

    return data;
  }),
};
