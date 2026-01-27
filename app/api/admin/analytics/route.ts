import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/require-admin';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const supabase = await createClient();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

    // Page views counts
    const [todayViews, weekViews, monthViews] = await Promise.all([
      supabase.from('analytics_events').select('id', { count: 'exact', head: true })
        .eq('event_type', 'page_view').gte('created_at', todayStart),
      supabase.from('analytics_events').select('id', { count: 'exact', head: true })
        .eq('event_type', 'page_view').gte('created_at', weekAgo),
      supabase.from('analytics_events').select('id', { count: 'exact', head: true })
        .eq('event_type', 'page_view').gte('created_at', monthAgo),
    ]);

    // WhatsApp clicks count (month)
    const whatsappClicks = await supabase.from('analytics_events').select('id', { count: 'exact', head: true })
      .eq('event_type', 'whatsapp_click').gte('created_at', monthAgo);

    // Provider views count (month)
    const providerViews = await supabase.from('analytics_events').select('id', { count: 'exact', head: true })
      .eq('event_type', 'provider_view').gte('created_at', monthAgo);

    // Top pages (month) — fetch raw and aggregate in JS
    const { data: pageData } = await supabase.from('analytics_events')
      .select('page')
      .eq('event_type', 'page_view')
      .gte('created_at', monthAgo)
      .not('page', 'is', null)
      .limit(5000);

    const pageCounts: Record<string, number> = {};
    pageData?.forEach(r => { if (r.page) pageCounts[r.page] = (pageCounts[r.page] || 0) + 1; });
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));

    // Top search terms (month)
    const { data: searchData } = await supabase.from('analytics_events')
      .select('metadata')
      .eq('event_type', 'search')
      .gte('created_at', monthAgo)
      .limit(5000);

    const searchCounts: Record<string, number> = {};
    searchData?.forEach(r => {
      const q = (r.metadata as any)?.query;
      if (q) searchCounts[q] = (searchCounts[q] || 0) + 1;
    });
    const topSearches = Object.entries(searchCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }));

    // Top providers by views
    const { data: provData } = await supabase.from('analytics_events')
      .select('provider_slug')
      .eq('event_type', 'provider_view')
      .gte('created_at', monthAgo)
      .not('provider_slug', 'is', null)
      .limit(5000);

    const provCounts: Record<string, number> = {};
    provData?.forEach(r => { if (r.provider_slug) provCounts[r.provider_slug] = (provCounts[r.provider_slug] || 0) + 1; });
    const topProviders = Object.entries(provCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([slug, count]) => ({ slug, count }));

    return NextResponse.json({
      pageViews: {
        today: todayViews.count || 0,
        week: weekViews.count || 0,
        month: monthViews.count || 0,
      },
      whatsappClicks: whatsappClicks.count || 0,
      providerViews: providerViews.count || 0,
      topPages,
      topSearches,
      topProviders,
    });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
