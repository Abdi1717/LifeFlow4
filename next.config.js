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
  
  // Improve caching - Extended for better performance
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 60 * 1000, // Increased from 25s to 60s
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 8, // Increased from 4 to 8
  },
  
  // Bundle optimization
  swcMinify: true, // Use SWC minifier instead of Terser for faster builds
  
  // Experimental features - keeping only supported ones
  experimental: {
    // JavaScript optimization
    esmExternals: 'loose',
    
    // Improved code splitting
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons', 
      'date-fns',
      'd3',
      'chart.js',
      'recharts',
      'framer-motion',
      'react-day-picker',
      '@radix-ui/react-*', // Optimize all Radix UI components
      '@visx/*',
    ],
    
    // Cache optimization
    incrementalCacheHandlerPath: require.resolve('./lib/cache-handler.js'),
    
    // Enable module-level code caching where supported
    moduleSuffixes: ['', '.module', '.browser', '.react', '.client'],
    
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
  
  // Webpack optimization - Enhanced for better performance
  webpack: (config, { dev, isServer }) => {
    // Only include required locales from date-fns
    config.resolve.alias['date-fns/locale'] = 'date-fns/locale/en-US';
    
    // Optimize for development speed
    if (dev) {
      // Use cached Babel loader in dev mode with higher cache limits
      config.module.rules.forEach((rule) => {
        if (rule.use && rule.use.loader === 'next-babel-loader') {
          rule.use.options.cacheDirectory = true;
          rule.use.options.cacheCompression = false; // Disable compression for faster reads/writes
        }
      });
      
      // Don't resolve symlinks in dev mode
      config.resolve.symlinks = false;
      
      // Increase cache size for faster incremental builds
      config.cache = {
        type: 'filesystem',
        allowCollectingMemory: true,
        cacheDirectory: '.next/cache/webpack',
        buildDependencies: {
          config: [__filename],
        },
        compression: false, // Faster but uses more disk space
      };
      
      // Ignore watching node_modules for faster rebuilds
      config.watchOptions = {
        aggregateTimeout: 200,
        poll: 1000,
        ignored: /node_modules/,
      };
    }
    
    // Better code splitting for larger libraries
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Group all heavy visualization libraries together
          visualizations: {
            test: /[\\/]node_modules[\\/](d3|three|recharts|chart\.js|react-force-graph)[\\/]/,
            name: 'visualizations',
            priority: 20,
            enforce: true,
          },
          // Group Radix UI components together
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'radix-ui',
            priority: 19,
            enforce: true,
          },
          // Group other common libraries
          commons: {
            test: /[\\/]node_modules[\\/](react|react-dom|next|framer-motion|tailwind-merge)[\\/]/,
            name: 'commons',
            priority: 18,
            enforce: true,
          },
          // Default vendor chunk
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            reuseExistingChunk: true,
          },
        },
      },
    };
    
    return config;
  },
}

// Apply optimizations and export
module.exports = withBundleAnalyzer(removeImports(nextConfig)); 