import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPropertyBySlug, MOCK_PROPERTIES } from '@/lib/properties/mock-data';
import { PropertyDetailClient } from './property-detail-client';

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

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
    },
  };
}

// Generate static paths for all properties
export async function generateStaticParams() {
  return MOCK_PROPERTIES.map((property) => ({
    slug: property.slug,
  }));
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return <PropertyDetailClient property={property} />;
}
