'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useRadar } from '@/lib/contexts/radar-context';
import { RadarEntry } from '@/lib/types';

interface RadarEntryFormProps {
  initialEntry?: RadarEntry;
  onSave?: () => void;
}

/**
 * RadarEntryForm provides a form for creating or updating radar chart entries
 * 
 * @param {object} props - The component props
 * @param {RadarEntry} [props.initialEntry] - Optional initial entry for editing
 * @param {() => void} [props.onSave] - Callback function called after successful save
 * @returns {JSX.Element} The rendered radar entry form component
 */
export function RadarEntryForm({ initialEntry, onSave }: RadarEntryFormProps) {
  const { areas, addEntry, updateEntry } = useRadar();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [values, setValues] = useState<{ areaId: string; value: number }[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form when editing existing entry
  useEffect(() => {
    if (initialEntry) {
      setDate(initialEntry.date.split('T')[0]);
      setNotes(initialEntry.notes);
      setValues([...initialEntry.values]);
      setIsEditing(true);
    } else {
      // For new entries, initialize with all areas at value 5
      setValues(areas.map(area => ({ areaId: area.id, value: 5 })));
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setIsEditing(false);
    }
  }, [initialEntry, areas]);

  const handleValueChange = (areaId: string, newValue: number[]) => {
    setValues(prev => 
      prev.map(v => 
        v.areaId === areaId 
          ? { ...v, value: newValue[0] } 
          : v
      )
    );
  };

  const handleSave = () => {
    // Ensure every area has a value
    const completeValues = areas.map(area => {
      const existingValue = values.find(v => v.areaId === area.id);
      return existingValue || { areaId: area.id, value: 5 };
    });

    const entryData = {
      date: new Date(date).toISOString(),
      notes,
      values: completeValues,
    };

    if (isEditing && initialEntry) {
      updateEntry(initialEntry.id, entryData);
    } else {
      addEntry(entryData);
    }

    if (onSave) {
      onSave();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Entry' : 'New Entry'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <label 
            htmlFor="entry-date" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Date
          </label>
          <Input
            id="entry-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium leading-none">Rate each area (1-10)</h3>
          
          {areas.map(area => {
            const areaValue = values.find(v => v.areaId === area.id)?.value || 5;
            
            return (
              <div key={area.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor={`slider-${area.id}`}
                    className="text-sm"
                    style={{ color: area.color }}
                  >
                    {area.name}
                  </label>
                  <span className="text-sm font-medium">{areaValue}/10</span>
                </div>
                <Slider
                  id={`slider-${area.id}`}
                  min={1}
                  max={10}
                  step={1}
                  value={[areaValue]}
                  onValueChange={(val) => handleValueChange(area.id, val)}
                  aria-label={`${area.name} rating`}
                />
                <p className="text-xs text-muted-foreground">{area.description}</p>
              </div>
            );
          })}
        </div>

        <div className="space-y-1">
          <label 
            htmlFor="entry-notes" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Notes
          </label>
          <Textarea
            id="entry-notes"
            placeholder="Any thoughts on your current ratings..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>
          {isEditing ? 'Update' : 'Save'} Entry
        </Button>
      </CardFooter>
    </Card>
  );
} 