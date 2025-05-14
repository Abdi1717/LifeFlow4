/** @type {import('next').NextConfig} */
const removeImports = require('next-remove-imports')();
const withBundleAnalyzer = process.env.ANALYZE === 'true' 
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;

const nextConfig = {
  reactStrictMode: false, // Disable in development for faster renders
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
  
  // Experimental features - keeping only supported ones
  experimental: {
    // JavaScript optimization
    esmExternals: 'loose',
    
    // Improved code splitting
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons', 'date-fns'],
    
    // Cache optimization
    incrementalCacheHandlerPath: require.resolve('./lib/cache-handler.js'),
    
    // Turbopack settings - simplified
    turbo: {
      loaders: {
        '.svg': ['@svgr/webpack'],
      },
    },
  },
  
  // Enhanced compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    // Only include required locales from date-fns
    config.resolve.alias['date-fns/locale'] = 'date-fns/locale/en-US';
    
    // Optimize for development speed
    if (dev) {
      // Use cached Babel loader in dev mode
      config.module.rules.forEach((rule) => {
        if (rule.use && rule.use.loader === 'next-babel-loader') {
          rule.use.options.cacheDirectory = true;
        }
      });
      
      // Don't resolve symlinks in dev mode
      config.resolve.symlinks = false;
    }
    
    return config;
  },
}

// Apply optimizations and export
module.exports = withBundleAnalyzer(removeImports(nextConfig)); 