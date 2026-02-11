'use client';

import { PropertyUtilities as PropertyUtilitiesType } from '@/lib/properties/types';
import { useTranslation } from '@/hooks/use-translation';
import { Droplet, Zap, CircleDot, MapPin, Check, X } from 'lucide-react';

interface PropertyUtilitiesProps {
  utilities: PropertyUtilitiesType;
}

export function PropertyUtilities({ utilities }: PropertyUtilitiesProps) {
  const { t } = useTranslation();

  const utilityList = [
    {
      key: 'agua',
      label: t('properties.utilities.agua'),
      available: utilities.agua,
      icon: Droplet,
      color: 'blue',
    },
    {
      key: 'luz',
      label: t('properties.utilities.luz'),
      available: utilities.luz,
      icon: Zap,
      color: 'yellow',
    },
    {
      key: 'alcantarillado',
      label: t('properties.utilities.alcantarillado'),
      available: utilities.alcantarillado,
      icon: CircleDot,
      color: 'green',
    },
    {
      key: 'via',
      label: t('properties.utilities.via'),
      available: utilities.via,
      icon: MapPin,
      color: 'purple',
    },
  ];

  const colorClasses = {
    blue: {
      available: 'bg-blue-50 border-blue-200 text-blue-700',
      icon: 'text-blue-500',
    },
    yellow: {
      available: 'bg-yellow-50 border-yellow-200 text-yellow-700',
      icon: 'text-yellow-500',
    },
    green: {
      available: 'bg-green-50 border-green-200 text-green-700',
      icon: 'text-green-500',
    },
    purple: {
      available: 'bg-purple-50 border-purple-200 text-purple-700',
      icon: 'text-purple-500',
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-bold text-gray-900 mb-4">{t('properties.utilities')}</h3>

      <div className="grid grid-cols-2 gap-3">
        {utilityList.map((utility) => {
          const colors = colorClasses[utility.color as keyof typeof colorClasses];

          return (
            <div
              key={utility.key}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                utility.available
                  ? colors.available
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <utility.icon
                  className={`w-5 h-5 ${
                    utility.available ? colors.icon : 'text-gray-400'
                  }`}
                />
                <span className="font-medium">{utility.label}</span>
              </div>
              {utility.available ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-400" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
