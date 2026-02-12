import { Metadata } from 'next';
import { BlogPageClient } from './blog-page-client';

export const metadata: Metadata = {
  title: 'Guía de Bienes Raíces en Cuenca Ecuador | Blog EcuaCasa',
  description:
    'Guías prácticas para comprar, vender y alquilar propiedades en Cuenca, Ecuador. Precios por sector, documentos legales, visa de inversionista y más.',
  openGraph: {
    title: 'Guía de Bienes Raíces en Cuenca Ecuador | Blog EcuaCasa',
    description:
      'Guías prácticas para comprar, vender y alquilar propiedades en Cuenca, Ecuador. Precios por sector, documentos legales, visa de inversionista y más.',
    type: 'website',
    url: 'https://ecuacasa.com/blog',
  },
  alternates: {
    canonical: '/blog',
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
