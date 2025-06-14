/**
 * ProjectInspirationSection.tsx
 * Displays project inspiration images in a gallery format
 * Mobile-first responsive design with interactive features
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectInspirationGallery } from '@/components/ui/project-inspiration-gallery';
import { useProjectImages } from '@/hooks/useProjectImages';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/core/ui';

interface ProjectInspirationSectionProps {
  projectId: string;
  className?: string;
}

export function ProjectInspirationSection({ 
  projectId,
  className 
}: ProjectInspirationSectionProps) {
  const { inspirationImages, profileImage, isLoading, error } = useProjectImages(projectId);
  
  // If there are no images and we're not loading, don't render the section
  if (!isLoading && inspirationImages.length === 0 && !error) {
    return null;
  }
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Inspiration Gallery</CardTitle>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="w-full h-48 rounded-lg" />
            <div className="grid grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-full aspect-square rounded-md" />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            <p>Could not load inspiration images</p>
          </div>
        ) : (
          <ProjectInspirationGallery 
            images={inspirationImages}
            profileImage={profileImage}
          />
        )}
      </CardContent>
    </Card>
  );
}
