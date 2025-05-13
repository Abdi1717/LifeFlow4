'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Settings, TrendingUp, GitCompare, Target } from 'lucide-react';
import { RadarProvider, useRadar } from '@/lib/contexts/radar-context';
import { RadarChart } from '@/components/radar-chart';
import { RadarEntryForm } from '@/components/radar-entry-form';
import { RadarEntriesList } from '@/components/radar-entries-list';
import { RadarAreasManager } from '@/components/radar-areas-manager';
import { RadarEntryDetail } from '@/components/radar-entry-detail';
import { RadarTimeline } from '@/components/radar-timeline';
import { RadarComparison } from '@/components/radar-comparison';
import { RadarGoalsManager } from '@/components/radar-goals-manager';
import { RadarEntry } from '@/lib/types';

function RadarContent() {
  const { getLatestEntry } = useRadar();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedEntry, setSelectedEntry] = useState<RadarEntry | null>(null);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [isEditingEntry, setIsEditingEntry] = useState(false);

  const latestEntry = getLatestEntry();

  const handleNewEntry = () => {
    setSelectedEntry(null);
    setIsAddingEntry(true);
    setIsEditingEntry(false);
    setActiveTab('add');
  };

  const handleViewEntry = (entry: RadarEntry) => {
    setSelectedEntry(entry);
    setIsAddingEntry(false);
    setIsEditingEntry(false);
    setActiveTab('detail');
  };

  const handleEditEntry = (entry: RadarEntry) => {
    setSelectedEntry(entry);
    setIsAddingEntry(false);
    setIsEditingEntry(true);
    setActiveTab('add');
  };

  const handleSaved = () => {
    setActiveTab('overview');
    setIsAddingEntry(false);
    setIsEditingEntry(false);
    setSelectedEntry(null);
  };

  const handleBackToList = () => {
    setActiveTab('entries');
    setSelectedEntry(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Personal Radar</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveTab('goals')}
            className="flex items-center gap-1"
            aria-label="Manage goals"
          >
            <Target className="h-4 w-4" />
            <span>Goals</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveTab('compare')}
            className="flex items-center gap-1"
            aria-label="Compare time periods"
          >
            <GitCompare className="h-4 w-4" />
            <span>Compare</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveTab('timeline')}
            className="flex items-center gap-1"
            aria-label="View progress timeline"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Timeline</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setActiveTab('areas')}
            className="flex items-center gap-1"
            aria-label="Manage areas"
          >
            <Settings className="h-4 w-4" />
            <span>Manage Areas</span>
          </Button>
          <Button 
            onClick={handleNewEntry}
            className="flex items-center gap-1"
            aria-label="Add new entry"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Entry</span>
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="entries">History</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="detail" disabled={!selectedEntry || isEditingEntry || isAddingEntry}>
            View Entry
          </TabsTrigger>
          <TabsTrigger value="add" disabled={!isAddingEntry && !isEditingEntry}>
            {isEditingEntry ? 'Edit Entry' : 'New Entry'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="bg-muted/20 p-4 rounded-lg">
            <RadarChart height={400} />
          </div>
          
          {latestEntry ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-3">Latest Entry: {new Date(latestEntry.date).toLocaleDateString()}</h3>
                {latestEntry.notes && (
                  <div className="p-3 rounded-lg border text-sm">
                    <h4 className="font-medium mb-1 text-sm">Notes</h4>
                    <p className="whitespace-pre-wrap">
                      {latestEntry.notes.length > 200 
                        ? `${latestEntry.notes.substring(0, 200)}...` 
                        : latestEntry.notes}
                    </p>
                  </div>
                )}
                <div className="mt-3 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewEntry(latestEntry)}
                    aria-label="View latest entry details"
                  >
                    View Details
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    onClick={handleNewEntry} 
                    className="w-full"
                    aria-label="Create new entry"
                  >
                    Record New Entry
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('goals')} 
                    className="w-full"
                    aria-label="Set and track goals"
                  >
                    Set & Track Goals
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('entries')} 
                    className="w-full"
                    aria-label="View all entries"
                  >
                    View All Entries
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('timeline')} 
                    className="w-full"
                    aria-label="View progress timeline"
                  >
                    View Progress Timeline
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('compare')} 
                    className="w-full"
                    aria-label="Compare time periods"
                  >
                    Compare Time Periods
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('areas')}
                    className="w-full"
                    aria-label="Manage tracked areas"
                  >
                    Manage Tracked Areas
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium mb-3">Welcome to Personal Radar</h3>
              <p className="text-muted-foreground mb-6">
                Track your growth across different life areas over time.
              </p>
              <Button 
                onClick={handleNewEntry}
                aria-label="Create your first entry"
              >
                Create Your First Entry
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="entries" className="mt-4">
          <RadarEntriesList 
            onSelectEntry={handleViewEntry} 
            onEditEntry={handleEditEntry} 
          />
        </TabsContent>
        
        <TabsContent value="timeline" className="mt-4">
          <RadarTimeline height={500} />
        </TabsContent>

        <TabsContent value="compare" className="mt-4">
          <RadarComparison />
        </TabsContent>
        
        <TabsContent value="goals" className="mt-4">
          <RadarGoalsManager />
        </TabsContent>
        
        <TabsContent value="detail" className="mt-4">
          {selectedEntry && (
            <RadarEntryDetail 
              entry={selectedEntry} 
              onEdit={() => handleEditEntry(selectedEntry)} 
              onBack={handleBackToList} 
            />
          )}
        </TabsContent>
        
        <TabsContent value="add" className="mt-4">
          <RadarEntryForm 
            initialEntry={isEditingEntry ? selectedEntry || undefined : undefined}
            onSave={handleSaved}
          />
        </TabsContent>
        
        <TabsContent value="areas" className="mt-4">
          <RadarAreasManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function RadarPage() {
  return (
    <RadarProvider>
      <RadarContent />
    </RadarProvider>
  );
} 