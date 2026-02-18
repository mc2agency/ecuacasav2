import { BLOG_POSTS } from '@/lib/blog/content';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = 'https://ecuacasa.com';

interface SitemapEntry {
  url: string;
  changefreq: string;
  priority: number;
}

function toXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${e.url}</loc>\n    <changefreq>${e.changefreq}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export async function GET() {
  // Static pages
  const entries: SitemapEntry[] = [
    { url: `${BASE_URL}/`, changefreq: 'daily', priority: 1 },
    { url: `${BASE_URL}/services`, changefreq: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/providers`, changefreq: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/propiedades`, changefreq: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/solicitar`, changefreq: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/blog`, changefreq: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/how-it-works`, changefreq: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/for-providers`, changefreq: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/recomendar`, changefreq: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/register`, changefreq: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/privacy`, changefreq: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, changefreq: 'yearly', priority: 0.3 },
  ];

  // Blog posts
  for (const post of BLOG_POSTS) {
    entries.push({
      url: `${BASE_URL}/blog/${post.slug}`,
      changefreq: 'monthly',
      priority: 0.7,
    });
  }

  // Dynamic entries from Supabase
  try {
    const supabase = await createClient();
    if (supabase) {
      const [servicesRes, providersRes, propertiesRes] = await Promise.all([
        supabase.from('services').select('slug'),
        supabase.from('providers').select('slug').eq('status', 'active'),
        supabase.from('properties').select('slug').eq('status', 'active'),
      ]);

      for (const r of servicesRes.data ?? []) {
        if (r.slug?.trim()) {
          entries.push({
            url: `${BASE_URL}/services/${r.slug.trim()}`,
            changefreq: 'weekly',
            priority: 0.8,
          });
        }
      }

      for (const r of providersRes.data ?? []) {
        if (r.slug?.trim()) {
          entries.push({
            url: `${BASE_URL}/providers/${r.slug.trim()}`,
            changefreq: 'weekly',
            priority: 0.8,
          });
        }
      }

      for (const r of propertiesRes.data ?? []) {
        if (r.slug?.trim()) {
          entries.push({
            url: `${BASE_URL}/propiedades/${r.slug.trim()}`,
            changefreq: 'weekly',
            priority: 0.8,
          });
        }
      }
    }
  } catch {
    // Supabase unavailable — continue with static + blog entries
  }

  const xml = toXml(entries);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
