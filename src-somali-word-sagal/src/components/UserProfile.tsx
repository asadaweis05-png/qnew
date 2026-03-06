
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

interface UserProfileProps {
  user: User | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch the profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        // If the profile doesn't exist yet, we'll create one when updating
        if (error.code === 'PGRST116') {
          console.log('Profile not found, will create on update');
          setLoading(false);
          return;
        }
        throw error;
      }
      
      // Update state with the fetched data
      if (data) {
        setDisplayName(data.display_name || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error loading profile',
        description: 'Your profile could not be loaded.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Create profile object with current timestamp
      const profileData = {
        id: user.id,
        display_name: displayName,
        updated_at: new Date().toISOString(),
      };
      
      console.log('Updating profile with:', profileData);
      
      // Update the profile using upsert to create if it doesn't exist
      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);
      
      if (error) {
        console.error('Supabase error updating profile:', error);
        throw error;
      }
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      // Redirect to game after successful update
      setTimeout(() => {
        navigate('/play');
      }, 1500);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error updating profile',
        description: error.message || 'Your profile could not be updated.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold">Your Profile</h1>
      
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          type="text"
          placeholder="Your display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      
      <div className="flex gap-3">
        <Button 
          variant="outline"
          className="flex-1" 
          onClick={() => navigate('/play')}
          disabled={loading}
        >
          Skip
        </Button>
        <Button 
          className="flex-1" 
          onClick={updateProfile}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update & Continue'}
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
