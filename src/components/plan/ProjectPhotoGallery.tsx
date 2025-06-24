/**
 * ProjectPhotoGallery Component
 * Optimized photo gallery for construction projects with lazy loading,
 * mobile-first design, and performance optimizations
 */

import React, { useState, useMemo, useCallback } from 'react';
import { LazyImage } from '@/components/shared/LazyImage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Grid, List, ZoomIn, Download, Share, Calendar, MapPin } from 'lucide-react';
import { motion as m, AnimatePresence } from 'framer-motion';

interface ProjectPhoto {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  timestamp?: string;
  location?: string;
  phaseId?: string;
  phaseName?: string;
  thumbnail?: string;
  blurDataURL?: string;
  photographer?: string;
  tags?: string[];
}

interface ProjectPhotoGalleryProps {
  photos: ProjectPhoto[];
  title?: string;
  description?: string;
  viewMode?: 'grid' | 'list';
  enableLightbox?: boolean;
  enableDownload?: boolean;
  enableShare?: boolean;
  photosPerRow?: number;
  lazyLoadingThreshold?: number;
}

export const ProjectPhotoGallery = React.memo(function ProjectPhotoGallery({
  photos,
  title = 'Project Photos',
  description = 'Construction progress and documentation',
  viewMode: initialViewMode = 'grid',
  enableLightbox = true,
  enableDownload = true,
  enableShare = true,
  photosPerRow = 3,
  lazyLoadingThreshold = 10
}: ProjectPhotoGalleryProps) {
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [selectedPhoto, setSelectedPhoto] = useState<ProjectPhoto | null>(null);
  const [visibleCount, setVisibleCount] = useState(lazyLoadingThreshold);

  // Memoize visible photos for performance
  const visiblePhotos = useMemo(() => {
    return photos.slice(0, visibleCount);
  }, [photos, visibleCount]);

  const hasMorePhotos = visibleCount < photos.length;

  // Load more photos
  const loadMorePhotos = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + lazyLoadingThreshold, photos.length));
  }, [lazyLoadingThreshold, photos.length]);

  // Handle photo selection for lightbox
  const handlePhotoClick = useCallback((photo: ProjectPhoto) => {
    if (enableLightbox) {
      setSelectedPhoto(photo);
    }
  }, [enableLightbox]);

  // Close lightbox
  const closeLightbox = useCallback(() => {
    setSelectedPhoto(null);
  }, []);

  // Handle keyboard navigation in lightbox
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!selectedPhoto) return;
    
    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
      setSelectedPhoto(photos[prevIndex]);
    } else if (e.key === 'ArrowRight') {
      const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
      const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
      setSelectedPhoto(photos[nextIndex]);
    }
  }, [selectedPhoto, photos, closeLightbox]);

  React.useEffect(() => {
    if (selectedPhoto) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedPhoto, handleKeyDown]);

  // Handle download
  const handleDownload = useCallback((photo: ProjectPhoto) => {
    const link = document.createElement('a');
    link.href = photo.src;
    link.download = `${photo.alt || 'photo'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Handle share
  const handleShare = useCallback(async (photo: ProjectPhoto) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.alt,
          text: photo.caption,
          url: photo.src,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(photo.src);
    }
  }, []);

  if (photos.length === 0) {
    return (
      <Card className="border border-buildease-blue-100/50 dark:border-buildease-blue-900/30">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-buildease-blue-100/60 dark:bg-buildease-blue-900/40 mb-4">
            <Camera className="h-8 w-8 text-buildease-blue-600 dark:text-buildease-blue-400" />
          </div>
          <h3 className="text-sm font-medium text-buildease-earth-800 dark:text-buildease-earth-200 mb-2">
            No photos available
          </h3>
          <p className="text-xs text-buildease-earth-600 dark:text-buildease-earth-400">
            Project photos will appear here as they are uploaded
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-buildease-blue-100/50 dark:border-buildease-blue-900/30 shadow-sm overflow-hidden rounded-lg bg-white/95 dark:bg-gray-900/95">
        <div className="bg-buildease-blue-50/30 dark:bg-buildease-blue-950/20 border-b border-buildease-blue-100/50 dark:border-buildease-blue-900/30 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold text-buildease-blue-800 dark:text-buildease-blue-200 flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                {title}
              </h2>
              <p className="text-buildease-blue-600/70 dark:text-buildease-blue-400/70 text-sm mt-1">
                {description} • {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <m.div
                key="grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`grid gap-4 ${
                  photosPerRow === 2 
                    ? 'grid-cols-1 sm:grid-cols-2' 
                    : photosPerRow === 3
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`}
              >
                {visiblePhotos.map((photo, index) => (
                  <m.div
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="group cursor-pointer"
                    onClick={() => handlePhotoClick(photo)}
                  >
                    <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
                      <LazyImage
                        src={photo.src}
                        alt={photo.alt}
                        placeholder={photo.thumbnail}
                        blurDataURL={photo.blurDataURL}
                        aspectRatio="4/3"
                        className="rounded-lg"
                        showLoadingIndicator={true}
                        enableProgressiveLoading={true}
                      />
                      
                      {/* Overlay with actions */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-gray-900 shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePhotoClick(photo);
                            }}
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                          
                          {enableDownload && (
                            <Button
                              size="sm"
                              className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-gray-900 shadow-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(photo);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {enableShare && (
                            <Button
                              size="sm"
                              className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-gray-900 shadow-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(photo);
                              }}
                            >
                              <Share className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Photo info overlay */}
                      {(photo.caption || photo.timestamp) && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                          {photo.caption && (
                            <p className="text-white text-xs font-medium truncate">
                              {photo.caption}
                            </p>
                          )}
                          {photo.timestamp && (
                            <p className="text-white/80 text-xs">
                              {new Date(photo.timestamp).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </m.div>
                ))}
              </m.div>
            ) : (
              <m.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {visiblePhotos.map((photo, index) => (
                  <m.div
                    key={photo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="flex gap-4 p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg border border-buildease-blue-200/50 dark:border-buildease-blue-800/50 hover:border-buildease-blue-300/70 dark:hover:border-buildease-blue-700/70 transition-all duration-200 cursor-pointer"
                    onClick={() => handlePhotoClick(photo)}
                  >
                    <div className="flex-shrink-0 w-20 h-20">
                      <LazyImage
                        src={photo.src}
                        alt={photo.alt}
                        placeholder={photo.thumbnail}
                        blurDataURL={photo.blurDataURL}
                        aspectRatio="1/1"
                        className="rounded-md"
                        showLoadingIndicator={false}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-buildease-earth-800 dark:text-buildease-earth-200 truncate">
                        {photo.caption || photo.alt}
                      </h4>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-buildease-earth-600 dark:text-buildease-earth-400">
                        {photo.timestamp && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(photo.timestamp).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        {photo.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{photo.location}</span>
                          </div>
                        )}
                        
                        {photo.phaseName && (
                          <span className="bg-buildease-blue-100/60 dark:bg-buildease-blue-900/40 text-buildease-blue-700 dark:text-buildease-blue-300 px-2 py-1 rounded-md">
                            {photo.phaseName}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {enableDownload && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(photo);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {enableShare && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(photo);
                          }}
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </m.div>
                ))}
              </m.div>
            )}
          </AnimatePresence>

          {/* Load More Button */}
          {hasMorePhotos && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={loadMorePhotos}
                variant="outline"
                className="bg-buildease-blue-50/80 dark:bg-buildease-blue-950/40 hover:bg-buildease-blue-100/80 dark:hover:bg-buildease-blue-900/40 text-buildease-blue-700 dark:text-buildease-blue-300 border-buildease-blue-200/50 dark:border-buildease-blue-800/50"
              >
                Load {Math.min(lazyLoadingThreshold, photos.length - visibleCount)} more photos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && enableLightbox && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <m.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-6xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <LazyImage
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl"
                objectFit="contain"
                priority={true}
                showLoadingIndicator={true}
              />
              
              {/* Close button */}
              <Button
                className="absolute top-4 right-4 h-10 w-10 p-0 bg-black/50 hover:bg-black/70 text-white border-0"
                onClick={closeLightbox}
              >
                ×
              </Button>
              
              {/* Photo info */}
              {(selectedPhoto.caption || selectedPhoto.timestamp) && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-4 rounded-lg">
                  {selectedPhoto.caption && (
                    <h3 className="font-medium mb-2">{selectedPhoto.caption}</h3>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-white/80">
                    {selectedPhoto.timestamp && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(selectedPhoto.timestamp).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {selectedPhoto.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedPhoto.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
});

export default ProjectPhotoGallery;