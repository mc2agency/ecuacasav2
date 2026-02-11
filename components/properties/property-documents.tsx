'use client';

import { PropertyDocuments as PropertyDocsType } from '@/lib/properties/types';
import { useTranslation } from '@/hooks/use-translation';
import { Check, X, FileText, Shield } from 'lucide-react';

interface PropertyDocumentsProps {
  documents: PropertyDocsType;
}

export function PropertyDocuments({ documents }: PropertyDocumentsProps) {
  const { t } = useTranslation();

  const documentList = [
    { key: 'iprus', label: t('properties.docs.iprus'), verified: documents.iprus },
    { key: 'certificadoGravamenes', label: t('properties.docs.certificado_gravamenes'), verified: documents.certificadoGravamenes },
    { key: 'escritura', label: t('properties.docs.escritura'), verified: documents.escritura },
    { key: 'lineaFabrica', label: t('properties.docs.linea_fabrica'), verified: documents.lineaFabrica },
    { key: 'levantamientoTopografico', label: t('properties.docs.levantamiento_topografico'), verified: documents.levantamientoTopografico },
  ];

  const verifiedCount = documentList.filter(d => d.verified).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{t('properties.detail.documents')}</h3>
            <p className="text-sm text-gray-500">{t('properties.detail.documents_desc')}</p>
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="p-6">
        <div className="space-y-3">
          {documentList.map((doc) => (
            <div
              key={doc.key}
              className={`flex items-center justify-between p-3 rounded-lg ${
                doc.verified ? 'bg-green-50' : 'bg-gray-50'
              }`}
            >
              <span className={`font-medium ${doc.verified ? 'text-gray-900' : 'text-gray-500'}`}>
                {doc.label}
              </span>
              {doc.verified ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-medium">Verificado</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-gray-400">
                  <X className="w-5 h-5" />
                  <span className="text-sm">Pendiente</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Documentos verificados</span>
            <span className="font-bold text-gray-900">{verifiedCount} de {documentList.length}</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${(verifiedCount / documentList.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
