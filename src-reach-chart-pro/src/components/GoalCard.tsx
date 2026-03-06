import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Target, Repeat, Trash2, Flame, ChevronDown, ChevronUp, AlertTriangle, Minus } from 'lucide-react';
import { Goal, Priority } from '@/types/goal';
import { GoalNotes } from './GoalNotes';
import { ShareGoalButton } from './ShareGoalButton';

const priorityConfig: Record<Priority, { label: string; icon: typeof AlertTriangle; className: string }> = {
  low: { label: 'Low', icon: Minus, className: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', icon: ChevronUp, className: 'bg-gold/20 text-gold' },
  high: { label: 'High', icon: AlertTriangle, className: 'bg-coral/20 text-coral' },
};

interface GoalCardProps {
  goal: Goal & { priority?: Priority };
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNote: (goalId: string, content: string) => void;
  onDeleteNote: (goalId: string, noteId: string) => void;
  index: number;
  showShare?: boolean;
}

export const GoalCard = ({ goal, onToggle, onDelete, onAddNote, onDeleteNote, index, showShare = false }: GoalCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative bg-card rounded-xl border border-border hover:border-primary/20 transition-all duration-300 ${
        goal.completed ? 'opacity-60' : ''
      }`}
    >
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(goal.id)}
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              goal.completed
                ? 'bg-primary border-primary'
                : 'border-border hover:border-primary hover:bg-primary/5'
            }`}
          >
            {goal.completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="animate-check"
              >
                <Check className="w-3.5 h-3.5 text-primary-foreground" />
              </motion.div>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Meta row */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {/* Status badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${
                goal.completed 
                  ? 'bg-emerald/20 text-emerald' 
                  : 'bg-gold/20 text-gold'
              }`}>
                {goal.completed ? (
                  <>
                    <Check className="w-3 h-3" />
                    Completed
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                    In Progress
                  </>
                )}
              </span>

              {/* Type badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${
                goal.isHabit 
                  ? 'bg-violet/10 text-violet' 
                  : 'bg-primary/10 text-primary'
              }`}>
                {goal.isHabit ? <Repeat className="w-3 h-3" /> : <Target className="w-3 h-3" />}
                {goal.isHabit ? 'Habit' : 'Goal'}
              </span>

              {/* Priority badge */}
              {(() => {
                const priorityValue = (goal.priority || 'medium') as Priority;
                const config = priorityConfig[priorityValue];
                const PriorityIcon = config.icon;
                return (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${config.className}`}>
                    <PriorityIcon className="w-3 h-3" />
                    {config.label}
                  </span>
                );
              })()}
              
              {goal.isHabit && goal.streak && goal.streak > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-coral">
                  <Flame className="w-3.5 h-3.5" />
                  {goal.streak}
                </span>
              )}
              
              {goal.notes.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  · {goal.notes.length} {goal.notes.length === 1 ? 'note' : 'notes'}
                </span>
              )}
            </div>
            
            {/* Title */}
            <h4
              className={`font-medium text-[15px] leading-snug transition-all duration-200 ${
                goal.completed ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}
            >
              {goal.title}
            </h4>
            
            {/* Description */}
            {goal.description && (
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                {goal.description}
              </p>
            )}

            {/* Expand toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 mt-3 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  Hide notes
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  {goal.notes.length > 0 ? 'View notes' : 'Add note'}
                </>
              )}
            </button>

            {/* Notes section */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <GoalNotes
                  notes={goal.notes}
                  onAddNote={(content) => onAddNote(goal.id, content)}
                  onDeleteNote={(noteId) => onDeleteNote(goal.id, noteId)}
                />
              </motion.div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            {showShare && <ShareGoalButton goalId={goal.id} goalTitle={goal.title} />}
            <button
              onClick={() => onDelete(goal.id)}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress indicator for habits */}
      {goal.isHabit && goal.streak && goal.streak > 0 && (
        <div className="h-0.5 bg-gradient-to-r from-coral/50 via-gold/50 to-transparent" />
      )}
    </motion.div>
  );
};
