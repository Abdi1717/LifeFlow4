'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { Note, Tag } from '@/lib/types';

interface NoteContextType {
  notes: Note[];
  tags: Tag[];
  currentNote: Note | null;
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  setCurrentNote: (note: Note | null) => void;
  searchNotes: (query: string) => Note[];
  addTag: (tag: Omit<Tag, 'id'>) => string;
  updateTag: (tag: Tag) => void;
  deleteTag: (id: string) => void;
  getSuggestedTags: (content: string) => string[];
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

const DEFAULT_TAGS: Tag[] = [
  { id: 'tag-1', name: 'personal', color: '#4f46e5' },
  { id: 'tag-2', name: 'work', color: '#059669' },
  { id: 'tag-3', name: 'ideas', color: '#d97706' },
  { id: 'tag-4', name: 'important', color: '#dc2626' },
];

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<Tag[]>(DEFAULT_TAGS);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('lifeflow-notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to parse saved notes:', e);
      }
    }

    const savedTags = localStorage.getItem('lifeflow-tags');
    if (savedTags) {
      try {
        setTags(JSON.parse(savedTags));
      } catch (e) {
        console.error('Failed to parse saved tags:', e);
        // Fallback to default tags if parsing fails
        setTags(DEFAULT_TAGS);
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lifeflow-notes', JSON.stringify(notes));
  }, [notes]);

  // Save tags to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lifeflow-tags', JSON.stringify(tags));
  }, [tags]);

  // Add a new note
  const addNote = (note: Note) => {
    setNotes(prev => [note, ...prev]);
    return note;
  };

  // Update an existing note
  const updateNote = (updatedNote: Note) => {
    setNotes(prev =>
      prev.map(note => {
        if (note.id === updatedNote.id) {
          // If current note is being updated, also update currentNote state
          if (currentNote?.id === updatedNote.id) {
            setCurrentNote(updatedNote);
          }
          return updatedNote;
        }
        return note;
      })
    );
  };

  // Delete a note
  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    // Clear current note if it's the one being deleted
    if (currentNote?.id === id) {
      setCurrentNote(null);
    }
  };

  // Search notes by title and content
  const searchNotes = (query: string) => {
    if (!query.trim()) return notes;
    
    const normalizedQuery = query.toLowerCase().trim();
    
    return notes.filter(note => {
      // Search in title
      if (note.title.toLowerCase().includes(normalizedQuery)) return true;
      
      // Search in content
      if (note.content.toLowerCase().includes(normalizedQuery)) return true;
      
      // Search in tags
      if (note.tags && note.tags.some(tagId => {
        const tagObj = tags.find(t => t.id === tagId);
        return tagObj && tagObj.name.toLowerCase().includes(normalizedQuery);
      })) return true;
      
      return false;
    });
  };

  // Add a new tag
  const addTag = (tag: Omit<Tag, 'id'>) => {
    const id = `tag-${Date.now()}`;
    const newTag: Tag = { id, ...tag };
    setTags(prev => [...prev, newTag]);
    return id;
  };

  // Update a tag
  const updateTag = (updatedTag: Tag) => {
    setTags(prev => 
      prev.map(tag => tag.id === updatedTag.id ? updatedTag : tag)
    );
  };

  // Delete a tag
  const deleteTag = (id: string) => {
    // Remove the tag
    setTags(prev => prev.filter(tag => tag.id !== id));
    
    // Also remove this tag from all notes that have it
    setNotes(prev =>
      prev.map(note => {
        if (note.tags && note.tags.includes(id)) {
          return {
            ...note,
            tags: note.tags.filter(tagId => tagId !== id),
            updatedAt: new Date().toISOString(),
          };
        }
        return note;
      })
    );
  };

  // Suggest tags based on note content
  const getSuggestedTags = (content: string): string[] => {
    if (!content || !content.trim()) return [];
    
    const normalizedContent = content.toLowerCase();
    const suggestedTagIds: string[] = [];
    
    // Check if content contains tag names
    tags.forEach(tag => {
      if (normalizedContent.includes(tag.name.toLowerCase())) {
        suggestedTagIds.push(tag.id);
      }
    });
    
    // Extract keywords from content (simple implementation)
    const words = normalizedContent
      .replace(/[^\w\s]/g, ' ') // Replace non-alphanumeric with spaces
      .split(/\s+/)
      .filter(word => word.length > 3) // Only words with more than 3 chars
      .filter(word => !['this', 'that', 'with', 'from', 'have', 'there', 'would', 'should', 'could'].includes(word)); // Filter common words
    
    // Count word frequency
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Find tags that match frequent words
    Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1]) // Sort by frequency
      .slice(0, 10) // Take top 10 words
      .forEach(([word]) => {
        // Find tags that are similar to the word
        tags.forEach(tag => {
          if (tag.name.toLowerCase().includes(word) || word.includes(tag.name.toLowerCase())) {
            if (!suggestedTagIds.includes(tag.id)) {
              suggestedTagIds.push(tag.id);
            }
          }
        });
      });
    
    return suggestedTagIds.slice(0, 5); // Return top 5 tag suggestions
  };

  const value = {
    notes,
    tags,
    currentNote,
    addNote,
    updateNote,
    deleteNote,
    setCurrentNote,
    searchNotes,
    addTag,
    updateTag,
    deleteTag,
    getSuggestedTags,
  };

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
}

export function useNotes() {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
} 