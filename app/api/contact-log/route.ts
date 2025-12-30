import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider_id, service_type, referrer } = body;

    if (!provider_id) {
      return NextResponse.json(
        { success: false, error: 'Provider ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('contact_logs')
      .insert({
        provider_id,
        service_type: service_type || null,
        referrer: referrer || null,
        contacted_at: new Date().toISOString(),
      });

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
