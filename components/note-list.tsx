'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from 'date-fns';
import { Search, X, Tag as TagIcon } from 'lucide-react';
import { useNotes } from '@/lib/contexts/note-context';
import { Note, Tag } from '@/lib/types';

/**
 * NoteList displays a searchable, filterable list of notes with tag filtering
 * 
 * @returns {JSX.Element} The rendered note list component
 */
export function NoteList() {
  const { notes, setCurrentNote, tags } = useNotes();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      // Filter by search term
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           note.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by tag
      const matchesTag = selectedTag === 'all' || 
                        (note.tags && note.tags.some(tagId => tagId === selectedTag));
      
      return matchesSearch && matchesTag;
    });
  }, [notes, searchTerm, selectedTag]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag('all');
  };

  const handleNoteSelect = (note: Note) => {
    setCurrentNote(note);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Notes</CardTitle>
        <CardDescription>Browse and search through your collected thoughts.</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1.5 h-6 w-6" 
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex-none sm:w-1/3">
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {tags.map(tag => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }}></div>
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(searchTerm || selectedTag !== 'all') && (
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground">
                  Showing {filteredNotes.length} of {notes.length} notes
                </span>
                {selectedTag !== 'all' && tags.find(t => t.id === selectedTag) && (
                  <Badge variant="outline" className="flex gap-1 items-center">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: tags.find(t => t.id === selectedTag)?.color }}
                    ></div>
                    {tags.find(t => t.id === selectedTag)?.name}
                  </Badge>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-8 px-2 text-xs"
              >
                Clear filters
              </Button>
            </div>
          )}
          
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No notes found</p>
              {(searchTerm || selectedTag !== 'all') && (
                <Button 
                  variant="link" 
                  onClick={clearFilters}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <Card 
                    key={note.id} 
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => handleNoteSelect(note)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg truncate">{note.title}</CardTitle>
                      <CardDescription>
                        {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {note.content.replace(/#{1,6}|\*\*|\*|~~|```[\s\S]*?```|`/g, '').trim()}
                      </p>
                    </CardContent>
                    {note.tags && note.tags.length > 0 && (
                      <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
                        <TagIcon className="h-4 w-4 text-muted-foreground mr-1" />
                        {note.tags.map(tagId => {
                          const tag = tags.find(t => t.id === tagId);
                          return tag ? (
                            <Badge 
                              key={tag.id} 
                              variant="outline" 
                              className="flex items-center gap-1 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTag(tag.id);
                              }}
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
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 