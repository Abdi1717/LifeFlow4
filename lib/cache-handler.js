/**
 * Custom cache handler for Next.js
 * Extends the default incremental cache behavior with improved caching strategies
 */

const ONE_HOUR = 60 * 60;
const ONE_DAY = 24 * ONE_HOUR;

module.exports = class CustomCacheHandler {
  constructor(options) {
    this.options = options;
    this.cache = new Map();
    this.revalidationTimes = new Map();
  }

  async get(key) {
    const cacheData = this.cache.get(key);
    
    if (!cacheData) {
      return null;
    }

    // Get the last time this key was revalidated
    const lastRevalidateTime = this.revalidationTimes.get(key) || 0;
    const currentTime = Date.now();
    
    // For dashboard routes, use a shorter cache time
    const isDashboardRoute = key.includes('/dashboard/');
    const revalidateInterval = isDashboardRoute ? ONE_HOUR : ONE_DAY;
    
    // Check if we need to revalidate
    const needsRevalidation = (currentTime - lastRevalidateTime) > revalidateInterval * 1000;
    
    if (needsRevalidation) {
      // Mark that we need to revalidate, but still return the cached data
      return {
        ...cacheData,
        isStale: true
      };
    }

    // Return the cached data as-is
    return cacheData;
  }

  async set(key, data, options = {}) {
    this.cache.set(key, data);
    this.revalidationTimes.set(key, Date.now());
    
    // Log cache update in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Cache] Updated: ${key}`);
    }
    
    return true;
  }

  async revalidateTag(tag) {
    // Find all cache entries with this tag and mark them for revalidation
    for (const [key, data] of this.cache.entries()) {
      if (data.tags && data.tags.includes(tag)) {
        this.revalidationTimes.set(key, 0); // Force revalidation
      }
    }
    
    return true;
  }
}; 