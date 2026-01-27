'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { trackWhatsAppClick } from '@/lib/analytics';

const SUPPORT_PHONE = '593939451457';

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);

  const message = encodeURIComponent(
    'Hola! Necesito ayuda con EcuaCasa. / Hi! I need help with EcuaCasa.'
  );

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip/Bubble */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl p-4 w-72 border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-gray-900 font-semibold mb-1">¿Necesitas ayuda?</p>
          <p className="text-gray-600 text-sm mb-3">
            Need help finding a provider? Chat with us!
          </p>
          <a
            href={`https://wa.me/${SUPPORT_PHONE}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackWhatsAppClick('support')}
            className="block w-full py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white text-center font-medium rounded-lg transition-colors"
          >
            Abrir WhatsApp
          </a>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          isOpen
            ? 'bg-gray-600 hover:bg-gray-700 rotate-90'
            : 'bg-[#25D366] hover:bg-[#20bd5a] hover:scale-110'
        }`}
        aria-label="WhatsApp Help"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Pulse animation when closed */}
      {!isOpen && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
      )}
    </div>
  );
}
