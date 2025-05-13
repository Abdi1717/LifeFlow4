"use client"

import { useState, useMemo, useCallback, memo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Transaction, useTransactions } from "@/lib/transaction-context"

// Memoized formatting functions to avoid recreating them on every render
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

// Memoized transaction row component
const TransactionRow = memo(({ 
  transaction, 
  categories, 
  onCategoryChange 
}: { 
  transaction: Transaction, 
  categories: string[], 
  onCategoryChange: (id: string, category: string) => void 
}) => {
  return (
    <TableRow key={transaction.id}>
      <TableCell>{formatDate(transaction.date)}</TableCell>
      <TableCell className="font-medium">{transaction.description}</TableCell>
      <TableCell className={transaction.amount < 0 ? "text-red-500" : "text-green-500"}>
        {formatAmount(transaction.amount)}
      </TableCell>
      <TableCell>
        <Select
          value={transaction.category || "Other"}
          onValueChange={(value) => onCategoryChange(transaction.id, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>{transaction.account || "—"}</TableCell>
    </TableRow>
  )
})

TransactionRow.displayName = "TransactionRow"

export function TransactionList() {
  const { transactions, categories, categorizeTransaction } = useTransactions()
  const [searchTerm, setSearchTerm] = useState("")
  
  // Memoized categorize function to avoid recreating it on every render
  const handleCategoryChange = useCallback((id: string, category: string) => {
    categorizeTransaction(id, category)
  }, [categorizeTransaction])
  
  // Memoized sorted and filtered transactions
  const filteredTransactions = useMemo(() => {
    // Sort transactions by date (most recent first)
    const sorted = [...transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    // Filter transactions based on search term
    if (!searchTerm.trim()) return sorted
    
    return sorted.filter(
      transaction => 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.account && transaction.account.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [transactions, searchTerm])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Account</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TransactionRow 
                  key={transaction.id} 
                  transaction={transaction} 
                  categories={categories} 
                  onCategoryChange={handleCategoryChange} 
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 