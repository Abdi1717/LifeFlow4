"use client"

import { useMemo, useState, memo, useCallback } from 'react'
import { useTransactions } from '@/lib/transaction-context'
import { formatCurrency } from '@/lib/format'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

// Memoized individual transaction row component
const TransactionRow = memo(({ 
  transaction, 
  onCategoryChange 
}: { 
  transaction: any; 
  onCategoryChange: (id: string, category: string) => void 
}) => {
  return (
    <TableRow key={transaction.id}>
      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
      <TableCell>{transaction.description}</TableCell>
      <TableCell className={transaction.amount < 0 ? "text-red-500" : "text-green-500"}>
        {formatCurrency(transaction.amount)}
      </TableCell>
      <TableCell>
        <Select 
          value={transaction.category} 
          onValueChange={(value) => onCategoryChange(transaction.id, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {transaction.availableCategories.map((category: string) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>{transaction.account || "—"}</TableCell>
    </TableRow>
  )
})

// Set display name for debugging
TransactionRow.displayName = 'TransactionRow'

function TransactionListComponent() {
  const { transactions, categories, categorizeTransaction } = useTransactions()
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const pageSize = 10

  // Memoized filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(transaction => {
        const matchesSearch = searchQuery 
          ? transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) 
          : true
        
        const matchesCategory = categoryFilter === 'all'
          ? true
          : transaction.category === categoryFilter
        
        return matchesSearch && matchesCategory
      })
      .map(transaction => ({
        ...transaction,
        availableCategories: categories
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, searchQuery, categoryFilter, categories])

  // Memoized paginated transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (page - 1) * pageSize
    return filteredTransactions.slice(startIndex, startIndex + pageSize)
  }, [filteredTransactions, page, pageSize])

  // Memoized total pages calculation
  const totalPages = useMemo(() => {
    return Math.ceil(filteredTransactions.length / pageSize)
  }, [filteredTransactions.length, pageSize])

  // Memoized category statistics
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number, total: number }> = {}
    
    transactions.forEach(transaction => {
      if (!stats[transaction.category]) {
        stats[transaction.category] = { count: 0, total: 0 }
      }
      
      stats[transaction.category].count += 1
      stats[transaction.category].total += transaction.amount
    })
    
    return stats
  }, [transactions])

  // Memoized handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)))
  }, [totalPages])

  const handleCategoryChange = useCallback((id: string, category: string) => {
    categorizeTransaction(id, category)
  }, [categorizeTransaction])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setPage(1) // Reset to first page when search changes
  }, [])

  const handleCategoryFilterChange = useCallback((value: string) => {
    setCategoryFilter(value)
    setPage(1) // Reset to first page when filter changes
  }, [])

  // No transactions state
  if (transactions.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No transactions available. Import data to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-4">
        <div className="relative w-full md:w-auto flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search transactions..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="w-full md:w-auto max-w-xs">
          <Select
            value={categoryFilter}
            onValueChange={handleCategoryFilterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem 
                  key={category} 
                  value={category}
                >
                  {category} ({categoryStats[category]?.count || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="border rounded-md">
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
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map(transaction => (
                <TransactionRow 
                  key={transaction.id}
                  transaction={transaction}
                  onCategoryChange={handleCategoryChange}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No matching transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min(filteredTransactions.length, (page - 1) * pageSize + 1)} to {Math.min(filteredTransactions.length, page * pageSize)} of {filteredTransactions.length} transactions
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Export memoized component
export const TransactionList = memo(TransactionListComponent) 