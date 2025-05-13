'use client'

import { useState } from 'react'
import { useNetwork } from '@/lib/contexts/network-context'
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Link as LinkIcon, 
  Search,
  UserCircle,
  Plus,
  Check,
  X 
} from 'lucide-react'
import { ContactInfo } from '@/lib/contexts/network-context'
import { OptimizedImage } from '@/components/optimized-image'

export function NetworkContactList() {
  const { 
    contacts, 
    groups, 
    deleteContact, 
    updateContact, 
    addContact, 
    filteredContactIds 
  } = useNetwork()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentContact, setCurrentContact] = useState<ContactInfo | null>(null)
  
  // Form state for adding/editing contacts
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
  
  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact => 
    // First check if we have filtered contacts from the network context
    (!filteredContactIds || filteredContactIds.includes(contact.id)) &&
    // Then apply local search filter
    (
      !searchTerm || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )
  
  // Sort contacts by name
  const sortedContacts = [...filteredContacts].sort((a, b) => 
    a.name.localeCompare(b.name)
  )
  
  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }
  
  // Handle group selection change
  const toggleGroup = (groupId: string) => {
    setForm(prev => ({
      ...prev,
      groups: prev.groups.includes(groupId)
        ? prev.groups.filter(id => id !== groupId)
        : [...prev.groups, groupId]
    }))
  }
  
  // Set up form for adding a new contact
  const handleAddContact = () => {
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
      groups: ['group-1'] // Default to 'Work' group
    })
    setIsAddDialogOpen(true)
  }
  
  // Set up form for editing a contact
  const handleEditContact = (contact: ContactInfo) => {
    setCurrentContact(contact)
    setForm({
      name: contact.name,
      company: contact.company,
      title: contact.title,
      email: contact.email,
      phone: contact.phone,
      website: contact.website || '',
      linkedin: contact.linkedin || '',
      twitter: contact.twitter || '',
      notes: contact.notes || '',
      tags: contact.tags.join(', '),
      groups: contact.groups
    })
    setIsEditDialogOpen(true)
  }
  
  // Submit form to add a new contact
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Convert comma-separated tags to array
      const tagsArray = form.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      
      // Add contact
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
        groups: form.groups
      })
      
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Failed to add contact', error)
    }
  }
  
  // Submit form to update a contact
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentContact) return
    
    try {
      // Convert comma-separated tags to array
      const tagsArray = form.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      
      // Update contact
      updateContact({
        ...currentContact,
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
        groups: form.groups
      })
      
      setIsEditDialogOpen(false)
      setCurrentContact(null)
    } catch (error) {
      console.error('Failed to update contact', error)
    }
  }
  
  // Handle delete contact
  const handleDeleteContact = (id: string) => {
    deleteContact(id)
  }
  
  return (
    <div className="space-y-4">
      {/* Search and Add */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <Button onClick={handleAddContact}>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>
      
      {/* Contacts Table */}
      <div className="rounded-md border">
        <Table>
          <TableCaption>
            {sortedContacts.length === 0 
              ? 'No contacts found' 
              : `Showing ${sortedContacts.length} contacts`}
          </TableCaption>
          
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {sortedContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  {contact.imageUrl ? (
                    <div className="h-8 w-8 rounded-full overflow-hidden">
                      <OptimizedImage
                        src={contact.imageUrl}
                        alt={contact.name}
                        width={32}
                        height={32}
                        className="object-cover h-full w-full"
                      />
                    </div>
                  ) : (
                    <UserCircle className="h-8 w-8 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-sm text-muted-foreground">{contact.title}</div>
                </TableCell>
                <TableCell>{contact.company}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{contact.email}</div>
                    <div className="text-sm">{contact.phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {contact.groups.map(groupId => {
                      const group = groups.find(g => g.id === groupId)
                      return group ? (
                        <Badge
                          key={groupId}
                          style={{ backgroundColor: group.color }}
                          className="text-white"
                        >
                          {group.name}
                        </Badge>
                      ) : null
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditContact(contact)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete {contact.name} from your contacts and remove
                              all connections with this contact.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteContact(contact.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Add Contact Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>
              Add a new contact to your network.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="add-name">Name</Label>
                <Input 
                  id="add-name" 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="add-company">Company</Label>
                  <Input 
                    id="add-company" 
                    name="company" 
                    value={form.company} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="add-title">Job Title</Label>
                  <Input 
                    id="add-title" 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="add-email">Email</Label>
                  <Input 
                    id="add-email" 
                    name="email" 
                    type="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="add-phone">Phone</Label>
                  <Input 
                    id="add-phone" 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="add-tags">Tags (comma separated)</Label>
                <Input 
                  id="add-tags" 
                  name="tags" 
                  value={form.tags} 
                  onChange={handleChange} 
                  placeholder="e.g. client, tech, developer" 
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label>Groups</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {groups.map(group => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`add-group-${group.id}`}
                        checked={form.groups.includes(group.id)}
                        onChange={() => toggleGroup(group.id)}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <Label
                        htmlFor={`add-group-${group.id}`}
                        className="text-sm font-normal flex items-center"
                      >
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: group.color }}
                        ></span>
                        {group.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Contact</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update contact information.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input 
                  id="edit-name" 
                  name="name" 
                  value={form.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="edit-company">Company</Label>
                  <Input 
                    id="edit-company" 
                    name="company" 
                    value={form.company} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="edit-title">Job Title</Label>
                  <Input 
                    id="edit-title" 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input 
                    id="edit-email" 
                    name="email" 
                    type="email" 
                    value={form.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input 
                    id="edit-phone" 
                    name="phone" 
                    value={form.phone} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                <Input 
                  id="edit-tags" 
                  name="tags" 
                  value={form.tags} 
                  onChange={handleChange} 
                  placeholder="e.g. client, tech, developer" 
                />
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label>Groups</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {groups.map(group => (
                    <div key={group.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`edit-group-${group.id}`}
                        checked={form.groups.includes(group.id)}
                        onChange={() => toggleGroup(group.id)}
                        className="rounded text-primary focus:ring-primary"
                      />
                      <Label
                        htmlFor={`edit-group-${group.id}`}
                        className="text-sm font-normal flex items-center"
                      >
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: group.color }}
                        ></span>
                        {group.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
} 