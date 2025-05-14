# D3 Chunk Loading Error Fix

This document explains the ChunkLoadError issue with d3-sankey and related visualization libraries, along with implementation details for the fix.

## Problem Description

The application was experiencing the following error:

```
Unhandled Runtime Error
ChunkLoadError: Loading chunk defaultVendors-_app-pages-browser_node_modules_d3-sankey_src_index_js-_app-pages-browser_node-1f0c75 failed.
(timeout: http://localhost:3000/_next/static/chunks/defaultVendors-_app-pages-browser_node_modules_d3-sankey_src_index_js-_app-pages-browser_node-1f0c75.js)
```

This error occurs because:

1. D3 library modules (especially d3-sankey) are being bundled into excessively large chunks
2. The default chunk loading timeout (120 seconds) is insufficient for these large chunks
3. Next.js is struggling with the cache configuration due to non-absolute paths

## Solution Components

We implemented a multi-faceted solution:

### 1. Fixed Webpack Configuration

In `next.config.js`, we made several key changes:

- **Absolute Path for Cache Directory**: Changed relative paths to absolute paths using `path.resolve()`
- **Increased Chunk Loading Timeout**: Set `config.output.chunkLoadTimeout = 60000` (60 seconds)
- **Optimized Chunk Splitting Strategy**:
  - Separated d3 libraries into their own chunk with highest priority 
  - Created a dedicated cache group for d3 libraries
  - Increased `maxInitialRequests` and `maxAsyncRequests` limits
  - Set appropriate `minSize` and `maxSize` for chunks

### 2. Enhanced Cache Handler

Created a custom cache handler (`lib/cache-handler.js`) that:

- Prioritizes visualization chunks to prevent eviction
- Implements intelligent cache pruning based on access frequency and priority
- Provides logging and error tracking for problematic chunks
- Handles retry logic for failed chunk loads

### 3. Cleanup Scripts

Added two utility scripts:

#### a. Fix D3 Chunks Script (`scripts/fix-d3-chunks.js`)

A targeted script that:
- Identifies and removes problematic D3-related chunks
- Cleans specific cache files related to visualizations
- Provides next steps for users after cleanup

#### b. Enhanced Cache Cleaning Script (`scripts/clean-next-cache.sh`)

A comprehensive cleaning script with multiple modes:
- `--light`: Minimal cleanup of webpack cache and problematic chunks
- `--medium`: Standard cleaning of cache directories
- `--full`: Complete removal of .next directory
- `--deep`: Full cleanup including node_modules/.cache

### 4. New NPM Commands

Added convenient npm scripts in `package.json`:

```json
"fix:chunks": "node scripts/fix-d3-chunks.js",
"dev:fixed": "npm run fix:chunks && npm run dev:fast"
```

## How to Use

If you encounter the ChunkLoadError:

1. **Quick Fix**: Run the targeted fix script:
   ```
   npm run fix:chunks
   ```

2. **Start with Clean Slate**: Run the development server with all optimizations:
   ```
   npm run dev:fixed
   ```

3. **For Persistent Issues**: Try a deep clean and reinstall:
   ```
   npm run clean:deep
   npm install
   npm run dev:fast
   ```

## Technical Details

### Why D3 Libraries Cause Trouble

D3 (Data-Driven Documents) libraries are particularly challenging because:

1. They're often large and complex (d3-sankey can be >200KB uncompressed)
2. They have many internal dependencies between d3 submodules
3. Tree-shaking is difficult due to their design and interconnected nature
4. They rely on complex calculations that can strain the browser during initialization

### Webpack Chunk Optimization

Our chunk splitting strategy prioritizes:

```javascript
cacheGroups: {
  // Handle d3 libraries separately to prevent loading timeout
  d3: {
    test: /[\\/]node_modules[\\/]d3(?:-.*)?[\\/]/,
    name: 'd3-libs',
    priority: 30,
    enforce: true,
    reuseExistingChunk: true,
  },
  // Other visualization libraries get grouped separately
  visualizations: {
    test: /[\\/]node_modules[\\/](three|recharts|chart\.js|react-force-graph)[\\/]/,
    name: 'visualizations',
    priority: 20,
    enforce: true,
    reuseExistingChunk: true,
  },
  // ... other groups
}
```

### Cache Handling Strategy

The cache handler includes:

1. **Prioritization**: Each cached item receives a priority score
2. **Pruning Algorithm**: When the cache exceeds thresholds, items are removed based on:
   - Recency (when last accessed)
   - Frequency (how often accessed)
   - Priority (importance of content type)
   - Age (how long in cache)
3. **Error Recovery**: Logic to detect and handle chunk loading failures

## Monitoring and Verification

After implementing these changes, monitor for:

1. Successful loading of visualization components
2. Cache hit rates in the console logs
3. Improved build and load times

If issues persist, check the browser network tab for:
- Failed chunk requests
- Request timeouts
- Excessive chunk sizes

## Prevention for Future Development

When working with D3 and other visualization libraries:

1. Import only the specific modules needed, not the entire D3 library
2. Consider using lightweight alternatives where possible
3. Implement code-splitting at the component level for visualization components
4. Use Next.js dynamic imports with the `loading` property for better user experience

## References

- [Next.js Webpack Configuration](https://nextjs.org/docs/api-reference/next.config.js/custom-webpack-config)
- [D3.js Official Documentation](https://d3js.org/)
- [Webpack Chunk Loading](https://webpack.js.org/guides/code-splitting/)
- [Next.js Cache Optimization](https://nextjs.org/docs/api-reference/next.config.js/configuring-onDemandEntries) 