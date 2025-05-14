'use client'

import dynamic from 'next/dynamic'
import { Suspense, memo, useEffect, useState } from 'react'
import Loading from '@/components/loading'
import { lazyImport } from '@/lib/utils'

// Load only the providers needed for the current page
// Load common providers aggressively, page-specific ones lazily
const TransactionProvider = lazyImport(
  () => import('@/lib/transaction-context').then(mod => ({ default: mod.TransactionProvider })),
  { ssr: false, loading: null, displayName: 'TransactionProvider' }
)

const BudgetProvider = lazyImport(
  () => import('@/lib/budget-context').then(mod => ({ default: mod.BudgetProvider })),
  { ssr: false, loading: null, displayName: 'BudgetProvider' }
)

// These providers will be loaded only when their pages are accessed
const RadarProvider = lazyImport(
  () => import('@/lib/contexts/radar-context').then(mod => ({ default: mod.RadarProvider })),
  { ssr: false, loading: null, displayName: 'RadarProvider' }
)

const SeptaProvider = lazyImport(
  () => import('@/lib/contexts/septa-context').then(mod => ({ default: mod.SeptaProvider })),
  { ssr: false, loading: null, displayName: 'SeptaProvider' }
)

const WeatherProvider = lazyImport(
  () => import('@/lib/contexts/weather-context').then(mod => ({ default: mod.WeatherProvider })),
  { ssr: false, loading: null, displayName: 'WeatherProvider' }
)

// Dashboard layout with optimized dynamic import
const DashboardLayoutComponent = lazyImport(
  () => import('@/components/dashboard-layout').then(mod => ({ default: mod.DashboardLayout })),
  { ssr: true, loading: null, displayName: 'DashboardLayout' }
)

// Use a context-aware provider wrapper
const ContextProviders = ({ children, pathname }) => {
  // Only load providers needed for specific routes
  const showRadar = pathname?.includes('/radar');
  const showCommute = pathname?.includes('/commute');
  
  return (
    <TransactionProvider>
      <BudgetProvider>
        {showRadar ? (
          <RadarProvider>{children}</RadarProvider>
        ) : showCommute ? (
          <SeptaProvider>
            <WeatherProvider>{children}</WeatherProvider>
          </SeptaProvider>
        ) : (
          children
        )}
      </BudgetProvider>
    </TransactionProvider>
  );
};

// Efficient prefetching system
function useDeferredPrefetch(routes) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Wait until the page is fully loaded and idle
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => {
        routes.forEach(route => {
          const prefetcher = document.createElement('link');
          prefetcher.rel = 'prefetch';
          prefetcher.href = route;
          prefetcher.as = 'document';
          document.head.appendChild(prefetcher);
        });
      }, { timeout: 2000 });
      
      return () => window.cancelIdleCallback(id);
    } else {
      // Fallback for browsers without requestIdleCallback
      const timer = setTimeout(() => {
        routes.forEach(route => {
          const prefetcher = document.createElement('link');
          prefetcher.rel = 'prefetch';
          prefetcher.href = route;
          document.head.appendChild(prefetcher);
        });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [routes]);
}

export default function DashboardPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [pathname, setPathname] = useState('');
  
  // Set pathname after mount to enable route-specific loading
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);
  
  // Defer prefetching until the page is idle
  useDeferredPrefetch([
    '/dashboard/radar',
    '/dashboard/commute',
    '/dashboard/tasks',
    '/dashboard/notes',
    '/dashboard/network'
  ]);

  // Show simplified loading state during initial load
  return pathname ? (
    <Suspense fallback={<Loading text="Loading dashboard..." />}>
      <ContextProviders pathname={pathname}>
        <DashboardLayoutComponent>{children}</DashboardLayoutComponent>
      </ContextProviders>
    </Suspense>
  ) : (
    <Loading text="Initializing dashboard..." />
  );
} 