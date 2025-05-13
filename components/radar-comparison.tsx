'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadarChart } from '@/components/radar-chart';
import { useRadar } from '@/lib/contexts/radar-context';
import { RadarEntry } from '@/lib/types';
import { format } from 'date-fns';

/**
 * RadarComparison allows comparing radar data between two time periods
 * 
 * @returns {JSX.Element} The rendered radar comparison component
 */
export function RadarComparison() {
  const { entries } = useRadar();
  const [periodAEntryId, setPeriodAEntryId] = useState<string | null>(null);
  const [periodBEntryId, setPeriodBEntryId] = useState<string | null>(null);

  // Sort entries by date (newest first)
  const sortedEntries = useMemo(() => {
    return [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [entries]);

  // Get selected entries
  const periodAEntry = useMemo(() => {
    return periodAEntryId 
      ? entries.find(e => e.id === periodAEntryId) || null 
      : null;
  }, [periodAEntryId, entries]);

  const periodBEntry = useMemo(() => {
    return periodBEntryId 
      ? entries.find(e => e.id === periodBEntryId) || null 
      : null;
  }, [periodBEntryId, entries]);

  // Format date for display
  const formatEntryDate = (entry: RadarEntry) => {
    return format(new Date(entry.date), 'PPP');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Compare Time Periods</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {entries.length < 2 ? (
          <div className="text-center py-6 text-muted-foreground">
            You need at least two entries to make a comparison. 
            Add more entries to your radar to use this feature.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label 
                  htmlFor="period-a" 
                  className="text-sm font-medium"
                >
                  Period A
                </label>
                <Select
                  value={periodAEntryId || ''}
                  onValueChange={setPeriodAEntryId}
                >
                  <SelectTrigger id="period-a" className="w-full">
                    <SelectValue placeholder="Select an entry" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedEntries.map(entry => (
                      <SelectItem 
                        key={`a-${entry.id}`} 
                        value={entry.id}
                        disabled={entry.id === periodBEntryId}
                      >
                        {format(new Date(entry.date), 'MMM d, yyyy')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label 
                  htmlFor="period-b" 
                  className="text-sm font-medium"
                >
                  Period B
                </label>
                <Select
                  value={periodBEntryId || ''}
                  onValueChange={setPeriodBEntryId}
                >
                  <SelectTrigger id="period-b" className="w-full">
                    <SelectValue placeholder="Select an entry" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedEntries.map(entry => (
                      <SelectItem 
                        key={`b-${entry.id}`} 
                        value={entry.id}
                        disabled={entry.id === periodAEntryId}
                      >
                        {format(new Date(entry.date), 'MMM d, yyyy')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="bg-muted/20 p-4 rounded-lg">
              {periodAEntry && periodBEntry ? (
                <div className="space-y-1">
                  <p className="text-center text-sm text-muted-foreground mb-2">
                    Comparing {formatEntryDate(periodAEntry)} with {formatEntryDate(periodBEntry)}
                  </p>
                  <RadarChart 
                    entry={periodAEntry} 
                    previousEntry={periodBEntry}
                    showComparison={true}
                    height={400} 
                  />
                </div>
              ) : periodAEntry ? (
                <div className="space-y-1">
                  <p className="text-center text-sm text-muted-foreground mb-2">
                    Showing {formatEntryDate(periodAEntry)}
                  </p>
                  <RadarChart 
                    entry={periodAEntry} 
                    height={400} 
                  />
                </div>
              ) : periodBEntry ? (
                <div className="space-y-1">
                  <p className="text-center text-sm text-muted-foreground mb-2">
                    Showing {formatEntryDate(periodBEntry)}
                  </p>
                  <RadarChart 
                    entry={periodBEntry} 
                    height={400} 
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  Select entries from both periods to compare
                </div>
              )}
            </div>
            
            {periodAEntry && periodBEntry && (
              <div className="border rounded-lg">
                <div className="p-4 border-b bg-muted/20">
                  <h3 className="font-medium">Change Analysis</h3>
                </div>
                <div className="p-4">
                  <ComparisonTable entryA={periodAEntry} entryB={periodBEntry} />
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface ComparisonTableProps {
  entryA: RadarEntry;
  entryB: RadarEntry;
}

function ComparisonTable({ entryA, entryB }: ComparisonTableProps) {
  const { areas } = useRadar();
  
  // Calculate changes between entries
  const comparisons = useMemo(() => {
    return areas.map(area => {
      const valueA = entryA.values.find(v => v.areaId === area.id)?.value || 0;
      const valueB = entryB.values.find(v => v.areaId === area.id)?.value || 0;
      const change = valueA - valueB;
      
      return {
        area,
        valueA,
        valueB,
        change,
        percentChange: valueB === 0 ? 0 : Math.round(change / valueB * 100)
      };
    }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change)); // Sort by absolute change
  }, [areas, entryA, entryB]);
  
  const formatDate = (date: string) => format(new Date(date), 'MMM d, yyyy');
  
  return (
    <div className="overflow-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-4">Area</th>
            <th className="text-center py-2 px-4">{formatDate(entryA.date)}</th>
            <th className="text-center py-2 px-4">{formatDate(entryB.date)}</th>
            <th className="text-center py-2 px-4">Change</th>
          </tr>
        </thead>
        <tbody>
          {comparisons.map(({ area, valueA, valueB, change, percentChange }) => (
            <tr key={area.id} className="border-b">
              <td className="py-2 px-4">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: area.color }}
                  />
                  <span>{area.name}</span>
                </div>
              </td>
              <td 
                className="text-center py-2 px-4 font-medium"
                style={{ color: area.color }}
              >
                {valueA}
              </td>
              <td 
                className="text-center py-2 px-4 font-medium"
                style={{ opacity: 0.7, color: area.color }}
              >
                {valueB}
              </td>
              <td className="text-center py-2 px-4">
                <span 
                  className={`font-medium ${
                    change > 0 
                      ? 'text-green-500' 
                      : change < 0 
                        ? 'text-red-500' 
                        : 'text-muted-foreground'
                  }`}
                >
                  {change > 0 ? '+' : ''}{change}
                  {percentChange !== 0 && (
                    <span className="text-xs ml-1 text-muted-foreground">
                      ({change > 0 ? '+' : ''}{percentChange}%)
                    </span>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 