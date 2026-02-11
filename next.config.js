/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'eqfocqdhnwqqxugonech.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      // Old URLs indexed by Google -> new structure
      { source: '/plomeria', destination: '/services/plomeria', permanent: true },
      { source: '/limpieza', destination: '/services/limpieza', permanent: true },
      { source: '/electricidad', destination: '/services/electricidad', permanent: true },
      { source: '/jardineria', destination: '/services/jardineria', permanent: true },
      { source: '/pintura', destination: '/services/pintura', permanent: true },
      { source: '/carpinteria', destination: '/services/carpinteria', permanent: true },
      { source: '/mudanzas', destination: '/services/mudanzas', permanent: true },
      { source: '/cerrajeria', destination: '/services/cerrajeria', permanent: true },
      { source: '/climatizacion', destination: '/services/climatizacion', permanent: true },
      { source: '/electrodomesticos', destination: '/services/electrodomesticos', permanent: true },
    ]
  },
}

module.exports = nextConfig
