'use client'

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts'
import { formatCurrency } from '@/lib/format'

// Mock data for the chart
const data = [
  { month: 'Jul', Expenses: 1850, Income: 3600, Savings: 1750 },
  { month: 'Aug', Expenses: 2100, Income: 3600, Savings: 1500 },
  { month: 'Sep', Expenses: 1900, Income: 3700, Savings: 1800 },
  { month: 'Oct', Expenses: 2200, Income: 3750, Savings: 1550 },
  { month: 'Nov', Expenses: 2320, Income: 3800, Savings: 1480 },
  { month: 'Dec', Expenses: 2450, Income: 3900, Savings: 1450 },
]

export function SpendingChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
        <XAxis dataKey="month" />
        <YAxis 
          tickFormatter={(value) => `$${value}`} 
          width={80}
        />
        <Tooltip 
          formatter={(value) => formatCurrency(value as number)} 
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="Expenses" 
          stroke="#f43f5e" 
          fillOpacity={1}
          fill="url(#colorExpenses)" 
          activeDot={{ r: 8 }}
          name="Expenses"
        />
        <Area 
          type="monotone" 
          dataKey="Income" 
          stroke="#10b981" 
          fillOpacity={1} 
          fill="url(#colorIncome)" 
          activeDot={{ r: 8 }}
          name="Income"
        />
        <Area 
          type="monotone" 
          dataKey="Savings" 
          stroke="#3b82f6" 
          fillOpacity={1} 
          fill="url(#colorSavings)" 
          activeDot={{ r: 8 }}
          name="Savings"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
} 