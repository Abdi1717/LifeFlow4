'use client'

import { useMemo, useState } from 'react'
import { useTransactions } from '@/lib/transaction-context'
import { formatCurrency } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle } from 'lucide-react'
import { getCategoryGroup, getCategoryColor } from '@/lib/sankeyUtils'

type TimeRange = 'month' | 'quarter' | 'year' | 'all'

// Colors moved to sankeyUtils.ts for consistency

interface SimpleFlowDiagramProps {
  timeRange?: TimeRange;
}

export function SimpleFlowDiagram({ timeRange: externalTimeRange }: SimpleFlowDiagramProps) {
  const { transactions } = useTransactions()
  const [internalTimeRange, setInternalTimeRange] = useState<TimeRange>('month')
  const [hoveredElement, setHoveredElement] = useState<string | null>(null)
  
  // Use external timeRange if provided, otherwise use internal state
  const timeRange = externalTimeRange || internalTimeRange

  // Filter transactions based on selected time range
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return []
    }
    
    if (timeRange === 'all') {
      return transactions
    }
    
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    return transactions.filter(t => {
      const date = new Date(t.date)
      
      if (timeRange === 'month') {
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
      } else if (timeRange === 'quarter') {
        const quarter = Math.floor(currentMonth / 3)
        const transactionQuarter = Math.floor(date.getMonth() / 3)
        return transactionQuarter === quarter && date.getFullYear() === currentYear
      } else if (timeRange === 'year') {
        return date.getFullYear() === currentYear
      }
      
      return true
    })
  }, [transactions, timeRange])

  // Process data
  const {
    incomeTotal,
    incomeCategories,
    expensesTotal,
    expenseCategories,
    hasValidData
  } = useMemo(() => {
    // Initialize
    const incomeCategories = new Map<string, number>()
    const expenseCategories = new Map<string, number>()
    let incomeTotal = 0
    let expensesTotal = 0
    
    // Process transactions
    filteredTransactions.forEach(transaction => {
      const category = transaction.category || 'Other'
      
      if (transaction.amount > 0) {
        // Income
        const sourceName = getCategoryGroup(category, true)
        const current = incomeCategories.get(sourceName) || 0
        incomeCategories.set(sourceName, current + transaction.amount)
        incomeTotal += transaction.amount
      } else if (transaction.amount < 0) {
        // Expense
        const targetCategory = getCategoryGroup(category, false)
        const current = expenseCategories.get(targetCategory) || 0
        const amount = Math.abs(transaction.amount)
        expenseCategories.set(targetCategory, current + amount)
        expensesTotal += amount
      }
    })
    
    return {
      incomeTotal,
      incomeCategories,
      expensesTotal,
      expenseCategories,
      hasValidData: incomeTotal > 0 && expensesTotal > 0
    }
  }, [filteredTransactions])

  // Only show time range selector if not provided externally
  const timeRangeSelector = !externalTimeRange ? (
    <Select
      value={internalTimeRange}
      onValueChange={(value) => setInternalTimeRange(value as TimeRange)}
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Select Range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="month">Current Month</SelectItem>
        <SelectItem value="quarter">Current Quarter</SelectItem>
        <SelectItem value="year">Current Year</SelectItem>
        <SelectItem value="all">All Time</SelectItem>
      </SelectContent>
    </Select>
  ) : null;

  // Handle no data scenario
  if (!hasValidData) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Money Flow</CardTitle>
          {timeRangeSelector}
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <h5 className="font-medium text-base mb-1">No Flow Data Available</h5>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Not enough transaction data to generate the money flow diagram.
              Import more transactions with both income and expenses to see how your money flows.
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Set up dimensions
  const svgWidth = 800
  const svgHeight = 400
  const paddingX = 60
  const paddingY = 40
  
  // Column positions
  const columnWidth = 100
  const leftColumnX = paddingX
  const middleColumnX = svgWidth / 2
  const rightColumnX = svgWidth - paddingX - columnWidth
  
  // Calculate heights based on values
  const maxValue = Math.max(incomeTotal, expensesTotal)
  const maxHeight = svgHeight - 2 * paddingY
  
  // Sort and prepare income categories
  const sortedIncomeCategories = Array.from(incomeCategories.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => {
      const heightPercent = value / incomeTotal
      const height = heightPercent * maxHeight
      const y = paddingY + (index > 0 
        ? sortedIncomeCategories.slice(0, index).reduce((sum, cat) => sum + (cat.height || 0), 0) 
        : 0)
      
      return { name, value, height, y }
    })
  
  // Sort and prepare expense categories  
  const sortedExpenseCategories = Array.from(expenseCategories.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => {
      const heightPercent = value / expensesTotal
      const height = heightPercent * maxHeight
      const y = paddingY + (index > 0 
        ? sortedExpenseCategories.slice(0, index).reduce((sum, cat) => sum + (cat.height || 0), 0) 
        : 0)
      
      return { name, value, height, y }
    })
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Money Flow</CardTitle>
        {timeRangeSelector}
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-auto">
          <svg 
            width={svgWidth} 
            height={svgHeight} 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="mx-auto"
          >
            {/* Income to Budget flows */}
            {sortedIncomeCategories.map((category, i) => {
              const sourceX = leftColumnX + columnWidth
              const sourceY = category.y + category.height / 2
              const targetY = svgHeight / 2
              
              const id = `income-flow-${i}`
              const color = getCategoryColor(category.name)
              
              return (
                <g key={id}>
                  <path
                    d={`M ${sourceX} ${sourceY} C ${middleColumnX - 50} ${sourceY}, ${middleColumnX - 50} ${targetY}, ${middleColumnX} ${targetY}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={Math.max(1, category.height * 0.7)}
                    strokeOpacity={hoveredElement === id || !hoveredElement ? 0.7 : 0.3}
                    onMouseEnter={() => setHoveredElement(id)}
                    onMouseLeave={() => setHoveredElement(null)}
                  />
                  {hoveredElement === id && (
                    <text
                      x={(sourceX + middleColumnX) / 2}
                      y={(sourceY + targetY) / 2 - 10}
                      textAnchor="middle"
                      fill="black"
                      fontSize={12}
                      fontWeight="bold"
                    >
                      {formatCurrency(category.value)}
                    </text>
                  )}
                </g>
              )
            })}
            
            {/* Budget to Expenses flows */}
            {sortedExpenseCategories.map((category, i) => {
              const sourceX = middleColumnX + columnWidth
              const sourceY = svgHeight / 2
              const targetY = category.y + category.height / 2
              
              const id = `expense-flow-${i}`
              const color = getCategoryColor(category.name)
              
              return (
                <g key={id}>
                  <path
                    d={`M ${sourceX} ${sourceY} C ${rightColumnX - 50} ${sourceY}, ${rightColumnX - 50} ${targetY}, ${rightColumnX} ${targetY}`}
                    fill="none" 
                    stroke={color}
                    strokeWidth={Math.max(1, category.height * 0.7)}
                    strokeOpacity={hoveredElement === id || !hoveredElement ? 0.7 : 0.3}
                    onMouseEnter={() => setHoveredElement(id)}
                    onMouseLeave={() => setHoveredElement(null)}
                  />
                  {hoveredElement === id && (
                    <text
                      x={(sourceX + rightColumnX) / 2}
                      y={(sourceY + targetY) / 2 - 10}
                      textAnchor="middle"
                      fill="black"
                      fontSize={12}
                      fontWeight="bold"
                    >
                      {formatCurrency(category.value)}
                    </text>
                  )}
                </g>
              )
            })}
            
            {/* Income Categories */}
            {sortedIncomeCategories.map((category, i) => {
              const id = `income-${i}`
              const color = getCategoryColor(category.name)
              
              return (
                <g 
                  key={id}
                  onMouseEnter={() => setHoveredElement(id)}
                  onMouseLeave={() => setHoveredElement(null)}
                >
                  <rect
                    x={leftColumnX}
                    y={category.y}
                    width={columnWidth}
                    height={category.height}
                    fill={color}
                    fillOpacity={hoveredElement === id || !hoveredElement ? 0.9 : 0.5}
                    stroke="#555"
                    strokeWidth={0.5}
                  />
                  <text
                    x={leftColumnX + 5}
                    y={category.y + category.height / 2}
                    dominantBaseline="middle"
                    fill="black"
                    fontSize={12}
                    fontWeight={hoveredElement === id ? "bold" : "normal"}
                  >
                    {category.name}
                  </text>
                  {hoveredElement === id && (
                    <text
                      x={leftColumnX + columnWidth / 2}
                      y={category.y + category.height / 2 + 15}
                      textAnchor="middle"
                      fill="black"
                      fontSize={12}
                      fontWeight="bold"
                    >
                      {formatCurrency(category.value)}
                    </text>
                  )}
                </g>
              )
            })}
            
            {/* Budget Node */}
            <g
              onMouseEnter={() => setHoveredElement('budget')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              <rect
                x={middleColumnX}
                y={svgHeight / 2 - 40}
                width={columnWidth}
                height={80}
                fill="#5CB8B2" // Budget color
                fillOpacity={hoveredElement === 'budget' || !hoveredElement ? 0.9 : 0.5}
                stroke="#555"
                strokeWidth={0.5}
                rx={5}
                ry={5}
              />
              <text
                x={middleColumnX + columnWidth / 2}
                y={svgHeight / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="black"
                fontSize={14}
                fontWeight="bold"
              >
                Budget
              </text>
              {hoveredElement === 'budget' && (
                <text
                  x={middleColumnX + columnWidth / 2}
                  y={svgHeight / 2 + 20}
                  textAnchor="middle"
                  fill="black"
                  fontSize={12}
                  fontWeight="bold"
                >
                  {formatCurrency(incomeTotal)}
                </text>
              )}
            </g>
            
            {/* Expense Categories */}
            {sortedExpenseCategories.map((category, i) => {
              const id = `expense-${i}`
              const color = getCategoryColor(category.name)
              
              return (
                <g 
                  key={id}
                  onMouseEnter={() => setHoveredElement(id)}
                  onMouseLeave={() => setHoveredElement(null)}
                >
                  <rect
                    x={rightColumnX}
                    y={category.y}
                    width={columnWidth}
                    height={category.height}
                    fill={color}
                    fillOpacity={hoveredElement === id || !hoveredElement ? 0.9 : 0.5}
                    stroke="#555"
                    strokeWidth={0.5}
                  />
                  <text
                    x={rightColumnX + columnWidth - 5}
                    y={category.y + category.height / 2}
                    dominantBaseline="middle"
                    textAnchor="end"
                    fill="black"
                    fontSize={12}
                    fontWeight={hoveredElement === id ? "bold" : "normal"}
                  >
                    {category.name}
                  </text>
                  {hoveredElement === id && (
                    <text
                      x={rightColumnX + columnWidth / 2}
                      y={category.y + category.height / 2 + 15}
                      textAnchor="middle"
                      fill="black"
                      fontSize={12}
                      fontWeight="bold"
                    >
                      {formatCurrency(category.value)}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>
        <div className="mt-4 text-xs text-muted-foreground text-center">
          This diagram visualizes how money flows from income sources through your budget to expense categories.
          Hover over elements to see details.
        </div>
      </CardContent>
    </Card>
  )
}