/**
 * ImageGallerySection Component
 * Handles the display of inspiration images in the review form
 */
import React, { useMemo } from 'react';
import { m } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Camera, Star, Info } from 'lucide-react';
import { cn } from '@/utils/core/ui';
import { useImageState } from '@/stores/createProject/imageStore';
import { ReviewSection } from './ReviewSection';

export function ImageGallerySection() {
  const { localFiles = [], localProfileImageId = null } = useImageState();
  
  // Fallback: if no profile selected, use the first uploaded image
  const profileImage = useMemo(() => {
    if (!localFiles || localFiles.length === 0) return null;
    const selected = localFiles.find((f) => f.id === localProfileImageId);
    return selected ?? localFiles[0];
  }, [localFiles, localProfileImageId]);

  if (localFiles.length === 0) return null;

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <ReviewSection
        title="Inspiration Images"
        icon={<Camera className="h-4 w-4" />}
      >
        <div className="space-y-4">
          {/* Main Image Display */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
            {profileImage && (
              <>
                <img
                  src={profileImage.previewUrl}
                  alt="Main inspiration"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-[#ED8936] hover:bg-[#ED8936]/90 text-white border-0">
                    <Star className="h-3 w-3 mr-1" />
                    Main Image
                  </Badge>
                </div>
              </>
            )}
          </div>

          {/* Simple Thumbnail Gallery */}
          {localFiles.length > 1 && (
            <div>
              <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3 font-opensans">
                All Images ({localFiles.length})
              </h4>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {localFiles.map((file, index) => (
                  <div
                    key={file.id}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden border-2",
                      file.id === localProfileImageId
                        ? "border-[#ED8936]"
                        : "border-slate-200 dark:border-slate-600"
                    )}
                  >
                    <img
                      src={file.previewUrl}
                      alt={`Inspiration ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {file.id === localProfileImageId && (
                      <div className="absolute top-1 right-1">
                        <div className="w-4 h-4 bg-[#ED8936] rounded-full flex items-center justify-center">
                          <Star className="h-2 w-2 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-opensans">
              <Info className="h-4 w-4 text-[#2B6CB0]" />
              <span>
                {localFiles.length} inspiration image{localFiles.length !== 1 ? 's' : ''} uploaded
                {profileImage && ' • Main image selected'}
              </span>
            </div>
          </div>
        </div>
      </ReviewSection>
    </m.div>
  );
}