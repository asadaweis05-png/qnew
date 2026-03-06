import { AnimatePresence } from 'framer-motion';
import { Goal } from '@/types/goal';
import { GoalCard } from './GoalCard';
import { Target } from 'lucide-react';

interface GoalListProps {
  goals: Goal[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddNote: (goalId: string, content: string) => void;
  onDeleteNote: (goalId: string, noteId: string) => void;
  showShare?: boolean;
}

export const GoalList = ({ goals, onToggle, onDelete, onAddNote, onDeleteNote, showShare = false }: GoalListProps) => {
  if (goals.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
          <Target className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-display font-semibold text-foreground mb-2">
          No goals yet
        </h3>
        <p className="text-muted-foreground">
          Add your first goal or habit to get started on your roadmap!
        </p>
      </div>
    );
  }

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  return (
    <div className="space-y-6">
      {activeGoals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            In Progress ({activeGoals.length})
          </h3>
          <AnimatePresence mode="popLayout">
            {activeGoals.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onToggle={onToggle}
                onDelete={onDelete}
                onAddNote={onAddNote}
                onDeleteNote={onDeleteNote}
                index={index}
                showShare={showShare}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Completed ({completedGoals.length})
          </h3>
          <AnimatePresence mode="popLayout">
            {completedGoals.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onToggle={onToggle}
                onDelete={onDelete}
                onAddNote={onAddNote}
                onDeleteNote={onDeleteNote}
                index={index}
                showShare={showShare}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
