'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Property, PROPERTY_TYPE_LABELS, LISTING_TYPE_LABELS, AGENT_ROLE_LABELS } from '@/lib/properties/types';
import { useTranslation } from '@/hooks/use-translation';
import { getLocalizedField } from '@/lib/i18n/helpers';
import { PropertyDocuments } from '@/components/properties/property-documents';
import { PropertyGuarantee } from '@/components/properties/property-guarantee';
import { PropertyUtilities } from '@/components/properties/property-utilities';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  MapPin,
  Maximize2,
  CheckCircle,
  Home,
  Share2,
  Camera,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  BedDouble,
  Bath,
  Clock,
  Star,
} from 'lucide-react';

const PropertyMap = dynamic(
  () => import('@/components/properties/property-map').then((mod) => mod.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center rounded-xl">
        <span className="text-gray-500">Loading map...</span>
      </div>
    ),
  }
);

interface PropertyDetailClientProps {
  property: Property;
}

export function PropertyDetailClient({ property }: PropertyDetailClientProps) {
  const { locale, t } = useTranslation();
  const [activeImage, setActiveImage] = useState(0);

  const title = getLocalizedField(property, 'title', locale);
  const description = getLocalizedField(property, 'description', locale);
  const typeLabel = locale === 'en'
    ? PROPERTY_TYPE_LABELS[property.type].en
    : PROPERTY_TYPE_LABELS[property.type].es;
  const listingLabel = property.listingType
    ? (locale === 'en' ? LISTING_TYPE_LABELS[property.listingType].en : LISTING_TYPE_LABELS[property.listingType].es)
    : null;
  const isRental = property.listingType === 'arriendo';

  // WhatsApp link with custom pre-filled message
  const whatsappMessage = encodeURIComponent(
    `Hola, vi el departamento en ${property.address} en EcuaCasa. ¿Está disponible?`
  );
  const whatsappUrl = `https://wa.me/${property.agent.phone.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;

  const hasPhotos = property.photos.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/propiedades"
          className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {locale === 'en' ? 'Back to Properties' : 'Volver a Propiedades'}
        </Link>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          {/* Image Gallery */}
          <div className="relative h-[400px] lg:h-[500px] bg-gradient-to-br from-purple-100 to-pink-100">
            {hasPhotos ? (
              <>
                <Image
                  src={property.photos[activeImage]}
                  alt={`${title} - foto ${activeImage + 1}`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1280px) 100vw, 1280px"
                />
                {/* Navigation arrows */}
                {property.photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((prev) => (prev === 0 ? property.photos.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImage((prev) => (prev === property.photos.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Home className="w-32 h-32 text-purple-200" />
              </div>
            )}

            {/* Listing type badge */}
            {listingLabel && (
              <div className={`absolute top-4 left-4 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg text-white font-medium ${isRental ? 'bg-blue-600' : 'bg-green-600'}`}>
                {listingLabel}
              </div>
            )}

            {/* Verified Badge */}
            {property.verified && (
              <div className={`absolute ${listingLabel ? 'top-16' : 'top-4'} left-4 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg`}>
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{t('properties.verified_badge')}</span>
              </div>
            )}

            {/* Photo Count */}
            {hasPhotos && (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span className="text-sm font-medium">{activeImage + 1} / {property.photos.length}</span>
              </div>
            )}

            {/* Share */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => navigator.share?.({ title, url: window.location.href }).catch(() => {})}
                className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Photo thumbnails */}
          {property.photos.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto bg-gray-50 border-t border-gray-100">
              {property.photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    i === activeImage ? 'border-purple-500 ring-2 ring-purple-200' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={photo} alt={`Thumbnail ${i + 1}`} fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}

          {/* Key Stats Bar */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {title}
                </h1>
                <div className="flex items-center gap-3 text-gray-600">
                  <Badge className="bg-purple-100 text-purple-700 border-0">{typeLabel}</Badge>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {property.sector}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-8">
                {/* Price */}
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    ${property.price.toLocaleString()}
                    {isRental && <span className="text-lg font-normal text-gray-500">/mes</span>}
                  </div>
                </div>

                {/* Size + Beds/Baths */}
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Maximize2 className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold">{property.size.toLocaleString()} m²</span>
                  </div>
                  {(property.bedrooms ?? 0) > 0 && (
                    <div className="flex items-center gap-1.5">
                      <BedDouble className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold">{property.bedrooms}</span>
                    </div>
                  )}
                  {(property.bathrooms ?? 0) > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Bath className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold">{property.bathrooms}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t('properties.detail.overview')}
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>

            {/* Utilities */}
            <PropertyUtilities utilities={property.utilities} />

            {/* Documents */}
            <PropertyDocuments documents={property.documents} />

            {/* Location Map */}
            {property.coordinates.lat !== 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">
                    {t('properties.detail.location')}
                  </h2>
                  <p className="text-gray-600 mt-1">{property.address}</p>
                </div>
                <div className="h-[300px]">
                  <PropertyMap
                    properties={[property]}
                    selectedProperty={property}
                    onPropertySelect={() => {}}
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            <PropertyGuarantee />
          </div>

          {/* Right Column - Agent & WhatsApp */}
          <div className="space-y-6">
            {/* Agent Card with WhatsApp */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border-2 border-white/30">
                    {property.agent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      {property.agent.name}
                      {property.agent.verified && (
                        <CheckCircle className="w-5 h-5 text-green-300" />
                      )}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {property.agent.role
                        ? (locale === 'en' ? AGENT_ROLE_LABELS[property.agent.role].en : AGENT_ROLE_LABELS[property.agent.role].es)
                        : t('properties.detail.agent')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <Clock className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                    <div className="text-sm text-gray-500">{t('properties.detail.response_time')}</div>
                    <div className="font-bold text-gray-900 text-sm">{property.agent.responseTime}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                    <div className="text-sm text-gray-500">{t('properties.detail.rating')}</div>
                    <div className="font-bold text-gray-900">
                      {property.agent.rating > 0 ? property.agent.rating.toFixed(1) : (locale === 'en' ? 'New' : 'Nuevo')}
                    </div>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <MessageCircle className="w-5 h-5" />
                  {locale === 'en' ? 'Contact via WhatsApp' : 'Contactar por WhatsApp'}
                </a>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                {locale === 'en' ? 'Quick Details' : 'Detalles Rápidos'}
              </h3>
              <div className="space-y-3">
                <QuickStat label={locale === 'en' ? 'Type' : 'Tipo'} value={typeLabel} />
                {listingLabel && <QuickStat label={locale === 'en' ? 'Listing' : 'Listado'} value={listingLabel} />}
                <QuickStat label={locale === 'en' ? 'Size' : 'Tamaño'} value={`${property.size.toLocaleString()} m²`} />
                {(property.bedrooms ?? 0) > 0 && (
                  <QuickStat label={locale === 'en' ? 'Bedrooms' : 'Habitaciones'} value={String(property.bedrooms)} />
                )}
                {(property.bathrooms ?? 0) > 0 && (
                  <QuickStat label={locale === 'en' ? 'Bathrooms' : 'Baños'} value={String(property.bathrooms)} />
                )}
                <QuickStat label="Sector" value={property.sector} />
                <QuickStat
                  label={locale === 'en' ? 'Published' : 'Publicado'}
                  value={new Date(property.createdAt).toLocaleDateString(
                    locale === 'es' ? 'es-EC' : 'en-US',
                    { year: 'numeric', month: 'short', day: 'numeric' }
                  )}
                  noBorder
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky CTA for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-gray-900">
              ${property.price.toLocaleString()}
              {isRental && <span className="text-sm font-normal text-gray-500">/mes</span>}
            </div>
            <div className="text-sm text-gray-500">{property.size.toLocaleString()} m² · {property.sector}</div>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold rounded-xl transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function QuickStat({ label, value, noBorder }: { label: string; value: string; noBorder?: boolean }) {
  return (
    <div className={`flex justify-between items-center py-2 ${noBorder ? '' : 'border-b border-gray-100'}`}>
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
