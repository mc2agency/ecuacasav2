import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendRegistrationNotification } from '@/lib/resend';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function getFileExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext || !['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'].includes(ext)) {
    return 'jpg';
  }
  return ext;
}

function validateFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `Tipo de archivo no permitido: ${file.type}. Solo se aceptan imágenes (JPEG, PNG, WebP).`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `Archivo demasiado grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo 5MB.`;
  }
  return null;
}

function safeJsonParse(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item: unknown) => typeof item === 'string');
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  // Rate limit: 5 registrations per IP per 15 minutes
  const ip = getClientIp(request);
  const { limited } = checkRateLimit(`register:${ip}`, { maxRequests: 5, windowMs: 15 * 60 * 1000 });
  if (limited) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intente de nuevo en unos minutos.' },
      { status: 429 }
    );
  }

  const supabase = getSupabaseClient();

  try {
    const contentType = request.headers.get('content-type') || '';
    const isFormData = contentType.includes('multipart/form-data');

    let name: string;
    let phone: string;
    let email: string | null;
    let services: string[];
    let areas_served: string[];
    let speaks_english: boolean;
    let message: string | null;
    let cedula_number: string | null = null;
    let reference1_name: string | null = null;
    let reference1_phone: string | null = null;
    let reference2_name: string | null = null;
    let reference2_phone: string | null = null;
    let cedulaPhotoFile: File | null = null;
    let profilePhotoFile: File | null = null;

    if (isFormData) {
      const formData = await request.formData();
      name = formData.get('name') as string;
      phone = formData.get('phone') as string;
      email = (formData.get('email') as string) || null;
      services = safeJsonParse(formData.get('services') as string);
      areas_served = safeJsonParse(formData.get('areas_served') as string);
      speaks_english = formData.get('speaks_english') === 'true';
      message = (formData.get('message') as string) || null;
      cedula_number = (formData.get('cedula_number') as string) || null;
      reference1_name = (formData.get('reference1_name') as string) || null;
      reference1_phone = (formData.get('reference1_phone') as string) || null;
      reference2_name = (formData.get('reference2_name') as string) || null;
      reference2_phone = (formData.get('reference2_phone') as string) || null;
      cedulaPhotoFile = formData.get('cedula_photo') as File | null;
      profilePhotoFile = formData.get('profile_photo') as File | null;

      // Validate uploaded files
      if (cedulaPhotoFile && cedulaPhotoFile.size > 0) {
        const fileError = validateFile(cedulaPhotoFile);
        if (fileError) {
          return NextResponse.json({ error: fileError }, { status: 400 });
        }
      }
      if (profilePhotoFile && profilePhotoFile.size > 0) {
        const fileError = validateFile(profilePhotoFile);
        if (fileError) {
          return NextResponse.json({ error: fileError }, { status: 400 });
        }
      }
    } else {
      // JSON fallback (for /for-providers or legacy clients)
      const data = await request.json();
      name = data.name;
      phone = data.phone;
      email = data.email || null;
      services = data.services || [];
      areas_served = data.areas_served || [];
      speaks_english = data.speaks_english || false;
      message = data.message || null;
    }

    // Validate required fields
    if (!name || !phone || !services?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert into database
    const { data: insertedRow, error: dbError } = await supabase
      .from('registration_requests')
      .insert({
        name,
        phone,
        email,
        services_interested: services,
        areas_served: areas_served.length > 0 ? areas_served : null,
        speaks_english,
        message,
        cedula_number,
        reference1_name,
        reference1_phone,
        reference2_name,
        reference2_phone,
        status: 'pending',
      })
      .select('id')
      .single();

    if (dbError || !insertedRow) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save registration' },
        { status: 500 }
      );
    }

    const recordId = insertedRow.id;
    let cedula_photo_url: string | null = null;
    let profile_photo_url: string | null = null;

    // Upload files to Supabase Storage
    if (cedulaPhotoFile && cedulaPhotoFile.size > 0) {
      const ext = getFileExtension(cedulaPhotoFile.name);
      const path = `${recordId}/cedula.${ext}`;
      const buffer = Buffer.from(await cedulaPhotoFile.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from('registration-uploads')
        .upload(path, buffer, {
          contentType: cedulaPhotoFile.type,
          upsert: true,
        });

      if (uploadError) {
        console.error('Cedula photo upload error:', uploadError);
      } else {
        const { data: urlData } = supabase.storage
          .from('registration-uploads')
          .getPublicUrl(path);
        cedula_photo_url = urlData.publicUrl;
      }
    }

    if (profilePhotoFile && profilePhotoFile.size > 0) {
      const ext = getFileExtension(profilePhotoFile.name);
      const path = `${recordId}/profile.${ext}`;
      const buffer = Buffer.from(await profilePhotoFile.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from('registration-uploads')
        .upload(path, buffer, {
          contentType: profilePhotoFile.type,
          upsert: true,
        });

      if (uploadError) {
        console.error('Profile photo upload error:', uploadError);
      } else {
        const { data: urlData } = supabase.storage
          .from('registration-uploads')
          .getPublicUrl(path);
        profile_photo_url = urlData.publicUrl;
      }
    }

    // Update record with photo URLs if uploaded
    if (cedula_photo_url || profile_photo_url) {
      const updateData: Record<string, string> = {};
      if (cedula_photo_url) updateData.cedula_photo_url = cedula_photo_url;
      if (profile_photo_url) updateData.profile_photo_url = profile_photo_url;

      const { error: updateError } = await supabase
        .from('registration_requests')
        .update(updateData)
        .eq('id', recordId);

      if (updateError) {
        console.error('Failed to update photo URLs:', updateError);
      }
    }

    // Send email notification (non-blocking)
    await sendRegistrationNotification({
      name,
      phone,
      email,
      services,
      speaks_english,
      message,
      cedula_number,
      areas_served,
      reference1_name,
      reference1_phone,
      reference2_name,
      reference2_phone,
      cedula_photo_url,
      profile_photo_url,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
