'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Phone, Mail, MessageSquare, Filter, Pencil, User, CreditCard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/** Converts a storage path (or legacy public URL) to admin-only proxy URL */
function storageProxyUrl(pathOrUrl: string): string {
  return `/api/admin/storage?path=${encodeURIComponent(pathOrUrl)}`;
}

interface Registration {
  id: string;
  name: string;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'contacted':
        return 'bg-blue-100 text-blue-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'contacted':
        return 'Contactado';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  };

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Solicitudes de Registro</h1>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Todos', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
            { value: 'pending', label: 'Pendientes', color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' },
            { value: 'contacted', label: 'Contactados', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
            { value: 'approved', label: 'Aprobados', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
            { value: 'rejected', label: 'Rechazados', color: 'bg-red-100 text-red-700 hover:bg-red-200' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value as StatusFilter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                statusFilter === filter.value
                  ? `${filter.color} ring-2 ring-offset-2 ring-gray-400`
                  : filter.color
              }`}
            >
              {filter.label} ({statusCounts[filter.value as StatusFilter]})
            </button>
          ))}
        </div>
      </div>

      {filteredRegistrations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">
              {statusFilter === 'all'
                ? 'No hay solicitudes de registro'
                : `No hay solicitudes con estado "${getStatusLabel(statusFilter)}"`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRegistrations.map((reg) => (
            <Card key={reg.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Main Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{reg.name}</h3>
                      <Badge className={getStatusColor(reg.status)}>
                        {getStatusLabel(reg.status)}
                      </Badge>
                      {reg.speaks_english && (
                        <Badge variant="outline">Habla Inglés</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <a
                          href={`https://wa.me/${reg.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary-600"
                        >
                          {reg.phone}
                        </a>
                      </div>
                      {reg.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <a href={`mailto:${reg.email}`} className="hover:text-primary-600">
                            {reg.email}
                          </a>
                        </div>
                      )}
                    </div>

                    {reg.services_interested && reg.services_interested.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Servicios:</p>
                        <div className="flex flex-wrap gap-1">
                          {reg.services_interested.map((service, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {reg.areas_served && reg.areas_served.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Sectores:</p>
                        <div className="flex flex-wrap gap-1">
                          {reg.areas_served.map((sector, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {sector}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {reg.cedula_number && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-medium">Cédula:</span> {reg.cedula_number}
                      </div>
                    )}

                    {/* Photos (served through admin-only proxy) */}
                    {(reg.profile_photo_url || reg.cedula_photo_url) && (
                      <div className="flex gap-4 mb-4">
                        {reg.profile_photo_url && (
                          <a href={storageProxyUrl(reg.profile_photo_url)} target="_blank" rel="noopener noreferrer" className="block">
                            <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-400 transition-colors">
                              <img src={storageProxyUrl(reg.profile_photo_url)} alt="Foto de perfil" className="w-full h-full object-cover" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-center">Perfil</p>
                          </a>
                        )}
                        {reg.cedula_photo_url && (
                          <a href={storageProxyUrl(reg.cedula_photo_url)} target="_blank" rel="noopener noreferrer" className="block">
                            <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-400 transition-colors">
                              <img src={storageProxyUrl(reg.cedula_photo_url)} alt="Foto de cédula" className="w-full h-full object-cover" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1 text-center">Cédula</p>
                          </a>
                        )}
                      </div>
                    )}

                    {/* References */}
                    {(reg.reference1_name || reg.reference2_name) && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Referencias:
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
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                          <MessageSquare className="w-4 h-4" />
                          Mensaje:
                        </div>
                        <p className="text-gray-600 text-sm">{reg.message}</p>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-3">
                      Enviado: {new Date(reg.created_at).toLocaleDateString('es-EC', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row lg:flex-col gap-2">
                    {reg.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => updateStatus(reg.id, 'contacted')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Contactado
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => approveRegistration(reg.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(reg.id, 'rejected')}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rechazar
                        </Button>
                      </>
                    )}
                    {reg.status === 'contacted' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => approveRegistration(reg.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(reg.id, 'rejected')}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rechazar
                        </Button>
                      </>
                    )}
                    {reg.status === 'approved' && reg.provider_id && (
                      <Link href={`/admin/providers/${reg.provider_id}/edit`}>
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 w-full"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Editar Profesional
                        </Button>
                      </Link>
                    )}
                    {reg.status === 'approved' && !reg.provider_id && (
                      <Link href="/admin/providers">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          <Pencil className="w-4 h-4 mr-1" />
                          Ver Profesionales
                        </Button>
                      </Link>
                    )}
                    <a
                      href={`https://wa.me/${reg.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="outline" className="w-full">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
