'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useBudget, BudgetItem } from '@/lib/budget-context'
import { formatCurrency } from '@/lib/format'
import { BudgetForm } from './budget-form'
import { Plus, Edit, PieChart, AlertTriangle } from 'lucide-react'

export function BudgetDashboard() {
  const { budgets, getBudgetProgress } = useBudget()
  const [formOpen, setFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetItem | undefined>(undefined)
  
  const openCreateForm = () => {
    setEditingBudget(undefined)
    setFormOpen(true)
  }
  
  const openEditForm = (budget: BudgetItem) => {
    setEditingBudget(budget)
    setFormOpen(true)
  }
  
  if (budgets.length === 0) {
    return (
      <Card className="border-slate-200 dark:border-slate-700 shadow-md h-full">
        <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            <CardTitle>Budget Tracker</CardTitle>
          </div>
          <CardDescription>Create budget goals to track your spending</CardDescription>
        </CardHeader>
        <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center min-h-[200px]">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <PieChart className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-6 text-center max-w-md">
            You haven't set any budget goals yet. Create your first budget to start tracking your finances.
          </p>
          <Button onClick={openCreateForm} className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Budget
          </Button>
          
          <BudgetForm 
            open={formOpen} 
            onOpenChange={setFormOpen} 
            editBudget={editingBudget} 
          />
        </CardContent>
      </Card>
    )
  }
  
  const sortedBudgets = [...budgets].sort((a, b) => {
    const progressA = getBudgetProgress(a.id).percentage;
    const progressB = getBudgetProgress(b.id).percentage;
    return progressB - progressA; // Sort by percentage in descending order
  });
  
  return (
    <Card className="border-slate-200 dark:border-slate-700 shadow-md h-full">
      <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            <CardTitle>Budget Tracker</CardTitle>
          </div>
          <CardDescription>Track your spending against budget goals</CardDescription>
        </div>
        <Button 
          onClick={openCreateForm} 
          variant="outline" 
          size="sm"
          className="border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-6">
          {sortedBudgets.map(budget => {
            const { spent, remaining, percentage } = getBudgetProgress(budget.id)
            const isOverBudget = percentage >= 100
            const isCloseToLimit = percentage >= 85 && percentage < 100
            
            return (
              <div key={budget.id} className="group bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium flex items-center">
                    <div 
                      className="h-4 w-4 rounded-full mr-2 shadow-inner" 
                      style={{ backgroundColor: budget.color }}
                    />
                    <div>
                      <span className="text-slate-900 dark:text-slate-100">{budget.category}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                        ({budget.period})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={
                      isOverBudget 
                        ? 'text-red-500 font-medium' 
                        : isCloseToLimit 
                        ? 'text-amber-500 font-medium' 
                        : 'text-slate-700 dark:text-slate-300'
                    }>
                      {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => openEditForm(budget)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={percentage} 
                    className={isOverBudget 
                      ? 'bg-red-100 dark:bg-red-950/30 h-2.5 rounded-md' 
                      : isCloseToLimit 
                      ? 'bg-amber-100 dark:bg-amber-950/30 h-2.5 rounded-md' 
                      : 'h-2.5 rounded-md'
                    }
                    indicatorClassName={isOverBudget 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 rounded-md' 
                      : isCloseToLimit 
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 rounded-md' 
                      : `bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-md`
                    }
                  />
                  {isOverBudget && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-1 animate-pulse">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between mt-2 text-xs">
                  <span className={
                    isOverBudget 
                      ? 'text-red-500 font-medium' 
                      : isCloseToLimit 
                      ? 'text-amber-500' 
                      : 'text-slate-500 dark:text-slate-400'
                  }>
                    {isOverBudget 
                      ? <span className="flex items-center"><AlertTriangle className="h-3 w-3 mr-1" /> Over budget by {formatCurrency(Math.abs(remaining))}</span>
                      : isCloseToLimit
                      ? 'Almost at limit'
                      : `${formatCurrency(remaining)} remaining`
                    }
                  </span>
                  <span className={
                    isOverBudget 
                      ? 'text-red-500 font-medium' 
                      : isCloseToLimit 
                      ? 'text-amber-500 font-medium' 
                      : 'text-slate-500 dark:text-slate-400'
                  }>
                    {percentage}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
      
      <BudgetForm 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        editBudget={editingBudget} 
      />
    </Card>
  )
} 