'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { BlogCard } from '@/components/blog/blog-card';
import { Button } from '@/components/ui/button';
import { getAllBlogPosts } from '@/lib/blog/content';
import { BlogCategory, BLOG_CATEGORY_LABELS } from '@/lib/blog/types';
import { BookOpen } from 'lucide-react';

export function BlogPageClient() {
  const { locale, t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'all'>('all');

  const allPosts = useMemo(() => getAllBlogPosts(), []);

  // Only show categories that have at least 1 post
  const categoriesWithPosts = useMemo(() => {
    const cats = new Set<BlogCategory>();
    allPosts.forEach((post) => cats.add(post.category));
    return ['all' as const, ...Array.from(cats)] as (BlogCategory | 'all')[];
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'all') return allPosts;
    return allPosts.filter((post) => post.category === selectedCategory);
  }, [allPosts, selectedCategory]);

  const getCategoryLabel = (category: BlogCategory | 'all') => {
    if (category === 'all') {
      return locale === 'es' ? 'Todos' : 'All';
    }
    return BLOG_CATEGORY_LABELS[category][locale as 'en' | 'es'];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <BookOpen className="w-5 h-5" />
              <span className="text-sm font-medium">
                {locale === 'es' ? 'Recursos para Compradores' : 'Buyer Resources'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              {locale === 'es'
                ? 'Guía de Bienes Raíces en Cuenca'
                : 'Cuenca Real Estate Guide'}
            </h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              {locale === 'es'
                ? 'Guías respaldadas por investigación desde experiencia real comprando propiedades en Cuenca, Ecuador'
                : 'Research-backed guides from real experience buying property in Cuenca, Ecuador'}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categoriesWithPosts.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'hover:border-purple-300 hover:text-purple-600'
                }
              >
                {getCategoryLabel(category)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {filteredPosts.length > 0 ? (
          <>
            {/* Featured Post (first post) */}
            {selectedCategory === 'all' && filteredPosts.length > 0 && (
              <div className="mb-12">
                <BlogCard post={filteredPosts[0]} featured />
              </div>
            )}

            {/* Rest of Posts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(selectedCategory === 'all' ? filteredPosts.slice(1) : filteredPosts).map(
                (post) => (
                  <BlogCard key={post.slug} post={post} />
                )
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {locale === 'es'
                ? 'No hay artículos en esta categoría'
                : 'No articles in this category'}
            </h3>
            <p className="text-gray-600 mb-4">
              {locale === 'es'
                ? 'Próximamente agregaremos más contenido'
                : 'More content coming soon'}
            </p>
            <Button variant="outline" onClick={() => setSelectedCategory('all')}>
              {locale === 'es' ? 'Ver todos los artículos' : 'View all articles'}
            </Button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {locale === 'es'
              ? '¿Buscas propiedades verificadas en Cuenca?'
              : 'Looking for verified properties in Cuenca?'}
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            {locale === 'es'
              ? 'Explora nuestro mercado de bienes raíces con listados verificados, documentos confirmados y agentes que responden.'
              : 'Explore our real estate marketplace with verified listings, confirmed documents, and responsive agents.'}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-purple-600 hover:bg-purple-700"
          >
            <a href="/propiedades">
              {locale === 'es' ? 'Explorar Propiedades' : 'Explore Properties'}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
