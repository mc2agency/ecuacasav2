import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ProviderJsonLd } from '@/components/seo/json-ld';

// ISR: revalidate every hour
export const revalidate = 3600;
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RatingStars } from '@/components/shared/rating-stars';
import { WhatsAppButton } from '@/components/shared/whatsapp-button';
import { providersRepository } from '@/lib/repositories';
import { getProviderPlaceholder, getBlurDataURL } from '@/lib/utils/placeholders';
import { CheckCircle, Clock, DollarSign, ArrowLeft, MapPin, Briefcase } from 'lucide-react';
import { ProviderReviews } from '@/components/providers/provider-reviews';

interface ProviderPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProviderPageProps) {
  const { slug } = await params;
  const provider = await providersRepository.getBySlug(slug);

  if (!provider) {
    return { title: 'Profesional no encontrado | EcuaCasa' };
  }

  return {
    title: `${provider.name} | EcuaCasa`,
    description: provider.description_es || `Contacta a ${provider.name} en Cuenca, Ecuador`,
  };
}

export default async function ProviderPage({ params }: ProviderPageProps) {
  const { slug } = await params;
  const provider = await providersRepository.getBySlug(slug);

  if (!provider) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <ProviderJsonLd
        name={provider.name}
        description={provider.description_es || provider.description_en || ''}
        slug={slug}
        rating={provider.rating}
        reviewCount={provider.review_count}
        services={provider.services?.map((s: any) => s.name_en || s.name_es) || []}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Back Link */}
        <Link
          href="/providers"
          className="inline-flex items-center text-gray-600 hover:text-accent-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Todos los profesionales
        </Link>

        {/* Provider Card */}
        <Card className="overflow-hidden border-2 border-gray-100 shadow-xl">
          <CardContent className="p-0">
            {/* Header Section */}
            <div className="relative bg-gradient-to-br from-primary-500 to-primary-700 p-8 text-white">
              {/* Badges */}
              <div className="absolute top-4 right-4 flex gap-2">
                {provider.verified && (
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Verificado
                  </div>
                )}
                {provider.featured && (
                  <div className="bg-accent-500 px-3 py-1.5 rounded-full text-sm font-medium">
                    Destacado
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Photo */}
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white/30 flex-shrink-0">
                  <Image
                    src={getProviderPlaceholder(provider.name)}
                    alt={provider.name}
                    fill
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL={getBlurDataURL()}
                    priority
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                    {provider.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4">
                    <RatingStars rating={provider.rating} size="md" showValue className="text-white" />
                    <span className="text-white/80">({provider.review_count} reseñas)</span>
                  </div>
                  {provider.speaks_english && (
                    <Badge className="mt-3 bg-white/20 text-white border-0">
                      Habla Inglés
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                {provider.response_time && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <Clock className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-500">Tiempo de respuesta</div>
                    <div className="font-semibold text-gray-900">{provider.response_time}</div>
                  </div>
                )}
                {provider.price_range && (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <DollarSign className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-500">Rango de precios</div>
                    <div className="font-semibold text-gray-900">{provider.price_range}</div>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
                  <Briefcase className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <div className="text-sm text-gray-500">Servicios</div>
                  <div className="font-semibold text-gray-900">{provider.services?.length || 0}</div>
                </div>
              </div>

              {/* About */}
              {(provider.description_es || provider.description_en) && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Acerca de</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {provider.description_es || provider.description_en}
                  </p>
                </div>
              )}

              {/* Services */}
              {provider.services && provider.services.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Servicios que ofrece</h2>
                  <div className="flex flex-wrap gap-2">
                    {provider.services.map((service: any) => (
                      <Link
                        key={service.slug}
                        href={`/services/${service.slug}`}
                        className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-100 transition-colors"
                      >
                        {service.name_es || service.name_en}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-accent-50 to-accent-100 rounded-2xl p-6 mt-8">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    ¿Interesado en este profesional?
                  </h3>
                  <p className="text-gray-600">
                    Contáctalo directamente por WhatsApp para discutir tu proyecto
                  </p>
                </div>
                <WhatsAppButton
                  providerName={provider.name}
                  phoneNumber={provider.phone}
                  providerId={provider.id}
                  serviceName={provider.services?.[0]?.name_en}
                  size="lg"
                  className="w-full max-w-md mx-auto"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <div className="mt-8">
          <ProviderReviews providerId={provider.id} />
        </div>

        {/* Cross-links */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/solicitar"
            className="p-6 bg-purple-50 rounded-2xl text-center hover:bg-purple-100 transition-colors group"
          >
            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-purple-700">
              ¿Necesitas este servicio? Solicítalo
            </h3>
            <p className="text-sm text-gray-600">Solicita cualquier servicio para el hogar</p>
          </Link>
          <Link
            href="/recomendar"
            className="p-6 bg-pink-50 rounded-2xl text-center hover:bg-pink-100 transition-colors group"
          >
            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-pink-700">
              ¿Conoces otro profesional? Recomiéndalo
            </h3>
            <p className="text-sm text-gray-600">Ayuda a la comunidad recomendando profesionales</p>
          </Link>
        </div>

        {/* Back to Providers */}
        <div className="text-center mt-8">
          <Link
            href="/providers"
            className="text-gray-600 hover:text-accent-600 transition-colors"
          >
            ← Ver más profesionales
          </Link>
        </div>
      </div>
    </div>
  );
}
