import { OrganizationJsonLd } from '@/components/seo/json-ld';
import { HeroSection } from '@/components/home/hero-section';
import { ServiceGrid } from '@/components/home/service-grid';
import { HowItWorks } from '@/components/home/how-it-works';
import { TrustSignals } from '@/components/home/trust-signals';
import { CTASection } from '@/components/home/cta-section';
import { servicesRepository } from '@/lib/repositories';

// ISR: revalidate every hour
export const revalidate = 3600;

export default async function HomePage() {
  const services = await servicesRepository.getActive();

  return (
    <>
      <OrganizationJsonLd />
      <HeroSection />
      <ServiceGrid services={services.slice(0, 6)} />
      <HowItWorks />
      <TrustSignals />
      <CTASection />
    </>
  );
}
