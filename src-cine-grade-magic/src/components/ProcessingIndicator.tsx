import { Aperture } from 'lucide-react';

export function ProcessingIndicator() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 animate-fade-in">
      {/* Animated rings */}
      <div className="relative w-32 h-32">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border border-teal/20 animate-pulse-glow" />
        
        {/* Middle ring */}
        <div 
          className="absolute inset-3 rounded-full border border-orange/20 animate-pulse-glow" 
          style={{ animationDelay: '0.5s' }}
        />
        
        {/* Inner ring */}
        <div 
          className="absolute inset-6 rounded-full border border-teal/30 animate-pulse-glow"
          style={{ animationDelay: '1s' }}
        />
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-teal/20 to-orange/20 rounded-full blur-xl animate-breathe" />
            <Aperture className="w-10 h-10 text-foreground/80 animate-spin relative z-10" style={{ animationDuration: '3s' }} />
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="font-display text-2xl text-foreground/80 mb-2">
          Applying color grade
        </p>
        <p className="text-sm text-muted-foreground">
          Processing your image...
        </p>
      </div>
    </div>
  );
}
