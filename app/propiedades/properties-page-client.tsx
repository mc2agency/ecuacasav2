'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/hooks/use-translation';
import { Property, PROPERTY_TYPE_LABELS, LISTING_TYPE_LABELS } from '@/lib/properties/types';
import { getLocalizedField } from '@/lib/i18n/helpers';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Mail, MessageCircle, MapPin, Maximize2, CheckCircle, BedDouble, Bath } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';

interface PropertiesPageClientProps {
  properties: Property[];
}

export function PropertiesPageClient({ properties }: PropertiesPageClientProps) {
  const { locale } = useTranslation();

  if (properties.length === 0) {
    return <EmptyState locale={locale} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {locale === 'es' ? 'Propiedades en Cuenca' : 'Properties in Cuenca'}
            </h1>
            <p className="text-gray-600 mt-2 max-w-xl mx-auto">
              {locale === 'es'
                ? 'Casas, departamentos y terrenos verificados en venta y arriendo'
                : 'Verified houses, apartments, and land for sale and rent'}
            </p>
          </div>
        </div>
      </div>

      {/* Property Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyListCard key={property.id} property={property} locale={locale} />
          ))}
        </div>

        {/* CTA to list property */}
        <div className="mt-12 text-center p-8 bg-white rounded-2xl border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {locale === 'es' ? '¿Tienes una propiedad en Cuenca?' : 'Have a property in Cuenca?'}
          </h2>
          <p className="text-gray-600 mb-4">
            {locale === 'es'
              ? 'Listamos tu propiedad gratis con verificación completa'
              : 'We list your property for free with full verification'}
          </p>
          <a
            href="https://wa.me/593939451457?text=Hola%2C%20tengo%20una%20propiedad%20para%20listar%20en%20EcuaCasa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold rounded-xl transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            {locale === 'es' ? 'Contáctanos por WhatsApp' : 'Contact us on WhatsApp'}
          </a>
        </div>
      </div>
    </div>
  );
}

function PropertyListCard({ property, locale }: { property: Property; locale: Locale }) {
  const title = getLocalizedField(property, 'title', locale);
  const typeLabel = locale === 'en'
    ? PROPERTY_TYPE_LABELS[property.type].en
    : PROPERTY_TYPE_LABELS[property.type].es;
  const listingLabel = property.listingType
    ? (locale === 'en' ? LISTING_TYPE_LABELS[property.listingType].en : LISTING_TYPE_LABELS[property.listingType].es)
    : null;
  const primaryPhoto = property.photos[0];
  const isRental = property.listingType === 'arriendo';

  return (
    <Link href={`/propiedades/${property.slug}`}>
      <Card className="group overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-xl border-gray-200 hover:border-purple-200 h-full">
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
            {primaryPhoto ? (
              <Image
                src={primaryPhoto}
                alt={title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Home className="w-16 h-16 text-purple-200" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {listingLabel && (
                <Badge className={`text-xs font-semibold shadow ${isRental ? 'bg-blue-600 text-white border-0' : 'bg-green-600 text-white border-0'}`}>
                  {listingLabel}
                </Badge>
              )}
              {property.verified && (
                <Badge className="text-xs bg-green-600 text-white border-0 shadow">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              )}
            </div>

            {/* Photo count */}
            {property.photos.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {property.photos.length} fotos
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Price */}
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-gray-900">
                ${property.price.toLocaleString()}
                {isRental && <span className="text-sm font-normal text-gray-500">/mes</span>}
              </span>
              <Badge variant="outline" className="text-xs">{typeLabel}</Badge>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-3">
              {title}
            </h3>

            {/* Details */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                {property.sector}
              </span>
              <span className="flex items-center gap-1">
                <Maximize2 className="w-4 h-4 text-gray-400" />
                {property.size} m²
              </span>
              {(property.bedrooms ?? 0) > 0 && (
                <span className="flex items-center gap-1">
                  <BedDouble className="w-4 h-4 text-gray-400" />
                  {property.bedrooms}
                </span>
              )}
              {(property.bathrooms ?? 0) > 0 && (
                <span className="flex items-center gap-1">
                  <Bath className="w-4 h-4 text-gray-400" />
                  {property.bathrooms}
                </span>
              )}
            </div>

            {/* Agent */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                {property.agent.name.charAt(0)}
              </div>
              <span className="text-sm text-gray-600">{property.agent.name}</span>
              {property.agent.verified && (
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyState({ locale }: { locale: string }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1800px] mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'es' ? 'Propiedades en Cuenca' : 'Properties in Cuenca'}
            </h1>
            <p className="text-gray-600 mt-1">
              {locale === 'es'
                ? 'Bienes raíces verificados en Cuenca, Ecuador'
                : 'Verified real estate in Cuenca, Ecuador'}
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="text-center">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Home className="w-12 h-12 text-purple-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {locale === 'es' ? 'Próximamente' : 'Coming Soon'}
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            {locale === 'es'
              ? 'Estamos verificando las primeras propiedades en Cuenca. ¿Tienes una propiedad?'
              : "We're verifying the first properties in Cuenca. Have a property?"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/593939451457?text=Hola%2C%20tengo%20una%20propiedad%20para%20listar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold rounded-xl transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              {locale === 'es' ? 'Contáctanos por WhatsApp' : 'Contact us on WhatsApp'}
            </a>
            <a
              href="mailto:info@ecuacasa.com?subject=Tengo%20una%20propiedad%20para%20listar"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-5 h-5" />
              info@ecuacasa.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
