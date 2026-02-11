'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Property } from '@/lib/properties/types';
import { useTranslation } from '@/hooks/use-translation';
import { getLocalizedField } from '@/lib/i18n/helpers';
import 'leaflet/dist/leaflet.css';

// Cuenca, Ecuador center coordinates
const CUENCA_CENTER: [number, number] = [-2.9001, -79.0059];
const DEFAULT_ZOOM = 12;

// Custom price marker icon
function createPriceIcon(price: number, isSelected: boolean = false) {
  const priceText = price >= 1000 ? `$${Math.round(price / 1000)}K` : `$${price}`;

  return L.divIcon({
    className: 'custom-price-marker',
    html: `
      <div class="${isSelected
        ? 'bg-purple-600 text-white border-purple-700'
        : 'bg-white text-gray-900 border-gray-300'
      } px-2 py-1 rounded-lg shadow-lg border-2 font-bold text-sm whitespace-nowrap transition-all hover:scale-110">
        ${priceText}
      </div>
    `,
    iconSize: [60, 30],
    iconAnchor: [30, 30],
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
  className?: string;
}

export function PropertyMap({
  properties,
  selectedProperty,
  onPropertySelect,
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

  if (!mapReady) {
    return (
      <div className={`bg-gray-100 animate-pulse flex items-center justify-center ${className}`}>
        <span className="text-gray-500">Loading map...</span>
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

      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.coordinates.lat, property.coordinates.lng]}
          icon={createPriceIcon(property.price, selectedProperty?.id === property.id)}
          eventHandlers={{
            click: () => onPropertySelect(property),
          }}
        >
          <Popup>
            <div className="min-w-[200px] p-1">
              <h3 className="font-bold text-gray-900 mb-1">
                {getLocalizedField(property, 'title', locale)}
              </h3>
              <p className="text-lg font-bold text-purple-600 mb-1">
                ${property.price.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                {property.size.toLocaleString()} m² • {property.sector}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ${property.pricePerM2.toLocaleString()}/m²
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
