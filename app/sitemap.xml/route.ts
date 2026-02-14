import { createClient } from '@/lib/supabase/server';
import { getAllBlogPosts } from '@/lib/blog/content';

export const dynamic = 'force-dynamic';

interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: string;
  priority: number;
}

function cleanUrl(url: string): string {
  return url.replace(/\s+/g, '');
}

function toXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (e) =>
        `<url><loc>${cleanUrl(e.url)}</loc><lastmod>${e.lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export async function GET() {
  const baseUrl = 'https://ecuacasa.com';
  const now = new Date().toISOString();

  const entries: SitemapEntry[] = [
    { url: baseUrl, lastmod: now, changefreq: 'daily', priority: 1 },
    { url: `${baseUrl}/services`, lastmod: now, changefreq: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/providers`, lastmod: now, changefreq: 'daily', priority: 0.9 },
    { url: `${baseUrl}/propiedades`, lastmod: now, changefreq: 'daily', priority: 0.9 },
    { url: `${baseUrl}/solicitar`, lastmod: now, changefreq: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastmod: now, changefreq: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/how-it-works`, lastmod: now, changefreq: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/for-providers`, lastmod: now, changefreq: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/recomendar`, lastmod: now, changefreq: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/register`, lastmod: now, changefreq: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastmod: now, changefreq: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastmod: now, changefreq: 'yearly', priority: 0.3 },
  ];

  // Blog posts
  const blogPosts = getAllBlogPosts();
  for (const post of blogPosts) {
    entries.push({
      url: `${baseUrl}/blog/${post.slug}`,
      lastmod: new Date(post.publishedAt).toISOString(),
      changefreq: 'monthly',
      priority: 0.7,
    });
  }

  // Dynamic pages from Supabase
  try {
    const supabase = await createClient();
    if (!supabase) throw new Error('Supabase not available');

    const [{ data: services }, { data: providers }, { data: properties }] = await Promise.all([
      supabase.from('services').select('slug'),
      supabase.from('providers').select('slug').eq('status', 'active'),
      supabase.from('properties').select('slug').eq('status', 'active'),
    ]);

    for (const s of (services || []).filter((s) => s.slug && s.slug.trim())) {
      entries.push({ url: `${baseUrl}/services/${s.slug}`, lastmod: now, changefreq: 'weekly', priority: 0.8 });
    }

    for (const p of (providers || []).filter((p) => p.slug && p.slug.trim())) {
      entries.push({ url: `${baseUrl}/providers/${p.slug}`, lastmod: now, changefreq: 'weekly', priority: 0.8 });
    }

    for (const p of (properties || []).filter((p) => p.slug && p.slug.trim())) {
      entries.push({ url: `${baseUrl}/propiedades/${p.slug}`, lastmod: now, changefreq: 'weekly', priority: 0.8 });
    }
  } catch (error) {
    console.error('Sitemap: Supabase error (non-fatal):', error);
  }

  const xml = toXml(entries);

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      'Vary': 'Accept',
    },
  });
}
