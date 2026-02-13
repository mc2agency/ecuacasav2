import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { BLOG_POSTS } from '@/lib/blog/content';

/** Strip all whitespace from a URL to prevent broken <loc> tags */
function cleanUrl(url: string): string {
  return url.replace(/\s+/g, '');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ecuacasa.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/providers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/propiedades`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/solicitar`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/for-providers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/recomendar`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Blog post pages
  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: cleanUrl(`${baseUrl}/blog/${post.slug}`),
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Dynamic pages from Supabase
  try {
    const supabase = await createClient();

    const [{ data: services }, { data: providers }, { data: properties }] = await Promise.all([
      supabase.from('services').select('slug'),
      supabase.from('providers').select('slug').eq('status', 'active'),
      supabase.from('properties').select('slug').eq('status', 'active'),
    ]);

    const servicePages: MetadataRoute.Sitemap = (services || []).map((s) => ({
      url: cleanUrl(`${baseUrl}/services/${s.slug}`),
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const providerPages: MetadataRoute.Sitemap = (providers || []).map((p) => ({
      url: cleanUrl(`${baseUrl}/providers/${p.slug}`),
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    const propertyPages: MetadataRoute.Sitemap = (properties || []).map((p) => ({
      url: cleanUrl(`${baseUrl}/propiedades/${p.slug}`),
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...blogPages, ...servicePages, ...providerPages, ...propertyPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [...staticPages, ...blogPages];
  }
}
