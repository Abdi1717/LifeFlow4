/**
 * Custom cache handler for Next.js
 * Extends the default incremental cache behavior with improved caching strategies
 * and performance optimizations
 */

// Cache time constants
const ONE_MINUTE = 60;
const ONE_HOUR = 60 * 60;
const ONE_DAY = 24 * ONE_HOUR;

// Route-specific cache times
const CACHE_TIMES = {
  dashboard: 30 * ONE_MINUTE,    // Dashboard routes cache for 30 minutes
  api: 5 * ONE_MINUTE,           // API routes cache for 5 minutes
  static: 7 * ONE_DAY,           // Static content caches for a week
  default: 2 * ONE_HOUR          // Default cache time is 2 hours
};

// Memory management settings
const MAX_CACHE_ITEMS = 500;     // Maximum number of items to keep in memory
const CACHE_PRUNE_THRESHOLD = 450; // When to start pruning the cache

module.exports = class CustomCacheHandler {
  constructor(options) {
    this.options = options;
    this.cache = new Map();
    this.revalidationTimes = new Map();
    this.accessTimes = new Map(); // Track when each cache entry was last accessed
    this.cacheHits = new Map();   // Track cache hit counts for LFU eviction
    
    // Initialize metrics
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };
    
    // Set up automatic cache cleanup
    this.setupCacheCleanup();
  }
  
  setupCacheCleanup() {
    // Clean up the cache periodically
    const cleanupInterval = setInterval(() => {
      this.pruneCache();
      
      // Log cache stats in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Cache Stats] Items: ${this.cache.size}, Hits: ${this.metrics.hits}, Misses: ${this.metrics.misses}, Hit Rate: ${this.getHitRate()}%`);
      }
    }, 5 * 60 * 1000); // Run every 5 minutes
    
    // Ensure cleanup interval is garbage collected properly
    if (cleanupInterval.unref) {
      cleanupInterval.unref();
    }
  }
  
  getHitRate() {
    const total = this.metrics.hits + this.metrics.misses;
    if (total === 0) return 0;
    return ((this.metrics.hits / total) * 100).toFixed(2);
  }

  getCacheTimeForKey(key) {
    // Determine appropriate cache time based on route type
    if (key.includes('/dashboard/')) {
      return CACHE_TIMES.dashboard;
    } else if (key.includes('/api/')) {
      return CACHE_TIMES.api;
    } else if (key.includes('/_next/') || key.includes('/static/')) {
      return CACHE_TIMES.static;
    }
    return CACHE_TIMES.default;
  }
  
  pruneCache() {
    if (this.cache.size <= CACHE_PRUNE_THRESHOLD) {
      return; // No need to prune yet
    }
    
    const now = Date.now();
    const entriesToPrune = this.cache.size - CACHE_PRUNE_THRESHOLD;
    
    // Collect entries with scores for eviction decision
    const entries = Array.from(this.cache.keys()).map(key => {
      const lastAccess = this.accessTimes.get(key) || 0;
      const hitCount = this.cacheHits.get(key) || 0;
      
      // Score based on combination of recency and frequency
      // Higher score = more likely to keep in cache
      const recencyScore = (now - lastAccess) / 1000; // seconds since last access
      const frequencyScore = Math.log1p(hitCount); // logarithmic scaling of hit count
      
      return {
        key,
        score: frequencyScore - (recencyScore / 3600) // balance frequency and recency
      };
    });
    
    // Sort by score (ascending) and evict lowest scoring entries
    entries.sort((a, b) => a.score - b.score);
    
    // Evict the lowest-scoring entries
    for (let i = 0; i < entriesToPrune; i++) {
      const key = entries[i].key;
      this.cache.delete(key);
      this.revalidationTimes.delete(key);
      this.accessTimes.delete(key);
      this.cacheHits.delete(key);
      this.metrics.evictions++;
    }
  }

  async get(key) {
    const cacheData = this.cache.get(key);
    
    if (!cacheData) {
      this.metrics.misses++;
      return null;
    }

    // Update access time and hit count
    this.accessTimes.set(key, Date.now());
    this.cacheHits.set(key, (this.cacheHits.get(key) || 0) + 1);
    this.metrics.hits++;

    // Get the last time this key was revalidated
    const lastRevalidateTime = this.revalidationTimes.get(key) || 0;
    const currentTime = Date.now();
    
    // Get appropriate cache time for this key
    const revalidateInterval = this.getCacheTimeForKey(key);
    
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
    // Check cache size before adding new items
    if (this.cache.size >= MAX_CACHE_ITEMS) {
      this.pruneCache();
    }
    
    this.cache.set(key, data);
    this.revalidationTimes.set(key, Date.now());
    this.accessTimes.set(key, Date.now());
    this.cacheHits.set(key, 1); // Initialize hit count
    this.metrics.sets++;
    
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