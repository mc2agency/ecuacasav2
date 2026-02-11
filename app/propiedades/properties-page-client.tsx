'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '@/hooks/use-translation';
import { PropertyFilters } from '@/components/properties/property-filters';
import { PropertyCard } from '@/components/properties/property-card';
import { Button } from '@/components/ui/button';
import { MOCK_PROPERTIES, filterProperties } from '@/lib/properties/mock-data';
import { Property, PropertyFilter } from '@/lib/properties/types';
import { Map, LayoutGrid, Home } from 'lucide-react';

// Dynamically import the map component to avoid SSR issues with Leaflet
const PropertyMap = dynamic(
  () => import('@/components/properties/property-map').then((mod) => mod.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
        <span className="text-gray-500">Cargando mapa...</span>
      </div>
    ),
  }
);

type ViewMode = 'map' | 'list';

export function PropertiesPageClient() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<PropertyFilter>({});
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
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
    if (selectedProperty && listRef.current && viewMode === 'map') {
      const card = listRef.current.querySelector(`[data-property-id="${selectedProperty.id}"]`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedProperty, viewMode]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1800px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Propiedades en Venta
              </h1>
              <p className="text-gray-600 mt-1">
                Bienes raíces verificados en Cuenca, Ecuador
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
                className={viewMode === 'map' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                <Map className="w-4 h-4 mr-1" />
                Mapa
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-purple-600 hover:bg-purple-700' : ''}
              >
                <LayoutGrid className="w-4 h-4 mr-1" />
                Lista
              </Button>
            </div>
          </div>

          {/* Filters */}
          <PropertyFilters
            filters={filters}
            onFilterChange={setFilters}
            resultCount={filteredProperties.length}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto">
        {viewMode === 'map' ? (
          /* Map View - Split Layout */
          <div className="flex flex-col lg:flex-row h-[calc(100vh-280px)] min-h-[500px]">
            {/* Property List Panel - 40% on desktop */}
            <div
              ref={listRef}
              className={`
                ${isMobile ? 'hidden' : 'w-[40%] min-w-[350px] max-w-[500px]'}
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
                <EmptyState onClear={() => setFilters({})} />
              )}
            </div>

            {/* Map Panel - 60% on desktop */}
            <div className="flex-1 relative">
              <PropertyMap
                properties={filteredProperties}
                selectedProperty={selectedProperty}
                onPropertySelect={setSelectedProperty}
                className="w-full h-full"
              />

              {/* Mobile Selected Property Card Overlay */}
              {isMobile && selectedProperty && (
                <div className="absolute bottom-4 left-4 right-4 z-[1000]">
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-200 relative">
                    <button
                      onClick={() => setSelectedProperty(null)}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-700 z-10"
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
          </div>
        ) : (
          /* List View - Grid Layout */
          <div className="p-4 lg:p-6">
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isSelected={selectedProperty?.id === property.id}
                  />
                ))}
              </div>
            ) : (
              <EmptyState onClear={() => setFilters({})} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Empty state component
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Home className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No se encontraron propiedades
      </h3>
      <p className="text-gray-600 mb-4">
        Intenta ajustar los filtros para ver más resultados
      </p>
      <Button variant="outline" onClick={onClear}>
        Limpiar filtros
      </Button>
    </div>
  );
}
