import type { Metadata } from 'next';
import { RecomendarForm } from './recomendar-form';

export const metadata: Metadata = {
  title: 'Recomendar Profesional | EcuaCasa',
  description: '¿Conoces un buen profesional? Recomiéndalo y ayúdanos a crecer nuestra red de servicios verificados en Cuenca.',
  openGraph: {
    title: 'Recomendar Profesional | EcuaCasa',
    description: '¿Conoces un buen profesional? Recomiéndalo y ayúdanos a crecer nuestra red de servicios verificados en Cuenca.',
  },
};

export default function RecomendarPage() {
  return <RecomendarForm />;
}
