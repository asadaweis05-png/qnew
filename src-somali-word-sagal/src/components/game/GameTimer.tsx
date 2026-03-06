
import React from 'react';
import { Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface GameTimerProps {
  timeLeft: number;
  totalTime?: number;
}

const GameTimer: React.FC<GameTimerProps> = ({ timeLeft, totalTime = 60 }) => {
  // Format time to MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (timeLeft / totalTime) * 100;

  return (
    <div className="text-center mb-2 space-y-2">
      <div className="flex items-center justify-between px-4">
        <span className="text-sm font-medium">Time Remaining</span>
        <span className="text-sm font-medium bg-primary text-white px-2 py-1 rounded-md">
          {formatTime(timeLeft)}
        </span>
      </div>
      
      {/* Timer progress bar */}
      <div className="px-4">
        <Progress value={progressPercentage} className="h-2" />
      </div>
    </div>
  );
};

export default GameTimer;
