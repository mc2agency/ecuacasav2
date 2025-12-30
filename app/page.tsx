import { HeroSection } from '@/components/home/hero-section';
import { ServiceGrid } from '@/components/home/service-grid';
import { FeaturedProviders } from '@/components/home/featured-providers';
import { HowItWorks } from '@/components/home/how-it-works';
import { TrustSignals } from '@/components/home/trust-signals';
import { SERVICE_ICONS, DEFAULT_SERVICE_ICON } from '@/lib/constants';
import { servicesRepository, locationsRepository, providersRepository } from '@/lib/repositories';

export default async function HomePage() {
  // Parallel data fetching with repositories
  const [services, locations, featuredProviders] = await Promise.all([
    servicesRepository.getActive(),
    locationsRepository.getActive(),
    providersRepository.getFeatured(6),
  ]);

  // Transform services to include icons and provider counts
  const servicesWithIcons = services.map(service => ({
    ...service,
    icon: SERVICE_ICONS[service.slug] || DEFAULT_SERVICE_ICON,
    provider_count: 0, // TODO: Add actual count in Phase 11
  }));

  return (
    <>
      <HeroSection
        services={servicesWithIcons.slice(0, 10)}
        locations={locations}
      />
      <ServiceGrid services={servicesWithIcons.slice(0, 6)} />
      {featuredProviders.length > 0 && (
        <FeaturedProviders providers={featuredProviders} />
      )}
      <HowItWorks />
      <TrustSignals />
    </>
  );
}
