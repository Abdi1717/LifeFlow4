'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useTransactions } from '@/lib/transaction-context'

// Colors for the chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

export function MonthlyBreakdown() {
  const { transactions, categories } = useTransactions()
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  
  // Get month name
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'long' })
  
  // Filter transactions for the current month
  const filteredTransactions = transactions.filter(transaction => {
    const date = new Date(transaction.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear && transaction.amount < 0
  })
  
  // Group by category
  const categoryMap: Record<string, number> = {}
  
  filteredTransactions.forEach(transaction => {
    const category = transaction.category || 'Other'
    const amount = Math.abs(transaction.amount)
    categoryMap[category] = (categoryMap[category] || 0) + amount
  })
  
  // Convert to chart data format
  const chartData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
  
  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }
  
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }
  
  // If there's no transaction data for this month, show a placeholder
  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Monthly Breakdown</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <span className="font-medium">{monthName} {currentYear}</span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">
              No transaction data available for {monthName} {currentYear}.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Monthly Breakdown</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="font-medium">{monthName} {currentYear}</span>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} horizontal={true} vertical={false} />
              <XAxis type="number" tickFormatter={(value) => `$${value}`} />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 