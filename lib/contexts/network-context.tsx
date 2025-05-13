'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

// Define the interfaces for contact data
export interface ContactInfo {
  id: string
  name: string
  company: string
  title: string
  email: string
  phone: string
  website?: string
  linkedin?: string
  twitter?: string
  notes?: string
  tags: string[]
  imageUrl?: string
  createdAt: string
  groups: string[]
}

export interface ContactConnection {
  source: string // Contact ID
  target: string // Contact ID
  strength: number // 1-10
  relationship: string
  createdAt: string
}

export interface NetworkGroup {
  id: string
  name: string
  color: string
  description?: string
}

interface NetworkContextType {
  contacts: ContactInfo[]
  connections: ContactConnection[]
  groups: NetworkGroup[]
  selectedContact: ContactInfo | null
  filteredContactIds: string[] | null
  addContact: (contact: Omit<ContactInfo, 'id' | 'createdAt'>) => string
  updateContact: (contact: ContactInfo) => void
  deleteContact: (id: string) => void
  setSelectedContact: (contact: ContactInfo | null) => void
  addConnection: (connection: Omit<ContactConnection, 'id' | 'createdAt'>) => void
  updateConnection: (connection: ContactConnection) => void
  deleteConnection: (sourceId: string, targetId: string) => void
  addGroup: (group: Omit<NetworkGroup, 'id'>) => string
  updateGroup: (group: NetworkGroup) => void
  deleteGroup: (id: string) => void
  filterContacts: (searchTerm: string, groupIds?: string[]) => void
  clearFilters: () => void
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined)

// Sample data
const DEFAULT_GROUPS: NetworkGroup[] = [
  { id: 'group-1', name: 'Work', color: '#4f46e5' },
  { id: 'group-2', name: 'Clients', color: '#10b981' },
  { id: 'group-3', name: 'Personal', color: '#f59e0b' },
]

const SAMPLE_CONTACTS: ContactInfo[] = [
  {
    id: 'contact-1',
    name: 'John Doe',
    company: 'Tech Corp',
    title: 'Software Engineer',
    email: 'john@example.com',
    phone: '555-123-4567',
    website: 'johndoe.com',
    tags: ['tech', 'developer'],
    createdAt: new Date().toISOString(),
    groups: ['group-1'],
  },
  {
    id: 'contact-2',
    name: 'Jane Smith',
    company: 'Design Studio',
    title: 'UX Designer',
    email: 'jane@example.com',
    phone: '555-987-6543',
    linkedin: 'linkedin.com/janesmith',
    tags: ['design', 'creative'],
    createdAt: new Date().toISOString(),
    groups: ['group-2'],
  },
]

const SAMPLE_CONNECTIONS: ContactConnection[] = [
  {
    source: 'contact-1',
    target: 'contact-2',
    strength: 8,
    relationship: 'Colleague',
    createdAt: new Date().toISOString(),
  },
]

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<ContactInfo[]>([])
  const [connections, setConnections] = useState<ContactConnection[]>([])
  const [groups, setGroups] = useState<NetworkGroup[]>([])
  const [selectedContact, setSelectedContact] = useState<ContactInfo | null>(null)
  const [filteredContactIds, setFilteredContactIds] = useState<string[] | null>(null)

  // Initialize from localStorage or use sample data
  useEffect(() => {
    const storedContacts = localStorage.getItem('network-contacts')
    const storedConnections = localStorage.getItem('network-connections')
    const storedGroups = localStorage.getItem('network-groups')

    if (storedContacts) {
      setContacts(JSON.parse(storedContacts))
    } else {
      setContacts(SAMPLE_CONTACTS)
    }

    if (storedConnections) {
      setConnections(JSON.parse(storedConnections))
    } else {
      setConnections(SAMPLE_CONNECTIONS)
    }

    if (storedGroups) {
      setGroups(JSON.parse(storedGroups))
    } else {
      setGroups(DEFAULT_GROUPS)
    }
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    if (contacts.length > 0) {
      localStorage.setItem('network-contacts', JSON.stringify(contacts))
    }
  }, [contacts])

  useEffect(() => {
    if (connections.length > 0) {
      localStorage.setItem('network-connections', JSON.stringify(connections))
    }
  }, [connections])

  useEffect(() => {
    if (groups.length > 0) {
      localStorage.setItem('network-groups', JSON.stringify(groups))
    }
  }, [groups])

  // Contact operations
  const addContact = (contactData: Omit<ContactInfo, 'id' | 'createdAt'>) => {
    const id = `contact-${uuidv4()}`
    const newContact = {
      ...contactData,
      id,
      createdAt: new Date().toISOString(),
    }
    setContacts(prev => [...prev, newContact])
    return id
  }

  const updateContact = (updatedContact: ContactInfo) => {
    setContacts(prev => 
      prev.map(contact => 
        contact.id === updatedContact.id ? updatedContact : contact
      )
    )

    if (selectedContact?.id === updatedContact.id) {
      setSelectedContact(updatedContact)
    }
  }

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id))
    setConnections(prev => 
      prev.filter(conn => conn.source !== id && conn.target !== id)
    )

    if (selectedContact?.id === id) {
      setSelectedContact(null)
    }
  }

  // Connection operations
  const addConnection = (connectionData: Omit<ContactConnection, 'id' | 'createdAt'>) => {
    const newConnection = {
      ...connectionData,
      createdAt: new Date().toISOString(),
    }

    // Prevent duplicate connections
    const exists = connections.some(
      conn => 
        (conn.source === connectionData.source && conn.target === connectionData.target) ||
        (conn.source === connectionData.target && conn.target === connectionData.source)
    )

    if (!exists) {
      setConnections(prev => [...prev, newConnection])
    }
  }

  const updateConnection = (updatedConnection: ContactConnection) => {
    setConnections(prev => 
      prev.map(conn => 
        (conn.source === updatedConnection.source && conn.target === updatedConnection.target) 
          ? updatedConnection 
          : conn
      )
    )
  }

  const deleteConnection = (sourceId: string, targetId: string) => {
    setConnections(prev => 
      prev.filter(conn => 
        !(conn.source === sourceId && conn.target === targetId) &&
        !(conn.source === targetId && conn.target === sourceId)
      )
    )
  }

  // Group operations
  const addGroup = (groupData: Omit<NetworkGroup, 'id'>) => {
    const id = `group-${uuidv4()}`
    const newGroup = {
      ...groupData,
      id,
    }
    setGroups(prev => [...prev, newGroup])
    return id
  }

  const updateGroup = (updatedGroup: NetworkGroup) => {
    setGroups(prev => 
      prev.map(group => 
        group.id === updatedGroup.id ? updatedGroup : group
      )
    )
  }

  const deleteGroup = (id: string) => {
    setGroups(prev => prev.filter(group => group.id !== id))
    
    // Remove group from contacts
    setContacts(prev => 
      prev.map(contact => ({
        ...contact,
        groups: contact.groups.filter(groupId => groupId !== id)
      }))
    )
  }

  // Filter operations
  const filterContacts = (searchTerm: string, groupIds?: string[]) => {
    const filtered = contacts.filter(contact => {
      const matchesSearch = 
        !searchTerm || 
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.tags && contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      
      const matchesGroups = 
        !groupIds || 
        groupIds.length === 0 || 
        contact.groups.some(groupId => groupIds.includes(groupId))
      
      return matchesSearch && matchesGroups
    })

    setFilteredContactIds(filtered.map(c => c.id))
  }

  const clearFilters = () => {
    setFilteredContactIds(null)
  }

  const value = {
    contacts,
    connections,
    groups,
    selectedContact,
    filteredContactIds,
    addContact,
    updateContact,
    deleteContact,
    setSelectedContact,
    addConnection,
    updateConnection,
    deleteConnection,
    addGroup,
    updateGroup,
    deleteGroup,
    filterContacts,
    clearFilters,
  }

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
}

export const useNetwork = () => {
  const context = useContext(NetworkContext)
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider')
  }
  return context
} 