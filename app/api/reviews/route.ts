import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const providerId = request.nextUrl.searchParams.get('provider_id');
  if (!providerId) {
    return NextResponse.json({ error: 'provider_id required' }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
  const { data, error } = await supabase
    .from('reviews')
    .select('id, customer_name, rating, comment, created_at')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }

  return NextResponse.json({ reviews: data });
}

// Simple rate limiter
const submitMap = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const lastSubmit = submitMap.get(ip) || 0;
    if (now - lastSubmit < 30_000) {
      return NextResponse.json({ error: 'Please wait before submitting another review' }, { status: 429 });
    }

    const body = await request.json();
    const { provider_id, customer_name, rating, comment, website } = body;

    // Honeypot: if "website" field is filled, it's a bot
    if (website) {
      // Pretend success
      return NextResponse.json({ ok: true });
    }

    if (!provider_id || !customer_name || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
    }

    if (customer_name.length > 100 || (comment && comment.length > 1000)) {
      return NextResponse.json({ error: 'Input too long' }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }
    const { error } = await supabase.from('reviews').insert({
      provider_id,
      customer_name: customer_name.trim(),
      rating,
      comment: comment?.trim() || null,
    });

    if (error) {
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    submitMap.set(ip, now);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
