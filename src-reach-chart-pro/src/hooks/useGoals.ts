import { useState, useCallback, useMemo } from 'react';
import { Goal, Timeframe, GoalStats, Note } from '@/types/goal';

const STORAGE_KEY = 'roadmap-goals';

const loadGoals = (): Goal[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const goals = JSON.parse(stored);
      return goals.map((g: Goal) => ({
        ...g,
        createdAt: new Date(g.createdAt),
        completedAt: g.completedAt ? new Date(g.completedAt) : undefined,
        notes: (g.notes || []).map((n: Note) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        })),
      }));
    }
  } catch (e) {
    console.error('Failed to load goals:', e);
  }
  return [];
};

const saveGoals = (goals: Goal[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
};

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>(loadGoals);

  const addGoal = useCallback((title: string, timeframe: Timeframe, isHabit: boolean, description?: string) => {
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title,
      description,
      timeframe,
      isHabit,
      completed: false,
      createdAt: new Date(),
      streak: isHabit ? 0 : undefined,
      notes: [],
    };
    
    setGoals(prev => {
      const updated = [...prev, newGoal];
      saveGoals(updated);
      return updated;
    });
    
    return newGoal;
  }, []);

  const toggleGoal = useCallback((id: string) => {
    setGoals(prev => {
      const updated = prev.map(goal => {
        if (goal.id !== id) return goal;
        
        const completed = !goal.completed;
        return {
          ...goal,
          completed,
          completedAt: completed ? new Date() : undefined,
          streak: goal.isHabit && completed ? (goal.streak || 0) + 1 : goal.streak,
        };
      });
      saveGoals(updated);
      return updated;
    });
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => {
      const updated = prev.filter(goal => goal.id !== id);
      saveGoals(updated);
      return updated;
    });
  }, []);

  const addNoteToGoal = useCallback((goalId: string, content: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      content,
      createdAt: new Date(),
    };

    setGoals(prev => {
      const updated = prev.map(goal => {
        if (goal.id !== goalId) return goal;
        return {
          ...goal,
          notes: [...goal.notes, newNote],
        };
      });
      saveGoals(updated);
      return updated;
    });

    return newNote;
  }, []);

  const deleteNoteFromGoal = useCallback((goalId: string, noteId: string) => {
    setGoals(prev => {
      const updated = prev.map(goal => {
        if (goal.id !== goalId) return goal;
        return {
          ...goal,
          notes: goal.notes.filter(n => n.id !== noteId),
        };
      });
      saveGoals(updated);
      return updated;
    });
  }, []);

  const getGoalsByTimeframe = useCallback((timeframe: Timeframe) => {
    return goals.filter(goal => goal.timeframe === timeframe);
  }, [goals]);

  const getStats = useCallback((timeframe: Timeframe): GoalStats => {
    const filtered = getGoalsByTimeframe(timeframe);
    const completed = filtered.filter(g => g.completed).length;
    return {
      total: filtered.length,
      completed,
      percentage: filtered.length > 0 ? Math.round((completed / filtered.length) * 100) : 0,
    };
  }, [getGoalsByTimeframe]);

  const totalStats = useMemo((): GoalStats => {
    const completed = goals.filter(g => g.completed).length;
    return {
      total: goals.length,
      completed,
      percentage: goals.length > 0 ? Math.round((completed / goals.length) * 100) : 0,
    };
  }, [goals]);

  const allNotes = useMemo(() => {
    return goals.flatMap(goal => 
      goal.notes.map(note => ({
        ...note,
        goalId: goal.id,
        goalTitle: goal.title,
      }))
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [goals]);

  return {
    goals,
    addGoal,
    toggleGoal,
    deleteGoal,
    addNoteToGoal,
    deleteNoteFromGoal,
    getGoalsByTimeframe,
    getStats,
    totalStats,
    allNotes,
  };
};
