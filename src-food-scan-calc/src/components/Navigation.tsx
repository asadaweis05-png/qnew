
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, LayoutDashboard, Home, Target, Crown, Users } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navigation = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/goals', label: 'Goals', icon: Target },
    { path: '/friends', label: 'Friends', icon: Users },
    { path: '/subscription', label: 'Subscription', icon: Crown },
  ];

  return (
    <>
      {/* Mobile Navigation */}
      <div className="fixed top-6 right-6 z-50 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="w-12 h-12 flex items-center justify-center rounded-full bg-card border border-border backdrop-blur-xl transition-all hover:border-primary/50">
              <Menu className="w-5 h-5 text-foreground" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] bg-background border-border backdrop-blur-xl p-0">
            <div className="p-8">
              <SheetHeader>
                <SheetTitle className="font-display text-3xl text-foreground text-left">Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-12">
                <ul className="space-y-2">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300
                            ${isActive 
                              ? 'bg-primary/10 text-primary border border-primary/20' 
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                            }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-base font-medium">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container-wide px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="font-display text-2xl text-foreground hover:text-primary transition-colors">
              NutriTrack
            </Link>
            <ul className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300
                        ${isActive 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
