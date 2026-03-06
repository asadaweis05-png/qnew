import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, Plus, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Note } from '@/types/goal';
import { format } from 'date-fns';

interface GoalNotesProps {
  notes: Note[];
  onAddNote: (content: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export const GoalNotes = ({ notes, onAddNote, onDeleteNote }: GoalNotesProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');

  const handleAdd = () => {
    if (!newNote.trim()) return;
    onAddNote(newNote.trim());
    setNewNote('');
    setIsAdding(false);
  };

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <StickyNote className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
          Notes ({notes.length})
        </span>
        {!isAdding && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-8 sm:h-6 px-3 sm:px-2 text-xs"
          >
            <Plus className="w-4 h-4 sm:w-3 sm:h-3 mr-1" />
            Add
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 sm:mb-2"
          >
            <Textarea
              placeholder="Write your note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="text-base sm:text-sm min-h-[80px] sm:min-h-[60px] resize-none"
              autoFocus
            />
            <div className="flex gap-2 mt-3 sm:mt-2">
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!newNote.trim()}
                className="h-9 sm:h-7 text-sm sm:text-xs px-4 sm:px-3 gradient-warm border-0 flex-1 sm:flex-none"
              >
                Save Note
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewNote('');
                }}
                className="h-9 sm:h-7 px-3 sm:px-2 text-xs"
              >
                <X className="w-4 h-4 sm:w-3 sm:h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notes.length > 0 && (
          <div className="space-y-2.5 sm:space-y-2">
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="group relative bg-secondary/50 rounded-lg p-3 sm:p-2"
              >
                <p className="text-sm sm:text-sm text-foreground/90 pr-8 sm:pr-6 leading-relaxed">{note.content}</p>
                <div className="flex items-center justify-between mt-2 sm:mt-1">
                  <span className="text-xs text-muted-foreground">
                    {format(note.createdAt, 'MMM d, h:mm a')}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="absolute top-3 sm:top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-1.5 sm:p-1 rounded text-muted-foreground hover:text-destructive active:text-destructive transition-all"
                >
                  <Trash2 className="w-4 h-4 sm:w-3 sm:h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
