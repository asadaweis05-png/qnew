import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Clock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
interface GameStartScreenProps {
  onStart: () => void;
  isLoggedIn: boolean;
}
const GameStartScreen: React.FC<GameStartScreenProps> = ({
  onStart,
  isLoggedIn
}) => {
  return <div className="flex flex-col items-center justify-center space-y-8 my-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-primary">Ready to Play?</h2>
        <p className="text-gray-600">waxaad heesataa 60 second soo saar ereyada lagaa rabbo</p>
      </div>
      
      {!isLoggedIn && <Alert className="bg-primary/10 border-primary/20 max-w-md">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            You're playing as a guest. <Link to="/auth" className="text-primary font-medium hover:underline">Sign in</Link> or <Link to="/auth" className="text-primary font-medium hover:underline">create an account</Link> to compete with others on the leaderboard!
          </AlertDescription>
        </Alert>}
      
      <Button onClick={onStart} size="lg" className="animate-pulse w-48 h-16 text-xl font-bold">
        <Play className="mr-2 h-6 w-6" />
        Start Game
      </Button>
      
      <div className="flex items-center gap-2 text-gray-500">
        <Clock className="h-5 w-5" />
        <span>1 minute countdown</span>
      </div>
    </div>;
};
export default GameStartScreen;