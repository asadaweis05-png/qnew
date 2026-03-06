
import React from 'react';
import { Button } from "@/components/ui/button";
import { User } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';

interface AuthSectionProps {
  user: User | null;
  onSignIn?: (email?: string) => Promise<void>;
  onSignOut: () => Promise<void>;
}

const AuthSection = ({ user, onSignIn, onSignOut }: AuthSectionProps) => {
  return (
    <div>
      {user ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.email}</span>
          <Button variant="outline" onClick={onSignOut}>Sign Out</Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button asChild>
            <Link to="/auth?tab=signup">Sign Up</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AuthSection;
