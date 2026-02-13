export type BlogCategory =
  | 'guia-comprador'
  | 'sectores'
  | 'legal'
  | 'finanzas'
  | 'visa'
  | 'precios';

export const BLOG_CATEGORY_LABELS: Record<BlogCategory, { en: string; es: string }> = {
  'guia-comprador': { en: "Buyer's Guide", es: 'Guía del Comprador' },
  'sectores': { en: 'Sectors', es: 'Sectores' },
  'legal': { en: 'Legal', es: 'Legal' },
  'finanzas': { en: 'Finance', es: 'Finanzas' },
  'visa': { en: 'Visa', es: 'Visa' },
  'precios': { en: 'Pricing', es: 'Precios' },
};

export interface BlogPost {
  slug: string;
  title: {
    en: string;
    es: string;
  };
  excerpt: {
    en: string;
    es: string;
  };
  content: {
    en: string;
    es: string;
  };
  category: BlogCategory;
  featuredImage: string;
  publishedAt: string;
  updatedAt?: string;
  author: {
    name: string;
    role: {
      en: string;
      es: string;
    };
  };
  readingTime: number; // in minutes
  tags: string[];
  relatedSlugs?: string[];
}

// Calculate reading time from content (average 200 words per minute)
export function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
