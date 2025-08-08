/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration simple et stable
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configuration des images
  images: {
    unoptimized: true,
    domains: ['localhost', 'mdagricole.zidani.org'],
  },

  // Configuration pour la production
  output: 'standalone',
  swcMinify: true,

  // Configuration expérimentale pour Prisma
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

module.exports = nextConfig;
