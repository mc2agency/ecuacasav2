import { Metadata } from 'next';
import { PropertiesPageClient } from './properties-page-client';

export const metadata: Metadata = {
  title: 'Propiedades en Venta | EcuaCasa',
  description: 'Encuentra terrenos, casas y departamentos verificados en Cuenca, Ecuador. Ubicaciones GPS exactas, documentos verificados, agentes de confianza.',
  keywords: 'terrenos Cuenca, casas Cuenca, departamentos Cuenca, bienes raíces Ecuador, propiedades verificadas, inversión inmobiliaria',
};

export default function PropertiesPage() {
  return <PropertiesPageClient />;
}
