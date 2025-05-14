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
  dashboard: 15 * ONE_MINUTE,    // Dashboard routes cache for 15 minutes (reduced to prevent stale data)
  api: 5 * ONE_MINUTE,           // API routes cache for 5 minutes
  static: 7 * ONE_DAY,           // Static content caches for a week
  default: 2 * ONE_HOUR          // Default cache time is 2 hours
};

// Chunk priority settings
const CHUNK_PRIORITIES = {
  'd3-libs': 10,                 // Highest priority for d3 libraries
  'visualizations': 9,           // High priority for visualization libraries
  'commons': 8,                  // Medium-high priority for common libraries
  'radix-ui': 7,                 // Medium priority for UI components
  'defaultVendors': 6,           // Standard priority for vendor chunks
  'default': 5                   // Default priority
};

// Memory management settings
const MAX_CACHE_ITEMS = 300;     // Maximum number of items to keep in memory
const CACHE_PRUNE_THRESHOLD = 250; // When to start pruning the cache

module.exports = class CustomCacheHandler {
  constructor(options) {
    this.options = options || {};
    this.cache = new Map();
    this.cacheItemsMeta = new Map(); // Track access frequency and timestamps
    this.hits = 0;
    this.misses = 0;
    this.lastPruneTime = Date.now();
    
    // Add error handling for timeout issues
    this.errorRetries = new Map(); // Track retry attempts for failed chunks
    
    // Log cache initialization
    console.log('[Cache] Custom cache handler initialized');
  }

  async get(key) {
    // Get from cache with metadata tracking
    const cacheKey = this.normalizeKey(key);
    const entry = this.cache.get(cacheKey);
    
    if (entry) {
      // Update access metadata
      const meta = this.cacheItemsMeta.get(cacheKey) || { 
        accessCount: 0, 
        lastAccessed: 0,
        priority: this.getItemPriority(cacheKey)
      };
      
      meta.accessCount++;
      meta.lastAccessed = Date.now();
      this.cacheItemsMeta.set(cacheKey, meta);
      
      this.hits++;
      
      // Consider auto-refreshing for dashboard routes
      if (cacheKey.includes('/dashboard') && 
          entry.lastModified && 
          (Date.now() - entry.lastModified) > 10 * ONE_MINUTE) {
        // This item is getting stale, schedule refresh in background
        this.scheduleRefresh(cacheKey, entry);
      }
      
      return entry;
    }
    
    this.misses++;
    
    // Check if we need to prune the cache
    this.pruneIfNeeded();
    
    return null;
  }

  async set(key, data) {
    // Set in cache with proper metadata
    const cacheKey = this.normalizeKey(key);
    
    // Don't cache error responses
    if (data.kind === 'ROUTE' && data.body && data.body.includes('Error')) {
      return;
    }
    
    // Add timestamp 
    data.lastModified = Date.now();
    
    this.cache.set(cacheKey, data);
    
    // Set initial metadata
    this.cacheItemsMeta.set(cacheKey, {
      accessCount: 1,
      lastAccessed: Date.now(),
      priority: this.getItemPriority(cacheKey),
      createdAt: Date.now()
    });
    
    // Prune cache if it's too large
    this.pruneIfNeeded();
    
    // Log cache stats occasionally
    if (Math.random() < 0.05) { // Log roughly 5% of the time
      this.logCacheStats();
    }
  }
  
  normalizeKey(key) {
    // Handle both string and object keys
    if (typeof key === 'string') return key;
    return JSON.stringify(key);
  }
  
  getItemPriority(key) {
    // Determine priority based on the key content
    // D3 and visualization chunks get higher priority
    const normalizedKey = typeof key === 'string' ? key : JSON.stringify(key);
    
    // Check for specific chunk types
    for (const [chunkType, priority] of Object.entries(CHUNK_PRIORITIES)) {
      if (normalizedKey.includes(chunkType)) {
        return priority;
      }
    }
    
    // Route-specific priorities
    if (normalizedKey.includes('/dashboard')) return 8;
    if (normalizedKey.includes('/api/')) return 7;
    
    return CHUNK_PRIORITIES.default;
  }
  
  pruneIfNeeded() {
    // Only prune every 30 seconds at most
    const now = Date.now();
    if (now - this.lastPruneTime < 30000 && this.cache.size < MAX_CACHE_ITEMS) {
      return;
    }
    
    // Start pruning when we hit the threshold
    if (this.cache.size > CACHE_PRUNE_THRESHOLD) {
      this.pruneCache();
      this.lastPruneTime = now;
    }
  }
  
  pruneCache() {
    // If cache isn't too large yet, don't prune
    if (this.cache.size <= CACHE_PRUNE_THRESHOLD) return;
    
    console.log(`[Cache] Pruning cache. Current size: ${this.cache.size} items`);
    
    // Calculate scores for all items (higher score = keep item)
    const scores = new Map();
    
    for (const [key, meta] of this.cacheItemsMeta.entries()) {
      if (!meta) continue;
      
      // Calculate score based on:
      // 1. Recency - More recent access gets higher score
      const recency = (Date.now() - meta.lastAccessed) / (10 * ONE_MINUTE);
      const recencyScore = Math.max(0, 10 - recency); // 0-10, higher for more recent
      
      // 2. Frequency - More accesses get higher score
      const frequencyScore = Math.min(10, meta.accessCount / 3); // 0-10, capped at 10
      
      // 3. Age - Newer items get slightly higher score
      const ageMinutes = (Date.now() - (meta.createdAt || 0)) / (1 * ONE_MINUTE);
      const ageScore = Math.max(0, 5 - (ageMinutes / 60)); // 0-5, higher for newer
      
      // 4. Priority - Based on content type
      const priorityScore = meta.priority * 2; // 0-20, based on priority
      
      // Calculate final score with weights
      const score = 
        (recencyScore * 3) + // Recency is important
        (frequencyScore * 2) + // Frequency is second
        (ageScore * 1) +       // Age is third
        (priorityScore * 4);   // Priority is most important
      
      scores.set(key, score);
    }
    
    // Sort by score (lowest first to remove)
    const sortedEntries = [...scores.entries()]
      .sort((a, b) => a[1] - b[1]);
    
    // Remove the lower 30% of items
    const itemsToRemove = Math.max(
      20, // At least 20 items
      Math.ceil(this.cache.size * 0.3) // Or 30% of current cache
    );
    
    // Remove the lowest scoring items
    let removed = 0;
    for (let i = 0; i < itemsToRemove && i < sortedEntries.length; i++) {
      const key = sortedEntries[i][0];
      this.cache.delete(key);
      this.cacheItemsMeta.delete(key);
      removed++;
    }
    
    console.log(`[Cache] Pruned ${removed} items. New size: ${this.cache.size} items`);
  }
  
  scheduleRefresh(key, entry) {
    // Simple background refresh mechanism
    setTimeout(() => {
      // We would fetch fresh data here, but since we don't have the 
      // actual fetch mechanism, we just mark the entry as refreshed
      if (this.cache.has(key)) {
        const currentEntry = this.cache.get(key);
        currentEntry.lastModified = Date.now();
        currentEntry.isRefreshed = true;
        this.cache.set(key, currentEntry);
      }
    }, 1000); // Schedule refresh after 1 second
  }
  
  logCacheStats() {
    const hitRate = this.hits + this.misses > 0 
      ? Math.round((this.hits / (this.hits + this.misses) * 100))
      : 0;
    
    console.log(`[Cache Stats] Items: ${this.cache.size}, Hits: ${this.hits}, Misses: ${this.misses}, Hit Rate: ${hitRate}%`);
  }
  
  // Handle retry logic for failed chunk loads
  recordChunkError(chunkName) {
    const retries = this.errorRetries.get(chunkName) || 0;
    this.errorRetries.set(chunkName, retries + 1);
    
    // If we've tried this chunk several times, try to clear related cache
    if (retries >= 2) {
      // Clear any cached entries that might be related to this chunk
      for (const [key] of this.cache.entries()) {
        if (key.includes(chunkName)) {
          console.log(`[Cache] Clearing problematic chunk: ${key}`);
          this.cache.delete(key);
          this.cacheItemsMeta.delete(key);
        }
      }
      
      // Reset retry counter
      this.errorRetries.delete(chunkName);
    }
  }
}; 