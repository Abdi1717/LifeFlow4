'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Check, Edit, Plus, Trash2, X } from 'lucide-react';
import { useNotes } from '@/lib/contexts/note-context';
import { Tag } from '@/lib/types';

// List of common colors for tags
const TAG_COLORS = [
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#059669' },
  { name: 'Yellow', value: '#d97706' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Gray', value: '#4b5563' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Orange', value: '#ea580c' },
];

/**
 * TagManager provides an interface for managing tags in the notes system
 * 
 * @returns {JSX.Element} The rendered tag manager component
 */
export function TagManager() {
  const { tags, addTag, updateTag, deleteTag } = useNotes();
  const [name, setName] = useState<string>('');
  const [color, setColor] = useState<string>(TAG_COLORS[0].value);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editColor, setEditColor] = useState<string>('');
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleAddTag = () => {
    if (name.trim()) {
      addTag({
        name: name.trim(),
        color,
      });
      // Reset form
      setName('');
      setColor(TAG_COLORS[0].value);
    }
  };

  const handleEditTag = () => {
    if (editingTag && editName.trim()) {
      updateTag({
        id: editingTag.id,
        name: editName.trim(),
        color: editColor,
      });
      setIsEditDialogOpen(false);
    }
  };

  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag);
    setEditName(tag.name);
    setEditColor(tag.color);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (tag: Tag) => {
    setTagToDelete(tag);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTag = () => {
    if (tagToDelete) {
      deleteTag(tagToDelete.id);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Tags</CardTitle>
          <CardDescription>
            Create, edit, and delete tags to organize your notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-end">
            <div className="sm:col-span-3">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                placeholder="Enter tag name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="tag-color">Tag Color</Label>
              <div className="flex gap-2">
                {TAG_COLORS.slice(0, 5).map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      color === colorOption.value ? 'border-primary' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: colorOption.value }}
                    onClick={() => setColor(colorOption.value)}
                    aria-label={`Select ${colorOption.name} color`}
                  >
                    {color === colorOption.value && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </button>
                ))}
                <select
                  className="h-8 px-2 rounded border"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  aria-label="More color options"
                >
                  {TAG_COLORS.map((colorOption) => (
                    <option key={colorOption.value} value={colorOption.value}>
                      {colorOption.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="sm:col-span-1">
              <Button onClick={handleAddTag} disabled={!name.trim()} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="flex items-center gap-1 px-2 py-1"
              >
                <div
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: tag.color }}
                />
                <span>{tag.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0 ml-1"
                  onClick={() => openEditDialog(tag)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0"
                  onClick={() => openDeleteDialog(tag)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tag Usage</CardTitle>
          <CardDescription>
            See how your tags are used across your notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="text-right">Usage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-xs">{tag.color}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Count notes with this tag */}
                    {0} notes
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openEditDialog(tag)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openDeleteDialog(tag)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Tag Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update the tag name or color.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tag-name">Tag Name</Label>
              <Input
                id="edit-tag-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Tag Color</Label>
              <div className="flex flex-wrap gap-2">
                {TAG_COLORS.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      editColor === colorOption.value ? 'border-primary' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: colorOption.value }}
                    onClick={() => setEditColor(colorOption.value)}
                    aria-label={`Select ${colorOption.name} color`}
                  >
                    {editColor === colorOption.value && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTag} disabled={!editName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tag Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tag "{tagToDelete?.name}" and remove it from all notes.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTag} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 