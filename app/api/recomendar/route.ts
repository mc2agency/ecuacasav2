import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendRecommendationNotification } from '@/lib/resend';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: NextRequest) {
  // Rate limit: 10 recommendations per IP per 15 minutes
  const ip = getClientIp(request);
  const { limited } = checkRateLimit(`recomendar:${ip}`, { maxRequests: 10, windowMs: 15 * 60 * 1000 });
  if (limited) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intente de nuevo en unos minutos.' },
      { status: 429 }
    );
  }

  const supabase = getSupabaseClient();
  try {
    const data = await request.json();

    if (!data.pro_name || !data.pro_service_type || !data.pro_phone || !data.relationship || !data.why_recommend) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Try to insert into database (graceful if table doesn't exist yet)
    try {
      const { error: dbError } = await supabase.from('recommendations').insert({
        pro_name: data.pro_name,
        pro_service_type: data.pro_service_type,
        pro_phone: data.pro_phone,
        relationship: data.relationship,
        why_recommend: data.why_recommend,
        recommender_name: data.recommender_name || null,
        recommender_email: data.recommender_email || null,
        status: 'pending',
      });

      if (dbError) {
        console.error('Database error (non-fatal):', dbError);
      }
    } catch (dbErr) {
      console.error('Database insert failed (non-fatal):', dbErr);
    }

    // Send email notification
    const emailResult = await sendRecommendationNotification({
      pro_name: data.pro_name,
      pro_service_type: data.pro_service_type,
      pro_phone: data.pro_phone,
      relationship: data.relationship,
      why_recommend: data.why_recommend,
      recommender_name: data.recommender_name,
      recommender_email: data.recommender_email,
    });

    return NextResponse.json({ success: true, email: emailResult });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
