'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadarChart } from '@/components/radar-chart';
import { useRadar } from '@/lib/contexts/radar-context';
import { RadarEntry } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ChevronLeft, Edit } from 'lucide-react';

interface RadarEntryDetailProps {
  entry: RadarEntry;
  onEdit: () => void;
  onBack: () => void;
}

/**
 * RadarEntryDetail displays detailed information about a radar entry
 * 
 * @param {object} props - The component props
 * @param {RadarEntry} props.entry - The radar entry to display
 * @param {() => void} props.onEdit - Callback when edit button is clicked
 * @param {() => void} props.onBack - Callback when back button is clicked
 * @returns {JSX.Element} The rendered radar entry detail component
 */
export function RadarEntryDetail({ entry, onEdit, onBack }: RadarEntryDetailProps) {
  const { areas, entries } = useRadar();

  // Find the previous entry for comparison
  const previousEntries = entries
    .filter(e => new Date(e.date) < new Date(entry.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const previousEntry = previousEntries.length > 0 ? previousEntries[0] : null;

  // Calculate average score
  const calculateAverageScore = (): number => {
    if (entry.values.length === 0) return 0;
    
    const sum = entry.values.reduce((total, value) => total + value.value, 0);
    return Math.round((sum / entry.values.length) * 10) / 10;
  };

  // Get highest and lowest scoring areas
  const getHighestAndLowestAreas = () => {
    if (entry.values.length === 0) return { highest: null, lowest: null };

    let highest = entry.values[0];
    let lowest = entry.values[0];

    entry.values.forEach(value => {
      if (value.value > highest.value) highest = value;
      if (value.value < lowest.value) lowest = value;
    });

    return {
      highest: {
        value: highest.value,
        area: areas.find(a => a.id === highest.areaId)
      },
      lowest: {
        value: lowest.value,
        area: areas.find(a => a.id === lowest.areaId)
      }
    };
  };

  const { highest, lowest } = getHighestAndLowestAreas();

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="p-0 h-8 w-8"
            aria-label="Back to entries list"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Life Areas: {new Date(entry.date).toLocaleDateString()}</CardTitle>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-muted-foreground">
            Entry from {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
            className="flex items-center gap-1"
            aria-label="Edit entry"
          >
            <Edit className="h-3.5 w-3.5" />
            <span className="text-xs">Edit</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/20 p-4 rounded-lg">
          <RadarChart 
            entry={entry}
            previousEntry={previousEntry}
            showComparison={previousEntry !== null}
            height={350}
          />
        </div>

        <div>
          <h3 className="font-medium mb-2">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border">
              <div className="text-sm text-muted-foreground">Average Score</div>
              <div className="text-2xl font-semibold">{calculateAverageScore()}/10</div>
            </div>
            
            {highest?.area && (
              <div className="p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground">Strongest Area</div>
                <div className="text-lg font-medium">
                  {highest.area.name}
                </div>
                <div 
                  className="text-sm font-semibold"
                  style={{ color: highest.area.color }}
                >
                  {highest.value}/10
                </div>
              </div>
            )}
            
            {lowest?.area && (
              <div className="p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground">Area for Growth</div>
                <div className="text-lg font-medium">
                  {lowest.area.name}
                </div>
                <div 
                  className="text-sm font-semibold"
                  style={{ color: lowest.area.color }}
                >
                  {lowest.value}/10
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">All Scores</h3>
          <div className="space-y-2">
            {entry.values.map(value => {
              const area = areas.find(a => a.id === value.areaId);
              if (!area) return null;
              
              return (
                <div key={value.areaId} className="flex justify-between items-center p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: area.color }}
                    />
                    <span>{area.name}</span>
                  </div>
                  <div 
                    className="font-semibold"
                    style={{ color: area.color }}
                  >
                    {value.value}/10
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {entry.notes && (
          <div>
            <h3 className="font-medium mb-2">Notes</h3>
            <div className="p-3 rounded-lg border text-sm whitespace-pre-wrap">
              {entry.notes}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {previousEntry && (
          <div className="text-sm text-muted-foreground">
            Previous entry: {new Date(previousEntry.date).toLocaleDateString()}
          </div>
        )}
      </CardFooter>
    </Card>
  );
} 