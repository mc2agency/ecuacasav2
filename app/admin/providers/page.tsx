'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit, Trash2, CheckCircle, Star, ImageIcon, X, Check, Lock, Loader2, Users, Search } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  phone: string;
  photo_url: string | null;
  rating: number;
  verified: boolean;
  featured: boolean;
  status: string;
  speaks_english: boolean;
  created_at: string;
}

interface PhotoItem {
  url: string;
  storage_path: string;
  label: string;
  type: 'profile' | 'cedula';
  selectable: boolean;
}

// ─── Photo Panel Modal ─────────────────────────────────────────────
function PhotoPanel({
  provider,
  onClose,
  onPhotoSaved,
}: {
  provider: Provider;
  onClose: () => void;
  onPhotoSaved: () => void;
}) {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/providers/${provider.id}/photos`);
        if (res.ok) {
          const data = await res.json();
          setPhotos(data.photos || []);
          setSelectedPath(data.selected_photo_url || null);
        } else {
          const errData = await res.json().catch(() => null);
          setError(`Error ${res.status}: ${errData?.error || res.statusText}`);
        }
      } catch (err) {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [provider.id]);

  const selectPhoto = useCallback(async (photo: PhotoItem) => {
    if (!photo.selectable || saving) return;
    setSaving(photo.storage_path);

    try {
      const res = await fetch(`/api/admin/providers/${provider.id}/photos`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_url: photo.storage_path }),
      });

      if (res.ok) {
        setSelectedPath(photo.storage_path);
        onPhotoSaved();
      }
    } catch {
      // ignore
    } finally {
      setSaving(null);
    }
  }, [provider.id, saving, onPhotoSaved]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const selectablePhotos = photos.filter((p) => p.selectable);
  const cedulaPhotos = photos.filter((p) => p.type === 'cedula');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Foto de tarjeta</h2>
            <p className="text-sm text-gray-500">{provider.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <X className="w-7 h-7 text-red-400" />
              </div>
              <p className="text-red-600 text-sm font-medium mb-1">No se pudieron cargar las fotos</p>
              <p className="text-gray-400 text-xs">{error}</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ImageIcon className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No hay fotos disponibles</p>
              <p className="text-gray-400 text-xs mt-1">Este profesional no tiene fotos en el sistema</p>
            </div>
          ) : (
            <>
              {/* Selectable photos */}
              {selectablePhotos.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                    Haz clic para usar en la tarjeta pública
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {selectablePhotos.map((photo) => {
                      const isSelected = selectedPath === photo.storage_path;
                      const isSaving = saving === photo.storage_path;
                      return (
                        <button
                          key={photo.storage_path}
                          type="button"
                          onClick={() => selectPhoto(photo)}
                          disabled={!!saving}
                          className={`relative rounded-xl overflow-hidden transition-all ${
                            isSelected
                              ? 'ring-3 ring-green-500 shadow-lg shadow-green-100'
                              : 'ring-1 ring-gray-200 hover:ring-purple-300 hover:shadow-md'
                          } ${saving && !isSaving ? 'opacity-50' : ''}`}
                        >
                          <div className="aspect-square bg-gray-100">
                            <img
                              src={photo.url}
                              alt={photo.label}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Selected checkmark */}
                          {isSelected && !isSaving && (
                            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1.5 shadow-lg">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}

                          {/* Saving spinner */}
                          {isSaving && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <div className="bg-white rounded-full p-2 shadow-lg">
                                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                              </div>
                            </div>
                          )}

                          <div className={`px-3 py-1.5 text-xs font-medium text-center ${
                            isSelected ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
                          }`}>
                            {isSelected ? 'Foto actual de tarjeta' : photo.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cédula — verification only */}
              {cedulaPhotos.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Cédula — verificación privada
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {cedulaPhotos.map((photo) => (
                      <div
                        key={photo.storage_path}
                        className="rounded-xl overflow-hidden ring-1 ring-gray-200 opacity-60"
                      >
                        <div className="aspect-square bg-gray-100">
                          <img
                            src={photo.url}
                            alt={photo.label}
                            className="w-full h-full object-cover grayscale-[30%]"
                          />
                        </div>
                        <div className="px-3 py-1.5 text-xs font-medium text-center bg-gray-100 text-gray-400 flex items-center justify-center gap-1">
                          <Lock className="w-3 h-3" />
                          Solo verificación
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoPanelProvider, setPhotoPanelProvider] = useState<Provider | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProviders();
  }, []);

  async function fetchProviders() {
    const supabase = createClient();
    const { data } = await supabase
      .from('providers')
      .select('id, name, phone, photo_url, rating, verified, featured, status, speaks_english, created_at')
      .order('created_at', { ascending: false });

    setProviders(data || []);
    setLoading(false);
  }

  async function toggleFeatured(id: string, currentValue: boolean) {
    const supabase = createClient();
    await supabase
      .from('providers')
      .update({ featured: !currentValue })
      .eq('id', id);
    fetchProviders();
  }

  async function toggleVerified(id: string, currentValue: boolean) {
    const supabase = createClient();
    await supabase
      .from('providers')
      .update({ verified: !currentValue })
      .eq('id', id);
    fetchProviders();
  }

  async function deleteProvider(id: string, name: string) {
    if (!confirm(`¿Estás seguro de eliminar a ${name}?`)) return;

    const supabase = createClient();
    await supabase.from('providers').delete().eq('id', id);
    fetchProviders();
  }

  const filteredProviders = searchQuery
    ? providers.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery)
      )
    : providers;

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Profesionales
          </h1>
          <p className="text-sm text-gray-500 mt-1">{providers.length} registrados</p>
        </div>
        <Link href="/admin/providers/new">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </Link>
      </div>

      {/* Search */}
      {providers.length > 0 && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      )}

      {providers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">No hay profesionales registrados</p>
          <Link href="/admin/providers/new">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl">Agregar el primero</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Teléfono</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Badges</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProviders.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {provider.photo_url ? (
                            <img
                              src={`/api/providers/${provider.id}/photo`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
                              {provider.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{provider.name}</div>
                          {provider.speaks_english && (
                            <span className="text-xs text-gray-400">Habla inglés</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{provider.phone}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-gray-900">{provider.rating}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        provider.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {provider.status === 'active' ? 'Activo' : provider.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => toggleVerified(provider.id, provider.verified)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                            provider.verified
                              ? 'bg-green-50 text-green-700 hover:bg-green-100'
                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Verificado
                        </button>
                        <button
                          onClick={() => toggleFeatured(provider.id, provider.featured)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                            provider.featured
                              ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          <Star className="w-3 h-3 inline mr-1" />
                          Destacado
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setPhotoPanelProvider(provider)}
                          className="p-2 rounded-xl text-purple-600 hover:bg-purple-50 transition-colors"
                          title="Foto de tarjeta"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <Link href={`/admin/providers/${provider.id}/edit`}>
                          <button className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => deleteProvider(provider.id, provider.name)}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Results count */}
          {searchQuery && (
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              {filteredProviders.length} de {providers.length} profesionales
            </div>
          )}
        </div>
      )}

      {/* Photo Panel Modal */}
      {photoPanelProvider && (
        <PhotoPanel
          provider={photoPanelProvider}
          onClose={() => setPhotoPanelProvider(null)}
          onPhotoSaved={fetchProviders}
        />
      )}
    </div>
  );
}
