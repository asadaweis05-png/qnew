
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface EmailSubscription {
  id: string;
  user_id: string;
  email: string;
  is_subscribed: boolean;
  created_at: string;
  updated_at: string;
}

// Get the current user's email subscription status
export const getUserSubscription = async (user: User | null): Promise<EmailSubscription | null> => {
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('email_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
  
  return data;
};

// Update the user's subscription preference
export const updateSubscriptionStatus = async (
  user: User | null, 
  isSubscribed: boolean
): Promise<boolean> => {
  if (!user) return false;
  
  const { error } = await supabase
    .from('email_subscriptions')
    .update({ is_subscribed: isSubscribed })
    .eq('user_id', user.id);
  
  if (error) {
    console.error('Error updating subscription:', error);
    return false;
  }
  
  return true;
};

// Create a subscription for a user who doesn't have one yet
// This function automatically subscribes every new user to the newsletter
export const createSubscription = async (user: User | null): Promise<boolean> => {
  if (!user || !user.email) return false;
  
  // First check if a subscription already exists
  const { data: existingSub } = await supabase
    .from('email_subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .single();
    
  if (existingSub) {
    console.log('Subscription already exists for user');
    return true; // Subscription already exists, so we're good
  }
  
  // If no subscription exists, create one with is_subscribed = true (default)
  const { error } = await supabase
    .from('email_subscriptions')
    .insert([
      { 
        user_id: user.id, 
        email: user.email,
        is_subscribed: true
      }
    ]);
  
  if (error) {
    console.error('Error creating subscription:', error);
    return false;
  }
  
  console.log('Successfully created email subscription for new user');
  return true;
};
