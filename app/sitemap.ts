import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getAllBlogPosts } from '@/lib/blog/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ecuacasa.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/providers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/propiedades`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/solicitar`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/for-providers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/recomendar`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Blog posts from local content
  const blogPosts = getAllBlogPosts();
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug.trim()}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Dynamic pages from Supabase
  try {
    const supabase = await createClient();

    const [{ data: services }, { data: providers }] = await Promise.all([
      supabase.from('services').select('slug'),
      supabase.from('providers').select('slug').eq('status', 'active'),
    ]);

    const servicePages: MetadataRoute.Sitemap = (services || [])
      .filter((s) => s.slug && s.slug.trim())
      .map((s) => ({
        url: `${baseUrl}/services/${s.slug.trim()}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    const providerPages: MetadataRoute.Sitemap = (providers || [])
      .filter((p) => p.slug && p.slug.trim())
      .map((p) => ({
        url: `${baseUrl}/providers/${p.slug.trim()}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));

    return [...staticPages, ...blogPages, ...servicePages, ...providerPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return [...staticPages, ...blogPages];
  }
}
