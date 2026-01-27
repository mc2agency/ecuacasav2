'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Eye, MessageCircle, Search, Users } from 'lucide-react';

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-red-500">Error loading analytics</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6" />
        Analytics
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Eye className="w-5 h-5" />} label="Page Views Today" value={data.pageViews.today} />
        <StatCard icon={<Eye className="w-5 h-5" />} label="Page Views (Week)" value={data.pageViews.week} />
        <StatCard icon={<Eye className="w-5 h-5" />} label="Page Views (Month)" value={data.pageViews.month} />
        <StatCard icon={<MessageCircle className="w-5 h-5" />} label="WhatsApp Clicks (Month)" value={data.whatsappClicks} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4" /> Top Pages
          </h2>
          {data.topPages.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet</p>
          ) : (
            <ul className="space-y-2">
              {data.topPages.map(p => (
                <li key={p.page} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate mr-2">{p.page}</span>
                  <span className="font-medium text-gray-900">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Searches */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Search className="w-4 h-4" /> Top Searches
          </h2>
          {data.topSearches.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet</p>
          ) : (
            <ul className="space-y-2">
              {data.topSearches.map(s => (
                <li key={s.term} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate mr-2">&quot;{s.term}&quot;</span>
                  <span className="font-medium text-gray-900">{s.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Providers */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" /> Top Provider Views
          </h2>
          {data.topProviders.length === 0 ? (
            <p className="text-gray-500 text-sm">No data yet</p>
          ) : (
            <ul className="space-y-2">
              {data.topProviders.map(p => (
                <li key={p.slug} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate mr-2">{p.slug}</span>
                  <span className="font-medium text-gray-900">{p.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );
}
