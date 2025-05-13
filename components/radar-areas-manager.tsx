'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarArea } from '@/lib/types';
import { useRadar } from '@/lib/contexts/radar-context';
import { PlusCircle, Pencil, Trash2, X } from 'lucide-react';

/**
 * RadarAreasManager provides a UI for managing radar chart areas
 * 
 * @returns {JSX.Element} The rendered radar areas manager component
 */
export function RadarAreasManager() {
  const { areas, addArea, updateArea, removeArea } = useRadar();
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<Omit<RadarArea, 'id'>>({
    name: '',
    description: '',
    color: '#3b82f6' // Default blue
  });

  const startEditing = (area: RadarArea) => {
    setEditingAreaId(area.id);
    setFormData({
      name: area.name,
      description: area.description,
      color: area.color,
    });
    setIsAddingNew(false);
  };

  const startAddingNew = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6', // Default blue
    });
    setEditingAreaId(null);
    setIsAddingNew(true);
  };

  const cancelEdit = () => {
    setEditingAreaId(null);
    setIsAddingNew(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;
    
    if (isAddingNew) {
      addArea(formData);
    } else if (editingAreaId) {
      updateArea(editingAreaId, formData);
    }
    
    cancelEdit();
  };

  const handleRemove = (id: string) => {
    if (confirm('Are you sure you want to remove this area? This will also remove its data from all entries.')) {
      removeArea(id);
      if (editingAreaId === id) {
        cancelEdit();
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Life Areas</h3>
        {!isAddingNew && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={startAddingNew}
            className="flex items-center gap-1"
            aria-label="Add new area"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Area</span>
          </Button>
        )}
      </div>

      {/* Area form */}
      {(isAddingNew || editingAreaId) && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {isAddingNew ? 'Add New Area' : 'Edit Area'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Physical Health"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Exercise, nutrition, sleep quality"
                  rows={2}
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="color" className="text-sm font-medium">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    className="w-14 h-8 p-1"
                  />
                  <Input
                    name="color"
                    type="text"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={cancelEdit}
                  aria-label="Cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  size="sm"
                  aria-label="Save area"
                >
                  {isAddingNew ? 'Add' : 'Update'} Area
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Areas list */}
      <div className="space-y-2">
        {areas.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No areas defined. Add your first life area to get started.
          </div>
        ) : (
          areas.map(area => (
            <div 
              key={area.id} 
              className="flex items-center justify-between p-3 rounded-md border"
              style={{ borderLeftColor: area.color, borderLeftWidth: '4px' }}
            >
              <div>
                <h4 className="font-medium">{area.name}</h4>
                {area.description && (
                  <p className="text-sm text-muted-foreground">{area.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => startEditing(area)}
                  className="h-8 w-8 p-0"
                  aria-label={`Edit ${area.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemove(area.id)}
                  className="h-8 w-8 p-0 text-destructive"
                  aria-label={`Remove ${area.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 