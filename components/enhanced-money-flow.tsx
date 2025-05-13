"use client";

import { useState } from "react";
import { useTransactions } from "@/lib/transaction-context";
import { SankeyDiagram } from "@/components/SankeyDiagram";
import { SimpleFlowDiagram } from "@/components/simple-flow-diagram";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ErrorBoundary } from "react-error-boundary";
import { BarChart2 } from "lucide-react";

type TimeRange = 'month' | 'quarter' | 'year' | 'all';

export function EnhancedMoneyFlow() {
  const { transactions } = useTransactions();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [useFallback, setUseFallback] = useState(false);
  
  // Handle time range changes
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as TimeRange);
  };

  // Handle fallback if SankeyDiagram fails
  const handleSankeyError = () => {
    console.error("Sankey diagram failed to render, using fallback");
    setUseFallback(true);
  };

  // Filter transactions based on selected time range
  const filteredTransactions = (() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
    
    if (timeRange === 'all') {
      return transactions;
    }
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions.filter(t => {
      const date = new Date(t.date);
      
      if (timeRange === 'month') {
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      } else if (timeRange === 'quarter') {
        const quarter = Math.floor(currentMonth / 3);
        const transactionQuarter = Math.floor(date.getMonth() / 3);
        return transactionQuarter === quarter && date.getFullYear() === currentYear;
      } else if (timeRange === 'year') {
        return date.getFullYear() === currentYear;
      }
      
      return true;
    });
  })();
  
  // Separate incomes and expenses
  const incomes = filteredTransactions.filter(t => t.amount > 0)
    .map(t => ({
      id: t.id,
      name: t.category || 'Other Income',
      amount: t.amount,
      category: t.category || 'Other Income'
    }));
    
  const expenses = filteredTransactions.filter(t => t.amount < 0)
    .map(t => ({
      id: t.id,
      name: t.category || 'Other Expense',
      amount: Math.abs(t.amount), // Make sure amounts are positive for the Sankey diagram
      category: t.category || 'Other Expense'
    }));

  // If no data, don't try to render the diagram
  if (!transactions || transactions.length === 0) {
    return (
      <Card className="border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
        <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-slate-500 dark:text-slate-400" />
            <CardTitle>Money Flow Visualization</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
            <BarChart2 className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <div className="text-sm text-slate-600 dark:text-slate-400 text-center max-w-md">
              <p className="font-medium mb-2">No transaction data available</p>
              <p>Import transactions using the CSV uploader in the Transactions tab to visualize your money flow.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Custom fallback for SankeyDiagram that includes our time range selector
  const FallbackComponent = () => (
    <Card className="w-full border-slate-200 dark:border-slate-700 shadow-md overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center">
          <BarChart2 className="h-5 w-5 mr-2 text-slate-500 dark:text-slate-400" />
          <CardTitle>Money Flow Visualization</CardTitle>
        </div>
        <Select
          value={timeRange}
          onValueChange={handleTimeRangeChange}
        >
          <SelectTrigger className="w-40 h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
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
      <CardContent className="p-6">
        <SimpleFlowDiagram timeRange={timeRange} />
      </CardContent>
    </Card>
  );

  return (
    <ErrorBoundary 
      fallback={<FallbackComponent />}
      onError={handleSankeyError}
    >
      {useFallback ? (
        <FallbackComponent />
      ) : (
        <SankeyDiagram 
          incomes={incomes}
          expenses={expenses}
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
        />
      )}
    </ErrorBoundary>
  );
} 