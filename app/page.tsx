import { HeroSection } from '@/components/home/hero-section';
import { StatsBar } from '@/components/home/stats-bar';
import { ServiceGrid } from '@/components/home/service-grid';
import { FeaturedProviders } from '@/components/home/featured-providers';
import { HowItWorks } from '@/components/home/how-it-works';
import { TrustSignals } from '@/components/home/trust-signals';
import { CTASection } from '@/components/home/cta-section';
import { servicesRepository, providersRepository } from '@/lib/repositories';

// Force dynamic rendering to avoid build-time database calls
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  // Parallel data fetching with repositories
  const [services, featuredProviders] = await Promise.all([
    servicesRepository.getActive(),
    providersRepository.getFeatured(6),
  ]);

  return (
    <>
      <HeroSection services={services.slice(0, 10)} />
      <StatsBar />
      <ServiceGrid services={services.slice(0, 6)} />
      {featuredProviders.length > 0 && (
        <FeaturedProviders providers={featuredProviders} />
      )}
      <HowItWorks />
      <TrustSignals />
      <CTASection />
    </>
  );
}
