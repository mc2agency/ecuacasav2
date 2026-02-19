import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Simple in-memory rate limiter (per IP, 100 events/min)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 100;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
    }

    const body = await request.json();
    const { event_type, page, provider_slug, service_slug, referrer, user_agent, locale, metadata } = body;

    if (!event_type || typeof event_type !== 'string') {
      return NextResponse.json({ error: 'event_type required' }, { status: 400 });
    }

    const allowedTypes = ['page_view', 'whatsapp_click', 'provider_view', 'search', 'install_prompt'];
    if (!allowedTypes.includes(event_type)) {
      return NextResponse.json({ error: 'Invalid event_type' }, { status: 400 });
    }

    console.log('Analytics hit:', event_type, page || '(no page)');

    const supabase = createAdminClient();
    if (!supabase) {
      console.error('Analytics: createAdminClient returned null — check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars');
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    const { error: insertError } = await supabase.from('analytics_events').insert({
      event_type,
      page: page || null,
      provider_slug: provider_slug || null,
      service_slug: service_slug || null,
      referrer: referrer || null,
      user_agent: user_agent || null,
      locale: locale || null,
      metadata: metadata || {},
    });

    if (insertError) {
      console.error('Analytics insert error:', insertError.message, insertError);
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Analytics unexpected error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
