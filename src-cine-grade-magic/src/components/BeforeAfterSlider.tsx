import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface BeforeAfterSliderProps {
  originalImage: string;
  processedImage: string;
}

export function BeforeAfterSlider({ originalImage, processedImage }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    },
    [isDragging, handleMove]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full max-w-5xl mx-auto rounded-lg overflow-hidden',
        'glow-cinematic',
        'animate-scale-in'
      )}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* Processed Image (Background) */}
      <img
        src={processedImage}
        alt="Processed"
        className="w-full h-auto block select-none"
        draggable={false}
      />

      {/* Original Image (Overlay with clip) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={originalImage}
          alt="Original"
          className="w-full h-full object-cover select-none"
          draggable={false}
        />
      </div>

      {/* Slider Line */}
      <div
        className="absolute top-0 bottom-0 w-px cursor-ew-resize z-10"
        style={{ 
          left: `${sliderPosition}%`, 
          transform: 'translateX(-50%)',
          background: 'linear-gradient(180deg, hsl(var(--teal)), hsl(var(--orange)))'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* Slider Handle */}
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'w-10 h-10 rounded-full',
            'bg-background/90 backdrop-blur-sm',
            'border border-foreground/20',
            'flex items-center justify-center gap-1',
            'transition-all duration-200',
            'shadow-lg shadow-background/50',
            isDragging && 'scale-110 border-teal/50'
          )}
        >
          <div className="w-px h-3 bg-teal rounded-full" />
          <div className="w-px h-3 bg-orange rounded-full" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded glass text-xs font-medium tracking-wide uppercase text-muted-foreground">
        Original
      </div>
      <div className="absolute top-4 right-4 px-3 py-1.5 rounded glass-teal text-xs font-medium tracking-wide uppercase text-gradient">
        Graded
      </div>
    </div>
  );
}
