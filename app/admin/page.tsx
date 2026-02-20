'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, FileText, Star, TrendingUp, Plus, ArrowRight, Clock, CheckCircle, Phone, ChevronRight } from 'lucide-react';

interface RecentRegistration {
  id: string;
  name: string;
  display_name: string | null;
  phone: string;
  status: string;
  services_interested: string[];
  created_at: string;
}

interface RecentProvider {
  id: string;
  name: string;
  phone: string;
  status: string;
  verified: boolean;
  featured: boolean;
  rating: number;
  created_at: string;
}

interface Stats {
  totalProviders: number;
  activeProviders: number;
  pendingRegistrations: number;
  averageRating: number;
  recentRegistrations: RecentRegistration[];
  recentProviders: RecentProvider[];
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'ahora';
  if (diffMins < 60) return `hace ${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `hace ${diffDays}d`;
  return date.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });
}

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
  contacted: { label: 'Contactado', color: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Aprobado', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700' },
  active: { label: 'Activo', color: 'bg-green-100 text-green-700' },
  inactive: { label: 'Inactivo', color: 'bg-gray-100 text-gray-600' },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-purple-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Error al cargar las estadísticas</p>
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      label: 'Profesionales',
      value: stats.totalProviders,
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-200',
      href: '/admin/providers',
    },
    {
      icon: TrendingUp,
      label: 'Activos',
      value: stats.activeProviders,
      gradient: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-200',
      href: '/admin/providers',
    },
    {
      icon: FileText,
      label: 'Pendientes',
      value: stats.pendingRegistrations,
      gradient: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-200',
      href: '/admin/registrations',
    },
    {
      icon: Star,
      label: 'Rating Prom.',
      value: stats.averageRating,
      gradient: 'from-purple-500 to-pink-500',
      shadow: 'shadow-purple-200',
      href: '/admin/providers',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Resumen general de EcuaCasa</p>
        </div>
        <Link
          href="/admin/providers/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nuevo Profesional
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link key={idx} href={stat.href}>
              <div className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} rounded-2xl p-5 text-white shadow-lg ${stat.shadow} hover:scale-[1.02] transition-transform cursor-pointer`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6" />
                <Icon className="w-5 h-5 mb-3 opacity-80" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm opacity-80 mt-0.5">{stat.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <h2 className="font-semibold text-gray-900 text-sm">Solicitudes Recientes</h2>
            </div>
            <Link href="/admin/registrations" className="text-xs text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-1">
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {stats.recentRegistrations.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Sin solicitudes</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.recentRegistrations.map((reg) => {
                const st = statusConfig[reg.status] || { label: reg.status, color: 'bg-gray-100 text-gray-600' };
                return (
                  <Link key={reg.id} href="/admin/registrations" className="block px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {reg.display_name || reg.name}
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.color}`}>
                            {st.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {reg.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(reg.created_at)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Providers */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h2 className="font-semibold text-gray-900 text-sm">Profesionales Recientes</h2>
            </div>
            <Link href="/admin/providers" className="text-xs text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-1">
              Ver todos <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {stats.recentProviders.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Sin profesionales</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.recentProviders.map((prov) => {
                const st = statusConfig[prov.status] || { label: prov.status, color: 'bg-gray-100 text-gray-600' };
                return (
                  <Link key={prov.id} href={`/admin/providers/${prov.id}/edit`} className="block px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{prov.name.charAt(0)}</span>
                          </div>
                          <p className="font-medium text-gray-900 text-sm truncate">{prov.name}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.color}`}>
                            {st.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 ml-9">
                          {prov.verified && (
                            <span className="flex items-center gap-1 text-green-500">
                              <CheckCircle className="w-3 h-3" />
                              Verificado
                            </span>
                          )}
                          {prov.rating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              {prov.rating}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(prov.created_at)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-semibold text-gray-900 text-sm mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/admin/providers/new" className="group flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:border-purple-200 hover:shadow-sm transition-all">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <Plus className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Agregar Profesional</p>
              <p className="text-xs text-gray-400">Crear nuevo perfil</p>
            </div>
          </Link>
          <Link href="/admin/registrations" className="group flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:border-amber-200 hover:shadow-sm transition-all">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <FileText className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Ver Solicitudes</p>
              <p className="text-xs text-gray-400">{stats.pendingRegistrations} pendientes</p>
            </div>
          </Link>
          <Link href="/admin/analytics" className="group flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:border-blue-200 hover:shadow-sm transition-all">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">Analytics</p>
              <p className="text-xs text-gray-400">Ver métricas del sitio</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
