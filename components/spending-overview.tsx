'use client'

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { ArrowUpIcon, ArrowDownIcon, DollarSignIcon, TrendingDownIcon, TrendingUpIcon, TriangleIcon } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { SpendingChart } from './spending-chart'
import { useTransactions } from '@/lib/transaction-context'

export function SpendingOverview() {
  const { transactions } = useTransactions()
  
  // Calculate total spending (for expenses, which are negative amounts)
  const totalSpending = transactions
    .filter(transaction => transaction.amount < 0)
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
  
  // Calculate total income (positive amounts)
  const totalIncome = transactions
    .filter(transaction => transaction.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  
  // Get transactions for current month
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  const currentMonthTransactions = transactions.filter(transaction => {
    const date = new Date(transaction.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })
  
  // Calculate current month expenses
  const currentMonthSpending = currentMonthTransactions
    .filter(transaction => transaction.amount < 0)
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
  
  // Calculate current month income
  const currentMonthIncome = currentMonthTransactions
    .filter(transaction => transaction.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0)
  
  // Get last month's data
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
  
  const lastMonthTransactions = transactions.filter(transaction => {
    const date = new Date(transaction.date)
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
  })
  
  // Calculate last month expenses
  const lastMonthSpending = lastMonthTransactions
    .filter(transaction => transaction.amount < 0)
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
  
  // Calculate spending trend (percentage change from last month)
  const spendingTrend = lastMonthSpending === 0 
    ? 0 
    : ((currentMonthSpending - lastMonthSpending) / lastMonthSpending) * 100
  
  // Get 5 most recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
  
  // Format month name
  const monthName = currentDate.toLocaleString('default', { month: 'long' })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
          <div className="absolute right-2 top-2 w-12 h-12 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-inner">
            <DollarSignIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Spending
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
              {formatCurrency(totalSpending)}
            </div>
            <div className="flex items-center mt-1">
              <TriangleIcon className="h-3 w-3 mr-1 text-slate-500 dark:text-slate-400" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lifetime total expenses
              </p>
            </div>
          </CardContent>
          <div className="h-1 w-full bg-gradient-to-r from-red-400 to-rose-600" />
        </Card>
        
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
          <div className="absolute right-2 top-2 w-12 h-12 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-inner">
            <ArrowDownIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {monthName} Spending
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
              {formatCurrency(currentMonthSpending)}
            </div>
            {spendingTrend !== 0 && (
              <div className="flex items-center mt-1">
                {spendingTrend > 0 ? (
                  <>
                    <TrendingUpIcon className="h-4 w-4 mr-1 text-red-500" />
                    <span className="text-xs font-medium text-red-500 mr-1">
                      {Math.abs(spendingTrend).toFixed(1)}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDownIcon className="h-4 w-4 mr-1 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-500 mr-1">
                      {Math.abs(spendingTrend).toFixed(1)}%
                    </span>
                  </>
                )}
                <span className="text-xs text-slate-500 dark:text-slate-400">vs last month</span>
              </div>
            )}
          </CardContent>
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-600" />
        </Card>
        
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
          <div className="absolute right-2 top-2 w-12 h-12 rounded-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-inner">
            <ArrowUpIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {monthName} Income
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
              {formatCurrency(currentMonthIncome)}
            </div>
            <div className="flex items-center mt-1">
              <TriangleIcon className="h-3 w-3 mr-1 text-slate-500 dark:text-slate-400" />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Net Income this month
              </p>
            </div>
          </CardContent>
          <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-green-600" />
        </Card>
      </div>
      
      <Card className="col-span-3 border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
        <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="text-lg">Spending Trends</CardTitle>
          <CardDescription>
            Your spending and income over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <SpendingChart />
          </div>
        </CardContent>
      </Card>
      
      {recentTransactions.length > 0 && (
        <Card className="border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${transaction.amount < 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">{transaction.description}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(transaction.date).toLocaleDateString()} • {transaction.category || 'Uncategorized'}
                      </div>
                    </div>
                  </div>
                  <div className={`font-medium ${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 