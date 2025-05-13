'use client';

import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Tag as TagIcon, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Note } from '@/lib/types';
import { useNotes } from '@/lib/contexts/note-context';

interface NoteViewerProps {
  note: Note;
  onEdit: () => void;
  onBack: () => void;
}

export function NoteViewer({ note, onEdit, onBack }: NoteViewerProps) {
  const { deleteNote, tags } = useNotes();

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNote(note.id);
      onBack();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Button 
            variant="ghost" 
            className="p-0 h-8 mr-2" 
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back</span>
          </Button>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              onClick={onEdit}
              variant="ghost"
              aria-label="Edit note"
            >
              <Edit className="h-4 w-4 mr-1" />
              <span>Edit</span>
            </Button>
            <Button 
              size="sm" 
              onClick={handleDelete}
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              aria-label="Delete note"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">{note.title}</CardTitle>
        <div className="text-sm text-muted-foreground">
          Last updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
        </div>
      </CardHeader>
      <CardContent className="prose prose-sm dark:prose-invert max-w-none pb-2">
        <ReactMarkdown>{note.content}</ReactMarkdown>
      </CardContent>
      {note.tags && note.tags.length > 0 && (
        <CardFooter className="pt-0 flex flex-wrap gap-2 border-t py-3">
          <TagIcon className="h-4 w-4 text-muted-foreground" />
          {note.tags.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            return tag ? (
              <Badge 
                key={tag.id} 
                variant="outline" 
                className="flex items-center gap-1"
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: tag.color }}
                ></div>
                {tag.name}
              </Badge>
            ) : null;
          })}
        </CardFooter>
      )}
    </Card>
  );
} 