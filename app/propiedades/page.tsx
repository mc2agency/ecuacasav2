import { Metadata } from 'next';
import { PropertiesPageClient } from './properties-page-client';

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

export default function PropertiesPage() {
  return <PropertiesPageClient />;
}
