/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile monorepo packages so Next.js can process their TypeScript
  transpilePackages: ['@rentnear/types', '@rentnear/api-client'],
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
    ],
  },
};

module.exports = nextConfig;
