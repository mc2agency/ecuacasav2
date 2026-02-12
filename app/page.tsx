import { OrganizationJsonLd } from '@/components/seo/json-ld';
import { HeroSection } from '@/components/home/hero-section';
import { StatsBar } from '@/components/home/stats-bar';
import { ServiceGrid } from '@/components/home/service-grid';
import { FeaturedProviders } from '@/components/home/featured-providers';
import { HowItWorks } from '@/components/home/how-it-works';
import { TrustSignals } from '@/components/home/trust-signals';
import { CTASection } from '@/components/home/cta-section';
import { servicesRepository, providersRepository } from '@/lib/repositories';

// ISR: revalidate every hour
export const revalidate = 3600;

export default async function HomePage() {
  // Parallel data fetching with repositories
  const [services, featuredProviders] = await Promise.all([
    servicesRepository.getActive(),
    providersRepository.getFeatured(6),
  ]);

  return (
    <>
      <OrganizationJsonLd />
      <HeroSection />
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
