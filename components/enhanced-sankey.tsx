'use client'

import React, { useState, useMemo } from 'react'
import { Sankey, SankeyLink } from '@visx/sankey'
import { LinearGradient } from '@visx/gradient'
import { ParentSize } from '@visx/responsive'
import { sankeyCenter, sankeyLinkHorizontal } from 'd3-sankey'
import { useTransactions } from '@/lib/transaction-context'
import { formatCurrency } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TooltipWithBounds, useTooltip } from '@visx/tooltip'
import { AlertCircle } from 'lucide-react'

// Create fallback Alert components in case ShadCN components aren't available
const FallbackAlert: React.FC<React.HTMLAttributes<HTMLDivElement> & { variant?: string }> = ({ 
  className, 
  children, 
  ...props 
}) => (
  <div className={`p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg ${className || ''}`} {...props}>
    {children}
  </div>
)

const FallbackAlertTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ 
  className, 
  children, 
  ...props 
}) => (
  <h5 className={`font-medium text-base mb-1 flex items-center gap-2 ${className || ''}`} {...props}>
    {children}
  </h5>
)

const FallbackAlertDescription: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  children, 
  ...props 
}) => (
  <div className={`text-sm text-slate-600 dark:text-slate-400 ${className || ''}`} {...props}>
    {children}
  </div>
)

// Use fallback components to guarantee we have Alert components available
// This avoids the import errors
const Alert = FallbackAlert;
const AlertTitle = FallbackAlertTitle;
const AlertDescription = FallbackAlertDescription;

// Color palette for nodes
const COLORS = {
  income: '#7CC7E8', // Light blue for income
  budget: '#5CB8B2', // Teal for budget
  taxes: '#F9C6BB', // Peach/salmon for taxes
  housing: '#D8BFD8', // Light purple for housing
  food: '#ADD8E6', // Light blue for food
  transportation: '#FFA07A', // Light salmon for transportation
  otherNecessities: '#FFFFE0', // Light yellow for other necessities
  entertainment: '#FFD580', // Light orange for entertainment
  shopping: '#E6E6FA', // Lavender for shopping
  healthcare: '#98FB98', // Pale green for healthcare
  savings: '#A8E1D0', // Light teal/mint for savings
  default: '#E8E8E8' // Default color
}

// Category mapping for smart grouping
const CATEGORY_MAPPING = {
  // Income categories
  income: ['Income', 'Salary', 'Wages', 'Bonus', 'Interest', 'Dividend', 'Gift', 'Refund', 'Cashback'],
  
  // Expense categories
  housing: ['Rent', 'Mortgage', 'Housing', 'Utilities', 'Electric', 'Water', 'Gas', 'Internet', 'Cable', 'Home Repair', 'Property Tax', 'Home Insurance'],
  food: ['Food', 'Groceries', 'Dining', 'Restaurants', 'Coffee', 'Takeout', 'Fast Food', 'Meal Delivery'],
  transportation: ['Transport', 'Transportation', 'Car', 'Gas', 'Public Transit', 'Uber', 'Lyft', 'Taxi', 'Parking', 'Auto Insurance', 'Car Repair', 'Car Payment'],
  taxes: ['Tax', 'Taxes', 'Income Tax', 'Sales Tax', 'Property Tax'],
  healthcare: ['Health', 'Healthcare', 'Medical', 'Doctor', 'Dentist', 'Pharmacy', 'Health Insurance', 'Gym', 'Fitness'],
  entertainment: ['Entertainment', 'Movies', 'Music', 'Concerts', 'Streaming', 'Subscription', 'Netflix', 'Spotify', 'Amazon Prime'],
  shopping: ['Shopping', 'Clothing', 'Electronics', 'Amazon', 'Online Shopping', 'Retail'],
  savings: ['Savings', 'Investment', 'Investments', '401k', 'IRA', 'Retirement', 'Emergency Fund'],
}

// Generate unique ID for gradient
const genSankeyGradientId = (index: number) => `sankey-gradient-${index}`

type TimeRange = 'month' | 'quarter' | 'year' | 'all'

interface SankeyNode {
  name: string;
  category: string;
  color: string;
  id: string;
  index?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  value?: number;
}

interface SankeyData {
  nodes: SankeyNode[];
  links: {
    source: number;
    target: number;
    value: number;
    color?: string;
  }[];
}

export function EnhancedSankey() {
  const { transactions } = useTransactions()
  const [timeRange, setTimeRange] = useState<TimeRange>('month')
  
  // Setup tooltip
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip()

  // Helper function to determine category group
  const getCategoryGroup = (category: string, isIncome: boolean): string => {
    if (isIncome) {
      if (CATEGORY_MAPPING.income.some(c => category.toLowerCase().includes(c.toLowerCase()))) {
        return 'Wages & Salary'
      }
      return 'Other Income'
    }
    
    // For expenses
    for (const [group, categories] of Object.entries(CATEGORY_MAPPING)) {
      if (group === 'income') continue // Skip income mapping for expenses
      if (categories.some(c => category.toLowerCase().includes(c.toLowerCase()))) {
        return group.charAt(0).toUpperCase() + group.slice(1)
      }
    }
    
    return 'Other Expenses'
  }

  // Filter transactions based on selected time range
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
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
  
  // Prepare Sankey data structure
  const sankeyData = useMemo((): SankeyData => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      return { nodes: [], links: [] };
    }
    
    try {
      // Group income categories
      const incomeCategories = new Map<string, number>()
      
      // Group expense categories
      const expenseCategories = new Map<string, number>()
      
      // Process transactions
      filteredTransactions.forEach(transaction => {
        const category = transaction.category || 'Other'
        
        if (transaction.amount > 0) {
          // Income
          const sourceName = getCategoryGroup(category, true)
          const current = incomeCategories.get(sourceName) || 0
          incomeCategories.set(sourceName, current + transaction.amount)
        } else if (transaction.amount < 0) {
          // Expense
          const targetCategory = getCategoryGroup(category, false)
          const current = expenseCategories.get(targetCategory) || 0
          expenseCategories.set(targetCategory, current + Math.abs(transaction.amount))
        }
      })
      
      // Ensure we have at least one income and one expense
      if (incomeCategories.size === 0 || expenseCategories.size === 0) {
        return { nodes: [], links: [] };
      }
      
      // Create nodes array
      const nodes: SankeyNode[] = []
      
      // Add income nodes
      Array.from(incomeCategories.entries())
        .filter(([_, value]) => value > 0)
        .forEach(([name], index) => {
          nodes.push({ 
            name,
            category: 'income',
            color: COLORS.income,
            id: `income-${index}`
          })
        })
      
      // Add central Budget node
      nodes.push({ 
        name: 'Budget',
        category: 'budget',
        color: COLORS.budget,
        id: 'budget'
      })
      
      // Add expense nodes
      Array.from(expenseCategories.entries())
        .filter(([_, value]) => value > 0)
        .forEach(([name, _], index) => {
          let color = COLORS.default
          const lowerName = name.toLowerCase()
          
          if (lowerName.includes('tax')) color = COLORS.taxes
          else if (lowerName.includes('housing')) color = COLORS.housing
          else if (lowerName.includes('food')) color = COLORS.food
          else if (lowerName.includes('transport')) color = COLORS.transportation
          else if (lowerName.includes('healthcare')) color = COLORS.healthcare
          else if (lowerName.includes('entertainment')) color = COLORS.entertainment
          else if (lowerName.includes('shopping')) color = COLORS.shopping
          else if (lowerName.includes('savings')) color = COLORS.savings
          else if (lowerName.includes('other')) color = COLORS.otherNecessities
          
          nodes.push({ 
            name, 
            category: lowerName.replace(' ', ''),
            color,
            id: `expense-${index}`
          })
        })
      
      if (nodes.length < 3) {
        // We need at least income node + budget node + expense node
        return { nodes: [], links: [] };
      }
      
      // Create links array
      const links: any[] = []
      
      // Income to middle node (Budget)
      const budgetIndex = nodes.findIndex(n => n.name === 'Budget')
      
      if (budgetIndex === -1 || nodes.length < 2) {
        return { nodes: [], links: [] }
      }
      
      let i = 0
      Array.from(incomeCategories.entries()).forEach(([category, amount]) => {
        if (amount > 0) {
          links.push({
            source: i,
            target: budgetIndex,
            value: amount,
            color: COLORS.income
          })
          i++
        }
      })
      
      // Middle node (Budget) to expenses
      Array.from(expenseCategories.entries()).forEach(([category, amount], index) => {
        if (amount > 0) {
          const targetIndex = budgetIndex + 1 + index
          if (targetIndex < nodes.length) {
            const lowerCategory = category.toLowerCase()
            let color = COLORS.default
            
            if (lowerCategory.includes('tax')) color = COLORS.taxes
            else if (lowerCategory.includes('housing')) color = COLORS.housing
            else if (lowerCategory.includes('food')) color = COLORS.food
            else if (lowerCategory.includes('transport')) color = COLORS.transportation
            else if (lowerCategory.includes('healthcare')) color = COLORS.healthcare
            else if (lowerCategory.includes('entertainment')) color = COLORS.entertainment
            else if (lowerCategory.includes('shopping')) color = COLORS.shopping
            else if (lowerCategory.includes('savings')) color = COLORS.savings
            else if (lowerCategory.includes('other')) color = COLORS.otherNecessities
            
            links.push({
              source: budgetIndex,
              target: targetIndex,
              value: amount,
              color
            })
          }
        }
      })
      
      return { nodes, links }
    } catch (error) {
      console.error('Error generating Sankey data:', error);
      return { nodes: [], links: [] };
    }
  }, [filteredTransactions])
  
  // Format data for d3-sankey with error handling
  const sankeyProcessedData = useMemo(() => {
    if (!sankeyData || !sankeyData.nodes || !sankeyData.links || 
        sankeyData.nodes.length === 0 || sankeyData.links.length === 0) {
      return { nodes: [], links: [] };
    }
    
    try {
      return {
        nodes: sankeyData.nodes.map((node, i) => ({
          ...node,
          index: i,
        })),
        links: sankeyData.links.map((link) => ({
          ...link,
          source: link.source,
          target: link.target,
          value: link.value,
        })),
      }
    } catch (error) {
      console.error('Error processing Sankey data:', error);
      return { nodes: [], links: [] };
    }
  }, [sankeyData])
  
  // Handle no data scenario
  if (!sankeyProcessedData.nodes || 
      !sankeyProcessedData.links || 
      sankeyProcessedData.nodes.length < 2 || 
      sankeyProcessedData.links.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Money Flow</CardTitle>
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value as TimeRange)}
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
        </CardHeader>
        <CardContent>
          <Alert variant="default">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Flow Data Available</AlertTitle>
            </div>
            <AlertDescription>
              Not enough transaction data to generate the money flow diagram.
              Import more transactions with both income and expenses to see how your money flows.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Money Flow</CardTitle>
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as TimeRange)}
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
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          <ParentSize>
            {({ width, height }) => {
              if (width === 0 || height === 0) {
                return <div>Loading...</div>;
              }
              
              return (
                <svg width={width} height={height}>
                  <rect width={width} height={height} fill="transparent" />
                  <Sankey
                    top={20}
                    left={20}
                    data={sankeyProcessedData}
                    size={[width - 40, height - 40]}
                    nodeWidth={22}
                    nodePadding={10}
                    extent={[[0, 0], [width - 40, height - 40]]}
                    nodeId={(d) => d.id || d.index?.toString() || '0'}
                    nodeAlign={sankeyCenter}
                    nodeSort={null}
                  >
                    {({ nodes, links }) => {
                      if (!nodes || !links || nodes.length === 0 || links.length === 0) {
                        return <g><text x={width/2} y={height/2}>No flow data available</text></g>;
                      }
                      
                      return (
                        <g>
                          {/* Render gradients for links */}
                          {links.map((link, i) => {
                            if (!link.source || !link.target) return null;
                            
                            const sourceNode = nodes[link.source.index];
                            const targetNode = nodes[link.target.index];
                            if (!sourceNode || !targetNode) return null;
                            
                            const gradientId = genSankeyGradientId(i);
                            
                            return (
                              <LinearGradient
                                key={`gradient-${i}`}
                                id={gradientId}
                                from={(sourceNode as any)?.color || '#E8E8E8'}
                                to={(targetNode as any)?.color || '#E8E8E8'}
                                opacity={0.6}
                              />
                            );
                          })}
                          
                          {/* Render links */}
                          {links.map((link, i) => {
                            if (!link.source || !link.target) return null;
                            
                            const linkGenerator = sankeyLinkHorizontal();
                            const path = linkGenerator({
                              source: [link.source.x1 || 0, link.y0 || 0],
                              target: [link.target.x0 || 0, link.y1 || 0]
                            });
                            
                            if (!path) return null;
                            
                            const gradientId = genSankeyGradientId(i);
                            
                            return (
                              <path
                                key={`link-${i}`}
                                d={path}
                                stroke={`url(#${gradientId})`}
                                strokeWidth={Math.max(1, link.width || 0)}
                                strokeOpacity={0.7}
                                fill="none"
                                onMouseEnter={() => {
                                  const sourceNode = nodes[link.source.index];
                                  const targetNode = nodes[link.target.index];
                                  if (sourceNode && targetNode) {
                                    showTooltip({
                                      tooltipData: {
                                        from: sourceNode.name,
                                        to: targetNode.name,
                                        value: link.value
                                      },
                                      tooltipLeft: ((sourceNode.x1 || 0) + (targetNode.x0 || 0)) / 2,
                                      tooltipTop: ((link.y0 || 0) + (link.y1 || 0)) / 2,
                                    });
                                  }
                                }}
                                onMouseLeave={hideTooltip}
                              />
                            );
                          })}
                          
                          {/* Render nodes */}
                          {nodes.map((node, i) => {
                            if (!node) return null;
                            
                            const isMiddleNode = node.name === 'Budget';
                            const x0 = node.x0 || 0;
                            const y0 = node.y0 || 0;
                            const width = (node.x1 || 0) - x0;
                            const height = (node.y1 || 0) - y0;
                            
                            if (width <= 0 || height <= 0) return null;
                            
                            return (
                              <g
                                key={`node-${i}`}
                                transform={`translate(${x0},${y0})`}
                                onMouseEnter={() => {
                                  showTooltip({
                                    tooltipData: {
                                      name: node.name,
                                      value: node.value || 0,
                                    },
                                    tooltipLeft: x0 + width > width / 2 ? x0 - 100 : x0 + width + 10,
                                    tooltipTop: y0 + 20,
                                  });
                                }}
                                onMouseLeave={hideTooltip}
                              >
                                <rect
                                  width={width}
                                  height={height}
                                  fill={(node as any).color || '#ccc'}
                                  fillOpacity={0.9}
                                  stroke="#555"
                                  strokeWidth={0.5}
                                />
                                <text
                                  x={width / 2}
                                  y={height / 2}
                                  dy=".35em"
                                  textAnchor="middle"
                                  fill="#000"
                                  fontWeight={isMiddleNode ? 'bold' : 'normal'}
                                  fontSize={14}
                                  style={{
                                    pointerEvents: 'none',
                                    userSelect: 'none',
                                  }}
                                >
                                  {node.name}
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      );
                    }}
                  </Sankey>
                </svg>
              );
            }}
          </ParentSize>
        </div>
        
        {/* Tooltip */}
        {tooltipOpen && tooltipData && (
          <TooltipWithBounds
            top={tooltipTop}
            left={tooltipLeft}
            style={{
              backgroundColor: 'white',
              color: 'black',
              padding: '8px 12px',
              fontSize: 12,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              borderRadius: 4,
              pointerEvents: 'none',
              zIndex: 1000,
              position: 'absolute',
              transform: 'translate(-50%, -100%)',
            }}
          >
            {tooltipData.from && tooltipData.to ? (
              <div>
                <strong>{tooltipData.from} → {tooltipData.to}</strong>
                <div>{formatCurrency(tooltipData.value)}</div>
              </div>
            ) : (
              <div>
                <strong>{tooltipData.name}</strong>
                <div>{formatCurrency(tooltipData.value)}</div>
              </div>
            )}
          </TooltipWithBounds>
        )}
        
        <div className="mt-4 text-xs text-muted-foreground text-center">
          This diagram visualizes how money flows from income sources through your budget to expense categories.
        </div>
      </CardContent>
    </Card>
  )
} 