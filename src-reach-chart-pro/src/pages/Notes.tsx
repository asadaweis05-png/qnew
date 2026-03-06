import { motion } from 'framer-motion';
import { StickyNote, ArrowLeft, Trash2, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGoals } from '@/hooks/useGoals';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

const Notes = () => {
  const { allNotes, deleteNoteFromGoal, goals } = useGoals();

  return (
    <div className="min-h-screen gradient-soft">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 md:py-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3 sm:mb-4 py-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm sm:text-base">Back to Roadmap</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl gradient-warm flex items-center justify-center flex-shrink-0">
              <StickyNote className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">All Notes</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {allNotes.length} {allNotes.length === 1 ? 'note' : 'notes'} across your goals
              </p>
            </div>
          </div>
        </motion.header>

        {/* Notes List */}
        {allNotes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-16 px-4"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <StickyNote className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-display font-semibold text-foreground mb-2">
              No notes yet
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-xs mx-auto">
              Add notes to your goals to keep track of your thoughts and progress.
            </p>
            <Link to="/">
              <Button className="gradient-warm border-0 h-10 sm:h-9 px-5">
                Go to Roadmap
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {allNotes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group gradient-card rounded-xl p-4 shadow-soft hover:shadow-elevated transition-all border border-border"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-primary flex-shrink-0" />
                      <Link
                        to="/"
                        className="text-sm font-medium text-primary hover:underline truncate"
                      >
                        {note.goalTitle}
                      </Link>
                    </div>
                    <p className="text-sm sm:text-base text-foreground leading-relaxed break-words">{note.content}</p>
                    <span className="text-xs text-muted-foreground mt-2 block">
                      {format(note.createdAt, 'MMM d, yyyy • h:mm a')}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteNoteFromGoal(note.goalId, note.id)}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2.5 sm:p-2 rounded-lg text-muted-foreground hover:text-destructive active:text-destructive hover:bg-destructive/10 transition-all flex-shrink-0 -mr-1"
                  >
                    <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
