
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HowToPlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToPlay: React.FC<HowToPlayProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">How to Play</DialogTitle>
        </DialogHeader>
        <DialogDescription className="space-y-4">
          <p className="text-lg">Find the correct Somali word within the time limit.</p>
          
          <div className="mt-4">
            <p className="font-medium mb-2">Example Word: "BISAD" (cat in Somali)</p>
            <div className="flex space-x-1 mt-2 justify-center">
              <div className="tile tile-correct">B</div>
              <div className="tile tile-correct">I</div>
              <div className="tile tile-correct">S</div>
              <div className="tile tile-correct">A</div>
              <div className="tile tile-correct">D</div>
            </div>
          </div>
          
          <p className="font-medium mt-4">Guess as many words as you can before time runs out!</p>
          <p className="mt-2">Good luck!</p>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default HowToPlay;
