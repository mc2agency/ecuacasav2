import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'registration-uploads';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Extracts the storage path from a raw path or a full Supabase public URL.
 */
function extractStoragePath(input: string): string {
  if (!input) return input;

  const publicUrlMarker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = input.indexOf(publicUrlMarker);
  if (idx !== -1) {
    return decodeURIComponent(input.substring(idx + publicUrlMarker.length));
  }

  return input;
}

/**
 * Public endpoint to serve a provider's card photo from private storage.
 * GET /api/providers/[id]/photo
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const supabase = getSupabaseClient();

  // Look up the provider's photo_url
  const { data: provider, error: dbError } = await supabase
    .from('providers')
    .select('photo_url')
    .eq('id', id)
    .single();

  if (dbError || !provider?.photo_url) {
    return NextResponse.json({ error: 'No photo' }, { status: 404 });
  }

  // Normalize the path (handle both raw paths and full Supabase URLs)
  const path = extractStoragePath(provider.photo_url);

  // Ensure we never serve a cedula photo publicly
  if (path.includes('/cedula.') || path.includes('/cedula_')) {
    return NextResponse.json({ error: 'No photo' }, { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(path);

  if (error || !data) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const contentType = data.type || 'image/jpeg';
  const buffer = Buffer.from(await data.arrayBuffer());

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
