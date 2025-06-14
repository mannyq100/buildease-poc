/**
 * ProjectInspirationImages Component
 * 
 * Handles the project inspiration images section
 * Allows users to upload, preview, and manage project images
 * Enhanced with local storage persistence for form state
 */
import React, { useCallback, useEffect } from 'react';
import { X, Upload, Camera, AlertCircle } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Control } from 'react-hook-form';
import { ProjectFormValues } from '@/pages/CreateProject';
import { useProjectCreation } from '@/contexts/ProjectCreationContext';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/utils/core/ui';

interface ProjectInspirationImagesProps {
  control: Control<ProjectFormValues>;
  className?: string;
}

/**
 * ProjectInspirationImages component
 * Allows users to upload and manage project inspiration images
 * Enhanced with local storage persistence for uploaded images
 */
function ProjectInspirationImagesComponent({ control, className = '' }: ProjectInspirationImagesProps) {
  // Use project creation context for Supabase integration
  const {
    localFiles,
    localProfileImageId,
    isUploading: isLoading,
    uploadError: error,
    handleFileSelection,
    handleRemoveImage: removeImage,
    handleSetProfileImage: setProfileImage
  } = useProjectCreation();
  


  // The localFiles from context already have previewUrl, so we can use them directly
  const previewImages = localFiles;
  
  // Debug logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview images updated:', previewImages.length, previewImages.map(img => ({
        id: img.id,
        fileName: img.file?.name,
        hasPreviewUrl: !!img.previewUrl,
        previewUrl: img.previewUrl?.substring(0, 50) + '...'
      })));
    }
  }, [previewImages]);
  
  // Form field connection is now handled by the context
  // No need for manual synchronization
  
  // Handle file input change
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Reset the input value so the same file can be selected again if needed
      const file = e.target.files[0];
      e.target.value = '';
      
      // The context handles the image addition and shows toast messages
      try {
        await handleFileSelection(file);
      } catch (error) {
        console.error('Failed to handle file selection:', error);
      }
    }
  }, [handleFileSelection]);
  
  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // The context handles the image addition and error handling
      handleFileSelection(e.dataTransfer.files[0]);
    }
  }, [handleFileSelection]);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="border-t border-slate-200 dark:border-slate-600 pt-8">
      
        
        <FormField
          control={control}
          name="images"
          render={() => (
            <FormItem className="space-y-4">
              <FormLabel className="text-base font-semibold text-slate-900 dark:text-white font-inter">
                Upload Images (Optional)
              </FormLabel>
              <FormControl>
                <ErrorBoundary fallback={<div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
                  There was an error loading the image uploader. Please try refreshing the page.
                </div>}>
                  <div className="space-y-4">
                    {/* Image Upload Area with Drag & Drop */}
                    <div 
                      className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        id="inspiration-image-upload"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isLoading}
                      />
                      <label 
                        htmlFor="inspiration-image-upload"
                        className="cursor-pointer flex flex-col items-center justify-center"
                      >
                        <div className="w-12 h-12 bg-[#2B6CB0]/10 dark:bg-[#2B6CB0]/20 rounded-full flex items-center justify-center mb-3">
                          <Upload className="h-6 w-6 text-[#2B6CB0]" />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-opensans">
                          Drag and drop or click to upload
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 font-opensans">
                          JPG, PNG or WebP (max. 5MB)
                        </p>
                      </label>
                    </div>
                    
                    {/* Loading Indicator */}
                    {isLoading && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 font-opensans">
                            Processing image...
                          </span>
                        </div>
                        <Progress value={50} className="h-2" />
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {error && (
                      <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          <p className="text-sm font-opensans">{error}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Image Grid */}
                    {previewImages.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                        {/* Stored Images with Previews */}
                        {previewImages.map((preview) => (
                          <div 
                            key={preview.id} 
                            className={cn(
                              "relative aspect-square rounded-lg overflow-hidden border-2",
                              localProfileImageId === preview.id ? "border-[#ED8936]" : "border-transparent"
                            )}
                          >
                            <img 
                              src={preview.previewUrl} 
                              alt={preview.file.name || "Project inspiration"} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.warn('Image preview failed to load:', preview.previewUrl);
                                // Show a placeholder instead of hiding the image
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                            
                            {/* Profile Image Indicator */}
                            {localProfileImageId === preview.id && (
                              <div className="absolute top-2 left-2">
                                <div className="bg-[#ED8936] p-1 rounded-full">
                                  <Camera className="h-4 w-4 text-white" />
                                </div>
                              </div>
                            )}
                            
                            {/* Hover Controls */}
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="bg-white text-slate-800 hover:bg-slate-100"
                                  onClick={() => setProfileImage(preview.id)}
                                >
                                  Set Profile
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => removeImage(preview.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ErrorBoundary>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

// Memoized export to prevent unnecessary re-renders
export const ProjectInspirationImages = React.memo(ProjectInspirationImagesComponent);
