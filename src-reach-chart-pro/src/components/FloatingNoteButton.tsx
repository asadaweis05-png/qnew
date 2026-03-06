import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StickyNote, X, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Goal {
  id: string;
  title: string;
}

interface FloatingNoteButtonProps {
  goals: Goal[];
  onAddNote: (goalId: string, content: string) => void;
}

export const FloatingNoteButton = ({ goals, onAddNote }: FloatingNoteButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [noteContent, setNoteContent] = useState('');

  const handleSave = () => {
    if (!selectedGoalId || !noteContent.trim()) return;
    onAddNote(selectedGoalId, noteContent.trim());
    setNoteContent('');
    setSelectedGoalId('');
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setNoteContent('');
    setSelectedGoalId('');
  };

  if (goals.length === 0) return null;

  return (
    <>
      {/* Floating Action Button - Mobile Only */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-warm shadow-elevated flex items-center justify-center sm:hidden active:scale-95 transition-transform"
        aria-label="Add quick note"
      >
        <StickyNote className="w-6 h-6 text-primary-foreground" />
      </motion.button>

      {/* Drawer for Quick Note */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="px-4 pb-8">
          <DrawerHeader className="px-0 pt-4">
            <div className="flex items-center justify-between">
              <DrawerTitle className="flex items-center gap-2 text-lg font-display">
                <StickyNote className="w-5 h-5 text-primary" />
                Quick Note
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}>
                  <X className="w-4 h-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="space-y-4">
            {/* Goal Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Select Goal
              </label>
              <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                <SelectTrigger className="w-full h-12 text-base">
                  <SelectValue placeholder="Choose a goal..." />
                </SelectTrigger>
                <SelectContent>
                  {goals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id} className="py-3">
                      {goal.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Note Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Your Note
              </label>
              <Textarea
                placeholder="Write your note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="min-h-[120px] text-base resize-none"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={!selectedGoalId || !noteContent.trim()}
              className="w-full h-12 text-base gradient-warm border-0"
            >
              Save Note
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
};
