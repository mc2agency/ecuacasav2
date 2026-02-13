import { Metadata } from 'next';
import { propertiesRepository } from '@/lib/repositories';
import { PropertiesPageClient } from './properties-page-client';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Propiedades en Cuenca Ecuador | Casas, Departamentos, Terrenos en Venta y Arriendo',
  description: 'Encuentra casas, departamentos y terrenos verificados en venta y arriendo en Cuenca, Ecuador. Precios reales, documentos verificados, sin intermediarios ocultos.',
  keywords: 'terrenos Cuenca, casas Cuenca, departamentos Cuenca, bienes raíces Ecuador, propiedades verificadas, inversión inmobiliaria, arriendo Cuenca',
  openGraph: {
    title: 'Propiedades en Cuenca Ecuador | Casas, Departamentos, Terrenos en Venta y Arriendo',
    description: 'Encuentra casas, departamentos y terrenos verificados en venta y arriendo en Cuenca, Ecuador. Precios reales, documentos verificados, sin intermediarios ocultos.',
    url: 'https://ecuacasa.com/propiedades',
  },
  alternates: {
    canonical: '/propiedades',
  },
};

export default async function PropertiesPage() {
  const properties = await propertiesRepository.getAll();
  return <PropertiesPageClient properties={properties} />;
}
