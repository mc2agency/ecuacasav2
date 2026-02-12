import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { servicesRepository } from '@/lib/repositories';
import { SERVICE_ICONS, DEFAULT_SERVICE_ICON } from '@/lib/constants';

// ISR: revalidate every hour
export const revalidate = 3600;

export const metadata = {
  title: 'Servicios para el Hogar en Cuenca Ecuador | Limpieza, Electricidad, Plomería',
  description: 'Profesionales verificados para servicios del hogar en Cuenca. Limpieza, electricidad, plomería, carpintería, jardinería, pintura y más. Respuesta en menos de 2 horas.',
  openGraph: {
    title: 'Servicios para el Hogar en Cuenca Ecuador | Limpieza, Electricidad, Plomería',
    description: 'Profesionales verificados para servicios del hogar en Cuenca. Limpieza, electricidad, plomería, carpintería, jardinería, pintura y más. Respuesta en menos de 2 horas.',
    url: 'https://ecuacasa.com/services',
  },
  alternates: {
    canonical: '/services',
  },
};

export default async function ServicesPage() {
  const services = await servicesRepository.getActive();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Servicios para el Hogar
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encuentra profesionales verificados para todas tus necesidades del hogar en Cuenca
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service) => {
            const Icon = SERVICE_ICONS[service.slug] || DEFAULT_SERVICE_ICON;
            return (
              <Link key={service.slug} href={`/services/${service.slug}`}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-gray-100 hover:border-accent-200 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-blue-100 rounded-2xl flex items-center justify-center mb-5 group-hover:from-accent-50 group-hover:to-accent-100 transition-all duration-300 group-hover:scale-110">
                      <Icon className="w-8 h-8 text-primary-600 group-hover:text-accent-600 transition-colors" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-accent-600 transition-colors">
                      {service.name_es}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {service.description_es}
                    </p>
                    <div className="flex items-center text-accent-600 font-semibold group-hover:text-accent-700">
                      <span>Ver profesionales</span>
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
