/**
 * ProjectInspirationGallery.tsx
 * A responsive gallery component for displaying project inspiration images
 * with mobile-first design and interactive features
 */
import { useState } from 'react';
import { cn } from '@/utils/core/ui';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { ProjectImageDisplay } from './project-image-display';
import { 
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ProjectInspirationGalleryProps {
  images: string[];
  className?: string;
  profileImage?: string | null;
}

export function ProjectInspirationGallery({
  images,
  className,
  profileImage
}: ProjectInspirationGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  
  // If no images, don't render anything
  if (!images || images.length === 0) {
    return null;
  }
  
  // Get the current image to display
  const currentImage = images[currentImageIndex];
  
  // Navigate to the previous image
  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };
  
  // Navigate to the next image
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Main image display */}
      <div className="relative rounded-lg overflow-hidden">
        <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
          <DialogTrigger asChild>
            <Button 
              variant="secondary" 
              size="icon"
              className="absolute top-2 right-2 z-10 bg-black/40 hover:bg-black/60 text-white"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-[95vw] p-0 bg-black">
            <div className="relative aspect-video w-full">
              <img 
                src={currentImage} 
                alt="Project inspiration" 
                className="w-full h-full object-contain"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 text-white hover:bg-black/40"
                onClick={() => setShowFullscreen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
              
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        <ProjectImageDisplay
          src={currentImage}
          alt="Project inspiration"
          className="w-full aspect-video sm:aspect-[16/9] md:aspect-[21/9] rounded-lg"
          aspectRatio="auto"
          priority
        />
        
        {/* Navigation arrows - only show if more than one image */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full h-8 w-8 sm:h-10 sm:w-10"
              onClick={prevImage}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full h-8 w-8 sm:h-10 sm:w-10"
              onClick={nextImage}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
      
      {/* Thumbnail navigation - only show if more than one image */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={cn(
                "relative rounded-md overflow-hidden aspect-square border-2 transition-all",
                currentImageIndex === index 
                  ? "border-[#2B6CB0] ring-2 ring-[#2B6CB0]/30" 
                  : "border-transparent hover:border-slate-300",
                profileImage === image && "ring-2 ring-amber-400"
              )}
            >
              <ProjectImageDisplay
                src={image}
                alt={`Inspiration ${index + 1}`}
                className="w-full h-full"
              />
              {profileImage === image && (
                <div className="absolute bottom-0 left-0 right-0 bg-amber-400 text-amber-950 text-[10px] text-center py-0.5">
                  Profile
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
