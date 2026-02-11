'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PropertyFilter, PropertyType, CUENCA_SECTORS } from '@/lib/properties/types';
import { useTranslation } from '@/hooks/use-translation';
import {
  X,
  SlidersHorizontal,
  CheckCircle,
  Droplet,
  Zap,
  MapPin,
} from 'lucide-react';

interface PropertyFiltersProps {
  filters: PropertyFilter;
  onFilterChange: (filters: PropertyFilter) => void;
  resultCount: number;
}

// Price range presets
const PRICE_PRESETS = [
  { label: '< $50K', min: 0, max: 50000 },
  { label: '$50K - $100K', min: 50000, max: 100000 },
  { label: '$100K - $200K', min: 100000, max: 200000 },
  { label: '$200K - $500K', min: 200000, max: 500000 },
  { label: '$500K+', min: 500000, max: undefined },
];

export function PropertyFilters({
  filters,
  onFilterChange,
  resultCount,
}: PropertyFiltersProps) {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = <K extends keyof PropertyFilter>(
    key: K,
    value: PropertyFilter[K]
  ) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== '' && v !== false
  ).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      {/* Main Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Property Type */}
        <select
          value={filters.type || ''}
          onChange={(e) => updateFilter('type', e.target.value as PropertyType | '')}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        >
          <option value="">{t('properties.type.all')}</option>
          <option value="terreno">{t('properties.type.terreno')}</option>
          <option value="casa">{t('properties.type.casa')}</option>
          <option value="departamento">{t('properties.type.departamento')}</option>
        </select>

        {/* Price Range */}
        <select
          value={
            filters.priceMin !== undefined || filters.priceMax !== undefined
              ? `${filters.priceMin || 0}-${filters.priceMax || ''}`
              : ''
          }
          onChange={(e) => {
            if (e.target.value === '') {
              updateFilter('priceMin', undefined);
              updateFilter('priceMax', undefined);
            } else {
              const preset = PRICE_PRESETS.find(
                (p) => `${p.min}-${p.max || ''}` === e.target.value
              );
              if (preset) {
                onFilterChange({
                  ...filters,
                  priceMin: preset.min,
                  priceMax: preset.max,
                });
              }
            }
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        >
          <option value="">{t('properties.price_range')}</option>
          {PRICE_PRESETS.map((preset) => (
            <option key={preset.label} value={`${preset.min}-${preset.max || ''}`}>
              {preset.label}
            </option>
          ))}
        </select>

        {/* Sector */}
        <select
          value={filters.sector || ''}
          onChange={(e) => updateFilter('sector', e.target.value || undefined)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        >
          <option value="">{t('properties.sector.all')}</option>
          {CUENCA_SECTORS.map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>

        {/* Verified Only Toggle */}
        <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={filters.verifiedOnly || false}
            onChange={(e) => updateFilter('verifiedOnly', e.target.checked || undefined)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-700 flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            {t('properties.verified_only')}
          </span>
        </label>

        {/* Advanced Filters Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={showAdvanced ? 'text-purple-600' : 'text-gray-600'}
        >
          <SlidersHorizontal className="w-4 h-4 mr-1" />
          {t('properties.utilities')}
        </Button>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 ml-auto"
          >
            <X className="w-4 h-4" />
            {t('properties.clear_filters')}
          </button>
        )}

        {/* Results Count */}
        <div className="text-sm text-gray-500 ml-auto">
          {resultCount} {t('properties.results')}
        </div>
      </div>

      {/* Advanced Filters (Utilities) */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors">
              <input
                type="checkbox"
                checked={filters.hasAgua || false}
                onChange={(e) => updateFilter('hasAgua', e.target.checked || undefined)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Droplet className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700">{t('properties.utilities.agua')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors">
              <input
                type="checkbox"
                checked={filters.hasLuz || false}
                onChange={(e) => updateFilter('hasLuz', e.target.checked || undefined)}
                className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
              />
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-700">{t('properties.utilities.luz')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors">
              <input
                type="checkbox"
                checked={filters.hasAlcantarillado || false}
                onChange={(e) => updateFilter('hasAlcantarillado', e.target.checked || undefined)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">{t('properties.utilities.alcantarillado')}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors">
              <input
                type="checkbox"
                checked={filters.hasVia || false}
                onChange={(e) => updateFilter('hasVia', e.target.checked || undefined)}
                className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
              />
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{t('properties.utilities.via')}</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
