'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useDropzone } from 'react-dropzone'
import { Camera, Upload, Scan, Trash2 } from 'lucide-react'
import { OptimizedImage } from '@/components/optimized-image'
import { useNetwork } from '@/lib/contexts/network-context'
import { ContactInfo } from '@/lib/contexts/network-context'

// Simulated OCR function (in a real app, this would call a proper OCR API)
async function simulateOCR(file: File): Promise<Partial<ContactInfo>> {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // This is just a simulation - in a real app, this would
      // extract actual text from the business card image
      const mockResults = {
        name: 'Alex Johnson',
        company: 'Innovation Labs',
        title: 'Senior Product Manager',
        email: 'alex.johnson@innovationlabs.example',
        phone: '555-867-5309',
        website: 'innovationlabs.example',
        tags: ['product', 'manager'],
        groups: ['group-1'] // Default to 'Work' group
      }
      
      resolve(mockResults)
    }, 1500)
  })
}

export function NetworkUploader() {
  const { addContact, groups } = useNetwork()
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<Partial<ContactInfo> | null>(null)
  
  const [form, setForm] = useState({
    name: '',
    company: '',
    title: '',
    email: '',
    phone: '',
    website: '',
    linkedin: '',
    twitter: '',
    notes: '',
    tags: '',
    groups: ['group-1'] // Default to 'Work' group
  })
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    
    // Only accept one image at a time for OCR
    const file = acceptedFiles[0]
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file.',
        variant: 'destructive'
      })
      return
    }
    
    // Create URL for preview
    const imageUrl = URL.createObjectURL(file)
    
    setFiles([file])
    setImageUrls([imageUrl])
    setResults(null)
  }, [toast])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic']
    },
    maxFiles: 1
  })
  
  const processImage = async () => {
    if (files.length === 0) return
    
    setIsProcessing(true)
    
    try {
      // Simulated OCR
      const extractedData = await simulateOCR(files[0])
      
      // Update form with extracted data
      setForm(prev => ({
        ...prev,
        ...extractedData,
        tags: Array.isArray(extractedData.tags) ? extractedData.tags.join(', ') : '',
        groups: extractedData.groups || ['group-1']
      }))
      
      setResults(extractedData)
      
      toast({
        title: 'Business card processed',
        description: 'Information has been extracted. Please review and edit if needed.',
      })
    } catch (error) {
      toast({
        title: 'Processing failed',
        description: 'Unable to extract information from the image.',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Convert comma-separated tags to array
      const tagsArray = form.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      
      // Add contact to the network
      addContact({
        name: form.name,
        company: form.company,
        title: form.title,
        email: form.email,
        phone: form.phone,
        website: form.website,
        linkedin: form.linkedin,
        twitter: form.twitter,
        notes: form.notes,
        tags: tagsArray,
        groups: form.groups,
        imageUrl: imageUrls[0] // Store the image URL
      })
      
      // Reset the form and state
      setForm({
        name: '',
        company: '',
        title: '',
        email: '',
        phone: '',
        website: '',
        linkedin: '',
        twitter: '',
        notes: '',
        tags: '',
        groups: ['group-1']
      })
      setFiles([])
      setImageUrls([])
      setResults(null)
      
      toast({
        title: 'Contact added',
        description: 'The contact has been added to your network.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add the contact. Please try again.',
        variant: 'destructive'
      })
    }
  }
  
  const clearImage = () => {
    setFiles([])
    setImageUrls([])
    setResults(null)
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Scanner */}
        <Card>
          <CardContent className="pt-6">
            {imageUrls.length > 0 ? (
              <div className="space-y-4">
                <OptimizedImage 
                  src={imageUrls[0]} 
                  alt="Business card"
                  width={400}
                  height={225}
                  className="rounded-md border border-border"
                />
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={clearImage}
                    size="sm"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                  
                  <Button 
                    onClick={processImage} 
                    disabled={isProcessing}
                    size="sm"
                  >
                    <Scan className="mr-2 h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Process Card'}
                  </Button>
                </div>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <input {...getInputProps()} />
                
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive
                      ? 'Drop the image here...'
                      : 'Drag & drop a business card, or click to select'}
                  </p>
                  
                  <div className="flex gap-4 mt-4">
                    <Button size="sm" variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Browse Files
                    </Button>
                    
                    <Button size="sm" variant="outline">
                      <Camera className="mr-2 h-4 w-4" />
                      Take Photo
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Contact Information Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input 
                id="company" 
                name="company" 
                value={form.company} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input 
                id="title" 
                name="title" 
                value={form.title} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={form.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={form.phone} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input 
                id="website" 
                name="website" 
                value={form.website} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input 
                id="tags" 
                name="tags" 
                value={form.tags} 
                onChange={handleChange} 
                placeholder="e.g. client, tech, developer" 
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={!form.name || !form.email || !form.phone}
          >
            Add to Network
          </Button>
        </form>
      </div>
    </div>
  )
} 