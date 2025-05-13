'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useTransactions } from './transaction-context'

// Types for budget data
export interface BudgetItem {
  id: string
  category: string
  amount: number
  period: 'monthly' | 'yearly'
  color?: string
}

interface BudgetContextType {
  budgets: BudgetItem[]
  addBudget: (budget: Omit<BudgetItem, 'id'>) => void
  updateBudget: (id: string, budget: Partial<BudgetItem>) => void
  deleteBudget: (id: string) => void
  getBudgetProgress: (budgetId: string) => { spent: number; remaining: number; percentage: number }
  getCategorySpending: (category: string, period: 'monthly' | 'yearly') => number
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined)

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 9)

// Colors for budgets
const BUDGET_COLORS = [
  '#f43f5e', '#ec4899', '#d946ef', '#a855f7', 
  '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', 
  '#06b6d4', '#14b8a6', '#10b981', '#84cc16'
]

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [budgets, setBudgets] = useState<BudgetItem[]>([])
  const { transactions } = useTransactions()
  
  // Load budgets from localStorage on initial render
  useEffect(() => {
    try {
      const savedBudgets = localStorage.getItem('lifeflow-budgets')
      if (savedBudgets) {
        setBudgets(JSON.parse(savedBudgets))
      }
    } catch (error) {
      console.error('Failed to load budgets from localStorage:', error)
    }
  }, [])
  
  // Save budgets to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('lifeflow-budgets', JSON.stringify(budgets))
    } catch (error) {
      console.error('Failed to save budgets to localStorage:', error)
    }
  }, [budgets])
  
  // Add a new budget
  const addBudget = (budget: Omit<BudgetItem, 'id'>) => {
    // Assign a random color if not provided
    const color = budget.color || BUDGET_COLORS[budgets.length % BUDGET_COLORS.length]
    setBudgets(prev => [...prev, { ...budget, id: generateId(), color }])
  }
  
  // Update an existing budget
  const updateBudget = (id: string, updates: Partial<BudgetItem>) => {
    setBudgets(prev => prev.map(budget => 
      budget.id === id ? { ...budget, ...updates } : budget
    ))
  }
  
  // Delete a budget
  const deleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(budget => budget.id !== id))
  }
  
  // Calculate spending for a specific category within the current month or year
  const getCategorySpending = (category: string, period: 'monthly' | 'yearly') => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    return transactions
      .filter(transaction => {
        // Match category
        if (transaction.category !== category) return false
        
        // Match time period
        const date = new Date(transaction.date)
        if (period === 'monthly') {
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear
        } else {
          return date.getFullYear() === currentYear
        }
      })
      .filter(transaction => transaction.amount < 0) // Only expenses
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
  }
  
  // Calculate progress for a specific budget
  const getBudgetProgress = (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId)
    
    if (!budget) {
      return { spent: 0, remaining: 0, percentage: 0 }
    }
    
    const spent = getCategorySpending(budget.category, budget.period)
    const remaining = Math.max(0, budget.amount - spent)
    const percentage = Math.min(100, Math.round((spent / budget.amount) * 100))
    
    return { spent, remaining, percentage }
  }
  
  return (
    <BudgetContext.Provider value={{
      budgets,
      addBudget,
      updateBudget,
      deleteBudget,
      getBudgetProgress,
      getCategorySpending
    }}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudget() {
  const context = useContext(BudgetContext)
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider')
  }
  return context
} 