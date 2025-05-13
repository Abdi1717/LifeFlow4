'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Settings } from 'lucide-react';
import { NoteEditor } from '@/components/note-editor';
import { NoteList } from '@/components/note-list';
import { NoteViewer } from '@/components/note-viewer';
import { NoteProvider, useNotes } from '@/lib/contexts/note-context';
import { TagManager } from '@/components/tag-manager';
import { Note } from '@/lib/types';

function NotesContent() {
  const { currentNote, setCurrentNote } = useNotes();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const handleCreateNew = () => {
    setCurrentNote(null);
    setIsEditing(true);
    setActiveTab('edit');
  };

  const handleEditExisting = () => {
    setIsEditing(true);
    setActiveTab('edit');
  };

  const handleBackToList = () => {
    setCurrentNote(null);
    setIsEditing(false);
    setActiveTab('all');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notes & Journaling</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-1"
            aria-label="Manage tags"
          >
            <Settings className="h-4 w-4" />
            <span>Manage Tags</span>
          </Button>
          <Button 
            onClick={handleCreateNew}
            className="flex items-center gap-1"
            aria-label="Create new note"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Note</span>
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Notes</TabsTrigger>
          <TabsTrigger value="view" disabled={!currentNote || isEditing}>
            {currentNote ? 'View Note' : 'Select a Note'}
          </TabsTrigger>
          <TabsTrigger value="edit" disabled={!isEditing}>
            {isEditing ? (currentNote ? 'Edit Note' : 'New Note') : 'Edit'}
          </TabsTrigger>
          <TabsTrigger value="settings">Tag Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <NoteList />
        </TabsContent>
        
        <TabsContent value="view" className="mt-4">
          {currentNote && (
            <NoteViewer 
              note={currentNote} 
              onEdit={handleEditExisting} 
              onBack={handleBackToList}
            />
          )}
        </TabsContent>
        
        <TabsContent value="edit" className="mt-4">
          <NoteEditor initialNote={currentNote} />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <TagManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function NotesPage() {
  return (
    <NoteProvider>
      <NotesContent />
    </NoteProvider>
  );
} 