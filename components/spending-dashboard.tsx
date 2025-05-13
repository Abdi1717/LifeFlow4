"use client"

import { SpendingOverview } from "@/components/spending-overview"
import { CategoryBreakdown } from "@/components/category-breakdown"
import { MonthlyBreakdown } from "@/components/monthly-breakdown"
import { EnhancedMoneyFlow } from "@/components/enhanced-money-flow"

export function SpendingDashboard() {
  return (
    <div className="space-y-8">
      <SpendingOverview />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CategoryBreakdown />
        <MonthlyBreakdown />
      </div>
      
      <EnhancedMoneyFlow />
    </div>
  )
} 