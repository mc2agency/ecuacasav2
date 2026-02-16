import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: Request) {
  // Rate limit: 30 contact logs per IP per minute
  const ip = getClientIp(request);
  const { limited } = checkRateLimit(`contact-log:${ip}`, { maxRequests: 30, windowMs: 60 * 1000 });
  if (limited) {
    return NextResponse.json({ success: false, error: 'Rate limited' }, { status: 429 });
  }

  const supabase = getSupabaseClient();
  try {
    const body = await request.json();
    const { provider_id, service_type, referrer } = body;

    if (!provider_id) {
      return NextResponse.json(
        { success: false, error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('contact_logs')
      .insert({
        provider_id,
        service_type: service_type || null,
        referrer: referrer || null,
        contacted_at: new Date().toISOString(),
      } as any);

    if (error) {
      console.error('Error logging contact:', error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Contact log API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to log contact' },
      { status: 500 }
    );
  }
}
