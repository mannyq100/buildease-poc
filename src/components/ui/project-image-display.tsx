/**
 * ProjectImageDisplay.tsx
 * Reusable component for displaying project profile/inspiration images
 * with fallback and responsive sizing options
 */
import { cn } from '@/utils/core/ui';
import { Building } from 'lucide-react';

interface ProjectImageDisplayProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
  aspectRatio?: 'square' | '16:9' | '4:3' | 'auto';
  priority?: boolean;
}

export function ProjectImageDisplay({
  src,
  alt = 'Project image',
  className,
  fallbackClassName,
  aspectRatio = 'square',
  priority = false
}: ProjectImageDisplayProps) {
  // Determine aspect ratio class
  const aspectRatioClass = {
    'square': 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-4/3',
    'auto': ''
  }[aspectRatio];
  
  // If no image is provided, show a fallback
  if (!src) {
    return (
      <div 
        className={cn(
          "bg-slate-100 dark:bg-slate-800 flex items-center justify-center",
          aspectRatioClass,
          fallbackClassName || className
        )}
      >
        <Building className="h-12 w-12 text-slate-400 dark:text-slate-600" />
      </div>
    );
  }
  
  return (
    <div className={cn("overflow-hidden", aspectRatioClass, className)}>
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
