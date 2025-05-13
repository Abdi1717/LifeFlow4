'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { useBudget, BudgetItem } from '@/lib/budget-context'
import { useTransactions } from '@/lib/transaction-context'
import { Check, Trash } from 'lucide-react'

interface BudgetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editBudget?: BudgetItem
}

export function BudgetForm({ open, onOpenChange, editBudget }: BudgetFormProps) {
  const { addBudget, updateBudget, deleteBudget } = useBudget()
  const { categories } = useTransactions()
  
  // Form state
  const [category, setCategory] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')
  
  // Load data when editing
  useEffect(() => {
    if (editBudget) {
      setCategory(editBudget.category)
      setAmount(editBudget.amount.toString())
      setPeriod(editBudget.period)
    } else {
      // Reset form when creating new
      setCategory('')
      setAmount('')
      setPeriod('monthly')
    }
  }, [editBudget, open])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!category || !amount) return
    
    const budgetData = {
      category,
      amount: parseFloat(amount),
      period
    }
    
    if (editBudget) {
      updateBudget(editBudget.id, budgetData)
    } else {
      addBudget(budgetData)
    }
    
    onOpenChange(false)
  }
  
  const handleDelete = () => {
    if (editBudget) {
      deleteBudget(editBudget.id)
      onOpenChange(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editBudget ? 'Edit Budget' : 'Create Budget'}</DialogTitle>
          <DialogDescription>
            {editBudget 
              ? 'Update your budget goal for this category.' 
              : 'Set a new budget goal to track your spending.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={category} 
              onValueChange={setCategory}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input 
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="period">Time Period</Label>
            <Select 
              value={period} 
              onValueChange={(value: 'monthly' | 'yearly') => setPeriod(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="pt-4 flex gap-2 justify-between">
            {editBudget && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                size="icon"
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                <Check className="h-4 w-4 mr-2" />
                {editBudget ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 