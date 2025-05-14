/** @type {import('next').NextConfig} */
const removeImports = require('next-remove-imports')();

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['lucide-react'],
  
  // Image optimization settings
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Improve caching
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 4,
  },
  
  // Bundle optimization
  swcMinify: true, // Use SWC minifier instead of Terser for faster builds
  
  // Experimental features
  experimental: {
    esmExternals: 'loose',
    optimizeCss: true, // CSS optimization for improved load time
    optimizeServerReact: true, // React server-side optimization
    turbo: {
      loaders: {
        // Enable SWC optimization for .svg files
        '.svg': ['@svgr/webpack'],
      },
    },
  },
}

module.exports = removeImports(nextConfig) 