import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Timeframe, GoalStats, Priority } from '@/types/goal';
import { useToast } from '@/hooks/use-toast';

export interface DbGoal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  timeframe: Timeframe;
  is_habit: boolean;
  completed: boolean;
  streak: number;
  priority: Priority;
  created_at: string;
  updated_at: string;
  notes: DbNote[];
  owner_name?: string;
  is_shared?: boolean;
}

export interface DbNote {
  id: string;
  goal_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name?: string;
}

export const useDbGoals = () => {
  const [goals, setGoals] = useState<DbGoal[]>([]);
  const [sharedGoals, setSharedGoals] = useState<DbGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setSharedGoals([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch user's own goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      // Fetch notes for user's goals
      const goalIds = goalsData?.map(g => g.id) || [];
      let notesData: DbNote[] = [];
      
      if (goalIds.length > 0) {
        const { data: notes, error: notesError } = await supabase
          .from('goal_notes')
          .select('*')
          .in('goal_id', goalIds);
        
        if (notesError) throw notesError;
        notesData = notes || [];
      }

      // Combine goals with notes
      const goalsWithNotes = (goalsData || []).map(goal => ({
        ...goal,
        timeframe: goal.timeframe as Timeframe,
        priority: (goal.priority || 'medium') as Priority,
        notes: notesData.filter(n => n.goal_id === goal.id),
      }));

      setGoals(goalsWithNotes);

      // Fetch shared goals
      const { data: sharedData, error: sharedError } = await supabase
        .from('shared_goals')
        .select(`
          goal_id,
          owner_id,
          goals!inner (*)
        `)
        .eq('shared_with_id', user.id);

      if (sharedError) throw sharedError;

      // Get owner profiles for shared goals
      const ownerIds = [...new Set(sharedData?.map(s => s.owner_id) || [])];
      let profilesMap: Record<string, string> = {};
      
      if (ownerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', ownerIds);
        
        profilesMap = (profiles || []).reduce((acc, p) => {
          acc[p.user_id] = p.display_name || 'Unknown';
          return acc;
        }, {} as Record<string, string>);
      }

      // Fetch notes for shared goals
      const sharedGoalIds = sharedData?.map(s => (s.goals as any).id) || [];
      let sharedNotesData: DbNote[] = [];
      
      if (sharedGoalIds.length > 0) {
        const { data: notes } = await supabase
          .from('goal_notes')
          .select('*')
          .in('goal_id', sharedGoalIds);
        
        sharedNotesData = notes || [];
      }

      const sharedGoalsWithNotes = (sharedData || []).map(s => {
        const goal = s.goals as any;
        return {
          ...goal,
          timeframe: goal.timeframe as Timeframe,
          priority: (goal.priority || 'medium') as Priority,
          notes: sharedNotesData.filter(n => n.goal_id === goal.id),
          owner_name: profilesMap[s.owner_id] || 'Unknown',
          is_shared: true,
        };
      });

      setSharedGoals(sharedGoalsWithNotes);
    } catch (error: any) {
      console.error('Error fetching goals:', error);
      toast({
        title: 'Error loading goals',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = useCallback(async (title: string, timeframe: Timeframe, isHabit: boolean, description?: string, priority: Priority = 'medium') => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title,
          description,
          timeframe,
          is_habit: isHabit,
          priority,
        })
        .select()
        .single();

      if (error) throw error;

      const newGoal = { ...data, timeframe: data.timeframe as Timeframe, priority: data.priority as Priority, notes: [] };
      setGoals(prev => [newGoal, ...prev]);
      return newGoal;
    } catch (error: any) {
      toast({
        title: 'Error adding goal',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast]);

  const toggleGoal = useCallback(async (id: string) => {
    const goal = [...goals, ...sharedGoals].find(g => g.id === id);
    if (!goal) return;

    const newCompleted = !goal.completed;
    const newStreak = goal.is_habit && newCompleted ? goal.streak + 1 : goal.streak;

    try {
      const { error } = await supabase
        .from('goals')
        .update({ 
          completed: newCompleted,
          streak: newStreak,
        })
        .eq('id', id);

      if (error) throw error;

      const updateFn = (prev: DbGoal[]) => prev.map(g => 
        g.id === id ? { ...g, completed: newCompleted, streak: newStreak } : g
      );

      if (goal.is_shared) {
        setSharedGoals(updateFn);
      } else {
        setGoals(updateFn);
      }
    } catch (error: any) {
      toast({
        title: 'Error updating goal',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [goals, sharedGoals, toast]);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (error: any) {
      toast({
        title: 'Error deleting goal',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [toast]);

  const addNoteToGoal = useCallback(async (goalId: string, content: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('goal_notes')
        .insert({
          goal_id: goalId,
          user_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      const updateFn = (prev: DbGoal[]) => prev.map(g => 
        g.id === goalId ? { ...g, notes: [...g.notes, data] } : g
      );

      setGoals(updateFn);
      setSharedGoals(updateFn);
      
      return data;
    } catch (error: any) {
      toast({
        title: 'Error adding note',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast]);

  const deleteNoteFromGoal = useCallback(async (goalId: string, noteId: string) => {
    try {
      const { error } = await supabase
        .from('goal_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      const updateFn = (prev: DbGoal[]) => prev.map(g => 
        g.id === goalId ? { ...g, notes: g.notes.filter(n => n.id !== noteId) } : g
      );

      setGoals(updateFn);
      setSharedGoals(updateFn);
    } catch (error: any) {
      toast({
        title: 'Error deleting note',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [toast]);

  const getGoalsByTimeframe = useCallback((timeframe: Timeframe) => {
    return goals.filter(goal => goal.timeframe === timeframe);
  }, [goals]);

  const getSharedGoalsByTimeframe = useCallback((timeframe: Timeframe) => {
    return sharedGoals.filter(goal => goal.timeframe === timeframe);
  }, [sharedGoals]);

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
        createdAt: new Date(note.created_at),
      }))
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [goals]);

  return {
    goals,
    sharedGoals,
    loading,
    addGoal,
    toggleGoal,
    deleteGoal,
    addNoteToGoal,
    deleteNoteFromGoal,
    getGoalsByTimeframe,
    getSharedGoalsByTimeframe,
    getStats,
    totalStats,
    allNotes,
    refetch: fetchGoals,
  };
};
