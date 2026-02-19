import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '@/lib/supabase/require-admin';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const supabase = getSupabaseClient();
  try {
    const data = await request.json();

    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Normalize phone number
    let fullPhone = data.phone.replace(/\s/g, '');
    if (fullPhone.startsWith('+593')) {
      // Already correct
    } else if (fullPhone.startsWith('593')) {
      fullPhone = `+${fullPhone}`;
    } else {
      if (fullPhone.startsWith('0')) {
        fullPhone = fullPhone.substring(1);
      }
      fullPhone = `+593${fullPhone}`;
    }

    // Create provider
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .insert({
        name: data.name,
        slug,
        phone: fullPhone,
        email: data.email || null,
        description_es: data.description_es || null,
        description_en: data.description_en || null,
        price_range: data.price_range || null,
        response_time: data.response_time || null,
        rating: data.rating || 5,
        review_count: data.review_count || 0,
        speaks_english: data.speaks_english || false,
        verified: data.verified || false,
        featured: data.featured || false,
        status: 'active',
      })
      .select('id')
      .single();

    if (providerError) {
      console.error('Provider creation error:', providerError);
      return NextResponse.json({ error: providerError.message }, { status: 500 });
    }

    // Get service IDs and create relationships
    if (data.services && data.services.length > 0) {
      const { data: serviceData } = await supabase
        .from('services')
        .select('id, slug')
        .in('slug', data.services);

      if (serviceData && provider) {
        const providerServices = serviceData.map((service) => ({
          provider_id: provider.id,
          service_id: service.id,
        }));

        const { error: servicesError } = await supabase
          .from('provider_services')
          .insert(providerServices);

        if (servicesError) {
          console.error('Provider services error:', servicesError);
        }
      }
    }

    // If registrationId provided, mark registration as approved
    if (data.registrationId) {
      await supabase
        .from('registration_requests')
        .update({ status: 'approved' })
        .eq('id', data.registrationId);
    }

    return NextResponse.json({ success: true, id: provider?.id });
  } catch (error) {
    console.error('Error creating provider:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  const supabase = getSupabaseClient();
  try {
    const data = await request.json();
    const { id, services, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    // Normalize phone number
    let fullPhone = updateData.phone?.replace(/\s/g, '') || '';
    if (fullPhone) {
      if (fullPhone.startsWith('+593')) {
        // Already correct
      } else if (fullPhone.startsWith('593')) {
        fullPhone = `+${fullPhone}`;
      } else {
        if (fullPhone.startsWith('0')) {
          fullPhone = fullPhone.substring(1);
        }
        fullPhone = `+593${fullPhone}`;
      }
    }

    // Update provider
    const { error: updateError } = await supabase
      .from('providers')
      .update({
        name: updateData.name,
        phone: fullPhone,
        email: updateData.email || null,
        description_es: updateData.description_es || null,
        description_en: updateData.description_en || null,
        price_range: updateData.price_range || null,
        response_time: updateData.response_time || null,
        rating: updateData.rating || 0,
        review_count: updateData.review_count || 0,
        speaks_english: updateData.speaks_english || false,
        verified: updateData.verified || false,
        featured: updateData.featured || false,
        status: updateData.status || 'active',
        cedula_number: updateData.cedula_number || null,
        cedula_photo_url: updateData.cedula_photo_url || null,
        profile_photo_url: updateData.profile_photo_url || null,
        reference1_name: updateData.reference1_name || null,
        reference1_phone: updateData.reference1_phone || null,
        reference2_name: updateData.reference2_name || null,
        reference2_phone: updateData.reference2_phone || null,
        areas_served: updateData.areas_served?.length ? updateData.areas_served : null,
      })
      .eq('id', id);

    if (updateError) {
      console.error('Provider update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Update services if provided
    if (services && Array.isArray(services)) {
      // Delete existing service relationships
      const { error: deleteError } = await supabase
        .from('provider_services')
        .delete()
        .eq('provider_id', id);

      if (deleteError) {
        console.error('Error deleting provider services:', deleteError);
      }

      // Get service IDs and create new relationships
      if (services.length > 0) {
        const { data: serviceData } = await supabase
          .from('services')
          .select('id, slug')
          .in('slug', services);

        if (serviceData) {
          const providerServices = serviceData.map((service) => ({
            provider_id: id,
            service_id: service.id,
          }));

          const { error: servicesError } = await supabase
            .from('provider_services')
            .insert(providerServices);

          if (servicesError) {
            console.error('Provider services error:', servicesError);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating provider:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
