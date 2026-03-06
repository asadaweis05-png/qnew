import { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, StickyNote, LogOut, LogIn, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useDbGoals } from '@/hooks/useDbGoals';
import { AddGoalForm } from '@/components/AddGoalForm';
import { TimeframeTabs } from '@/components/TimeframeTabs';
import { GoalList } from '@/components/GoalList';
import { StatsOverview } from '@/components/StatsOverview';
import { AIInsights } from '@/components/AIInsights';
import { EmailSummary } from '@/components/EmailSummary';
import { Achievements } from '@/components/Achievements';
import { FriendsPanel } from '@/components/FriendsPanel';
import { SharedGoalsSection } from '@/components/SharedGoalsSection';
import { FloatingNoteButton } from '@/components/FloatingNoteButton';
import { Timeframe } from '@/types/goal';

const Index = () => {
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('today');
  const { user, loading: authLoading, signOut } = useAuth();
  
  const { 
    goals, 
    sharedGoals,
    loading: goalsLoading,
    addGoal, 
    toggleGoal, 
    deleteGoal, 
    addNoteToGoal, 
    deleteNoteFromGoal, 
    getGoalsByTimeframe,
    getSharedGoalsByTimeframe,
    getStats, 
    totalStats,
    allNotes 
  } = useDbGoals();

  const filteredGoals = getGoalsByTimeframe(activeTimeframe);
  const filteredSharedGoals = getSharedGoalsByTimeframe(activeTimeframe);
  const habitsCount = goals.filter(g => g.is_habit).length;
  const goalsCount = goals.filter(g => !g.is_habit).length;

  // Convert DB goals to Goal type for components
  const convertedGoals = filteredGoals.map(g => ({
    id: g.id,
    title: g.title,
    description: g.description || undefined,
    timeframe: g.timeframe,
    isHabit: g.is_habit,
    completed: g.completed,
    createdAt: new Date(g.created_at),
    streak: g.streak,
    notes: g.notes.map(n => ({
      id: n.id,
      content: n.content,
      createdAt: new Date(n.created_at),
    })),
  }));

  const allGoalsConverted = goals.map(g => ({
    id: g.id,
    title: g.title,
    description: g.description || undefined,
    timeframe: g.timeframe,
    isHabit: g.is_habit,
    completed: g.completed,
    createdAt: new Date(g.created_at),
    streak: g.streak,
    notes: g.notes.map(n => ({
      id: n.id,
      content: n.content,
      createdAt: new Date(n.created_at),
    })),
  }));

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-mesh grain flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh grain">
      <div className="fixed top-0 left-0 w-full h-1 gradient-emerald" />
      <div className="fixed top-20 right-8 w-32 h-32 rounded-full bg-emerald/5 blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 left-8 w-40 h-40 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
      
      <div className="relative max-w-2xl mx-auto px-5 py-12 md:py-16">
        {/* Motivational Reminder Banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 p-4 rounded-xl bg-foreground/5 border border-foreground/10 text-center"
        >
          <p className="text-sm text-foreground leading-relaxed font-medium">
            Bani aadam ayaa tahay naftaada udhimri sidoo kale marwalba xasuusnaw hadafkaaga aad leedahay qeyrka ah inuu Allah kucaawiyo naxriistiisa ayaa waxwalba kaween guuleyso
          </p>
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center shadow-soft">
                <Compass className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                Personal Roadmap
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {user && (
                <Link 
                  to="/notes"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
                >
                  <StickyNote className="w-3.5 h-3.5" />
                  {allNotes.length} notes
                </Link>
              )}
              
              {user ? (
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign in
                </Link>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-5xl md:text-6xl font-serif text-foreground leading-[1.1] tracking-tight">
              Chart your
              <span className="block text-gradient italic">journey forward</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-md leading-relaxed">
              {user ? 'Set intentions, build momentum, and watch your progress unfold day by day.' : 'Sign in to track your goals and share them with friends.'}
            </p>
          </div>
          
          {user && (
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-wrap gap-2 mt-8"
            >
              <AIInsights goals={allGoalsConverted} />
              <EmailSummary goals={allGoalsConverted} />
              <Achievements goals={allGoalsConverted} />
              <FriendsPanel />
            </motion.div>
          )}
        </motion.header>

        {user ? (
          <>
            {goals.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <StatsOverview stats={totalStats} habits={habitsCount} goals={goalsCount} />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <AddGoalForm onAdd={addGoal} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <TimeframeTabs
                activeTimeframe={activeTimeframe}
                onSelect={setActiveTimeframe}
                getStats={getStats}
              />
            </motion.div>

            {goalsLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <GoalList
                  goals={convertedGoals}
                  onToggle={toggleGoal}
                  onDelete={deleteGoal}
                  onAddNote={addNoteToGoal}
                  onDeleteNote={deleteNoteFromGoal}
                  showShare
                />
                
                <SharedGoalsSection
                  goals={filteredSharedGoals}
                  onToggle={toggleGoal}
                  onAddNote={addNoteToGoal}
                  onDeleteNote={deleteNoteFromGoal}
                />
              </>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Link
              to="/auth"
              className="btn-primary inline-flex items-center gap-2 px-6 py-3"
            >
              <LogIn className="w-4 h-4" />
              Get Started
            </Link>
          </motion.div>
        )}

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-16 pt-8 border-t border-border"
        >
          <p className="text-xs text-muted-foreground tracking-wide">
            Small steps compound into extraordinary journeys.
          </p>
        </motion.footer>
      </div>

      {/* Floating Note Button - Mobile Only */}
      {user && goals.length > 0 && (
        <FloatingNoteButton
          goals={goals.map(g => ({ id: g.id, title: g.title }))}
          onAddNote={addNoteToGoal}
        />
      )}
    </div>
  );
};

export default Index;