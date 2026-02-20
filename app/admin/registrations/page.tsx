'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Phone, Mail, MessageSquare, Filter, Pencil, User, CreditCard, Trash2, FileText, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/** Converts a storage path (or legacy public URL) to admin-only proxy URL */
function storageProxyUrl(pathOrUrl: string): string {
  return `/api/admin/storage?path=${encodeURIComponent(pathOrUrl)}`;
}

interface Registration {
  id: string;
  name: string;
  display_name: string | null;
  phone: string;
  email: string | null;
  services_interested: string[];
  areas_served: string[] | null;
  speaks_english: boolean;
  message: string | null;
  cedula_number: string | null;
  cedula_photo_url: string | null;
  profile_photo_url: string | null;
  reference1_name: string | null;
  reference1_phone: string | null;
  reference2_name: string | null;
  reference2_phone: string | null;
  status: string;
  created_at: string;
  provider_id?: string; // Associated provider ID if approved
}

type StatusFilter = 'all' | 'pending' | 'contacted' | 'approved' | 'rejected';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50' },
  contacted: { label: 'Contactado', color: 'text-blue-700', bg: 'bg-blue-50' },
  approved: { label: 'Aprobado', color: 'text-green-700', bg: 'bg-green-50' },
  rejected: { label: 'Rechazado', color: 'text-red-700', bg: 'bg-red-50' },
};

const filterConfig = [
  { value: 'all', label: 'Todos', activeClass: 'bg-gray-900 text-white', inactiveClass: 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50' },
  { value: 'pending', label: 'Pendientes', activeClass: 'bg-amber-500 text-white', inactiveClass: 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50' },
  { value: 'contacted', label: 'Contactados', activeClass: 'bg-blue-500 text-white', inactiveClass: 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50' },
  { value: 'approved', label: 'Aprobados', activeClass: 'bg-green-500 text-white', inactiveClass: 'bg-white text-green-700 border border-green-200 hover:bg-green-50' },
  { value: 'rejected', label: 'Rechazados', activeClass: 'bg-red-500 text-white', inactiveClass: 'bg-white text-red-700 border border-red-200 hover:bg-red-50' },
];

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  async function fetchRegistrations() {
    try {
      const response = await fetch('/api/admin/registrations');
      const data = await response.json();
      const regs = Array.isArray(data) ? data : [];

      // For approved registrations, try to find associated provider by phone
      const supabase = createClient();
      const approvedRegs = regs.filter((r: Registration) => r.status === 'approved');

      if (approvedRegs.length > 0) {
        const phones = approvedRegs.map((r: Registration) => r.phone);
        const { data: providers } = await supabase
          .from('providers')
          .select('id, phone')
          .in('phone', phones);

        if (providers) {
          const phoneToProviderId = new Map(providers.map(p => [p.phone, p.id]));
          regs.forEach((reg: Registration) => {
            if (reg.status === 'approved' && phoneToProviderId.has(reg.phone)) {
              reg.provider_id = phoneToProviderId.get(reg.phone);
            }
          });
        }
      }

      setRegistrations(regs);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setRegistrations([]);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    try {
      await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      fetchRegistrations();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  async function approveRegistration(id: string) {
    if (!confirm('¿Aprobar esta solicitud y crear el perfil de profesional?')) return;
    try {
      const response = await fetch(`/api/admin/registrations/${id}/approve`, {
        method: 'POST',
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to approve');
      }
      fetchRegistrations();
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Error al aprobar la solicitud');
    }
  }

  async function deleteRegistration(id: string) {
    if (!confirm('¿Estás seguro que deseas eliminar este profesional? Esta acción no se puede deshacer.')) return;
    try {
      const supabase = createClient();
      await supabase.from('registration_requests').delete().eq('id', id);
      fetchRegistrations();
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Error al eliminar la solicitud');
    }
  }

  // Filter registrations based on status
  const filteredRegistrations = statusFilter === 'all'
    ? registrations
    : registrations.filter(reg => reg.status === statusFilter);

  // Count by status
  const statusCounts = {
    all: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    contacted: registrations.filter(r => r.status === 'contacted').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-600" />
          Solicitudes de Registro
        </h1>
        <p className="text-sm text-gray-500 mt-1">{registrations.length} solicitudes en total</p>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-none">
        {filterConfig.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value as StatusFilter)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              statusFilter === filter.value
                ? `${filter.activeClass} shadow-md`
                : filter.inactiveClass
            }`}
          >
            {filter.label}
            <span className={`ml-1.5 ${statusFilter === filter.value ? 'opacity-80' : 'opacity-60'}`}>
              {statusCounts[filter.value as StatusFilter]}
            </span>
          </button>
        ))}
      </div>

      {filteredRegistrations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileText className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-500">
            {statusFilter === 'all'
              ? 'No hay solicitudes de registro'
              : `No hay solicitudes con estado "${statusConfig[statusFilter]?.label || statusFilter}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRegistrations.map((reg) => {
            const st = statusConfig[reg.status] || { label: reg.status, color: 'text-gray-600', bg: 'bg-gray-50' };
            return (
              <div key={reg.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {reg.display_name || reg.name}
                          {reg.display_name && (
                            <span className="text-sm font-normal text-gray-400 ml-2">({reg.name})</span>
                          )}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${st.bg} ${st.color} flex-shrink-0`}>
                          {st.label}
                        </span>
                        {reg.speaks_english && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-600 flex-shrink-0">
                            Habla Inglés
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-4">
                        <a
                          href={`https://wa.me/${reg.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {reg.phone}
                        </a>
                        {reg.email && (
                          <a href={`mailto:${reg.email}`} className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors">
                            <Mail className="w-3.5 h-3.5" />
                            {reg.email}
                          </a>
                        )}
                      </div>

                      {reg.services_interested && reg.services_interested.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Servicios</p>
                          <div className="flex flex-wrap gap-1.5">
                            {reg.services_interested.map((service, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium border border-gray-100">
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {reg.areas_served && reg.areas_served.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">Sectores</p>
                          <div className="flex flex-wrap gap-1.5">
                            {reg.areas_served.map((sector, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg bg-purple-50/50 text-purple-600 text-xs font-medium border border-purple-100">
                                {sector}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {reg.cedula_number && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span className="font-medium text-gray-700">Cédula:</span> {reg.cedula_number}
                        </div>
                      )}

                      {/* Photos (served through admin-only proxy) */}
                      {(reg.profile_photo_url || reg.cedula_photo_url) && (
                        <div className="flex gap-3 mb-3">
                          {reg.profile_photo_url && (
                            <a href={storageProxyUrl(reg.profile_photo_url)} target="_blank" rel="noopener noreferrer" className="block">
                              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 hover:border-purple-300 transition-colors">
                                <img src={storageProxyUrl(reg.profile_photo_url)} alt="Foto de perfil" className="w-full h-full object-cover" />
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1 text-center font-medium">Perfil</p>
                            </a>
                          )}
                          {reg.cedula_photo_url && (
                            <a href={storageProxyUrl(reg.cedula_photo_url)} target="_blank" rel="noopener noreferrer" className="block">
                              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-gray-100 hover:border-purple-300 transition-colors">
                                <img src={storageProxyUrl(reg.cedula_photo_url)} alt="Foto de cédula" className="w-full h-full object-cover" />
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1 text-center font-medium">Cédula</p>
                            </a>
                          )}
                        </div>
                      )}

                      {/* References */}
                      {(reg.reference1_name || reg.reference2_name) && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 mb-3">
                          <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            Referencias
                          </p>
                          {reg.reference1_name && (
                            <p className="text-sm text-gray-600">
                              1. {reg.reference1_name} — {reg.reference1_phone || 'Sin teléfono'}
                            </p>
                          )}
                          {reg.reference2_name && (
                            <p className="text-sm text-gray-600">
                              2. {reg.reference2_name} — {reg.reference2_phone || 'Sin teléfono'}
                            </p>
                          )}
                        </div>
                      )}

                      {reg.message && (
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                          <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Mensaje
                          </p>
                          <p className="text-gray-600 text-sm">{reg.message}</p>
                        </div>
                      )}

                      <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {new Date(reg.created_at).toLocaleDateString('es-EC', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap sm:flex-row lg:flex-col gap-2 flex-shrink-0">
                      {reg.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateStatus(reg.id, 'contacted')}
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs"
                          >
                            <Phone className="w-3.5 h-3.5 mr-1" />
                            Contactado
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => approveRegistration(reg.id)}
                            className="bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(reg.id, 'rejected')}
                            className="text-red-600 hover:bg-red-50 rounded-xl border-red-200 text-xs"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Rechazar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => deleteRegistration(reg.id)}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Eliminar
                          </Button>
                        </>
                      )}
                      {reg.status === 'contacted' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => approveRegistration(reg.id)}
                            className="bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(reg.id, 'rejected')}
                            className="text-red-600 hover:bg-red-50 rounded-xl border-red-200 text-xs"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Rechazar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => deleteRegistration(reg.id)}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Eliminar
                          </Button>
                        </>
                      )}
                      {reg.status === 'approved' && reg.provider_id && (
                        <Link href={`/admin/providers/${reg.provider_id}/edit`}>
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full rounded-xl text-xs"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            Editar Profesional
                          </Button>
                        </Link>
                      )}
                      {reg.status === 'approved' && !reg.provider_id && (
                        <Link href="/admin/providers">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full rounded-xl text-xs"
                          >
                            <Pencil className="w-3.5 h-3.5 mr-1" />
                            Ver Profesionales
                          </Button>
                        </Link>
                      )}
                      {reg.status === 'rejected' && (
                        <Button
                          size="sm"
                          onClick={() => deleteRegistration(reg.id)}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Eliminar
                        </Button>
                      )}
                      <a
                        href={`https://wa.me/${reg.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline" className="w-full rounded-xl text-xs">
                          <MessageSquare className="w-3.5 h-3.5 mr-1" />
                          WhatsApp
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
