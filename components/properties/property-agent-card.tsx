'use client';

import { PropertyAgent } from '@/lib/properties/types';
import { useTranslation } from '@/hooks/use-translation';
import { RatingStars } from '@/components/shared/rating-stars';
import { MessageCircle, CheckCircle, Clock, TrendingUp, Star } from 'lucide-react';

interface PropertyAgentCardProps {
  agent: PropertyAgent;
  propertyTitle: string;
}

export function PropertyAgentCard({ agent, propertyTitle }: PropertyAgentCardProps) {
  const { t } = useTranslation();

  // Generate WhatsApp link
  const whatsappMessage = encodeURIComponent(
    `Hola ${agent.name}, estoy interesado en la propiedad: ${propertyTitle}. Vi su listado en EcuaCasa.`
  );
  const whatsappUrl = `https://wa.me/${agent.phone.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 text-white">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold border-2 border-white/30">
            {agent.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              {agent.name}
              {agent.verified && (
                <CheckCircle className="w-5 h-5 text-green-300" />
              )}
            </h3>
            <p className="text-white/80 text-sm">{t('properties.detail.agent')}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Rating */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="text-sm text-gray-500">{t('properties.detail.rating')}</div>
            <div className="font-bold text-gray-900">{agent.rating.toFixed(1)}</div>
          </div>

          {/* Response Time */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <Clock className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <div className="text-sm text-gray-500">{t('properties.detail.response_time')}</div>
            <div className="font-bold text-gray-900 text-sm">{agent.responseTime}</div>
          </div>

          {/* Total Sales */}
          <div className="bg-gray-50 rounded-xl p-4 text-center col-span-2">
            <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <div className="text-sm text-gray-500">{t('properties.detail.total_sales')}</div>
            <div className="font-bold text-gray-900">{agent.totalSales} propiedades</div>
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
          {t('properties.detail.contact_via_whatsapp')}
        </a>
      </div>
    </div>
  );
}
