import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Goal } from '@/types/goal';
import { Achievement } from '@/types/achievement';
import { useAchievements } from '@/hooks/useAchievements';
import { cn } from '@/lib/utils';

interface AchievementsProps {
  goals: Goal[];
}

const tierGradients = {
  bronze: 'from-amber-700 to-amber-900',
  silver: 'from-slate-400 to-slate-600',
  gold: 'from-yellow-500 to-amber-600',
  platinum: 'from-cyan-400 to-blue-600',
};

const tierBg = {
  bronze: 'bg-amber-800/90',
  silver: 'bg-slate-500/90',
  gold: 'bg-yellow-600/90',
  platinum: 'bg-cyan-500/90',
};

const categoryLabels = {
  completion: 'Completion',
  streak: 'Streaks',
  milestone: 'Milestones',
  special: 'Special',
};

const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
  const progressPercent = (achievement.progress / achievement.requirement) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'relative p-4 rounded-xl transition-all duration-300',
        achievement.unlocked
          ? `bg-gradient-to-br ${tierGradients[achievement.tier]} text-white shadow-elevated`
          : 'bg-secondary border border-border'
      )}
    >
      {!achievement.unlocked && (
        <div className="absolute top-3 right-3">
          <Lock className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className={cn(
          'text-2xl p-2.5 rounded-lg',
          achievement.unlocked ? 'bg-white/20' : 'bg-muted'
        )}>
          {achievement.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className={cn(
              'font-semibold text-sm truncate',
              achievement.unlocked ? 'text-white' : 'text-foreground'
            )}>
              {achievement.name}
            </h4>
            {achievement.unlocked && (
              <Star className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
            )}
          </div>
          
          <p className={cn(
            'text-xs leading-relaxed mb-2',
            achievement.unlocked ? 'text-white/70' : 'text-muted-foreground'
          )}>
            {achievement.description}
          </p>
          
          {!achievement.unlocked && (
            <div className="space-y-1">
              <Progress value={progressPercent} className="h-1.5" />
              <p className="text-[10px] font-medium text-muted-foreground">
                {achievement.progress} / {achievement.requirement}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const Achievements = ({ goals }: AchievementsProps) => {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { achievements, stats } = useAchievements(goals);

  const filteredAchievements = activeCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === activeCategory);

  const categories = ['all', 'completion', 'streak', 'milestone', 'special'];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 rounded-full px-4 h-9 border-border hover:border-primary/30">
          <Trophy className="w-4 h-4" />
          <span className="text-sm">{stats.totalUnlocked}/{stats.totalAchievements}</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-xl font-serif">
            <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center">
              <Trophy className="w-4 h-4 text-primary-foreground" />
            </div>
            Achievements
          </DialogTitle>
        </DialogHeader>

        {/* Stats */}
        <div className="px-6 py-4 bg-secondary/30">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold text-primary">{stats.totalUnlocked}</div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Unlocked</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground">{stats.totalAchievements}</div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-gold">
                {Math.round((stats.totalUnlocked / stats.totalAchievements) * 100)}%
              </div>
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Complete</div>
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="px-6 py-3 flex gap-1.5 overflow-x-auto">
          {categories.map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'capitalize text-xs rounded-full px-3 h-7 flex-shrink-0',
                activeCategory === cat ? 'gradient-emerald border-0' : ''
              )}
            >
              {cat === 'all' ? 'All' : categoryLabels[cat as keyof typeof categoryLabels]}
            </Button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {filteredAchievements.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
