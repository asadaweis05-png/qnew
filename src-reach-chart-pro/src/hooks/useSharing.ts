import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SharedWith {
  id: string;
  shared_with_id: string;
  friend_name: string;
  can_complete: boolean;
}

export const useSharing = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const getSharedWith = useCallback(async (goalId: string): Promise<SharedWith[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('shared_goals')
        .select('id, shared_with_id, can_complete')
        .eq('goal_id', goalId)
        .eq('owner_id', user.id);

      if (error) throw error;

      // Get friend profiles
      const friendIds = data?.map(s => s.shared_with_id) || [];
      if (friendIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', friendIds);

      const profileMap = (profiles || []).reduce((acc, p) => {
        acc[p.user_id] = p.display_name || 'Unknown';
        return acc;
      }, {} as Record<string, string>);

      return (data || []).map(s => ({
        id: s.id,
        shared_with_id: s.shared_with_id,
        friend_name: profileMap[s.shared_with_id] || 'Unknown',
        can_complete: s.can_complete,
      }));
    } catch (error) {
      console.error('Error fetching shared with:', error);
      return [];
    }
  }, [user]);

  const shareGoal = useCallback(async (goalId: string, friendUserId: string, canComplete: boolean = true) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('shared_goals')
        .insert({
          goal_id: goalId,
          owner_id: user.id,
          shared_with_id: friendUserId,
          can_complete: canComplete,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already shared',
            description: 'This goal is already shared with this friend.',
            variant: 'destructive',
          });
          return false;
        }
        throw error;
      }

      toast({
        title: 'Goal shared!',
        description: 'Your friend can now see and collaborate on this goal.',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Error sharing goal',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const unshareGoal = useCallback(async (sharedGoalId: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('shared_goals')
        .delete()
        .eq('id', sharedGoalId);

      if (error) throw error;

      toast({
        title: 'Sharing removed',
        description: 'The goal is no longer shared with this friend.',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Error removing share',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  return {
    loading,
    getSharedWith,
    shareGoal,
    unshareGoal,
  };
};
