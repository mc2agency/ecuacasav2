'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Property, PROPERTY_TYPE_LABELS } from '@/lib/properties/types';
import { useTranslation } from '@/hooks/use-translation';
import { getLocalizedField } from '@/lib/i18n/helpers';
import 'leaflet/dist/leaflet.css';

// Cuenca, Ecuador center coordinates
const CUENCA_CENTER: [number, number] = [-2.9001, -79.0059];
const DEFAULT_ZOOM = 12;

// Generate property image URL
function getPropertyImage(property: Property): string {
  const seed = parseInt(property.id) || 1;
  const category = property.type === 'terreno' ? 'nature' : 'house';
  const imageId = (seed * 17 + 100) % 1000;
  return `https://picsum.photos/seed/${category}${imageId}/200/150`;
}

// Custom price marker icon
function createPriceIcon(price: number, isSelected: boolean = false) {
  const priceText = price >= 1000 ? `$${Math.round(price / 1000)}K` : `$${price}`;

  return L.divIcon({
    className: 'custom-price-marker',
    html: `
      <div class="${isSelected
        ? 'bg-green-600 text-white border-green-700'
        : 'bg-white text-gray-900 border-gray-300'
      } px-2 py-1 rounded-lg shadow-lg border-2 font-bold text-sm whitespace-nowrap transition-all hover:scale-110 hover:bg-purple-600 hover:text-white hover:border-purple-700">
        ${priceText}
      </div>
    `,
    iconSize: [60, 30],
    iconAnchor: [30, 30],
  });
}

// Custom cluster icon
function createClusterCustomIcon(cluster: any) {
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<div class="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white">${count}</div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(40, 40, true),
  });
}

// Component to handle map view updates
function MapController({ selectedProperty }: { selectedProperty: Property | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedProperty) {
      map.flyTo(
        [selectedProperty.coordinates.lat, selectedProperty.coordinates.lng],
        14,
        { duration: 0.5 }
      );
    }
  }, [selectedProperty, map]);

  return null;
}

interface PropertyMapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onPropertySelect: (property: Property | null) => void;
  onPropertyClick?: (property: Property) => void;
  className?: string;
}

export function PropertyMap({
  properties,
  selectedProperty,
  onPropertySelect,
  onPropertyClick,
  className = '',
}: PropertyMapProps) {
  const { locale } = useTranslation();
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Fix Leaflet default icon issue in Next.js
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
    setMapReady(true);
  }, []);

  const handlePopupClick = (property: Property) => {
    if (onPropertyClick) {
      onPropertyClick(property);
    } else {
      // Navigate to listing page
      window.location.href = `/propiedades/${property.slug}`;
    }
  };

  if (!mapReady) {
    return (
      <div className={`bg-gray-100 animate-pulse flex items-center justify-center ${className}`}>
        <span className="text-gray-500">Cargando mapa...</span>
      </div>
    );
  }

  return (
    <MapContainer
      center={CUENCA_CENTER}
      zoom={DEFAULT_ZOOM}
      className={`w-full h-full ${className}`}
      ref={mapRef}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController selectedProperty={selectedProperty} />

      <MarkerClusterGroup
        chunkedLoading
        iconCreateFunction={createClusterCustomIcon}
        maxClusterRadius={60}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
      >
        {properties.map((property) => {
          const title = getLocalizedField(property, 'title', locale);
          const typeLabel = locale === 'en'
            ? PROPERTY_TYPE_LABELS[property.type].en
            : PROPERTY_TYPE_LABELS[property.type].es;
          const imageUrl = getPropertyImage(property);

          return (
            <Marker
              key={property.id}
              position={[property.coordinates.lat, property.coordinates.lng]}
              icon={createPriceIcon(property.price, selectedProperty?.id === property.id)}
              eventHandlers={{
                click: () => onPropertySelect(property),
              }}
            >
              <Popup className="property-popup" closeButton={true} maxWidth={280} minWidth={260}>
                <div
                  className="cursor-pointer"
                  onClick={() => handlePopupClick(property)}
                >
                  {/* Property Image */}
                  <div className="relative w-full h-32 -mt-3 -mx-3 mb-3 overflow-hidden rounded-t-lg" style={{ width: 'calc(100% + 24px)' }}>
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {/* EcuaCasa Verified Badge - Brand Green */}
                    <div className="absolute bottom-2 right-2 bg-green-600/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-medium">
                      EcuaCasa Verificado
                    </div>
                    {/* Featured Badge - Amber */}
                    {property.featured && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] font-medium">
                        Destacado
                      </div>
                    )}
                    {/* Property Type */}
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-medium text-gray-700">
                      {typeLabel}
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="px-1">
                    {/* Price */}
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-lg font-bold text-gray-900">
                        ${property.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        ${property.pricePerM2.toLocaleString()}/m²
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1 hover:text-purple-600 transition-colors">
                      {title}
                    </h3>

                    {/* Location & Size */}
                    <p className="text-xs text-gray-600 mb-2">
                      {property.size.toLocaleString()} m² • {property.sector}
                    </p>

                    {/* Agent & Response Time */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-[10px] font-bold">
                          {property.agent.name.charAt(0)}
                        </div>
                        <span className="text-xs text-gray-700 font-medium">{property.agent.name}</span>
                        {property.agent.verified && (
                          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-500">{property.agent.responseTime}</span>
                    </div>

                    {/* CTA */}
                    <div className="mt-2 text-center">
                      <span className="text-xs text-purple-600 font-medium hover:text-purple-700">
                        Ver detalles →
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
