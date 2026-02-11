'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Property, PROPERTY_TYPE_LABELS } from '@/lib/properties/types';
import { useTranslation } from '@/hooks/use-translation';
import { getLocalizedField } from '@/lib/i18n/helpers';
import {
  CheckCircle,
  MapPin,
  Droplet,
  Zap,
  Clock,
  Maximize2,
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  isSelected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

// Generate consistent placeholder images with Cuenca-style landscapes
// Using seeds that produce green hills, valleys, and countryside views
function getPropertyImage(property: Property): string {
  const seed = parseInt(property.id) || 1;
  // Use landscape/countryside themed seeds for Cuenca aesthetic
  const landscapeSeeds = [
    'hills', 'valley', 'farm', 'green', 'mountain', 'field', 'meadow', 'rural',
    'countryside', 'nature', 'landscape', 'pastoral', 'terrain', 'andes', 'ecuador'
  ];
  const seedIndex = seed % landscapeSeeds.length;
  const uniqueSeed = `${landscapeSeeds[seedIndex]}${seed}`;
  return `https://picsum.photos/seed/${uniqueSeed}/400/300`;
}

export function PropertyCard({
  property,
  isSelected = false,
  onClick,
  compact = false,
}: PropertyCardProps) {
  const { locale, t } = useTranslation();

  const title = getLocalizedField(property, 'title', locale);
  const typeLabel = locale === 'en'
    ? PROPERTY_TYPE_LABELS[property.type].en
    : PROPERTY_TYPE_LABELS[property.type].es;

  const propertyImage = getPropertyImage(property);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Link href={`/propiedades/${property.slug}`} onClick={handleClick}>
      <Card
        className={`group overflow-hidden transition-all duration-300 cursor-pointer ${
          isSelected
            ? 'ring-2 ring-green-500 shadow-xl border-green-200'
            : 'hover:shadow-lg border-gray-200 hover:border-gray-300'
        } ${compact ? '' : 'h-full'}`}
      >
        <CardContent className="p-0">
          {/* Image Section */}
          <div className="relative h-40 w-full overflow-hidden bg-gray-100">
            {/* Property Photo */}
            <Image
              src={propertyImage}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* EcuaCasa Verificado Watermark - Brand Green */}
            <div className="absolute bottom-2 right-2 bg-green-600/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-white font-medium">
              EcuaCasa Verificado
            </div>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {property.verified && (
                <div className="bg-green-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 text-xs font-medium shadow">
                  <CheckCircle className="w-3 h-3" />
                  {t('properties.verified_badge')}
                </div>
              )}
              {property.gpsVerified && (
                <div className="bg-purple-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 text-xs font-medium shadow">
                  <MapPin className="w-3 h-3" />
                  GPS
                </div>
              )}
            </div>

            {/* Featured Badge - Gold/Amber */}
            {property.featured && (
              <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-medium shadow">
                {t('properties.featured')}
              </div>
            )}

            {/* Property Type Badge */}
            <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-medium text-gray-700">
              {typeLabel}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4">
            {/* Price */}
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xl font-bold text-gray-900">
                ${property.price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">
                ${property.pricePerM2.toLocaleString()}/m²
              </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1 mb-2">
              {title}
            </h3>

            {/* Location & Size */}
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{property.sector}</span>
              </div>
              <div className="flex items-center gap-1">
                <Maximize2 className="w-4 h-4 text-gray-400" />
                <span>{property.size.toLocaleString()} m²</span>
              </div>
            </div>

            {/* Utilities */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {property.utilities.agua && (
                <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                  <Droplet className="w-3 h-3 mr-1" />
                  {t('properties.utilities.agua')}
                </Badge>
              )}
              {property.utilities.luz && (
                <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200 text-yellow-700">
                  <Zap className="w-3 h-3 mr-1" />
                  {t('properties.utilities.luz')}
                </Badge>
              )}
              {property.utilities.alcantarillado && (
                <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                  {t('properties.utilities.alcantarillado')}
                </Badge>
              )}
              {property.utilities.via && (
                <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-700">
                  {t('properties.utilities.via')}
                </Badge>
              )}
            </div>

            {/* Agent Info */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                  {property.agent.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    {property.agent.name}
                    {property.agent.verified && (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {property.agent.responseTime}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
