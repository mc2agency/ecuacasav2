import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SolicitarForm } from './solicitar-form';

export const metadata: Metadata = {
  title: 'Solicitar Servicio para el Hogar en Cuenca',
  description: 'Dinos qué necesitas y te conectamos con un profesional verificado en Cuenca en menos de 2 horas. Sin compromiso.',
  openGraph: {
    title: 'Solicitar Servicio para el Hogar en Cuenca | EcuaCasa',
    description: 'Dinos qué necesitas y te conectamos con un profesional verificado en Cuenca en menos de 2 horas. Sin compromiso.',
  },
};

export default function SolicitarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <SolicitarForm />
    </Suspense>
  );
}
