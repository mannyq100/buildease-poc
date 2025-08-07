/**
 * ProjectInspirationImages Component
 * Handles inspiration image uploads for project creation wizard
 * Integrates with the centralized image store and localStorage persistence
 */

import React, { useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Image as ImageIcon, Star } from 'lucide-react';
import { cn } from '@/utils/core/ui';
import { useImageState, useImageActions } from '@/stores/createProject/imageStore';
import { toast } from 'sonner';

interface ProjectInspirationImagesProps {
  className?: string;
}

const ProjectInspirationImagesComponent = ({ className }: ProjectInspirationImagesProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Always call hooks (React Hook rules)
  const imageState = useImageState();
  const imageActions = useImageActions();
  
  // Safe destructuring with fallbacks
  const {
    localFiles = [],
    localProfileImageId = null,
    uploadError = null
  } = imageState || {};
  
  const {
    addLocalImage = () => {},
    removeLocalImage = () => {},
    setProfileImage = () => {}
  } = imageActions || {};

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Add each selected file
    Array.from(files).forEach(file => {
      addLocalImage(file);
    });

    // Clear input
    event.target.value = '';
  }, [addLocalImage]);

  // Handle drag and drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        addLocalImage(file);
      } else {
        toast.error(`${file.name} is not a valid image file`);
      }
    });
  }, [addLocalImage]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  // Handle remove image
  const handleRemoveImage = useCallback((imageId: string) => {
    removeLocalImage(imageId);
  }, [removeLocalImage]);

  // Handle set profile image
  const handleSetProfileImage = useCallback((imageId: string) => {
    const isCurrentProfile = localProfileImageId === imageId;
    setProfileImage(isCurrentProfile ? null : imageId);
  }, [localProfileImageId, setProfileImage]);

  // Open file dialog
  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <ImageIcon className="h-5 w-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Inspiration Images
        </h3>
        <Badge variant="secondary" className="text-xs">
          Optional
        </Badge>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400">
        Upload images that inspire your project design. These help our AI create better plans.
      </p>

      {/* Upload Error */}
      {uploadError && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          {uploadError}
        </div>
      )}

      {/* Upload Area */}
      <Card 
        className={cn(
          'border-2 border-dashed border-orange-300 dark:border-orange-700 transition-colors',
          'hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/10'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="p-6 text-center">
          <Upload className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Drag and drop images here, or click to browse
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={openFileDialog}
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Images
          </Button>
        </div>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Image Preview Grid */}
      {localFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Uploaded Images ({localFiles.length})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {localFiles.map((image) => {
              const isProfile = image.id === localProfileImageId;
              
              return (
                <div
                  key={image.id}
                  className={cn(
                    'relative group rounded-lg overflow-hidden border-2 transition-all',
                    isProfile
                      ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'border-slate-200 dark:border-slate-700'
                  )}
                >
                  {/* Image */}
                  <div className="aspect-square relative">
                    <img
                      src={image.previewUrl}
                      alt={image.file.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Profile Badge */}
                    {isProfile && (
                      <Badge className="absolute top-2 left-2 bg-blue-500 text-white text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Profile
                      </Badge>
                    )}

                    {/* Action Buttons */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={isProfile ? "secondary" : "default"}
                        onClick={() => handleSetProfileImage(image.id)}
                        className="text-xs"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        {isProfile ? 'Unset' : 'Profile'}
                      </Button>
                      
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveImage(image.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="p-2 bg-white dark:bg-slate-800">
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {image.file.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {(image.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-slate-500 dark:text-slate-500 space-y-1">
        <p>• Supported formats: JPG, PNG, WebP, HEIC, GIF</p>
        <p>• Maximum file size: 10MB per image</p>
        <p>• Click the star icon to set an image as your project's profile photo</p>
        <p>• Images are automatically saved as you upload them</p>
      </div>
    </div>
  );
};

// Export memoized component to prevent infinite re-renders
export const ProjectInspirationImages = React.memo(ProjectInspirationImagesComponent);