import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SolicitarForm } from './solicitar-form';

export const metadata: Metadata = {
  title: 'Solicitar Servicio | EcuaCasa',
  description: 'Solicita un servicio para el hogar en Cuenca. Te conectamos con un profesional verificado en menos de 2 horas.',
  openGraph: {
    title: 'Solicitar Servicio | EcuaCasa',
    description: 'Solicita un servicio para el hogar en Cuenca. Te conectamos con un profesional verificado en menos de 2 horas.',
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
