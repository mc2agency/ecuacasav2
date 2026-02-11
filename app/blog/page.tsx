import { Metadata } from 'next';
import { BlogPageClient } from './blog-page-client';

export const metadata: Metadata = {
  title: 'Blog - Guía de Bienes Raíces en Cuenca | EcuaCasa',
  description:
    'Research-backed guides for buying property in Cuenca, Ecuador. Learn about documents, sectors, prices, and the investor visa from real experience.',
  openGraph: {
    title: 'Blog - Guía de Bienes Raíces en Cuenca | EcuaCasa',
    description:
      'Research-backed guides for buying property in Cuenca, Ecuador. Learn about documents, sectors, prices, and the investor visa from real experience.',
    type: 'website',
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
