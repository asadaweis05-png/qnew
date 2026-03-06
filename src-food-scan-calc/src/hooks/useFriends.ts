import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Friendship, FriendWithProgress, FriendProfile } from '@/types/friends';

export const useFriends = (userId: string | undefined) => {
  const [friends, setFriends] = useState<FriendWithProgress[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFriends = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      // Get accepted friendships
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('*')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

      if (friendshipsError) throw friendshipsError;

      // Get pending requests received
      const { data: pending, error: pendingError } = await supabase
        .from('friendships')
        .select('*')
        .eq('addressee_id', userId)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Get sent requests
      const { data: sent, error: sentError } = await supabase
        .from('friendships')
        .select('*')
        .eq('requester_id', userId)
        .eq('status', 'pending');

      if (sentError) throw sentError;

      setPendingRequests((pending || []) as Friendship[]);
      setSentRequests((sent || []) as Friendship[]);

      // Fetch friend profiles and their progress
      if (friendships && friendships.length > 0) {
        const friendIds = friendships.map(f => 
          f.requester_id === userId ? f.addressee_id : f.requester_id
        );

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', friendIds);

        if (profilesError) throw profilesError;

        // Get today's date
        const today = new Date().toISOString().split('T')[0];

        // Get daily totals for friends
        const { data: dailyTotals, error: dailyError } = await supabase
          .from('daily_totals')
          .select('*')
          .in('user_id', friendIds)
          .eq('date', today);

        if (dailyError) throw dailyError;

        // Build friend list with progress
        const friendsWithProgress: FriendWithProgress[] = friendships.map(friendship => {
          const friendId = friendship.requester_id === userId 
            ? friendship.addressee_id 
            : friendship.requester_id;
          
          const profile = profiles?.find(p => p.id === friendId);
          const dailyTotal = dailyTotals?.find(d => d.user_id === friendId);

          return {
            friendship: friendship as Friendship,
            profile: profile as FriendProfile || { id: friendId, email: null, weight_kg: null, height_cm: null, age: null, gender: null, activity_level: null, goal: null, target_calories: null, daily_calorie_goal: null },
            dailyTotal: dailyTotal ? {
              calories: Number(dailyTotal.calories),
              protein: Number(dailyTotal.protein),
              carbs: Number(dailyTotal.carbs),
              fat: Number(dailyTotal.fat),
              daily_calorie_goal: dailyTotal.daily_calorie_goal
            } : null,
            streak: 0
          };
        });

        setFriends(friendsWithProgress);
      } else {
        setFriends([]);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast({
        title: "Khalad",
        description: "Ma helin saaxiibada",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  const sendFriendRequest = async (email: string) => {
    if (!userId) return { success: false };

    try {
      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        toast({
          title: "Khalad",
          description: "Isticmaale leh emailkan ma jiro",
          variant: "destructive",
        });
        return { success: false };
      }

      if (profile.id === userId) {
        toast({
          title: "Khalad",
          description: "Ma is-dir kartid codsiga saaxiibtinimo",
          variant: "destructive",
        });
        return { success: false };
      }

      // Check if friendship already exists
      const { data: existing } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(requester_id.eq.${userId},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${userId})`)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Khalad",
          description: existing.status === 'accepted' ? "Waxaad horay u tihiin saaxiibbo" : "Codsiga horay ayaa loo diray",
          variant: "destructive",
        });
        return { success: false };
      }

      // Send request
      const { error: insertError } = await supabase
        .from('friendships')
        .insert({
          requester_id: userId,
          addressee_id: profile.id,
          status: 'pending'
        });

      if (insertError) throw insertError;

      toast({
        title: "Guul",
        description: "Codsiga saaxiibtinimo ayaa la diray",
      });

      await fetchFriends();
      return { success: true };
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Khalad",
        description: "Ma dirin codsiga",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const respondToRequest = async (friendshipId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Guul",
        description: accept ? "Codsiga waa la aqbalay" : "Codsiga waa la diiday",
      });

      await fetchFriends();
    } catch (error) {
      console.error('Error responding to request:', error);
      toast({
        title: "Khalad",
        description: "Ma badelin codsiga",
        variant: "destructive",
      });
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Guul",
        description: "Saaxiibka waa la tirtiray",
      });

      await fetchFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: "Khalad",
        description: "Ma tirtiri karin saaxiibka",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  return {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    respondToRequest,
    removeFriend,
    refreshFriends: fetchFriends
  };
};
