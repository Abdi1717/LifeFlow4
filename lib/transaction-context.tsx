"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface Transaction {
  id: string
  date: string
  amount: number
  description: string
  category: string
  account?: string
}

interface TransactionContextType {
  transactions: Transaction[]
  addTransactions: (newTransactions: Transaction[]) => void
  clearTransactions: () => void
  categories: string[]
  setCategories: (categories: string[]) => void
  categorizeTransaction: (id: string, category: string) => void
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider")
  }
  return context
}

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<string[]>([
    "Food & Dining",
    "Shopping",
    "Housing",
    "Transportation",
    "Entertainment",
    "Health & Fitness",
    "Travel",
    "Income",
    "Utilities",
    "Education",
    "Personal Care",
    "Gifts & Donations",
    "Other"
  ])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedTransactions = localStorage.getItem("transactions")
      const savedCategories = localStorage.getItem("categories")
      
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions))
      }
      
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories))
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error)
    }
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    try {
      localStorage.setItem("transactions", JSON.stringify(transactions))
    } catch (error) {
      console.error("Error saving transactions to localStorage:", error)
    }
  }, [transactions])

  useEffect(() => {
    try {
      localStorage.setItem("categories", JSON.stringify(categories))
    } catch (error) {
      console.error("Error saving categories to localStorage:", error)
    }
  }, [categories])

  const addTransactions = (newTransactions: Transaction[]) => {
    setTransactions(prev => [...prev, ...newTransactions])
  }

  const clearTransactions = () => {
    setTransactions([])
  }

  const categorizeTransaction = (id: string, category: string) => {
    setTransactions(prev => 
      prev.map(transaction => 
        transaction.id === id 
          ? { ...transaction, category } 
          : transaction
      )
    )
  }

  const value = {
    transactions,
    addTransactions,
    clearTransactions,
    categories,
    setCategories,
    categorizeTransaction
  }

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  )
} 