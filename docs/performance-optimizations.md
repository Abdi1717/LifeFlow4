# LifeFlow4 Performance Optimizations

This document outlines the performance optimizations applied to the LifeFlow4 project to improve development experience, build times, and runtime performance.

## Table of Contents
- [Development Performance](#development-performance)
- [Build Optimizations](#build-optimizations)
- [Runtime Performance](#runtime-performance)
- [Cache Management](#cache-management)
- [Troubleshooting](#troubleshooting)

## Development Performance

### Fast Development Mode

The project includes a specialized development mode that skips non-essential checks:

```bash
npm run dev:fast
```

This command:
- Skips TypeScript type checking during development
- Disables font optimization
- Disables source map generation 

### Webpack Cache Configuration

The webpack configuration has been optimized with:
- Filesystem-based caching with compression disabled for faster reads/writes
- Absolute path resolution for cache directories
- Increased buffer length for on-demand entries

### NPM Scripts for Cache Management

Several scripts are available to manage caching:

```bash
# Quick cache refresh (keeps structure)
npm run clean:light

# Standard cache cleanup
npm run clean

# Full cache removal
npm run clean:full

# Deep cleanup (reinstalls packages)
npm run clean:deep

# Clean and restart dev server
npm run dev:clean
```

## Build Optimizations

### Chunk Splitting Strategy

The webpack configuration implements a sophisticated chunk splitting strategy:

```javascript
splitChunks: {
  chunks: 'all',
  cacheGroups: {
    // Group visualization libraries (d3, three.js, etc.)
    visualizations: {
      test: /[\\/]node_modules[\\/](d3|three|recharts|chart\.js|react-force-graph)[\\/]/,
      name: 'visualizations',
      priority: 20,
      enforce: true,
    },
    // Group Radix UI components
    radix: {
      test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
      name: 'radix-ui',
      priority: 19,
      enforce: true,
    },
    // Group core React/Next.js libraries
    commons: {
      test: /[\\/]node_modules[\\/](react|react-dom|next|framer-motion|tailwind-merge)[\\/]/,
      name: 'commons',
      priority: 18,
      enforce: true,
    },
    // Default vendor chunking
    defaultVendors: {
      test: /[\\/]node_modules[\\/]/,
      priority: 10,
      reuseExistingChunk: true,
    },
  },
}
```

This approach:
- Groups related libraries into logical chunks
- Reduces the total number of chunks generated
- Improves caching efficiency for repeated builds
- Reduces the impact of individual module changes

### Package Optimization

The Next.js configuration includes package-specific optimizations:

```javascript
experimental: {
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
    '@radix-ui/react-*',
    '@visx/*',
  ],
}
```

This enables tree-shaking for large packages, reducing bundle size.

### Production Build Options

For production builds, use:

```bash
# Standard production build
npm run build

# Optimized production build with increased memory limit
npm run build:optimized

# Build with bundle analyzer to identify large modules
npm run build:analyze
```

## Runtime Performance

### Enhanced Lazy Loading

The project uses an enhanced lazy loading utility that supports:

- Component prefetching
- Intelligent loading states
- Error boundary handling
- Named export handling

```javascript
// Usage example
const SpendingDashboard = lazyImport(
  () => import('@/components/spending-dashboard')
    .then(mod => ({ default: mod.SpendingDashboard })), 
  {
    displayName: 'SpendingDashboard',
    ssr: false,
    loading: <Loading text="Loading..." />,
    prefetch: true
  }
);
```

### Dashboard Module Prefetching

Dashboard components implement intelligent prefetching to load modules in the background:

```javascript
useEffect(() => {
  prefetchDashboardModules()
}, [])
```

The `prefetchDashboardModules` utility uses browser idle time to preload critical components:

```javascript
export const prefetchDashboardModules = () => {
  if (typeof window === 'undefined') return;

  // Prefetch critical modules during idle time
  const modules = [
    () => import('@/components/spending-dashboard')
      .then(mod => ({ default: mod.SpendingDashboard })),
    // ... other modules
  ];

  if ('requestIdleCallback' in window) {
    modules.forEach(factory => {
      window.requestIdleCallback(() => {
        try { factory(); } catch (err) { /* silent fail */ }
      }, { timeout: 2000 });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    modules.forEach((factory, index) => {
      setTimeout(() => {
        try { factory(); } catch (err) { /* silent fail */ }
      }, 1000 + (index * 300));
    });
  }
};
```

## Cache Management

### Custom Cache Handler

The project implements a custom Next.js cache handler with:

- Route-specific cache times
- Memory management with LRU/LFU hybrid eviction
- Cache metrics collection
- Intelligent revalidation

```javascript
// Route-specific cache times
const CACHE_TIMES = {
  dashboard: 30 * ONE_MINUTE,    // Dashboard routes cache for 30 minutes
  api: 5 * ONE_MINUTE,           // API routes cache for 5 minutes
  static: 7 * ONE_DAY,           // Static content caches for a week
  default: 2 * ONE_HOUR          // Default cache time is 2 hours
};
```

### Cache Pruning Strategy

The cache handler implements an intelligent pruning strategy that balances:

- Recency (when the item was last accessed)
- Frequency (how often the item is accessed)
- Cache size limits

## Troubleshooting

If you encounter build or performance issues:

1. Start with a light cache cleanup: `npm run clean:light`
2. If problems persist, try a full cleanup: `npm run clean:full`
3. For persistent issues, use deep cleanup: `npm run clean:deep`
4. Check the webpack configuration for unsupported features
5. Examine bundle sizes with `npm run build:analyze`

For memory-related issues during builds, use:

```bash
npm run build:optimized
```

This increases the Node.js memory limit to 4GB and disables telemetry. 