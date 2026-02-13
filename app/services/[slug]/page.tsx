import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ServiceJsonLd } from '@/components/seo/json-ld';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RatingStars } from '@/components/shared/rating-stars';
import { WhatsAppButton } from '@/components/shared/whatsapp-button';
import { servicesRepository, providersRepository } from '@/lib/repositories';
import { SERVICE_ICONS, DEFAULT_SERVICE_ICON } from '@/lib/constants';
import { getProviderPlaceholder, getBlurDataURL } from '@/lib/utils/placeholders';
import { CheckCircle, Clock, ArrowLeft } from 'lucide-react';

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

// Custom SEO titles/descriptions per service slug
const SERVICE_SEO: Record<string, { title: string; description: string }> = {
  carpinteria: {
    title: 'Carpinteros en Cuenca Ecuador | Carpintería a Domicilio',
    description: 'Encuentra carpinteros verificados en Cuenca. Muebles a medida, puertas, closets, reparaciones. Servicio a domicilio, presupuesto sin compromiso. Respuesta en 2 horas.',
  },
  plomeria: {
    title: 'Plomeros en Cuenca Ecuador | Plomería a Domicilio',
    description: 'Plomeros verificados en Cuenca. Reparaciones, instalaciones, emergencias 24h. Servicio a domicilio, presupuesto sin compromiso. Respuesta en 2 horas.',
  },
  limpieza: {
    title: 'Limpieza de Casas en Cuenca Ecuador | Servicio a Domicilio',
    description: 'Servicio de limpieza de casas y departamentos en Cuenca. Personal verificado, limpieza profunda, mantenimiento. Presupuesto sin compromiso.',
  },
  electricidad: {
    title: 'Electricistas en Cuenca Ecuador | Servicio Eléctrico a Domicilio',
    description: 'Electricistas verificados en Cuenca. Instalaciones, reparaciones, emergencias. Servicio a domicilio profesional. Respuesta en 2 horas.',
  },
  jardineria: {
    title: 'Jardineros en Cuenca Ecuador | Jardinería y Mantenimiento',
    description: 'Jardineros verificados en Cuenca. Mantenimiento de jardines, paisajismo, poda, limpieza. Servicio a domicilio. Presupuesto sin compromiso.',
  },
  pintura: {
    title: 'Pintores en Cuenca Ecuador | Pintura de Casas y Fachadas',
    description: 'Pintores verificados en Cuenca. Pintura interior, exterior, fachadas. Servicio profesional a domicilio. Presupuesto sin compromiso.',
  },
  handyman: {
    title: 'Handyman Services in Cuenca Ecuador | Verified Professionals',
    description: 'Verified handyman services in Cuenca. Home repairs, maintenance, installations. Response in under 2 hours. No commitment.',
  },
};

export async function generateMetadata({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = await servicesRepository.getBySlug(slug);

  if (!service) {
    return { title: 'Servicio no encontrado | EcuaCasa' };
  }

  const customSeo = SERVICE_SEO[slug];

  return {
    title: customSeo?.title || `${service.name_es} en Cuenca | EcuaCasa`,
    description: customSeo?.description || service.description_es,
    openGraph: {
      title: (customSeo?.title || `${service.name_es} en Cuenca`) + ' | EcuaCasa',
      description: customSeo?.description || service.description_es,
    },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const [service, providers] = await Promise.all([
    servicesRepository.getBySlug(slug),
    providersRepository.getByService(slug),
  ]);

  if (!service) {
    notFound();
  }

  const Icon = SERVICE_ICONS[service.slug] || DEFAULT_SERVICE_ICON;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <ServiceJsonLd
        name={service.name_es}
        description={service.description_es}
        slug={service.slug}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Back Link */}
        <Link
          href="/services"
          className="inline-flex items-center text-gray-600 hover:text-accent-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Todos los servicios
        </Link>

        {/* Request Service Banner */}
        <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              ¿Necesitas {service.name_es}?
            </h2>
            <p className="text-gray-600 text-sm">
              Solicita y te conectamos con un profesional verificado en 2 horas
            </p>
          </div>
          <Link
            href={`/solicitar?service=${service.slug}`}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all whitespace-nowrap"
          >
            Solicitar Servicio
          </Link>
        </div>

        {/* Service Header */}
        <div className="flex items-start gap-6 mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-10 h-10 text-primary-600" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
              {service.name_es}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              {service.description_es}
            </p>
          </div>
        </div>

        {/* Providers Count */}
        <div className="mb-8">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{providers.length}</span> profesionales disponibles
          </p>
        </div>

        {/* Providers Grid */}
        {providers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <Card key={provider.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-accent-200">
                <CardContent className="p-0">
                  {/* Provider Photo */}
                  <Link href={`/providers/${provider.slug}`}>
                    <div className="relative h-48 w-full bg-gradient-to-br from-primary-50 to-blue-100 overflow-hidden">
                      <Image
                        src={getProviderPlaceholder(provider.name)}
                        alt={provider.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        placeholder="blur"
                        blurDataURL={getBlurDataURL()}
                      />
                      {/* Verified Badge Overlay */}
                      {provider.verified && (
                        <div className="absolute top-3 right-3 bg-success text-white px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-medium shadow-lg">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verificado
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-5">
                    <Link href={`/providers/${provider.slug}`}>
                      <h3 className="text-xl font-bold text-gray-900 hover:text-accent-600 transition-colors mb-2">
                        {provider.name}
                      </h3>
                    </Link>

                    {/* Key Stats */}
                    <div className="space-y-2 mb-4">
                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <RatingStars rating={provider.rating} size="sm" showValue />
                        <span className="text-sm text-gray-500">({provider.review_count})</span>
                      </div>

                      {/* Response Time & Price */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{provider.response_time}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{provider.price_range}</span>
                      </div>

                      {/* Speaks English Badge */}
                      {provider.speaks_english && (
                        <Badge variant="outline" className="text-xs border-accent-300 text-accent-700 bg-accent-50">
                          Habla Inglés
                        </Badge>
                      )}
                    </div>

                    {/* WhatsApp Button */}
                    <WhatsAppButton
                      providerName={provider.name}
                      phoneNumber={provider.phone}
                      providerId={provider.id}
                      serviceName={service.name_en}
                      size="sm"
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay profesionales disponibles
            </h3>
            <p className="text-gray-600 mb-6">
              Aún no tenemos profesionales registrados para este servicio.
            </p>
            <Link
              href={`/solicitar?service=${service.slug}`}
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-colors"
            >
              Solicitar este servicio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
