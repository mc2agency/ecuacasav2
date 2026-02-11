'use client';

import { useTranslation } from '@/hooks/use-translation';
import { Shield, MapPin, FileCheck, UserCheck, Camera } from 'lucide-react';

export function PropertyGuarantee() {
  const { t } = useTranslation();

  const guaranteeItems = [
    { icon: MapPin, label: t('properties.guarantee.gps'), color: 'text-purple-600' },
    { icon: FileCheck, label: t('properties.guarantee.docs'), color: 'text-green-600' },
    { icon: UserCheck, label: t('properties.guarantee.agent'), color: 'text-blue-600' },
    { icon: Camera, label: t('properties.guarantee.photos'), color: 'text-pink-600' },
  ];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{t('properties.guarantee.title')}</h3>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-gray-600 mb-6">
          {t('properties.guarantee.desc')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {guaranteeItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
