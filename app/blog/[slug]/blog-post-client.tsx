'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/hooks/use-translation';
import { BlogCard } from '@/components/blog/blog-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlogPost, BLOG_CATEGORY_LABELS } from '@/lib/blog/types';
import { getRelatedPosts } from '@/lib/blog/content';
import {
  Calendar,
  Clock,
  ChevronLeft,
  Share2,
  Link as LinkIcon,
  CheckCircle,
} from 'lucide-react';

// WhatsApp icon
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// Facebook icon
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

interface BlogPostClientProps {
  post: BlogPost;
}

// Parse headings from markdown content
function parseHeadings(content: string): { id: string; text: string; level: number }[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2];
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    headings.push({ id, text, level });
  }

  return headings;
}

// Simple markdown renderer
function renderMarkdown(content: string): string {
  let html = content
    // Headers with IDs
    .replace(/^### (.+)$/gm, (_, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      return `<h3 id="${id}" class="text-xl font-bold text-gray-900 mt-8 mb-4">${text}</h3>`;
    })
    .replace(/^## (.+)$/gm, (_, text) => {
      const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      return `<h2 id="${id}" class="text-2xl font-bold text-gray-900 mt-10 mb-4">${text}</h2>`;
    })
    // Blockquotes (callout style)
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-green-500 bg-green-50 pl-4 py-3 my-6 italic text-gray-700">$1</blockquote>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-purple-600 hover:text-purple-700 underline">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-6 list-disc text-gray-700">$1</li>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="my-8 border-gray-200" />')
    // Tables (simple)
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.some(c => c.includes('---'))) {
        return ''; // Skip separator row
      }
      const isHeader = !match.includes('✓') && !match.includes('$');
      const tag = isHeader ? 'th' : 'td';
      const cellClass = isHeader
        ? 'px-4 py-2 text-left font-semibold bg-gray-50 border border-gray-200'
        : 'px-4 py-2 border border-gray-200';
      const row = cells.map(c => `<${tag} class="${cellClass}">${c.trim()}</${tag}>`).join('');
      return `<tr>${row}</tr>`;
    })
    // Paragraphs (lines that don't start with special chars)
    .replace(/^(?!<[a-z]|$)(.+)$/gm, '<p class="text-gray-700 leading-relaxed mb-4">$1</p>')
    // Screenshot placeholders
    .replace(/\[SCREENSHOT:([^\]]+)\]/g, '<div class="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 my-6 text-center text-gray-500"><span class="text-sm">📷 $1</span></div>');

  // Wrap lists
  html = html.replace(/(<li[^>]*>.*?<\/li>\n?)+/g, '<ul class="my-4 space-y-2">$&</ul>');

  // Wrap tables
  html = html.replace(/(<tr>.*?<\/tr>\n?)+/g, '<table class="w-full my-6 border-collapse">$&</table>');

  return html;
}

export function BlogPostClient({ post }: BlogPostClientProps) {
  const { locale } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [activeHeading, setActiveHeading] = useState('');

  const title = post.title[locale as 'en' | 'es'];
  const content = post.content[locale as 'en' | 'es'];
  const categoryLabel = BLOG_CATEGORY_LABELS[post.category][locale as 'en' | 'es'];
  const authorRole = post.author.role[locale as 'en' | 'es'];

  const headings = useMemo(() => parseHeadings(content), [content]);
  const renderedContent = useMemo(() => renderMarkdown(content), [content]);
  const relatedPosts = useMemo(() => getRelatedPosts(post, 3), [post]);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString(
    locale === 'es' ? 'es-EC' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  // Track active heading on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `${title} - EcuaCasa`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
      '_blank'
    );
  };

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank'
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative h-64 md:h-96 bg-gray-900">
        <Image
          src={post.featuredImage}
          alt={title}
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />

        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Link href="/blog">
            <Button variant="outline" size="sm" className="bg-white/90 hover:bg-white">
              <ChevronLeft className="w-4 h-4 mr-1" />
              {locale === 'es' ? 'Volver al Blog' : 'Back to Blog'}
            </Button>
          </Link>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <article className="flex-1 max-w-3xl">
            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-xl p-6 md:p-10 mb-8">
              <Badge className="bg-purple-600 hover:bg-purple-700 text-white mb-4">
                {categoryLabel}
              </Badge>

              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                {title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
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

              {/* Share Buttons */}
              <div className="flex items-center gap-2 mb-8">
                <span className="text-sm text-gray-500 mr-2">
                  {locale === 'es' ? 'Compartir:' : 'Share:'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWhatsAppShare}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <WhatsAppIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFacebookShare}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <FacebookIcon className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className={copied ? 'text-green-600 border-green-200' : ''}
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <LinkIcon className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Article Body */}
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: renderedContent }}
              />
            </div>

            {/* Author Card */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  EC
                </div>
                <div>
                  <p className="font-bold text-gray-900">{post.author.name}</p>
                  <p className="text-gray-600">{authorRole}</p>
                </div>
              </div>
            </div>

            {/* CTA Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">
                {locale === 'es'
                  ? '¿Buscas terreno en Cuenca?'
                  : 'Looking for land in Cuenca?'}
              </h3>
              <p className="text-purple-100 mb-4">
                {locale === 'es'
                  ? 'Explora propiedades verificadas con documentos confirmados'
                  : 'Explore verified properties with confirmed documents'}
              </p>
              <Button asChild variant="secondary" size="lg">
                <Link href="/propiedades">
                  {locale === 'es' ? 'Ver Propiedades' : 'View Properties'}
                </Link>
              </Button>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {locale === 'es' ? 'Artículos Relacionados' : 'Related Articles'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedPosts.slice(0, 2).map((relatedPost) => (
                    <BlogCard key={relatedPost.slug} post={relatedPost} />
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar - Table of Contents */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-4">
                  {locale === 'es' ? 'En este artículo' : 'In this article'}
                </h4>
                <nav className="space-y-2">
                  {headings.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className={`block text-sm transition-colors ${
                        heading.level === 3 ? 'pl-4' : ''
                      } ${
                        activeHeading === heading.id
                          ? 'text-purple-600 font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
