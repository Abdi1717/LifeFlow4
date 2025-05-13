// Note types
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[]; // Array of tag IDs
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
}

// Personal Radar types
export interface RadarArea {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface RadarValue {
  areaId: string;
  value: number; // Score from 1-10
}

export interface RadarEntry {
  id: string;
  date: string;
  notes?: string;
  values: RadarValue[];
}

// New Goal setting types for Personal Radar
export interface RadarGoal {
  id: string;
  areaId: string;
  targetValue: number; // Target score from 1-10
  targetDate: string;
  startDate: string;
  startValue: number;
  title: string;
  description?: string;
  completed: boolean;
  milestones?: RadarGoalMilestone[];
}

export interface RadarGoalMilestone {
  id: string;
  value: number;
  description: string;
  completed: boolean;
  date?: string; // Date milestone was reached (if completed)
} 