'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Settings, TrendingUp, GitCompare, Target } from 'lucide-react';
import { useRadar } from '@/lib/contexts/radar-context';
import { RadarEntry } from '@/lib/types';
import { lazyImport } from '@/lib/utils';
import { Suspense } from 'react';
import Loading from '@/components/loading';

// Lazy load the heavy components
const RadarChart = lazyImport(() => import('@/components/radar-chart').then(mod => ({ default: mod.RadarChart })), {
  displayName: 'RadarChart',
  ssr: false,
  loading: <Loading text="Rendering radar chart..." />
});

const RadarEntryForm = lazyImport(() => import('@/components/radar-entry-form').then(mod => ({ default: mod.RadarEntryForm })), {
  displayName: 'RadarEntryForm',
  ssr: false,
  loading: <Loading text="Loading form..." />
});

const RadarEntriesList = lazyImport(() => import('@/components/radar-entries-list').then(mod => ({ default: mod.RadarEntriesList })), {
  displayName: 'RadarEntriesList',
  ssr: false,
  loading: <Loading text="Loading entries..." />
});

const RadarAreasManager = lazyImport(() => import('@/components/radar-areas-manager').then(mod => ({ default: mod.RadarAreasManager })), {
  displayName: 'RadarAreasManager',
  ssr: false,
  loading: <Loading text="Loading areas manager..." />
});

const RadarEntryDetail = lazyImport(() => import('@/components/radar-entry-detail').then(mod => ({ default: mod.RadarEntryDetail })), {
  displayName: 'RadarEntryDetail',
  ssr: false,
  loading: <Loading text="Loading entry details..." />
});

const RadarTimeline = lazyImport(() => import('@/components/radar-timeline').then(mod => ({ default: mod.RadarTimeline })), {
  displayName: 'RadarTimeline',
  ssr: false,
  loading: <Loading text="Loading timeline..." />
});

const RadarComparison = lazyImport(() => import('@/components/radar-comparison').then(mod => ({ default: mod.RadarComparison })), {
  displayName: 'RadarComparison',
  ssr: false,
  loading: <Loading text="Loading comparison view..." />
});

const RadarGoalsManager = lazyImport(() => import('@/components/radar-goals-manager').then(mod => ({ default: mod.RadarGoalsManager })), {
  displayName: 'RadarGoalsManager',
  ssr: false,
  loading: <Loading text="Loading goals manager..." />
});

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
            <Suspense fallback={<Loading text="Rendering radar chart..." />}>
              <RadarChart height={400} />
            </Suspense>
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
          <Suspense fallback={<Loading text="Loading entries..." />}>
            <RadarEntriesList 
              onSelectEntry={handleViewEntry} 
              onEditEntry={handleEditEntry} 
            />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="timeline" className="mt-4">
          <Suspense fallback={<Loading text="Loading timeline..." />}>
            <RadarTimeline height={500} />
          </Suspense>
        </TabsContent>

        <TabsContent value="compare" className="mt-4">
          <Suspense fallback={<Loading text="Loading comparison view..." />}>
            <RadarComparison />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="goals" className="mt-4">
          <Suspense fallback={<Loading text="Loading goals manager..." />}>
            <RadarGoalsManager />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="detail" className="mt-4">
          {selectedEntry && (
            <Suspense fallback={<Loading text="Loading entry details..." />}>
              <RadarEntryDetail 
                entry={selectedEntry} 
                onBack={handleBackToList}
                onEdit={() => handleEditEntry(selectedEntry)}
              />
            </Suspense>
          )}
        </TabsContent>
        
        <TabsContent value="add" className="mt-4">
          <Suspense fallback={<Loading text="Loading form..." />}>
            <RadarEntryForm 
              onSaved={handleSaved}
              existingEntry={isEditingEntry ? selectedEntry : undefined}
              isEditing={isEditingEntry}
            />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="areas" className="mt-4">
          <Suspense fallback={<Loading text="Loading areas manager..." />}>
            <RadarAreasManager />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function RadarPage() {
  return (
    <div className="container mx-auto py-6">
      <RadarContent />
    </div>
  )
} 