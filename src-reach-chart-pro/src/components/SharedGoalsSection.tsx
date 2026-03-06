import { AnimatePresence, motion } from 'framer-motion';
import { Users, Check, Target, Repeat, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { DbGoal } from '@/hooks/useDbGoals';
import { GoalNotes } from './GoalNotes';

interface SharedGoalsSectionProps {
  goals: DbGoal[];
  onToggle: (id: string) => void;
  onAddNote: (goalId: string, content: string) => void;
  onDeleteNote: (goalId: string, noteId: string) => void;
}

const SharedGoalCard = ({ 
  goal, 
  onToggle, 
  onAddNote, 
  onDeleteNote, 
  index 
}: { 
  goal: DbGoal; 
  onToggle: (id: string) => void;
  onAddNote: (goalId: string, content: string) => void;
  onDeleteNote: (goalId: string, noteId: string) => void;
  index: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative bg-card rounded-xl border border-violet/20 hover:border-violet/40 transition-all duration-300 ${
        goal.completed ? 'opacity-60' : ''
      }`}
    >
      {/* Shared indicator */}
      <div className="absolute -top-2 left-4 px-2 py-0.5 bg-violet text-white text-[10px] font-medium rounded-full flex items-center gap-1">
        <Users className="w-3 h-3" />
        {goal.owner_name}
      </div>

      <div className="p-4 md:p-5 pt-6">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(goal.id)}
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              goal.completed
                ? 'bg-violet border-violet'
                : 'border-violet/30 hover:border-violet hover:bg-violet/5'
            }`}
          >
            {goal.completed && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="animate-check"
              >
                <Check className="w-3.5 h-3.5 text-white" />
              </motion.div>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Meta row */}
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${
                goal.is_habit 
                  ? 'bg-gold/10 text-gold' 
                  : 'bg-violet/10 text-violet'
              }`}>
                {goal.is_habit ? <Repeat className="w-3 h-3" /> : <Target className="w-3 h-3" />}
                {goal.is_habit ? 'Habit' : 'Goal'}
              </span>
              
              {goal.is_habit && goal.streak > 0 && (
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
              className="flex items-center gap-1 mt-3 text-xs font-medium text-violet hover:text-violet/80 transition-colors"
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
                  notes={goal.notes.map(n => ({
                    id: n.id,
                    content: n.content,
                    createdAt: new Date(n.created_at),
                  }))}
                  onAddNote={(content) => onAddNote(goal.id, content)}
                  onDeleteNote={(noteId) => onDeleteNote(goal.id, noteId)}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* Progress indicator for habits */}
      {goal.is_habit && goal.streak > 0 && (
        <div className="h-0.5 bg-gradient-to-r from-violet/50 via-gold/50 to-transparent" />
      )}
    </motion.div>
  );
};

export const SharedGoalsSection = ({ goals, onToggle, onAddNote, onDeleteNote }: SharedGoalsSectionProps) => {
  if (goals.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-border">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-violet/10 flex items-center justify-center">
          <Users className="w-4 h-4 text-violet" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-foreground">Shared with you</h3>
          <p className="text-xs text-muted-foreground">Goals from friends you can help complete</p>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {goals.map((goal, index) => (
            <SharedGoalCard
              key={goal.id}
              goal={goal}
              onToggle={onToggle}
              onAddNote={onAddNote}
              onDeleteNote={onDeleteNote}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
