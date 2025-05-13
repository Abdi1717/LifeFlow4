"use client"

import { useState, useRef } from "react"
import { Upload, FileUp, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface CSVFileUploaderProps {
  onFileLoad: (data: any[]) => void
}

export function CSVFileUploader({ onFileLoad }: CSVFileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError(null)
    setSuccess(false)
    
    if (!selectedFile) {
      return
    }
    
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }
    
    setFile(selectedFile)
  }

  const parseCSV = (text: string) => {
    try {
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(header => header.trim())
      
      const data = lines.slice(1)
        .filter(line => line.trim() !== '')
        .map(line => {
          const values = line.split(',')
          const entry: Record<string, string> = {}
          
          headers.forEach((header, i) => {
            entry[header] = values[i]?.trim() || ''
          })
          
          return entry
        })
      
      return data
    } catch (err) {
      console.error('Error parsing CSV:', err)
      throw new Error('Failed to parse CSV file')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const text = await file.text()
      const data = parseCSV(text)
      
      // Validate required fields: date, amount, description
      const isValid = data.every(item => 
        (item.date || item.Date) && 
        (item.amount || item.Amount) &&
        (item.description || item.Description || item.desc || item.Desc)
      )
      
      if (!isValid) {
        throw new Error('CSV file missing required columns (date, amount, or description)')
      }
      
      onFileLoad(data)
      setSuccess(true)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process CSV file')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="csv-upload" className="text-sm font-medium">
            Upload CSV Statement
          </label>
          <Input
            ref={fileInputRef}
            id="csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            Upload a CSV file containing transaction data with columns for date, amount, and description.
          </p>
        </div>
        
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500">
            <CheckCircle2 className="h-4 w-4" />
            <span>CSV file successfully processed!</span>
          </div>
        )}
        
        <Button 
          onClick={handleUpload} 
          disabled={!file || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <FileUp className="mr-2 h-4 w-4" />
              Upload & Process
            </>
          )}
        </Button>
      </div>
    </Card>
  )
} 