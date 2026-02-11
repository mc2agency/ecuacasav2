'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/hooks/use-translation';
import { PropertyFilters } from '@/components/properties/property-filters';
import { PropertyCard } from '@/components/properties/property-card';
import { Button } from '@/components/ui/button';
import { MOCK_PROPERTIES, filterProperties } from '@/lib/properties/mock-data';
import { Property, PropertyFilter } from '@/lib/properties/types';
import { Map, List, Home, ChevronLeft, ChevronRight } from 'lucide-react';

// Dynamically import the map component to avoid SSR issues with Leaflet
const PropertyMap = dynamic(
  () => import('@/components/properties/property-map').then((mod) => mod.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
        <span className="text-gray-500">Loading map...</span>
      </div>
    ),
  }
);

export function PropertiesPageClient() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<PropertyFilter>({});
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter properties based on current filters
  const filteredProperties = useMemo(() => {
    return filterProperties(MOCK_PROPERTIES, filters);
  }, [filters]);

  // Scroll to selected property in list
  useEffect(() => {
    if (selectedProperty && listRef.current) {
      const card = listRef.current.querySelector(`[data-property-id="${selectedProperty.id}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedProperty]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1800px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('properties.title')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('properties.subtitle')}
              </p>
            </div>

            {/* Mobile Toggle */}
            {isMobile && (
              <div className="flex gap-2">
                <Button
                  variant={showMap ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowMap(true)}
                  className={showMap ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  <Map className="w-4 h-4 mr-1" />
                  {t('properties.view_on_map')}
                </Button>
                <Button
                  variant={!showMap ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowMap(false)}
                  className={!showMap ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  <List className="w-4 h-4 mr-1" />
                  {t('properties.view_list')}
                </Button>
              </div>
            )}
          </div>

          {/* Filters */}
          <PropertyFilters
            filters={filters}
            onFilterChange={setFilters}
            resultCount={filteredProperties.length}
          />
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row h-[calc(100vh-280px)] min-h-[500px]">
          {/* Property List Panel */}
          <div
            ref={listRef}
            className={`
              ${isMobile ? (showMap ? 'hidden' : 'flex-1') : 'w-[500px] xl:w-[600px]'}
              overflow-y-auto bg-gray-50 border-r border-gray-200
            `}
          >
            {filteredProperties.length > 0 ? (
              <div className="p-4 space-y-4">
                {filteredProperties.map((property) => (
                  <div key={property.id} data-property-id={property.id}>
                    <PropertyCard
                      property={property}
                      isSelected={selectedProperty?.id === property.id}
                      onClick={() => setSelectedProperty(property)}
                      compact
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Home className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('properties.no_results')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('properties.no_results_desc')}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setFilters({})}
                >
                  {t('properties.clear_filters')}
                </Button>
              </div>
            )}
          </div>

          {/* Map Panel */}
          <div
            className={`
              ${isMobile ? (showMap ? 'flex-1' : 'hidden') : 'flex-1'}
              relative
            `}
          >
            <PropertyMap
              properties={filteredProperties}
              selectedProperty={selectedProperty}
              onPropertySelect={setSelectedProperty}
              className="w-full h-full"
            />

            {/* Selected Property Card Overlay (Mobile) */}
            {isMobile && selectedProperty && showMap && (
              <div className="absolute bottom-4 left-4 right-4 z-[1000]">
                <div className="bg-white rounded-xl shadow-2xl p-4 border border-gray-200">
                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                  <PropertyCard
                    property={selectedProperty}
                    isSelected={true}
                    compact
                  />
                </div>
              </div>
            )}
          </div>

          {/* Desktop Selected Property Details Panel */}
          {!isMobile && selectedProperty && (
            <div className="w-[350px] bg-white border-l border-gray-200 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {t('properties.detail.overview')}
                  </h3>
                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <PropertyCard
                  property={selectedProperty}
                  isSelected={true}
                />
                <div className="mt-4">
                  <a
                    href={`/propiedades/${selectedProperty.slug}`}
                    className="block w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-center rounded-lg font-medium transition-colors"
                  >
                    {t('properties.view_details')}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
