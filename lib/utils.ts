import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ComponentType, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Loading from '@/components/loading';
import React from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a dynamically imported component with a loading state
 * @param importFn - The import function that returns the component
 * @param options - Options for the dynamic import
 * @returns The dynamically imported component
 */
export function lazyImport<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T } | { [key: string]: T }>,
  options: {
    ssr?: boolean;
    loading?: ReactNode;
    displayName?: string;
  } = {}
) {
  const {
    ssr = true,
    loading = null,
    displayName = 'LazyComponent',
  } = options;

  const loadingComponent = loading || React.createElement(Loading);

  const LazyComponent = dynamic(importFn, {
    ssr,
    loading: () => React.createElement(React.Fragment, null, loadingComponent),
  });

  // Set the display name for debugging
  LazyComponent.displayName = displayName;

  return LazyComponent;
}
