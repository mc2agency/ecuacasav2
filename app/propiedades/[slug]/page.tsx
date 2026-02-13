import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { propertiesRepository } from '@/lib/repositories';
import { PropertyDetailClient } from './property-detail-client';

export const revalidate = 3600;

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await propertiesRepository.getBySlug(slug);

  if (!property) {
    return { title: 'Propiedad no encontrada | EcuaCasa' };
  }

  return {
    title: `${property.title_es} | EcuaCasa`,
    description: property.description_es.substring(0, 160),
    openGraph: {
      title: `${property.title_es} | EcuaCasa`,
      description: property.description_es.substring(0, 160),
      type: 'website',
      images: property.photos[0] ? [{ url: property.photos[0] }] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const slugs = await propertiesRepository.getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = await propertiesRepository.getBySlug(slug);

  if (!property) {
    notFound();
  }

  return <PropertyDetailClient property={property} />;
}
