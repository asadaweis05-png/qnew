
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export const useProfile = (user: any) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  // Fetch user profile when user changes
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      setProfile(data as Profile || null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Failed to load profile",
        description: "Could not retrieve your profile data",
        variant: "destructive",
      });
    }
  };

  return {
    profile,
    refreshProfile: fetchUserProfile
  };
};
