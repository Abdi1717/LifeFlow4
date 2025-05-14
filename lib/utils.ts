import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ComponentType, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Loading from '@/components/loading';
import React from 'react';
import { lazy, createElement, Suspense } from "react";
import type { LazyExoticComponent } from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ImportedModule<T = any> {
  default: T;
  [key: string]: any;
}

interface LazyImportOptions {
  displayName?: string;
  ssr?: boolean;
  loading?: React.ReactNode;
  errorFallback?: React.ReactNode;
  prefetch?: boolean;
}

/**
 * Enhanced lazy import utility with support for named exports, SSR, loading indicators, and module prefetching
 * 
 * @param factory - A function that returns a dynamic import
 * @param options - Configuration options for the lazy component
 * @returns A React component that renders the lazy loaded component
 */
export function lazyImport<T extends ComponentType<any>>(
  factory: () => Promise<ImportedModule<T>>,
  options: LazyImportOptions = {}
) {
  const {
    displayName,
    ssr = true,
    loading = null,
    errorFallback = null,
    prefetch = false
  } = options;

  // Create a lazy component from the factory
  const LazyComponent = lazy(factory);

  // Prefetch the module if requested (executed when this function is called)
  if (prefetch && typeof window !== 'undefined') {
    const prefetchModule = () => {
      try {
        // Don't await to avoid blocking, just trigger the fetch
        factory();
      } catch (err) {
        // Silent error in prefetch
        console.debug('Module prefetch failed:', err);
      }
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(prefetchModule, { timeout: 2000 });
    } else {
      setTimeout(prefetchModule, 1000);
    }
  }

  // Create a wrapper component that handles suspense and errors
  const Component = (props: React.ComponentProps<T>) => {
    return createElement(
      Suspense,
      { fallback: loading },
      createElement(LazyComponent, props)
    );
  };

  // Set the display name for the component
  if (displayName) {
    Component.displayName = displayName;
  }

  return Component;
}

// Create prefetch functions for critical modules
export const prefetchDashboardModules = () => {
  if (typeof window === 'undefined') return;

  // Prefetch critical dashboard modules
  const modules = [
    () => import('@/components/spending-dashboard').then(mod => ({ default: mod.SpendingDashboard })),
    () => import('@/components/transaction-list').then(mod => ({ default: mod.TransactionList })),
    () => import('@/components/budget-dashboard').then(mod => ({ default: mod.BudgetDashboard }))
  ];

  const prefetchModule = (factory) => {
    try {
      factory();
    } catch (err) {
      // Silent fail on prefetch
    }
  };

  // Use requestIdleCallback for non-blocking prefetching
  if ('requestIdleCallback' in window) {
    modules.forEach(factory => {
      window.requestIdleCallback(() => prefetchModule(factory), { timeout: 2000 });
    });
  } else {
    // Fallback to setTimeout
    modules.forEach((factory, index) => {
      setTimeout(() => prefetchModule(factory), 1000 + (index * 300));
    });
  }
};
