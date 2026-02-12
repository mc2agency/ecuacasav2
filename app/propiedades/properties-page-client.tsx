'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Home, MessageCircle, Mail } from 'lucide-react';

export function PropertiesPageClient() {
  const { locale } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1800px] mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              {locale === 'es' ? 'Propiedades en Cuenca' : 'Properties in Cuenca'}
            </h1>
            <p className="text-gray-600 mt-1">
              {locale === 'es'
                ? 'Bienes raíces verificados en Cuenca, Ecuador'
                : 'Verified real estate in Cuenca, Ecuador'}
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Empty State */}
      <div className="max-w-2xl mx-auto px-4 py-20">
        <div className="text-center">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Home className="w-12 h-12 text-purple-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {locale === 'es' ? 'Próximamente' : 'Coming Soon'}
          </h2>

          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            {locale === 'es'
              ? 'Estamos verificando las primeras propiedades en Cuenca. ¿Tienes una propiedad?'
              : "We're verifying the first properties in Cuenca. Have a property?"}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://wa.me/593939451457?text=Hola%2C%20tengo%20una%20propiedad%20para%20listar"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {locale === 'es' ? 'Contáctanos por WhatsApp' : 'Contact us on WhatsApp'}
              </Button>
            </Link>

            <Link href="mailto:info@ecuacasa.com?subject=Tengo%20una%20propiedad%20para%20listar">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Mail className="w-5 h-5 mr-2" />
                info@ecuacasa.com
              </Button>
            </Link>
          </div>

          {/* Info Box */}
          <div className="mt-12 p-6 bg-purple-50 rounded-xl border border-purple-100 max-w-md mx-auto">
            <h3 className="font-semibold text-purple-900 mb-2">
              {locale === 'es' ? '¿Qué verificamos?' : 'What do we verify?'}
            </h3>
            <ul className="text-sm text-purple-800 text-left space-y-1">
              <li>✓ {locale === 'es' ? 'Ubicación GPS exacta' : 'Exact GPS location'}</li>
              <li>✓ {locale === 'es' ? 'Documentos legales (IPRUS, Escritura, etc.)' : 'Legal documents (IPRUS, Title, etc.)'}</li>
              <li>✓ {locale === 'es' ? 'Identidad del propietario/agente' : 'Owner/agent identity'}</li>
              <li>✓ {locale === 'es' ? 'Fotos verificadas en sitio' : 'On-site verified photos'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
