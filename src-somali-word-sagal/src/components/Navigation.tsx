
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const Navigation: React.FC = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Play', path: '/play' },
    { name: 'Leaderboard', path: '/leaderboard' },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  const MobileNav = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-[#0f1528]/95 backdrop-blur-md border-white/10 w-[250px]">
        <div className="flex flex-col gap-6 mt-8">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-lg font-medium text-white hover:text-primary transition-colors"
                onClick={handleLinkClick}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <Link to="/play" onClick={handleLinkClick}>
            <Button size="lg" className="w-full bg-primary hover:bg-primary/90">
              Get Started
            </Button>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );

  const DesktopNav = () => (
    <div className="hidden md:flex items-center gap-6">
      {navLinks.map((link) => (
        <Link 
          key={link.name} 
          to={link.path}
          className="text-sm hover:text-primary transition-colors"
        >
          {link.name}
        </Link>
      ))}
      <Link to="/play">
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          Get Started
        </Button>
      </Link>
    </div>
  );

  return (
    <nav className="sticky top-0 z-50 py-4 px-6 md:px-12 bg-white/5 backdrop-blur-sm border-b border-white/5">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary">SOMALI ERAYO</h2>
        
        <MobileNav />
        <DesktopNav />
      </div>
    </nav>
  );
};

export default Navigation;
