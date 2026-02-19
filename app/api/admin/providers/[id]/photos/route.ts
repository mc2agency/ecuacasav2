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

interface PhotoItem {
  url: string;
  storage_path: string;
  label: string;
  type: 'profile' | 'cedula';
  selectable: boolean;
}

/**
 * GET /api/admin/providers/[id]/photos
 * Returns available photos for a provider (from their registration + existing photo_url).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const supabase = getSupabaseClient();

  // Get the provider
  const { data: provider, error: providerError } = await supabase
    .from('providers')
    .select('id, phone, photo_url')
    .eq('id', params.id)
    .single();

  if (providerError || !provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  const photos: PhotoItem[] = [];
  const seenPaths = new Set<string>();

  // 1. Find registration(s) by phone to get uploaded photos
  const { data: registrations } = await supabase
    .from('registration_requests')
    .select('id, profile_photo_url, cedula_photo_url')
    .eq('phone', provider.phone)
    .order('created_at', { ascending: false });

  if (registrations) {
    for (const reg of registrations) {
      if (reg.profile_photo_url) {
        const storagePath = extractStoragePath(reg.profile_photo_url);
        if (!seenPaths.has(storagePath)) {
          seenPaths.add(storagePath);
          photos.push({
            url: `/api/admin/storage?path=${encodeURIComponent(storagePath)}`,
            storage_path: storagePath,
            label: 'Foto de perfil',
            type: 'profile',
            selectable: true,
          });
        }
      }
      if (reg.cedula_photo_url) {
        const storagePath = extractStoragePath(reg.cedula_photo_url);
        if (!seenPaths.has(storagePath)) {
          seenPaths.add(storagePath);
          photos.push({
            url: `/api/admin/storage?path=${encodeURIComponent(storagePath)}`,
            storage_path: storagePath,
            label: 'Cédula — solo verificación',
            type: 'cedula',
            selectable: false,
          });
        }
      }
    }
  }

  // 2. If the provider already has a photo_url but it wasn't found in registrations,
  //    add it as a selectable option (handles manually-set photos or legacy data)
  if (provider.photo_url) {
    const storagePath = extractStoragePath(provider.photo_url);
    if (!storagePath.includes('/cedula') && !seenPaths.has(storagePath)) {
      seenPaths.add(storagePath);
      photos.push({
        url: `/api/admin/storage?path=${encodeURIComponent(storagePath)}`,
        storage_path: storagePath,
        label: 'Foto actual',
        type: 'profile',
        selectable: true,
      });
    }
  }

  const selectedPhotoUrl = provider.photo_url
    ? extractStoragePath(provider.photo_url)
    : null;

  return NextResponse.json({
    photos,
    selected_photo_url: selectedPhotoUrl,
  });
}

/**
 * PATCH /api/admin/providers/[id]/photos
 * Update the provider's card photo (photo_url).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const supabase = getSupabaseClient();
  const body = await request.json();
  const { photo_url } = body;

  if (!photo_url || typeof photo_url !== 'string') {
    return NextResponse.json({ error: 'photo_url is required' }, { status: 400 });
  }

  // Safety: never allow setting a cedula photo as the card photo
  if (photo_url.includes('/cedula.') || photo_url.includes('/cedula_')) {
    return NextResponse.json({ error: 'Cannot use cedula photo as card photo' }, { status: 400 });
  }

  const storagePath = extractStoragePath(photo_url);

  // Verify the file exists in storage
  const { data: fileData, error: fileError } = await supabase.storage
    .from(BUCKET)
    .download(storagePath);

  if (fileError || !fileData) {
    return NextResponse.json({ error: 'Photo not found in storage' }, { status: 404 });
  }

  // Update the provider — store the clean storage path
  const { error: updateError } = await supabase
    .from('providers')
    .update({ photo_url: storagePath })
    .eq('id', params.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
