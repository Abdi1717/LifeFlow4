'use client'

import { useState, useEffect } from 'react'
import { useNetwork } from '@/lib/contexts/network-context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Search, Filter } from 'lucide-react'

export function NetworkSearch() {
  const { contacts, groups, filterContacts, clearFilters } = useNetwork()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)

  // Apply filters when search term or selected groups change
  useEffect(() => {
    if (searchTerm || selectedGroups.length > 0) {
      filterContacts(searchTerm, selectedGroups.length > 0 ? selectedGroups : undefined)
    } else {
      clearFilters()
    }
  }, [searchTerm, selectedGroups, filterContacts, clearFilters])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  // Toggle group selection
  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedGroups([])
    clearFilters()
  }

  return (
    <Card className="h-full">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Search Contacts</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="h-8 w-8"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search network..."
              value={searchTerm}
              onChange={handleSearchChange}
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
        </div>

        {/* Active Filters */}
        {(searchTerm || selectedGroups.length > 0) && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs">Active Filters</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={handleClearFilters}
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {searchTerm && (
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-1"
                >
                  "{searchTerm}"
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchTerm('')}
                    className="h-3 w-3 rounded-full p-0 ml-1"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                </Badge>
              )}
              {selectedGroups.map(groupId => {
                const group = groups.find(g => g.id === groupId)
                return group ? (
                  <Badge 
                    key={groupId}
                    style={{ backgroundColor: group.color }}
                    className="text-white flex items-center gap-1"
                  >
                    {group.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleGroup(groupId)}
                      className="h-3 w-3 rounded-full p-0 ml-1 text-white hover:text-white/70"
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ) : null
              })}
            </div>
          </div>
        )}

        {/* Group Filters */}
        {isFilterExpanded && groups.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-xs">Filter by Group</Label>
            <div className="grid grid-cols-1 gap-2">
              {groups.map(group => (
                <div key={group.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`group-${group.id}`}
                    checked={selectedGroups.includes(group.id)}
                    onCheckedChange={() => toggleGroup(group.id)}
                  />
                  <Label
                    htmlFor={`group-${group.id}`}
                    className="text-sm font-normal flex items-center"
                  >
                    <span 
                      className="inline-block w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: group.color }}
                    ></span>
                    {group.name}
                    <span className="text-muted-foreground ml-1 text-xs">
                      ({contacts.filter(c => c.groups.includes(group.id)).length})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Connection Stats */}
        <div className="pt-2 border-t mt-4">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Total Contacts</span>
              <span className="text-xs font-medium">{contacts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Groups</span>
              <span className="text-xs font-medium">{groups.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 