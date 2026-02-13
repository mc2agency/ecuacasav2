import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Únete a EcuaCasa | Recibe Clientes en Cuenca Ecuador',
  description: 'Recibe solicitudes de clientes expatriados y locales en Cuenca. Únete gratis a la red de profesionales verificados de EcuaCasa.',
  openGraph: {
    title: 'Únete a EcuaCasa | Recibe Clientes en Cuenca Ecuador',
    description: 'Recibe solicitudes de clientes expatriados y locales en Cuenca. Únete gratis a la red de profesionales verificados de EcuaCasa.',
  },
};

export default function ForProvidersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
