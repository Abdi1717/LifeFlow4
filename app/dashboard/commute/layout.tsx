'use client'

import { ReactNode, Suspense } from 'react'
import { Loading } from '@/components/loading'
import dynamic from 'next/dynamic'

// Dynamically import the providers to reduce initial bundle size
const SeptaProvider = dynamic(() => import('@/lib/contexts/septa-context').then(mod => mod.SeptaProvider), {
  ssr: false,
  loading: () => <Loading />
})

const WeatherProvider = dynamic(() => import('@/lib/contexts/weather-context').then(mod => mod.WeatherProvider), {
  ssr: false,
  loading: () => <Loading />
})

export default function CommuteLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      {children}
    </Suspense>
  )
} 