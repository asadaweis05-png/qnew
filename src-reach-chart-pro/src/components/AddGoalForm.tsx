import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Repeat, X, ArrowRight, AlertTriangle, Minus, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Timeframe, Priority } from '@/types/goal';

interface AddGoalFormProps {
  onAdd: (title: string, timeframe: Timeframe, isHabit: boolean, description?: string, priority?: Priority) => void;
}

const timeframes: { value: Timeframe; label: string; short: string }[] = [
  { value: 'today', label: 'Today', short: 'D' },
  { value: 'week', label: 'Week', short: 'W' },
  { value: 'month', label: 'Month', short: 'M' },
  { value: 'year', label: 'Year', short: 'Y' },
];

const priorities: { value: Priority; label: string; icon: typeof AlertTriangle; color: string }[] = [
  { value: 'low', label: 'Low', icon: Minus, color: 'text-muted-foreground bg-muted' },
  { value: 'medium', label: 'Medium', icon: ChevronUp, color: 'text-gold bg-gold/20' },
  { value: 'high', label: 'High', icon: AlertTriangle, color: 'text-coral bg-coral/20' },
];

export const AddGoalForm = ({ onAdd }: AddGoalFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeframe, setTimeframe] = useState<Timeframe>('today');
  const [isHabit, setIsHabit] = useState(false);
  const [priority, setPriority] = useState<Priority>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAdd(title.trim(), timeframe, isHabit, description.trim() || undefined, priority);
    setTitle('');
    setDescription('');
    setTimeframe('today');
    setIsHabit(false);
    setPriority('medium');
    setIsOpen(false);
  };

  return (
    <div className="mb-10">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <button
              onClick={() => setIsOpen(true)}
              className="group w-full p-5 rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-card/50 hover:bg-card transition-all duration-300"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary flex items-center justify-center transition-colors duration-300">
                  <Plus className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <span className="text-base font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  Add new goal or habit
                </span>
              </div>
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
            className="bg-card rounded-2xl border border-border shadow-elevated overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-serif text-foreground">New Entry</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-6 space-y-5">
              {/* Title input */}
              <div>
                <Input
                  placeholder="What do you want to achieve?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 text-base border-0 bg-secondary/50 placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <Textarea
                  placeholder="Add details (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none border-0 bg-secondary/50 placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
                  rows={2}
                />
              </div>

              {/* Timeframe selector */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
                  Timeframe
                </label>
                <div className="flex gap-2">
                  {timeframes.map((tf) => (
                    <button
                      key={tf.value}
                      type="button"
                      onClick={() => setTimeframe(tf.value)}
                      className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        timeframe === tf.value
                          ? 'bg-foreground text-background shadow-soft'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <span className="hidden sm:inline">{tf.label}</span>
                      <span className="sm:hidden">{tf.short}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Type selector */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsHabit(false)}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                      !isHabit
                        ? 'bg-foreground text-background shadow-soft'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsHabit(true)}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isHabit
                        ? 'bg-foreground text-background shadow-soft'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <Repeat className="w-4 h-4" />
                    Habit
                  </button>
                </div>
              </div>

              {/* Priority selector */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {priorities.map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          priority === p.value
                            ? 'bg-foreground text-background shadow-soft'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={!title.trim()}
                className="w-full h-12 text-base font-medium gradient-emerald border-0 shadow-soft hover:shadow-elevated transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create entry
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
