
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { createSubscription } from '@/lib/emailSubscriptions';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // When the modal opens, set up an auth state listener
  useEffect(() => {
    if (!isOpen) return;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // Try to create a subscription for new users as a fallback
        // This is a safety measure in case the database trigger fails
        if (session?.user) {
          createSubscription(session.user)
            .then(() => {
              console.log("User subscription status confirmed");
              toast({
                title: "Welcome!",
                description: "You've been subscribed to our newsletter for updates.",
              });
            })
            .catch(err => console.error("Error with subscription:", err));
        }
        
        // Close the modal when signed in
        onClose();
        
        // If this is a new sign up (no display name yet), redirect to profile page
        if (event === 'SIGNED_IN') {
          toast({
            title: "Complete your profile",
            description: "Add your display name and avatar to personalize your experience.",
          });
          setTimeout(() => navigate('/profile'), 500);
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [isOpen, onClose, toast, navigate]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Sign in to track your progress</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            theme="light"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
