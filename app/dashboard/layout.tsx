'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import Loading from '@/components/loading'

// Dynamic imports for context providers and layout
const TransactionProvider = dynamic(() => import('@/lib/transaction-context').then(mod => mod.TransactionProvider), {
  ssr: false,
  loading: () => <Loading />
})

const BudgetProvider = dynamic(() => import('@/lib/budget-context').then(mod => mod.BudgetProvider), {
  ssr: false,
  loading: () => <Loading />
})

const DashboardLayout = dynamic(() => import('@/components/dashboard-layout').then(mod => mod.DashboardLayout), {
  ssr: true,
  loading: () => <Loading />
})

export default function DashboardPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<Loading />}>
      <TransactionProvider>
        <BudgetProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </BudgetProvider>
      </TransactionProvider>
    </Suspense>
  )
} 