import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/supabase/require-admin';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const supabase = getSupabaseClient();

  try {
    // Fetch the registration
    const { data: reg, error: regError } = await supabase
      .from('registration_requests')
      .select('*')
      .eq('id', params.id)
      .single();

    if (regError || !reg) {
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Check if a provider with this phone already exists
    const { data: existingProvider } = await supabase
      .from('providers')
      .select('id')
      .eq('phone', reg.phone)
      .single();

    let providerId: string;

    if (existingProvider) {
      // Update existing provider
      const { error: updateError } = await supabase
        .from('providers')
        .update({
          name: reg.name,
          email: reg.email || null,
          photo_url: reg.profile_photo_url || null,
          description_es: reg.message || null,
          speaks_english: reg.speaks_english || false,
          status: 'active',
        })
        .eq('id', existingProvider.id);

      if (updateError) {
        console.error('Provider update error:', updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      providerId = existingProvider.id;

      // Replace service relationships
      await supabase
        .from('provider_services')
        .delete()
        .eq('provider_id', providerId);
    } else {
      // Create new provider
      const slug = generateSlug(reg.name);

      const { data: newProvider, error: createError } = await supabase
        .from('providers')
        .insert({
          name: reg.name,
          slug,
          phone: reg.phone,
          email: reg.email || null,
          photo_url: reg.profile_photo_url || null,
          description_es: reg.message || null,
          speaks_english: reg.speaks_english || false,
          verified: false,
          featured: false,
          rating: 5,
          review_count: 0,
          status: 'active',
        })
        .select('id')
        .single();

      if (createError || !newProvider) {
        console.error('Provider creation error:', createError);
        return NextResponse.json({ error: createError?.message || 'Failed to create provider' }, { status: 500 });
      }

      providerId = newProvider.id;
    }

    // Create service relationships
    if (reg.services_interested && reg.services_interested.length > 0) {
      const { data: serviceData } = await supabase
        .from('services')
        .select('id, slug')
        .in('slug', reg.services_interested);

      if (serviceData && serviceData.length > 0) {
        const providerServices = serviceData.map((service: { id: string; slug: string }) => ({
          provider_id: providerId,
          service_id: service.id,
        }));

        await supabase.from('provider_services').insert(providerServices);
      }
    }

    // Create location relationships if areas_served exist
    if (reg.areas_served && reg.areas_served.length > 0) {
      const { data: locationData } = await supabase
        .from('locations')
        .select('id, name')
        .in('name', reg.areas_served);

      if (locationData && locationData.length > 0) {
        const providerLocations = locationData.map((loc: { id: string; name: string }) => ({
          provider_id: providerId,
          location_id: loc.id,
        }));

        // Remove existing locations first if updating
        if (existingProvider) {
          await supabase
            .from('provider_locations')
            .delete()
            .eq('provider_id', providerId);
        }

        await supabase.from('provider_locations').insert(providerLocations);
      }
    }

    // Mark registration as approved
    await supabase
      .from('registration_requests')
      .update({ status: 'approved' })
      .eq('id', params.id);

    return NextResponse.json({ success: true, provider_id: providerId });
  } catch (error) {
    console.error('Error approving registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
