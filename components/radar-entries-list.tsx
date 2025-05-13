'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRadar } from '@/lib/contexts/radar-context';
import { RadarEntry } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpDown, Pencil, Trash2, Eye } from 'lucide-react';

interface RadarEntriesListProps {
  onSelectEntry: (entry: RadarEntry) => void;
  onEditEntry: (entry: RadarEntry) => void;
}

/**
 * RadarEntriesList displays a list of radar entries with sorting and actions
 * 
 * @param {object} props - The component props
 * @param {(entry: RadarEntry) => void} props.onSelectEntry - Callback when an entry is selected for viewing
 * @param {(entry: RadarEntry) => void} props.onEditEntry - Callback when an entry is selected for editing
 * @returns {JSX.Element} The rendered radar entries list component
 */
export function RadarEntriesList({ onSelectEntry, onEditEntry }: RadarEntriesListProps) {
  const { entries, removeEntry, areas } = useRadar();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortDirection === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const handleRemove = (id: string) => {
    if (confirm('Are you sure you want to remove this entry?')) {
      removeEntry(id);
    }
  };

  // Function to calculate average score for an entry
  const calculateAverageScore = (entry: RadarEntry): number => {
    if (entry.values.length === 0) return 0;
    
    const sum = entry.values.reduce((total, value) => total + value.value, 0);
    return Math.round((sum / entry.values.length) * 10) / 10;
  };

  // Function to get area color if present
  const getAreaColor = (areaId: string): string => {
    const area = areas.find(a => a.id === areaId);
    return area?.color || '#888888';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Entries</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleSortDirection}
          className="flex items-center gap-1"
          aria-label="Sort by date"
        >
          <span>Sort by Date</span>
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {sortedEntries.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No entries yet. Create your first entry to start tracking!
          </div>
        ) : (
          sortedEntries.map(entry => (
            <Card key={entry.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base">
                    {new Date(entry.date).toLocaleDateString()}
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
                  </div>
                </div>
                <div className="text-lg font-semibold">
                  {calculateAverageScore(entry)}/10
                </div>
              </CardHeader>
              <CardContent>
                {/* Mini visualization of scores */}
                <div className="flex items-center gap-1 mb-3">
                  {entry.values.map((value) => (
                    <div 
                      key={value.areaId} 
                      className="flex-1 h-2 rounded-full" 
                      style={{
                        backgroundColor: getAreaColor(value.areaId),
                        opacity: value.value / 10
                      }}
                      title={`${areas.find(a => a.id === value.areaId)?.name}: ${value.value}/10`}
                    />
                  ))}
                </div>
                
                {entry.notes && (
                  <p className="text-sm line-clamp-2 mb-2">
                    {entry.notes}
                  </p>
                )}
                
                <div className="flex justify-end gap-1 mt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onSelectEntry(entry)}
                    className="h-8 w-8 p-0"
                    aria-label="View entry details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEditEntry(entry)}
                    className="h-8 w-8 p-0"
                    aria-label="Edit entry"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemove(entry.id)}
                    className="h-8 w-8 p-0 text-destructive"
                    aria-label="Delete entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 