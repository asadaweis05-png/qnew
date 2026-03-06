import { motion } from 'framer-motion';
import { ProgressRing } from './ProgressRing';
import { GoalStats } from '@/types/goal';
import { CheckCircle2, Repeat, Target } from 'lucide-react';

interface StatsOverviewProps {
  stats: GoalStats;
  habits: number;
  goals: number;
}

export const StatsOverview = ({ stats, habits, goals }: StatsOverviewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-card rounded-2xl border border-border shadow-elevated mb-10"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 geo-dots opacity-30" />
      
      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Progress Ring */}
          <div className="flex-shrink-0">
            <ProgressRing percentage={stats.percentage} />
          </div>
          
          {/* Stats Grid */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-3 gap-4">
              <StatCard 
                icon={CheckCircle2}
                value={stats.completed}
                label="Done"
                color="emerald"
              />
              <StatCard 
                icon={Repeat}
                value={habits}
                label="Habits"
                color="gold"
              />
              <StatCard 
                icon={Target}
                value={goals}
                label="Goals"
                color="violet"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  color: 'emerald' | 'gold' | 'violet';
}

const colorClasses = {
  emerald: 'bg-emerald/10 text-emerald border-emerald/20',
  gold: 'bg-gold/10 text-gold border-gold/20',
  violet: 'bg-violet/10 text-violet border-violet/20',
};

const iconBgClasses = {
  emerald: 'gradient-emerald',
  gold: 'gradient-gold',
  violet: 'gradient-violet',
};

const StatCard = ({ icon: Icon, value, label, color }: StatCardProps) => (
  <div className="text-center">
    <div className={`w-10 h-10 mx-auto mb-2 rounded-xl ${iconBgClasses[color]} flex items-center justify-center shadow-soft`}>
      <Icon className="w-5 h-5 text-primary-foreground" />
    </div>
    <div className="text-2xl font-semibold text-foreground tabular-nums">{value}</div>
    <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
  </div>
);
