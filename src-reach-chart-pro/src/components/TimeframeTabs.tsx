import { motion } from 'framer-motion';
import { Timeframe, GoalStats } from '@/types/goal';

interface TimeframeTabsProps {
  activeTimeframe: Timeframe;
  onSelect: (timeframe: Timeframe) => void;
  getStats: (timeframe: Timeframe) => GoalStats;
}

const timeframes: { value: Timeframe; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

export const TimeframeTabs = ({ activeTimeframe, onSelect, getStats }: TimeframeTabsProps) => {
  return (
    <div className="mb-8">
      {/* Tab buttons */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl mb-1">
        {timeframes.map((tf) => {
          const isActive = activeTimeframe === tf.value;

          return (
            <button
              key={tf.value}
              onClick={() => onSelect(tf.value)}
              className="relative flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTimeframe"
                  className="absolute inset-0 bg-card rounded-lg shadow-soft border border-border"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
              <span className={`relative z-10 ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {tf.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-1">
        {timeframes.map((tf) => {
          const stats = getStats(tf.value);
          const isActive = activeTimeframe === tf.value;

          return (
            <div
              key={tf.value}
              className={`text-center py-2 transition-opacity duration-200 ${isActive ? 'opacity-100' : 'opacity-50'}`}
            >
              <div className="flex items-baseline justify-center gap-0.5">
                <span className={`text-lg font-semibold tabular-nums ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {stats.completed}
                </span>
                <span className="text-xs text-muted-foreground">/{stats.total}</span>
              </div>
              {stats.total > 0 && (
                <div className="mt-1.5 mx-auto w-12 h-1 rounded-full bg-border overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${isActive ? 'gradient-emerald' : 'bg-muted-foreground/30'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.percentage}%` }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
