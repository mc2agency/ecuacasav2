import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendServiceRequestNotification } from '@/lib/resend';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function generateRequestNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 900 + 100);
  return `SR-${date}-${random}`;
}

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  if (!cleaned.startsWith('593')) {
    cleaned = '593' + cleaned;
  }
  return '+' + cleaned;
}

export async function POST(request: NextRequest) {
  // Rate limit: 10 service requests per IP per 15 minutes
  const ip = getClientIp(request);
  const { limited } = checkRateLimit(`solicitar:${ip}`, { maxRequests: 10, windowMs: 15 * 60 * 1000 });
  if (limited) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intente de nuevo en unos minutos.' },
      { status: 429 }
    );
  }

  const supabase = getSupabaseClient();
  try {
    const data = await request.json();

    if (!data.service_slug || !data.sector || !data.urgency || !data.client_name || !data.client_whatsapp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const requestNumber = generateRequestNumber();
    const normalizedPhone = normalizePhone(data.client_whatsapp);

    // Try to insert into database (graceful if table doesn't exist yet)
    try {
      const { error: dbError } = await supabase.from('service_requests').insert({
        request_number: requestNumber,
        service_slug: data.service_slug,
        service_other: data.service_other || null,
        description: data.description || null,
        sector: data.sector,
        urgency: data.urgency,
        client_name: data.client_name,
        client_whatsapp: normalizedPhone,
        client_email: data.client_email || null,
        status: 'pending',
      });

      if (dbError) {
        console.error('Database error (non-fatal):', dbError);
      }
    } catch (dbErr) {
      console.error('Database insert failed (non-fatal):', dbErr);
    }

    // Send email notification
    const emailResult = await sendServiceRequestNotification({
      request_number: requestNumber,
      service_slug: data.service_slug,
      service_other: data.service_other,
      description: data.description,
      sector: data.sector,
      urgency: data.urgency,
      client_name: data.client_name,
      client_whatsapp: normalizedPhone,
      client_email: data.client_email,
    });

    return NextResponse.json({ success: true, request_number: requestNumber, email: emailResult });
  } catch (error) {
    console.error('Service request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
