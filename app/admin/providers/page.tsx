'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit, Trash2, CheckCircle, Star, ImageIcon, X, Check, Lock, Loader2 } from 'lucide-react';

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
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Foto de tarjeta</h2>
            <p className="text-sm text-gray-500">{provider.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <X className="w-7 h-7 text-red-400" />
              </div>
              <p className="text-red-600 text-sm font-medium mb-1">No se pudieron cargar las fotos</p>
              <p className="text-gray-400 text-xs">{error}</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
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
                              : 'ring-1 ring-gray-200 hover:ring-primary-300 hover:shadow-md'
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
                                <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profesionales</h1>
        <Link href="/admin/providers/new">
          <Button className="bg-primary-600 hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </Link>
      </div>

      {providers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 mb-4">No hay profesionales registrados</p>
            <Link href="/admin/providers/new">
              <Button>Agregar el primero</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nombre</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Teléfono</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rating</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Badges</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {providers.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {provider.photo_url ? (
                            <img
                              src={`/api/providers/${provider.id}/photo`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                              {provider.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{provider.name}</div>
                          {provider.speaks_english && (
                            <span className="text-xs text-gray-500">Habla inglés</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{provider.phone}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium">{provider.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={provider.status === 'active' ? 'default' : 'secondary'}>
                        {provider.status === 'active' ? 'Activo' : provider.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleVerified(provider.id, provider.verified)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            provider.verified
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Verificado
                        </button>
                        <button
                          onClick={() => toggleFeatured(provider.id, provider.featured)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            provider.featured
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          <Star className="w-3 h-3 inline mr-1" />
                          Destacado
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPhotoPanelProvider(provider)}
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          title="Foto de tarjeta"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </Button>
                        <Link href={`/admin/providers/${provider.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteProvider(provider.id, provider.name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
