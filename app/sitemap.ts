import type { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/lib/blog/content';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = 'https://ecuacasa.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/services`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/providers`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/propiedades`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/solicitar`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/how-it-works`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/for-providers`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/recomendar`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/register`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Blog posts
  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Dynamic entries from Supabase
  let dynamicPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = await createClient();
    if (supabase) {
      const [servicesRes, providersRes, propertiesRes] = await Promise.all([
        supabase.from('services').select('slug'),
        supabase.from('providers').select('slug').eq('status', 'active'),
        supabase.from('properties').select('slug').eq('status', 'active'),
      ]);

      const services = (servicesRes.data ?? [])
        .filter((r) => r.slug?.trim())
        .map((r) => ({
          url: `${BASE_URL}/services/${r.slug.trim()}`,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));

      const providers = (providersRes.data ?? [])
        .filter((r) => r.slug?.trim())
        .map((r) => ({
          url: `${BASE_URL}/providers/${r.slug.trim()}`,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));

      const properties = (propertiesRes.data ?? [])
        .filter((r) => r.slug?.trim())
        .map((r) => ({
          url: `${BASE_URL}/propiedades/${r.slug.trim()}`,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));

      dynamicPages = [...services, ...providers, ...properties];
    }
  } catch {
    // Supabase unavailable — continue with static + blog entries
  }

  return [...staticPages, ...blogPages, ...dynamicPages];
}
