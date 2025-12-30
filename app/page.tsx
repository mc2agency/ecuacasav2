import { HeroSection } from '@/components/home/hero-section';
import { ServiceGrid } from '@/components/home/service-grid';
import { FeaturedProviders } from '@/components/home/featured-providers';
import { HowItWorks } from '@/components/home/how-it-works';
import { TrustSignals } from '@/components/home/trust-signals';
import { servicesRepository, locationsRepository, providersRepository } from '@/lib/repositories';

export default async function HomePage() {
  // Parallel data fetching with repositories
  const [services, locations, featuredProviders] = await Promise.all([
    servicesRepository.getActive(),
    locationsRepository.getActive(),
    providersRepository.getFeatured(6),
  ]);

  return (
    <>
      <HeroSection
        services={services.slice(0, 10)}
        locations={locations}
      />
      <ServiceGrid services={services.slice(0, 6)} />
      {featuredProviders.length > 0 && (
        <FeaturedProviders providers={featuredProviders} />
      )}
      <HowItWorks />
      <TrustSignals />
    </>
  );
}
