# LifeFlow4 - Personal Dashboard

A modern, responsive personal dashboard application built with Next.js, React, Tailwind CSS, and ShadCN UI.

## Performance Optimizations

This application includes several performance optimizations to improve development and production efficiency:

### Development Mode

For faster development experience, use the optimized dev script:

```bash
npm run dev:fast
```

This script skips type checking, font optimization, and source maps generation, significantly reducing compilation times.

### Key Optimizations

1. **Code Splitting**:
   - All major components and providers use dynamic imports with consistent loading patterns
   - Route-based code splitting ensures minimal initial payload

2. **Lazy Loading & Context Providers**:
   - Context providers are only loaded when needed by specific routes
   - The `lazyImport` utility in `lib/utils.ts` standardizes dynamic imports

3. **Configuration Optimizations**:
   - Removed unsupported/deprecated experimental features from `next.config.js`
   - Optimized `tsconfig.json` with performance-focused watch options
   - Added `.npmrc` with development performance settings

4. **Asset Optimization**:
   - Image optimization configured with WebP and AVIF support
   - Proper image sizes and caching configurations

5. **Advanced Prefetching**:
   - Intelligent route prefetching using `requestIdleCallback` 
   - Deferred loading of non-essential resources

## Common Issues & Troubleshooting

- If you experience strange compilation errors, try clearing the `.next` directory:
  ```bash
  rm -rf .next
  ```

- Watch for "deoptimised the styling" warnings in large dependencies - these are normal and can be ignored

- For the full development experience with type checking, use:
  ```bash
  npm run dev
  ```

## Components

The application uses ShadCN UI components, documented in `ShadCN-context.md`.

## Project Structure

```
LifeFlow4/
├── app/                  # Next.js App Router pages
│   ├── api/              # API routes
│   └── dashboard/        # Dashboard pages
├── components/           # React components
│   ├── ui/               # ShadCN UI components
│   └── ...               # Custom components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and contexts
│   ├── utils.ts          # Utility functions incl. lazyImport
│   ├── contexts/         # React contexts
│   └── cache-handler.js  # Custom cache handler
├── public/               # Static assets
└── styles/               # Global styles
```

## Performance Best Practices

For full performance optimization guidelines, see the `.cursor/rules/performance_optimization.mdc` file.