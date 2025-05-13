'use client'

import { useState, useMemo } from 'react'
import { 
  Sankey, 
  Tooltip, 
  Rectangle, 
  ResponsiveContainer, 
  Layer, 
  Text 
} from 'recharts'
import { formatCurrency } from '@/lib/format'
import { useTransactions } from '@/lib/transaction-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Color palette for nodes
const COLORS = {
  income: '#C0C0C0', // Gray for income
  budget: '#C0C0C0', // Gray for budget
  taxes: '#F9C6BB', // Peach/salmon color for taxes
  housing: '#C0C0C0', // Gray for housing
  food: '#C0C0C0', // Gray for food
  transportation: '#C0C0C0', // Gray for transportation
  otherNecessities: '#C0C0C0', // Gray for other necessities
  savings: '#A8E1D0', // Light teal/mint for savings
}

interface SankeyNode {
  name: string
  color?: string
}

interface SankeyLink {
  source: number
  target: number
  value: number
  color?: string
}

export function SankeyChart() {
  const { transactions } = useTransactions()
  const [timeRange, setTimeRange] = useState<'month' | 'all'>('month')
  
  const filteredTransactions = useMemo(() => {
    if (timeRange === 'all') {
      return transactions
    }
    
    // Filter for current month
    const now = new Date()
    return transactions.filter(t => {
      const date = new Date(t.date)
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    })
  }, [transactions, timeRange])
  
  // Prepare Sankey data
  const { nodes, links } = useMemo(() => {
    // Group income categories
    const incomeCategories = new Map<string, number>()
    
    // Group expense categories
    const expenseCategories = new Map<string, number>()
    
    // Process transactions
    filteredTransactions.forEach(transaction => {
      const category = transaction.category || 'Other'
      
      if (transaction.amount > 0) {
        // Income
        const sourceName = category === 'Salary' || category === 'Income' ? 'Wages' : 'Other'
        const current = incomeCategories.get(sourceName) || 0
        incomeCategories.set(sourceName, current + transaction.amount)
      } else if (transaction.amount < 0) {
        // Map transaction categories to our simplified model
        let targetCategory = 'Other Necessities'
        
        if (['Rent', 'Mortgage', 'Housing', 'Utilities'].includes(category)) {
          targetCategory = 'Housing'
        } else if (['Food', 'Groceries', 'Dining', 'Restaurants'].includes(category)) {
          targetCategory = 'Food'
        } else if (['Transport', 'Transportation', 'Car', 'Gas', 'Public Transit'].includes(category)) {
          targetCategory = 'Transportation'
        } else if (['Tax', 'Taxes', 'Income Tax'].includes(category)) {
          targetCategory = 'Taxes'
        } else if (['Savings', 'Investment', 'Investments'].includes(category)) {
          targetCategory = 'Savings'
        }
        
        const current = expenseCategories.get(targetCategory) || 0
        expenseCategories.set(targetCategory, current + Math.abs(transaction.amount))
      }
    })
    
    // Create nodes array
    const sourceNodes: SankeyNode[] = Array.from(incomeCategories.entries())
      .filter(([_, value]) => value > 0)
      .map(([name]) => ({ 
        name,
        color: COLORS.income
      }))
    
    const middleNode: SankeyNode = { 
      name: 'Budget',
      color: COLORS.budget
    }
    
    // Add target nodes in specific order
    const targetNodeNames = ['Taxes', 'Housing', 'Food', 'Transportation', 'Other Necessities', 'Savings']
    const targetNodes: SankeyNode[] = targetNodeNames.map(name => {
      let color
      if (name === 'Taxes') color = COLORS.taxes
      else if (name === 'Housing') color = COLORS.housing
      else if (name === 'Food') color = COLORS.food
      else if (name === 'Transportation') color = COLORS.transportation
      else if (name === 'Other Necessities') color = COLORS.otherNecessities
      else if (name === 'Savings') color = COLORS.savings
      
      return { name, color }
    })
    
    // Combine all nodes
    const nodes: SankeyNode[] = [...sourceNodes, middleNode, ...targetNodes]
    
    // Create links array
    const links: SankeyLink[] = []
    
    // Income to middle node (Budget)
    const middleIndex = sourceNodes.length
    
    sourceNodes.forEach((_, index) => {
      const [category, amount] = Array.from(incomeCategories.entries())[index]
      links.push({
        source: index,
        target: middleIndex,
        value: amount
      })
    })
    
    // Middle node (Budget) to expenses
    targetNodeNames.forEach((category, index) => {
      const amount = expenseCategories.get(category) || 0
      if (amount > 0) {
        let color
        if (category === 'Taxes') color = COLORS.taxes
        else if (category === 'Savings') color = COLORS.savings
        
        links.push({
          source: middleIndex,
          target: middleIndex + 1 + index,
          value: amount,
          color
        })
      }
    })
    
    return { nodes, links }
  }, [filteredTransactions])
  
  // Handle no data scenario
  if (links.length <= 1) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Money Flow</CardTitle>
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as 'month' | 'all')}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Current Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">
              Not enough transaction data to generate flow diagram.
              <br />
              Import more transactions with both income and expenses.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Money Flow</CardTitle>
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as 'month' | 'all')}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Current Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={{ nodes, links }}
              node={({ x, y, width, height, index, payload }) => {
                const name = payload.name
                const isMiddleNode = name === 'Budget'
                const color = payload.color || COLORS[index % Object.keys(COLORS).length]
                
                return (
                  <Layer key={`sankey-node-${index}`}>
                    <Rectangle
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={color}
                      fillOpacity={0.9}
                    />
                    <Text
                      x={x + width / 2}
                      y={y + height / 2}
                      textAnchor="middle"
                      verticalAnchor="middle"
                      style={{
                        fontSize: 14,
                        fontWeight: isMiddleNode ? 'bold' : 'normal',
                        fill: '#000',
                      }}
                    >
                      {name}
                    </Text>
                  </Layer>
                )
              }}
              link={({ sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index, payload }) => {
                const link = links[index]
                const gradientId = `linkGradient${index}`
                let fromColor, toColor
                
                if (link && link.color) {
                  fromColor = link.color
                  toColor = link.color
                } else {
                  // Default gradient
                  fromColor = "#e0e0e0"
                  toColor = "#e0e0e0"
                }
                
                return (
                  <Layer key={`sankey-link-${index}`}>
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={fromColor} stopOpacity={0.8} />
                        <stop offset="100%" stopColor={toColor} stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <path
                      d={`
                        M${sourceX},${sourceY}
                        C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
                        L${targetX},${targetY + linkWidth}
                        C${targetControlX},${targetY + linkWidth} ${sourceControlX},${sourceY + linkWidth} ${sourceX},${sourceY + linkWidth}
                        Z
                      `}
                      fill={`url(#${gradientId})`}
                      stroke="none"
                    />
                  </Layer>
                )
              }}
              margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              nodeWidth={20}
              nodePadding={50}
            >
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
              />
            </Sankey>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-xs text-muted-foreground text-center">
          This diagram visualizes how money flows from income sources through your budget to expense categories.
        </div>
      </CardContent>
    </Card>
  )
} 