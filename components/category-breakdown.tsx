'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { useTransactions } from '@/lib/transaction-context'

// Colors for the pie chart segments
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

const renderActiveShape = (props: any) => {
  const { 
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value 
  } = props;
  
  return (
    <g>
      <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={10} textAnchor="middle" fill="#999">
        {formatCurrency(value)}
      </text>
      <text x={cx} y={cy} dy={30} textAnchor="middle" fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export function CategoryBreakdown() {
  const { transactions } = useTransactions()
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
  
  // Group transactions by category and sum amounts
  const categoryMap: Record<string, number> = {}
  
  transactions.forEach(transaction => {
    if (transaction.amount < 0) { // Only consider expenses (negative amounts)
      const category = transaction.category || 'Other'
      const amount = Math.abs(transaction.amount) // Get absolute value for expenses
      
      categoryMap[category] = (categoryMap[category] || 0) + amount
    }
  })
  
  // Convert to array format for Recharts
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value
  }))
  
  // Sort by value (descending)
  categoryData.sort((a, b) => b.value - a.value)
  
  // Calculate total spent
  const totalSpent = categoryData.reduce((sum, item) => sum + item.value, 0)
  
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }
  
  const onPieLeave = () => {
    setActiveIndex(undefined)
  }
  
  // If there's no transaction data, show a placeholder
  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">
              No transaction data available. Import transactions to see your spending breakdown.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 space-y-2">
          <div className="font-medium">Top Categories</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {categoryData.slice(0, 5).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="h-3 w-3 rounded-full mr-2" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{formatCurrency(item.value)}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({Math.round((item.value / totalSpent) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 