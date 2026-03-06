
import React, { useEffect } from 'react';
import GoalsForm from '@/components/GoalsForm';
import { useAuth } from '@/hooks/useAuth';
import { Target, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/Footer';

const Goals = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to set your fitness goals",
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [user, navigate, loading, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 pt-24 md:pt-28">
        <div className="container-tight px-4 md:px-8 pb-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-foreground">
                Fitness Goals
              </h1>
              <p className="text-sm text-muted-foreground">Set your personal nutrition targets</p>
            </div>
          </div>
          
          <div className="glass-card p-6 md:p-8 rounded-2xl">
            <GoalsForm />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Goals;
