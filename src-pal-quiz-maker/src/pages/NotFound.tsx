import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-destructive/20 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary/15 rounded-full blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
      </div>
      
      <div className="relative z-10 text-center animate-fade-up">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-destructive to-primary flex items-center justify-center mx-auto mb-8 shadow-glow">
          <AlertTriangle className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-7xl font-display font-bold gradient-text mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Bogga lama helin</p>
        <Button asChild className="bg-gradient-primary hover:opacity-90 shadow-glow shine px-8 py-6">
          <a href="/">
            <Home className="mr-2 h-5 w-5" />
            Ku noqo Bogga Hore
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
