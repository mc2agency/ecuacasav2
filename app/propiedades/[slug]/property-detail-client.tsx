'use client';

import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Property, PROPERTY_TYPE_LABELS } from '@/lib/properties/types';
import { useTranslation } from '@/hooks/use-translation';
import { getLocalizedField } from '@/lib/i18n/helpers';
import { PropertyAgentCard } from '@/components/properties/property-agent-card';
import { PropertyDocuments } from '@/components/properties/property-documents';
import { PropertyGuarantee } from '@/components/properties/property-guarantee';
import { PropertyUtilities } from '@/components/properties/property-utilities';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  MapPin,
  Maximize2,
  DollarSign,
  CheckCircle,
  Home,
  Share2,
  Heart,
  Camera,
} from 'lucide-react';

// Dynamically import the map component
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/propiedades"
          className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back')} a Propiedades
        </Link>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          {/* Image Gallery */}
          <div className="relative h-[400px] lg:h-[500px] bg-gradient-to-br from-purple-100 to-pink-100">
            {/* Placeholder with property icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Home className="w-32 h-32 text-purple-200" />
            </div>

            {/* GPS Verified Badge */}
            {property.gpsVerified && (
              <div className="absolute top-4 left-4 bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">{t('properties.gps_verified')}</span>
              </div>
            )}

            {/* Verified Badge */}
            {property.verified && (
              <div className="absolute top-4 left-4 mt-12 bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{t('properties.verified_badge')}</span>
              </div>
            )}

            {/* Photo Count */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span className="text-sm font-medium">{property.photos.length} fotos</span>
            </div>

            {/* Watermark */}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded text-sm text-white font-medium">
              EcuaCasa Verificado
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-purple-600 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Key Stats Bar */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {title}
                </h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <Badge className="bg-purple-100 text-purple-700 border-0">
                    {typeLabel}
                  </Badge>
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
                  </div>
                  <div className="text-sm text-gray-500">
                    ${property.pricePerM2.toLocaleString()}/m²
                  </div>
                </div>

                {/* Size */}
                <div className="text-right">
                  <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    <Maximize2 className="w-5 h-5 text-gray-400" />
                    {property.size.toLocaleString()} m²
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('properties.size_label')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t('properties.detail.overview')}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Utilities */}
            <PropertyUtilities utilities={property.utilities} />

            {/* Documents */}
            <PropertyDocuments documents={property.documents} />

            {/* Location Map */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('properties.detail.location')}
                </h2>
                <p className="text-gray-600 mt-1">
                  {property.address}
                </p>
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

            {/* EcuaCasa Guarantee */}
            <PropertyGuarantee />
          </div>

          {/* Right Column - Agent & Actions */}
          <div className="space-y-6">
            {/* Agent Card */}
            <PropertyAgentCard
              agent={property.agent}
              propertyTitle={title}
            />

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Detalles Rápidos</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Tipo</span>
                  <span className="font-medium text-gray-900">{typeLabel}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Tamaño</span>
                  <span className="font-medium text-gray-900">{property.size.toLocaleString()} m²</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Precio/m²</span>
                  <span className="font-medium text-gray-900">${property.pricePerM2.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Sector</span>
                  <span className="font-medium text-gray-900">{property.sector}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500">Publicado</span>
                  <span className="font-medium text-gray-900">
                    {new Date(property.createdAt).toLocaleDateString(
                      locale === 'es' ? 'es-EC' : 'en-US',
                      { year: 'numeric', month: 'short', day: 'numeric' }
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Sticky CTA for Mobile */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-gray-900">
                    ${property.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">{property.size.toLocaleString()} m²</div>
                </div>
                <a
                  href={`https://wa.me/${property.agent.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hola ${property.agent.name}, estoy interesado en: ${title}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold rounded-xl transition-colors"
                >
                  {t('properties.contact_agent')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
