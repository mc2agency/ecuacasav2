import type { Metadata } from 'next';
import { RecomendarForm } from './recomendar-form';

export const metadata: Metadata = {
  title: 'Recomendar un Profesional en Cuenca',
  description: '¿Conoces un buen profesional en Cuenca? Recomiéndalo y ayúdanos a crecer nuestra red verificada.',
  openGraph: {
    title: 'Recomendar un Profesional en Cuenca | EcuaCasa',
    description: '¿Conoces un buen profesional en Cuenca? Recomiéndalo y ayúdanos a crecer nuestra red verificada.',
  },
};

export default function RecomendarPage() {
  return <RecomendarForm />;
}
