"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactions, Transaction } from "@/lib/transaction-context"
import { BarChart3, Wallet, Receipt, CreditCard } from "lucide-react"
import { lazyImport, prefetchDashboardModules } from "@/lib/utils"
import { Suspense } from "react"
import Loading from "@/components/loading"

// Lazy load heavy components with prefetching
const SpendingDashboard = lazyImport(() => import('@/components/spending-dashboard').then(mod => ({ default: mod.SpendingDashboard })), {
  displayName: 'SpendingDashboard',
  ssr: false,
  loading: <Loading text="Loading spending dashboard..." />,
  prefetch: true
})

const CSVFileUploader = lazyImport(() => import('@/components/csv-file-uploader').then(mod => ({ default: mod.CSVFileUploader })), {
  displayName: 'CSVFileUploader',
  ssr: false,
})

const TransactionList = lazyImport(() => import('@/components/transaction-list').then(mod => ({ default: mod.TransactionList })), {
  displayName: 'TransactionList',
  ssr: false,
  loading: <Loading text="Loading transactions..." />,
  prefetch: true
})

const BudgetDashboard = lazyImport(() => import('@/components/budget-dashboard').then(mod => ({ default: mod.BudgetDashboard })), {
  displayName: 'BudgetDashboard',
  ssr: false,
  loading: <Loading text="Loading budget dashboard..." />,
  prefetch: true
})

function FinanceDashboardContent() {
  const { addTransactions, categories } = useTransactions()
  
  // Prefetch other modules when component is mounted
  useEffect(() => {
    prefetchDashboardModules()
  }, [])
  
  const handleFileLoad = (data: any[]) => {
    // Map CSV data to Transaction format
    const transactions: Transaction[] = data.map(item => {
      // Try to find the date, amount, and description fields accounting for different column names
      const dateField = item.date || item.Date || item.DATE || item.transaction_date || ""
      const amountField = 
        item.amount || 
        item.Amount || 
        item.AMOUNT || 
        item.transaction_amount || 
        "0"
      const descriptionField = 
        item.description || 
        item.Description || 
        item.DESC || 
        item.desc || 
        item.merchant || 
        item.memo || 
        ""
      
      // Extract category from CSV if available
      const categoryField = 
        item.category || 
        item.Category || 
        item.CATEGORY || 
        item.categories || 
        item.Categories || 
        ""
      
      // Parse amount and handle different formats
      let parsedAmount = 0
      if (typeof amountField === 'string') {
        // Remove any currency symbols and commas
        const cleanAmount = amountField.replace(/[$,]/g, '')
        parsedAmount = parseFloat(cleanAmount)
      } else if (typeof amountField === 'number') {
        parsedAmount = amountField
      }
      
      // Find a matching category in our known categories, or use the original if valid
      let assignedCategory = "Other"
      
      if (categoryField) {
        // First check if category from CSV exactly matches a known category
        const exactMatch = categories.find(cat => 
          cat.toLowerCase() === categoryField.toLowerCase()
        )
        
        if (exactMatch) {
          assignedCategory = exactMatch
        } else {
          // Then check for partial matches in known categories
          const partialMatch = categories.find(cat => 
            categoryField.toLowerCase().includes(cat.toLowerCase()) || 
            cat.toLowerCase().includes(categoryField.toLowerCase())
          )
          
          if (partialMatch) {
            assignedCategory = partialMatch
          } else {
            // If no match found, use the original category from CSV
            assignedCategory = categoryField
          }
        }
      }
      
      return {
        id: uuidv4(),
        date: dateField,
        amount: parsedAmount,
        description: descriptionField,
        category: assignedCategory,
        account: item.account || item.Account || ""
      }
    })
    
    // Add transactions to context
    addTransactions(transactions)
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400">Finance Dashboard</h1>
        <div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700">
          <Wallet className="h-6 w-6 text-slate-600 dark:text-slate-300" />
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto mb-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <TabsTrigger value="overview" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow">
            <Receipt className="h-4 w-4" />
            <span>Transactions</span>
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow">
            <Wallet className="h-4 w-4" />
            <span>Budget</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow">
            <CreditCard className="h-4 w-4" />
            <span>Payments</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                Spending Overview
              </CardTitle>
              <CardDescription>
                Visualize your spending and income across all accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <SpendingDashboard />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <Card className="border-slate-200 dark:border-slate-700 shadow-md h-full">
                <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Receipt className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    Import Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <CSVFileUploader onFileLoad={handleFileLoad} />
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-3">
              <Card className="border-slate-200 dark:border-slate-700 shadow-md">
                <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Receipt className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    Transactions
                  </CardTitle>
                  <CardDescription>
                    View and categorize your transactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <TransactionList />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="budget" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-700 shadow-md">
            <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Wallet className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                Budget Management
              </CardTitle>
              <CardDescription>
                Create and manage your budget categories
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <BudgetDashboard />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-700 shadow-md">
            <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CreditCard className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                Payments & Transfers
              </CardTitle>
              <CardDescription>
                Schedule payments and transfer funds between accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-6">
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300">Coming Soon</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                  Payment and transfer features are currently in development.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function Dashboard() {
  return (
    <div className="px-4 py-6 md:px-6 md:py-8 lg:py-10 max-w-7xl mx-auto">
      <FinanceDashboardContent />
    </div>
  );
} 