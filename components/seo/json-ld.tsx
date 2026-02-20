export function JsonLd({ data }: { data: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "EcuaCasa",
        description:
          "Trusted home service marketplace in Cuenca, Ecuador. Connecting expats and locals with verified professionals.",
        url: "https://ecuacasa.com",
        areaServed: {
          "@type": "City",
          name: "Cuenca",
          addressCountry: "EC",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Cuenca",
          addressRegion: "Azuay",
          addressCountry: "EC",
        },
        serviceType: [
          "Plumbing",
          "Electrical",
          "Cleaning",
          "Handyman",
          "Home Repair",
        ],
        knowsLanguage: ["es", "en"],
      }}
    />
  );
}

export function ServiceJsonLd({
  name,
  description,
  slug,
  rating,
  reviewCount,
}: {
  name: string;
  description: string;
  slug: string;
  rating?: number;
  reviewCount?: number;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name,
        description,
        url: `https://ecuacasa.com/services/${slug}`,
        providerMobility: "dynamic",
        provider: {
          "@type": "LocalBusiness",
          name: "EcuaCasa",
          url: "https://ecuacasa.com",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Cuenca",
            addressRegion: "Azuay",
            addressCountry: "EC",
          },
          knowsLanguage: ["es", "en"],
        },
        areaServed: {
          "@type": "GeoCircle",
          geoMidpoint: {
            "@type": "GeoCoordinates",
            latitude: -2.9001,
            longitude: -79.0059,
          },
          geoRadius: "30000",
        },
        ...(reviewCount && reviewCount > 0 && rating && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating,
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }),
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

export function FAQJsonLd({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }}
    />
  );
}

export function ProviderJsonLd({
  name,
  description,
  slug,
  rating,
  reviewCount,
  services,
}: {
  name: string;
  description: string;
  slug: string;
  rating: number;
  reviewCount: number;
  services: string[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: `${name} - Home Services`,
        description,
        url: `https://ecuacasa.com/providers/${slug}`,
        provider: {
          "@type": "Person",
          name,
        },
        serviceType: services,
        areaServed: {
          "@type": "City",
          name: "Cuenca",
          addressCountry: "EC",
        },
        ...(reviewCount > 0 && {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating,
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }),
      }}
    />
  );
}
