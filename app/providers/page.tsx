import { Metadata } from 'next';
import { ProvidersFilter } from '@/components/providers/providers-filter';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Profesionales Verificados',
  description: 'Encuentra profesionales verificados para servicios del hogar en Cuenca, Ecuador. Plomeros, electricistas, limpieza y más.',
};

interface ProvidersPageProps {
  searchParams: Promise<{ service?: string }>;
}

export default async function ProvidersPage({ searchParams }: ProvidersPageProps) {
  const { service: initialService } = await searchParams;
  const supabase = await createClient();

  let providers: any[] = [];
  let servicesData: any[] = [];

  if (supabase) {
    const [{ data: providersData }, { data: svcData }] = await Promise.all([
      supabase
        .from('providers')
        .select(`
          id, slug, name, photo_url, description_es, description_en,
          rating, review_count, price_range, response_time,
          verified, speaks_english, featured, phone,
          services:provider_services(service:services(slug, name_es, name_en))
        `)
        .eq('status', 'active')
        .order('rating', { ascending: false }),
      supabase
        .from('services')
        .select('slug, name_es, name_en')
        .order('name_en'),
    ]);

    providers = (providersData || []).map((p: any) => ({
      ...p,
      services: p.services?.map((ps: any) => ps.service) || [],
    }));
    servicesData = svcData || [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Profesionales Verificados
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encuentra al profesional perfecto para tu proyecto
          </p>
        </div>

        <ProvidersFilter
          providers={providers}
          services={servicesData || []}
          initialService={initialService || ''}
        />
      </div>
    </div>
  );
}
