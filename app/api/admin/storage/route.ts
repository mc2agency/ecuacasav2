import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/supabase/require-admin';

const BUCKET = 'registration-uploads';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Extracts the storage path from either a raw path or a full Supabase public URL.
 * Handles both new records (path only) and legacy records (full URL).
 */
function extractStoragePath(input: string): string | null {
  if (!input) return null;

  // If it's a full Supabase storage URL, extract just the path portion
  const publicUrlMarker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = input.indexOf(publicUrlMarker);
  if (idx !== -1) {
    return decodeURIComponent(input.substring(idx + publicUrlMarker.length));
  }

  // Already a raw path — validate it doesn't try path traversal
  const normalized = input.replace(/\\/g, '/');
  if (normalized.includes('..') || normalized.startsWith('/')) {
    return null;
  }

  return normalized;
}

/**
 * Admin-only proxy for private Supabase Storage files.
 * Usage: GET /api/admin/storage?path=<storage-path-or-url>
 */
export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const rawPath = request.nextUrl.searchParams.get('path');
  if (!rawPath) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
  }

  const storagePath = extractStoragePath(rawPath);
  if (!storagePath) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  const supabase = getSupabaseClient();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(storagePath);

  if (error || !data) {
    console.error('Storage download error:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const contentType = data.type || 'image/jpeg';
  const buffer = Buffer.from(await data.arrayBuffer());

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
