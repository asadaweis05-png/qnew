import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Friend {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
}

export interface Invitation {
  id: string;
  inviter_id: string;
  invitee_email: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  inviter_name?: string;
}

export const useFriends = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchFriends = useCallback(async () => {
    if (!user) {
      setFriends([]);
      setPendingInvitations([]);
      setSentInvitations([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch friendships where user is either user_id or friend_id
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (friendshipsError) throw friendshipsError;

      // Get friend IDs
      const friendIds = (friendships || []).map(f => 
        f.user_id === user.id ? f.friend_id : f.user_id
      );

      // Fetch friend profiles
      if (friendIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', friendIds);

        if (profilesError) throw profilesError;

        setFriends((profiles || []).map(p => ({
          id: p.id,
          user_id: p.user_id,
          display_name: p.display_name || 'Unknown',
          email: p.email || '',
          avatar_url: p.avatar_url,
        })));
      } else {
        setFriends([]);
      }

      // Fetch pending invitations received
      const { data: pending, error: pendingError } = await supabase
        .from('friend_invitations')
        .select('*')
        .eq('invitee_email', user.email)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Get inviter profiles
      const inviterIds = pending?.map(i => i.inviter_id) || [];
      let inviterProfiles: Record<string, string> = {};
      
      if (inviterIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('user_id', inviterIds);
        
        inviterProfiles = (profiles || []).reduce((acc, p) => {
          acc[p.user_id] = p.display_name || 'Unknown';
          return acc;
        }, {} as Record<string, string>);
      }

      setPendingInvitations((pending || []).map(i => ({
        ...i,
        status: i.status as 'pending' | 'accepted' | 'declined',
        inviter_name: inviterProfiles[i.inviter_id] || 'Unknown',
      })));

      // Fetch sent invitations
      const { data: sent, error: sentError } = await supabase
        .from('friend_invitations')
        .select('*')
        .eq('inviter_id', user.id)
        .eq('status', 'pending');

      if (sentError) throw sentError;

      setSentInvitations((sent || []).map(i => ({
        ...i,
        status: i.status as 'pending' | 'accepted' | 'declined',
      })));
    } catch (error: any) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const sendInvitation = useCallback(async (email: string) => {
    if (!user) return false;

    if (email === user.email) {
      toast({
        title: 'Invalid email',
        description: 'You cannot invite yourself.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Check if already friends
      const isFriend = friends.some(f => f.email === email);
      if (isFriend) {
        toast({
          title: 'Already friends',
          description: 'You are already friends with this person.',
          variant: 'destructive',
        });
        return false;
      }

      // Check if invitation already sent
      const alreadySent = sentInvitations.some(i => i.invitee_email === email);
      if (alreadySent) {
        toast({
          title: 'Invitation pending',
          description: 'You have already sent an invitation to this email.',
          variant: 'destructive',
        });
        return false;
      }

      const { error } = await supabase
        .from('friend_invitations')
        .insert({
          inviter_id: user.id,
          invitee_email: email,
        });

      if (error) throw error;

      toast({
        title: 'Invitation sent!',
        description: `An invitation has been sent to ${email}.`,
      });

      fetchFriends();
      return true;
    } catch (error: any) {
      toast({
        title: 'Error sending invitation',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  }, [user, friends, sentInvitations, toast, fetchFriends]);

  const respondToInvitation = useCallback(async (invitationId: string, accept: boolean) => {
    if (!user) return;

    try {
      const invitation = pendingInvitations.find(i => i.id === invitationId);
      if (!invitation) return;

      // Update invitation status
      const { error: updateError } = await supabase
        .from('friend_invitations')
        .update({ status: accept ? 'accepted' : 'declined' })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      if (accept) {
        // Create bidirectional friendships
        const { error: friendshipError } = await supabase
          .from('friendships')
          .insert([
            { user_id: user.id, friend_id: invitation.inviter_id },
            { user_id: invitation.inviter_id, friend_id: user.id },
          ]);

        if (friendshipError) throw friendshipError;

        toast({
          title: 'Friend added!',
          description: `You are now friends with ${invitation.inviter_name}.`,
        });
      } else {
        toast({
          title: 'Invitation declined',
          description: 'The invitation has been declined.',
        });
      }

      fetchFriends();
    } catch (error: any) {
      toast({
        title: 'Error responding to invitation',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [user, pendingInvitations, toast, fetchFriends]);

  const removeFriend = useCallback(async (friendUserId: string) => {
    if (!user) return;

    try {
      // Delete both directions of the friendship
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendUserId}),and(user_id.eq.${friendUserId},friend_id.eq.${user.id})`);

      if (error) throw error;

      toast({
        title: 'Friend removed',
        description: 'The friend has been removed from your list.',
      });

      fetchFriends();
    } catch (error: any) {
      toast({
        title: 'Error removing friend',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [user, toast, fetchFriends]);

  return {
    friends,
    pendingInvitations,
    sentInvitations,
    loading,
    sendInvitation,
    respondToInvitation,
    removeFriend,
    refetch: fetchFriends,
  };
};
