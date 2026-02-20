import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/supabase/require-admin';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const supabase = getSupabaseClient();

  try {
    const [
      { count: totalProviders },
      { count: activeProviders },
      { count: pendingRegistrations },
      { data: ratingData },
      { data: recentRegistrations },
      { data: recentProviders },
    ] = await Promise.all([
      supabase
        .from('providers')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('providers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase
        .from('registration_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('providers')
        .select('rating')
        .eq('status', 'active'),
      supabase
        .from('registration_requests')
        .select('id, name, display_name, phone, status, services_interested, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('providers')
        .select('id, name, phone, status, verified, featured, rating, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const avgRating = ratingData?.length
      ? ratingData.reduce((acc, p) => acc + (p.rating || 0), 0) / ratingData.length
      : 0;

    return NextResponse.json({
      totalProviders: totalProviders || 0,
      activeProviders: activeProviders || 0,
      pendingRegistrations: pendingRegistrations || 0,
      averageRating: Math.round(avgRating * 10) / 10,
      recentRegistrations: recentRegistrations || [],
      recentProviders: recentProviders || [],
    });
  } catch (error: any) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
