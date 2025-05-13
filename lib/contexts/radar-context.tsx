'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { RadarArea, RadarEntry, RadarGoal, RadarGoalMilestone } from '@/lib/types';

// Default areas for personal development
const DEFAULT_AREAS: RadarArea[] = [
  { id: 'physical', name: 'Physical Health', description: 'Exercise, nutrition, sleep quality', color: '#10b981' },
  { id: 'mental', name: 'Mental Health', description: 'Stress levels, happiness, emotional wellbeing', color: '#3b82f6' },
  { id: 'social', name: 'Social Connection', description: 'Relationships, community involvement', color: '#f59e0b' },
  { id: 'career', name: 'Career Growth', description: 'Professional development, skills improvement', color: '#8b5cf6' },
  { id: 'financial', name: 'Financial Health', description: 'Savings, investments, income growth', color: '#ec4899' },
  { id: 'learning', name: 'Learning', description: 'New skills, reading, education', color: '#06b6d4' },
  { id: 'creative', name: 'Creative Expression', description: 'Art, music, writing, crafts', color: '#ef4444' },
];

interface RadarContextType {
  areas: RadarArea[];
  entries: RadarEntry[];
  goals: RadarGoal[];
  addArea: (area: Omit<RadarArea, 'id'>) => void;
  updateArea: (id: string, data: Partial<Omit<RadarArea, 'id'>>) => void;
  removeArea: (id: string) => void;
  addEntry: (entry: Omit<RadarEntry, 'id'>) => void;
  updateEntry: (id: string, data: Partial<Omit<RadarEntry, 'id'>>) => void;
  removeEntry: (id: string) => void;
  getLatestEntry: () => RadarEntry | null;
  getEntriesByDateRange: (startDate: string, endDate: string) => RadarEntry[];
  // New goal management functions
  addGoal: (goal: Omit<RadarGoal, 'id'>) => void;
  updateGoal: (id: string, data: Partial<Omit<RadarGoal, 'id'>>) => void;
  removeGoal: (id: string) => void;
  getGoalsByArea: (areaId: string) => RadarGoal[];
  addGoalMilestone: (goalId: string, milestone: Omit<RadarGoalMilestone, 'id'>) => void;
  updateGoalMilestone: (goalId: string, milestoneId: string, data: Partial<Omit<RadarGoalMilestone, 'id'>>) => void;
  removeGoalMilestone: (goalId: string, milestoneId: string) => void;
  getActiveGoals: () => RadarGoal[];
  getCompletedGoals: () => RadarGoal[];
  calculateGoalProgress: (goalId: string) => { currentValue: number; progress: number };
}

const RadarContext = createContext<RadarContextType | undefined>(undefined);

export function RadarProvider({ children }: { children: React.ReactNode }) {
  const [areas, setAreas] = useState<RadarArea[]>([]);
  const [entries, setEntries] = useState<RadarEntry[]>([]);
  const [goals, setGoals] = useState<RadarGoal[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    // Load areas
    const savedAreas = localStorage.getItem('lifeflow-radar-areas');
    if (savedAreas) {
      try {
        setAreas(JSON.parse(savedAreas));
      } catch (error) {
        console.error('Failed to parse saved areas:', error);
        setAreas(DEFAULT_AREAS);
      }
    } else {
      setAreas(DEFAULT_AREAS);
    }

    // Load entries
    const savedEntries = localStorage.getItem('lifeflow-radar-entries');
    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries));
      } catch (error) {
        console.error('Failed to parse saved entries:', error);
      }
    }

    // Load goals
    const savedGoals = localStorage.getItem('lifeflow-radar-goals');
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (error) {
        console.error('Failed to parse saved goals:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('lifeflow-radar-areas', JSON.stringify(areas));
  }, [areas]);

  useEffect(() => {
    localStorage.setItem('lifeflow-radar-entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('lifeflow-radar-goals', JSON.stringify(goals));
  }, [goals]);

  const addArea = (areaData: Omit<RadarArea, 'id'>) => {
    const newArea: RadarArea = {
      id: `area_${Date.now()}`,
      ...areaData,
    };
    setAreas(prev => [...prev, newArea]);
  };

  const updateArea = (id: string, data: Partial<Omit<RadarArea, 'id'>>) => {
    setAreas(prev => 
      prev.map(area => 
        area.id === id 
          ? { ...area, ...data } 
          : area
      )
    );
  };

  const removeArea = (id: string) => {
    setAreas(prev => prev.filter(area => area.id !== id));
    // Also remove this area from all entries
    setEntries(prev => 
      prev.map(entry => ({
        ...entry,
        values: entry.values.filter(v => v.areaId !== id)
      }))
    );
    // Remove goals associated with this area
    setGoals(prev => prev.filter(goal => goal.areaId !== id));
  };

  const addEntry = (entryData: Omit<RadarEntry, 'id'>) => {
    const newEntry: RadarEntry = {
      id: `entry_${Date.now()}`,
      ...entryData,
    };
    setEntries(prev => [...prev, newEntry]);
    
    // Check for completed goals based on this new entry
    newEntry.values.forEach(value => {
      const goalsForArea = goals.filter(g => 
        g.areaId === value.areaId && !g.completed
      );
      
      goalsForArea.forEach(goal => {
        if (value.value >= goal.targetValue) {
          // Mark goal as completed
          updateGoal(goal.id, { 
            completed: true 
          });
        }
      });
    });
  };

  const updateEntry = (id: string, data: Partial<Omit<RadarEntry, 'id'>>) => {
    setEntries(prev => 
      prev.map(entry => 
        entry.id === id 
          ? { ...entry, ...data } 
          : entry
      )
    );
  };

  const removeEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const getLatestEntry = (): RadarEntry | null => {
    if (entries.length === 0) return null;
    
    return entries.reduce((latest, current) => {
      return new Date(current.date) > new Date(latest.date) ? current : latest;
    }, entries[0]);
  };

  const getEntriesByDateRange = (startDate: string, endDate: string): RadarEntry[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  // Goal management functions
  const addGoal = (goalData: Omit<RadarGoal, 'id'>) => {
    const newGoal: RadarGoal = {
      id: `goal_${Date.now()}`,
      ...goalData,
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const updateGoal = (id: string, data: Partial<Omit<RadarGoal, 'id'>>) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === id 
          ? { ...goal, ...data } 
          : goal
      )
    );
  };

  const removeGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const getGoalsByArea = (areaId: string): RadarGoal[] => {
    return goals.filter(goal => goal.areaId === areaId);
  };

  const addGoalMilestone = (goalId: string, milestoneData: Omit<RadarGoalMilestone, 'id'>) => {
    const newMilestone: RadarGoalMilestone = {
      id: `milestone_${Date.now()}`,
      ...milestoneData,
    };
    
    setGoals(prev => 
      prev.map(goal => 
        goal.id === goalId 
          ? { 
              ...goal, 
              milestones: [...(goal.milestones || []), newMilestone] 
            } 
          : goal
      )
    );
  };

  const updateGoalMilestone = (
    goalId: string, 
    milestoneId: string, 
    data: Partial<Omit<RadarGoalMilestone, 'id'>>
  ) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === goalId && goal.milestones 
          ? { 
              ...goal, 
              milestones: goal.milestones.map(milestone => 
                milestone.id === milestoneId 
                  ? { ...milestone, ...data } 
                  : milestone
              ) 
            } 
          : goal
      )
    );
  };

  const removeGoalMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === goalId && goal.milestones 
          ? { 
              ...goal, 
              milestones: goal.milestones.filter(milestone => milestone.id !== milestoneId) 
            } 
          : goal
      )
    );
  };

  const getActiveGoals = (): RadarGoal[] => {
    return goals.filter(goal => !goal.completed);
  };

  const getCompletedGoals = (): RadarGoal[] => {
    return goals.filter(goal => goal.completed);
  };

  const calculateGoalProgress = (goalId: string): { currentValue: number; progress: number } => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) {
      return { currentValue: 0, progress: 0 };
    }

    const latestEntry = getLatestEntry();
    if (!latestEntry) {
      return { currentValue: goal.startValue, progress: 0 };
    }

    const latestValue = latestEntry.values.find(v => v.areaId === goal.areaId)?.value || goal.startValue;
    
    // Calculate progress percentage
    const totalChange = goal.targetValue - goal.startValue;
    if (totalChange <= 0) {
      return { currentValue: latestValue, progress: 100 }; // Already achieved or invalid goal
    }

    const currentChange = latestValue - goal.startValue;
    const progress = Math.min(100, Math.max(0, (currentChange / totalChange) * 100));
    
    return { currentValue: latestValue, progress };
  };

  return (
    <RadarContext.Provider
      value={{
        areas,
        entries,
        goals,
        addArea,
        updateArea,
        removeArea,
        addEntry,
        updateEntry,
        removeEntry,
        getLatestEntry,
        getEntriesByDateRange,
        addGoal,
        updateGoal,
        removeGoal,
        getGoalsByArea,
        addGoalMilestone,
        updateGoalMilestone,
        removeGoalMilestone,
        getActiveGoals,
        getCompletedGoals,
        calculateGoalProgress
      }}
    >
      {children}
    </RadarContext.Provider>
  );
}

export function useRadar() {
  const context = useContext(RadarContext);
  if (context === undefined) {
    throw new Error('useRadar must be used within a RadarProvider');
  }
  return context;
} 