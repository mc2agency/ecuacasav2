'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Eye, MessageCircle, Search, Users, TrendingUp, ArrowRight, Globe } from 'lucide-react';

interface AnalyticsData {
  pageViews: { today: number; week: number; month: number };
  whatsappClicks: number;
  providerViews: number;
  topPages: { page: string; count: number }[];
  topSearches: { term: string; count: number }[];
  topProviders: { slug: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-purple-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <BarChart3 className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-gray-500 font-medium">Error al cargar analytics</p>
      </div>
    );
  }

  const statCards = [
    {
      icon: Eye,
      label: 'Hoy',
      value: data.pageViews.today,
      gradient: 'from-blue-500 to-blue-600',
      shadow: 'shadow-blue-200',
    },
    {
      icon: TrendingUp,
      label: 'Semana',
      value: data.pageViews.week,
      gradient: 'from-emerald-500 to-emerald-600',
      shadow: 'shadow-emerald-200',
    },
    {
      icon: Globe,
      label: 'Mes',
      value: data.pageViews.month,
      gradient: 'from-purple-500 to-pink-500',
      shadow: 'shadow-purple-200',
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp Clicks',
      value: data.whatsappClicks,
      gradient: 'from-amber-500 to-orange-500',
      shadow: 'shadow-amber-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-1">Métricas de visitas y comportamiento</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} rounded-2xl p-5 text-white shadow-lg ${stat.shadow}`}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6" />
              <Icon className="w-5 h-5 mb-3 opacity-80" />
              <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
              <p className="text-sm opacity-80 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Three Column Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-gray-900 text-sm">Páginas más vistas</h2>
          </div>
          {data.topPages.length === 0 ? (
            <div className="p-8 text-center">
              <Eye className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Sin datos aún</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.topPages.map((p, i) => (
                <div key={p.page} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' :
                      i === 1 ? 'bg-purple-100 text-purple-600' :
                      i === 2 ? 'bg-purple-50 text-purple-500' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 truncate">{p.page}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">{p.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Searches */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-amber-600" />
            <h2 className="font-semibold text-gray-900 text-sm">Búsquedas populares</h2>
          </div>
          {data.topSearches.length === 0 ? (
            <div className="p-8 text-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Sin datos aún</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.topSearches.map((s, i) => (
                <div key={s.term} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' :
                      i === 1 ? 'bg-amber-100 text-amber-600' :
                      i === 2 ? 'bg-amber-50 text-amber-500' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 truncate">&quot;{s.term}&quot;</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">{s.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Providers */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            <h2 className="font-semibold text-gray-900 text-sm">Profesionales más vistos</h2>
          </div>
          {data.topProviders.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Sin datos aún</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.topProviders.map((p, i) => (
                <div key={p.slug} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i === 0 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white' :
                      i === 1 ? 'bg-emerald-100 text-emerald-600' :
                      i === 2 ? 'bg-emerald-50 text-emerald-500' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700 truncate">{p.slug}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">{p.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
