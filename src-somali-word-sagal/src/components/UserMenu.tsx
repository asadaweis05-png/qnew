
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import AuthModal from './AuthModal';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, User as UserIcon, Bell, LogOut } from "lucide-react";
import { getUserSubscription, updateSubscriptionStatus } from '@/lib/emailSubscriptions';

interface UserMenuProps {
  user: User | null;
  onSignOut: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onSignOut }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch subscription status when user changes
  useEffect(() => {
    const fetchSubscription = async () => {
      if (user) {
        const subscription = await getUserSubscription(user);
        if (subscription) {
          setIsSubscribed(subscription.is_subscribed);
        }
      }
    };

    fetchSubscription();
  }, [user]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account"
      });
      onSignOut();
    }
  };

  const handleToggleSubscription = async () => {
    setIsLoading(true);
    const newStatus = !isSubscribed;
    
    const success = await updateSubscriptionStatus(user, newStatus);
    
    if (success) {
      setIsSubscribed(newStatus);
      toast({
        title: newStatus ? "Subscribed" : "Unsubscribed",
        description: newStatus 
          ? "You will now receive email updates and reminders." 
          : "You have been unsubscribed from email updates.",
      });
    } else {
      toast({
        title: "Failed to update subscription",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Link to="/leaderboard" className="text-sm font-medium hover:underline">
        Leaderboard
      </Link>
      
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              {user.email?.split('@')[0] || 'User'} <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex gap-2 cursor-pointer" asChild>
              <Link to="/profile">
                <UserIcon className="h-4 w-4" /> Edit Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex gap-2 cursor-pointer" onClick={handleToggleSubscription} disabled={isLoading}>
              <Bell className="h-4 w-4" /> 
              {isSubscribed ? 'Unsubscribe from emails' : 'Subscribe to emails'}
            </DropdownMenuItem>
            <DropdownMenuItem className="flex gap-2 cursor-pointer text-destructive" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setIsAuthModalOpen(true)}>
          Sign In
        </Button>
      )}
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
};

export default UserMenu;
