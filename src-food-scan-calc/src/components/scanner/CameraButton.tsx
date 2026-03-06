
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

interface CameraButtonProps {
  onStart: () => void;
  isDisabled: boolean;
}

const CameraButton: React.FC<CameraButtonProps> = ({ onStart, isDisabled }) => {
  return (
    <Button 
      onClick={onStart}
      className="w-full h-64 flex flex-col items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary"
      disabled={isDisabled}
    >
      <Camera className="h-8 w-8" />
      <span>Tap to Scan Food</span>
    </Button>
  );
};

export default CameraButton;
