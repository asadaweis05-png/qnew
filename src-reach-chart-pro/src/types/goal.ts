export type Timeframe = 'today' | 'week' | 'month' | 'year';
export type Priority = 'low' | 'medium' | 'high';

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  timeframe: Timeframe;
  isHabit: boolean;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  streak?: number;
  notes: Note[];
}

export interface GoalStats {
  total: number;
  completed: number;
  percentage: number;
}
