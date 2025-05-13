'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useNotes } from '@/lib/contexts/note-context';
import { Note, Tag } from '@/lib/types';
import { X, Tag as TagIcon, Check, MessageSquarePlus, ArrowLeft, Save, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { cn } from '@/lib/utils';

// Import markdown editor dynamically to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface NoteEditorProps {
  initialNote?: Note | null;
}

/**
 * NoteEditor provides a rich markdown editing experience for creating and updating notes
 * 
 * @param {object} props - The component props
 * @param {Note} [props.initialNote] - Optional initial note data for editing an existing note
 * @param {() => void} [props.onSave] - Callback function called after successful save
 * @returns {JSX.Element} The rendered note editor component
 */
export function NoteEditor({ initialNote }: NoteEditorProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { addNote, updateNote, tags, getSuggestedTags } = useNotes();
  
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(initialNote?.tags || []);
  const [tagOpen, setTagOpen] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  // Effect to resize the textarea based on content
  useEffect(() => {
    if (contentRef.current) {
      // Reset the height first to get accurate scrollHeight
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = `${contentRef.current.scrollHeight}px`;
    }
  }, [content]);

  // Effect to get tag suggestions based on content
  useEffect(() => {
    if (content.trim().length > 10) {
      const suggested = getSuggestedTags(content);
      setSuggestedTags(suggested);
    } else {
      setSuggestedTags([]);
    }
  }, [content, getSuggestedTags]);

  const handleSave = () => {
    if (!title.trim()) {
      return; // Don't save notes without a title
    }

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      tags: selectedTags,
      updatedAt: new Date().toISOString(),
    };

    if (initialNote) {
      updateNote({ ...initialNote, ...noteData });
    } else {
      addNote({
        ...noteData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      });
    }

    router.push('/dashboard/notes');
  };

  const handleAddTag = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter(id => id !== tagId));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          className="flex items-center gap-1"
          onClick={() => router.push('/dashboard/notes')}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Notes</span>
        </Button>
        <Button 
          onClick={handleSave}
          disabled={!title.trim()}
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          <span>{initialNote ? 'Update' : 'Save'} Note</span>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            <Input
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-bold border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            ref={contentRef}
            placeholder="What's on your mind?"
            className="min-h-[300px] resize-none border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          <div className="w-full flex flex-wrap gap-2 items-center">
            <TagIcon className="h-4 w-4 text-muted-foreground" />
            
            <Popover open={tagOpen} onOpenChange={setTagOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={tagOpen}
                  className="justify-between text-sm h-8"
                >
                  Select tags
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search tags..." />
                  <CommandList>
                    <CommandEmpty>No tags found</CommandEmpty>
                    <CommandGroup>
                      {tags.map((tag) => (
                        <CommandItem
                          key={tag.id}
                          value={tag.id}
                          onSelect={() => {
                            handleAddTag(tag.id);
                            setTagOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }}></div>
                            <span>{tag.name}</span>
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                selectedTags.includes(tag.id) ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            
            <div className="flex flex-wrap gap-1 ml-1">
              {selectedTags.map(tagId => {
                const tag = tags.find(t => t.id === tagId);
                return tag ? (
                  <Badge 
                    key={tag.id} 
                    variant="outline" 
                    className="flex items-center gap-1 text-xs h-7 pl-2"
                  >
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: tag.color }}
                    ></div>
                    {tag.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 p-0"
                      onClick={() => handleRemoveTag(tag.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
          
          {suggestedTags.length > 0 && (
            <div className="w-full">
              <p className="text-sm text-muted-foreground mb-2">Suggested tags based on content:</p>
              <div className="flex flex-wrap gap-1">
                {suggestedTags.map(tagId => {
                  const tag = tags.find(t => t.id === tagId);
                  if (!tag || selectedTags.includes(tagId)) return null;
                  
                  return (
                    <Badge 
                      key={tag.id} 
                      variant="secondary" 
                      className="flex items-center gap-1 text-xs cursor-pointer hover:bg-secondary/80"
                      onClick={() => handleAddTag(tag.id)}
                    >
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: tag.color }}
                      ></div>
                      {tag.name}
                      <Plus className="h-3 w-3 ml-1" />
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 