
import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { HelpCircle, Home, Trophy } from 'lucide-react';

interface HeaderProps {
  onOpenHowToPlay: () => void;
  children?: ReactNode;
}

const Header: React.FC<HeaderProps> = ({ onOpenHowToPlay, children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <header className="flex items-center justify-between w-full px-4 py-3 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <Link to="/" aria-label="Home">
          <Button variant="ghost" size="icon" className="w-9 h-9 md:w-10 md:h-10">
            <Home className="h-5 w-5" />
          </Button>
        </Link>
        <Link to="/leaderboard" aria-label="Leaderboard">
          <Button variant="ghost" size="icon" className="w-9 h-9 md:w-10 md:h-10">
            <Trophy className="h-5 w-5" />
          </Button>
        </Link>
        {children}
      </div>
      
      {isHomePage && (
        <h1 className="text-xl md:text-2xl font-bold tracking-wide text-center absolute left-1/2 transform -translate-x-1/2">SOMALI ERAYO</h1>
      )}
      
      <Button variant="ghost" size="icon" onClick={onOpenHowToPlay} className="w-9 h-9 md:w-10 md:h-10">
        <HelpCircle className="h-5 w-5" />
      </Button>
    </header>
  );
};

export default Header;
