/**
 * Generates public/sitemap.xml at build time.
 * Includes static pages, blog posts, and Supabase dynamic entries.
 * Run: node scripts/generate-sitemap.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://ecuacasa.com';

// Static pages
const staticPages = [
  { loc: '/', changefreq: 'daily', priority: 1 },
  { loc: '/services', changefreq: 'weekly', priority: 0.9 },
  { loc: '/providers', changefreq: 'daily', priority: 0.9 },
  { loc: '/propiedades', changefreq: 'daily', priority: 0.9 },
  { loc: '/solicitar', changefreq: 'monthly', priority: 0.9 },
  { loc: '/blog', changefreq: 'weekly', priority: 0.8 },
  { loc: '/how-it-works', changefreq: 'monthly', priority: 0.7 },
  { loc: '/for-providers', changefreq: 'monthly', priority: 0.7 },
  { loc: '/recomendar', changefreq: 'monthly', priority: 0.5 },
  { loc: '/register', changefreq: 'monthly', priority: 0.6 },
  { loc: '/privacy', changefreq: 'yearly', priority: 0.3 },
  { loc: '/terms', changefreq: 'yearly', priority: 0.3 },
];

// Read blog posts from content file
function getBlogSlugs() {
  try {
    const contentPath = path.join(__dirname, '..', 'lib', 'blog', 'content.ts');
    const content = fs.readFileSync(contentPath, 'utf-8');
    const slugMatches = content.matchAll(/slug:\s*['"]([^'"]+)['"]/g);
    return [...slugMatches].map((m) => m[1]);
  } catch {
    console.warn('Could not read blog content file');
    return [];
  }
}

// Fetch dynamic entries from Supabase (if env vars available)
async function getSupabaseEntries() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('Supabase env vars not set, skipping dynamic entries');
    return { services: [], providers: [], properties: [] };
  }

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
  };

  async function fetchSlugs(table, filter = '') {
    try {
      const res = await fetch(`${url}/rest/v1/${table}?select=slug${filter}`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      return data.filter((r) => r.slug && r.slug.trim()).map((r) => r.slug);
    } catch {
      return [];
    }
  }

  const [services, providers, properties] = await Promise.all([
    fetchSlugs('services'),
    fetchSlugs('providers', '&status=eq.active'),
    fetchSlugs('properties', '&status=eq.active'),
  ]);

  return { services, providers, properties };
}

function toXml(entries) {
  const urls = entries
    .map(
      (e) =>
        `<url><loc>${e.loc}</loc><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

async function main() {
  const entries = staticPages.map((p) => ({ ...p, loc: `${BASE_URL}${p.loc}` }));

  // Blog posts
  const blogSlugs = getBlogSlugs();
  for (const slug of blogSlugs) {
    entries.push({ loc: `${BASE_URL}/blog/${slug}`, changefreq: 'monthly', priority: 0.7 });
  }

  // Supabase dynamic entries
  const { services, providers, properties } = await getSupabaseEntries();
  for (const s of services) {
    entries.push({ loc: `${BASE_URL}/services/${s}`, changefreq: 'weekly', priority: 0.8 });
  }
  for (const p of providers) {
    entries.push({ loc: `${BASE_URL}/providers/${p}`, changefreq: 'weekly', priority: 0.8 });
  }
  for (const p of properties) {
    entries.push({ loc: `${BASE_URL}/propiedades/${p}`, changefreq: 'weekly', priority: 0.8 });
  }

  const xml = toXml(entries);
  const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf-8');
  console.log(`Sitemap generated: ${entries.length} URLs → ${outPath}`);
}

main().catch(console.error);
