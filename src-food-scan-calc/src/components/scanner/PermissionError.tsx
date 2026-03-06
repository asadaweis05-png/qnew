
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';

interface PermissionErrorProps {
  errorMessage: string | null;
  onRetry: () => void;
}

const PermissionError: React.FC<PermissionErrorProps> = ({ errorMessage, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
      <div className="text-destructive mb-4">
        {errorMessage || "Camera permission denied"}
      </div>
      <Button 
        onClick={onRetry}
        variant="outline"
        className="flex items-center gap-2"
      >
        <RefreshCcw className="h-4 w-4" />
        <span>Try Again</span>
      </Button>
    </div>
  );
};

export default PermissionError;
