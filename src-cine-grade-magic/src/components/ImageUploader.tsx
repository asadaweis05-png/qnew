import { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  isProcessing: boolean;
}

export function ImageUploader({ onImageSelect, isProcessing }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  return (
    <div className="w-full max-w-2xl mx-auto animate-scale-in">
      <label
        className={cn(
          'relative flex flex-col items-center justify-center',
          'w-full aspect-[16/10] rounded-lg cursor-pointer',
          'border border-dashed transition-all duration-500',
          'group overflow-hidden',
          isDragging
            ? 'border-teal bg-teal/5 scale-[1.02]'
            : 'border-border/50 hover:border-teal/50 bg-card/30',
          isProcessing && 'pointer-events-none opacity-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Background gradient on hover */}
        <div className={cn(
          'absolute inset-0 opacity-0 transition-opacity duration-500',
          'bg-gradient-to-br from-teal/5 via-transparent to-orange/5',
          isDragging ? 'opacity-100' : 'group-hover:opacity-100'
        )} />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t border-l border-teal/30 rounded-tl-lg transition-all duration-500 group-hover:w-20 group-hover:h-20" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b border-r border-orange/30 rounded-br-lg transition-all duration-500 group-hover:w-20 group-hover:h-20" />

        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="relative z-10 flex flex-col items-center gap-6 p-8">
          {/* Icon */}
          <div className={cn(
            'relative w-20 h-20 rounded-full',
            'bg-gradient-to-br from-muted to-card',
            'flex items-center justify-center',
            'transition-all duration-500',
            'group-hover:scale-110',
            isDragging && 'scale-110 bg-teal/10'
          )}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal/20 to-orange/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {isDragging ? (
              <ImageIcon className="w-8 h-8 text-teal relative z-10" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground group-hover:text-foreground relative z-10 transition-colors duration-300" />
            )}
          </div>

          {/* Text */}
          <div className="text-center">
            <p className={cn(
              'font-display text-2xl mb-2 transition-colors duration-300',
              isDragging ? 'text-teal' : 'text-foreground/80 group-hover:text-foreground'
            )}>
              {isDragging ? 'Drop to transform' : 'Drop your image here'}
            </p>
            <p className="text-sm text-muted-foreground">
              or <span className="text-teal/80 hover:text-teal transition-colors">browse</span> to select
            </p>
          </div>

          {/* Supported formats */}
          <p className="text-xs text-muted-foreground/50 tracking-wide">
            JPG, PNG, WebP • Max 20MB
          </p>
        </div>
      </label>
    </div>
  );
}
