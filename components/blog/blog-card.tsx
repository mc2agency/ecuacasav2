'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BlogPost, BLOG_CATEGORY_LABELS } from '@/lib/blog/types';
import { useTranslation } from '@/hooks/use-translation';
import { Calendar, Clock } from 'lucide-react';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const { locale } = useTranslation();

  const title = post.title[locale as 'en' | 'es'];
  const excerpt = post.excerpt[locale as 'en' | 'es'];
  const categoryLabel = BLOG_CATEGORY_LABELS[post.category][locale as 'en' | 'es'];

  const formattedDate = new Date(post.publishedAt).toLocaleDateString(
    locale === 'es' ? 'es-EC' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card
        className={`group overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg border-gray-200 hover:border-gray-300 h-full ${
          featured ? 'md:flex md:flex-row' : ''
        }`}
      >
        <CardContent className={`p-0 ${featured ? 'md:flex md:flex-row w-full' : ''}`}>
          {/* Image Section */}
          <div
            className={`relative overflow-hidden bg-gray-100 ${
              featured ? 'h-48 md:h-auto md:w-1/2' : 'h-48'
            }`}
          >
            <Image
              src={post.featuredImage}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes={featured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
            />
            {/* Category Badge */}
            <Badge
              className="absolute top-3 left-3 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {categoryLabel}
            </Badge>
          </div>

          {/* Content Section */}
          <div className={`p-5 ${featured ? 'md:w-1/2 md:flex md:flex-col md:justify-center' : ''}`}>
            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>
                  {post.readingTime} {locale === 'es' ? 'min de lectura' : 'min read'}
                </span>
              </div>
            </div>

            {/* Title */}
            <h3
              className={`font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2 line-clamp-2 ${
                featured ? 'text-xl md:text-2xl' : 'text-lg'
              }`}
            >
              {title}
            </h3>

            {/* Excerpt */}
            <p className={`text-gray-600 line-clamp-3 ${featured ? 'text-base' : 'text-sm'}`}>
              {excerpt}
            </p>

            {/* Read More */}
            <div className="mt-4">
              <span className="text-purple-600 font-medium text-sm group-hover:text-purple-700 transition-colors">
                {locale === 'es' ? 'Leer más →' : 'Read more →'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
