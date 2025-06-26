/**
 * ProjectInspirationImages Component
 * 
 * Handles the project inspiration images section
 * Allows users to upload, preview, and manage project images
 * Refactored to use Zustand store for state management
 */
import React, { useCallback } from 'react';
import { X, Upload, Camera, AlertCircle } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Control } from 'react-hook-form';
import { ProjectFormValues } from '@/pages/CreateProject';
import { useCreateProjectImages } from '@/stores/createProjectStore';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/utils/core/ui';

interface ProjectInspirationImagesProps {
  control: Control<ProjectFormValues>;
  className?: string;
}

/**
 * ProjectInspirationImages component
 * Allows users to upload and manage project inspiration images
 * Now uses Zustand store for state management
 */
function ProjectInspirationImagesComponent({ control, className = '' }: ProjectInspirationImagesProps) {
  // Use Zustand store for image management
  const {
    localFiles,
    localProfileImageId,
    isUploading: isLoading,
    uploadError: error,
    handleFileSelection,
    removeImage,
    setProfileImage
  } = useCreateProjectImages();
  


  // The localFiles from context already have previewUrl, so we can use them directly
  const previewImages = localFiles;
  
  // Debug logging removed for production optimization
  
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
      } catch {
        // Error handling is managed by the context with toast notifications
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
                    {/* Enhanced Image Upload Area with Drag & Drop */}
                    <div 
                      className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center transition-all duration-300 hover:border-[#2B6CB0] hover:bg-[#2B6CB0]/5 group"
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
                        <div className="w-16 h-16 bg-gradient-to-br from-[#2B6CB0]/10 to-[#ED8936]/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Upload className="h-8 w-8 text-[#2B6CB0] group-hover:text-[#ED8936] transition-colors duration-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 font-inter">
                          Upload Inspiration Images
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-opensans">
                          Drag and drop your images here, or click to browse
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 font-opensans">
                          JPG, PNG or WebP • Max 5 images • 5MB each
                        </p>
                      </label>
                    </div>
                    
                    {/* Enhanced Loading Indicator */}
                    {isLoading && (
                      <div className="bg-gradient-to-r from-[#2B6CB0]/5 to-[#ED8936]/5 border border-[#2B6CB0]/20 p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-[#2B6CB0] rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 font-opensans">
                              Processing your inspiration image...
                            </span>
                          </div>
                        </div>
                        <Progress value={50} className="h-2" />
                      </div>
                    )}
                    
                    {/* Enhanced Error Message */}
                    {error && (
                      <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-xl">
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mt-0.5">
                            <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-red-800 dark:text-red-300 font-inter mb-1">
                              Upload Error
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-400 font-opensans">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Image Grid */}
                    {previewImages.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
                        {/* Local Images with Previews */}
                        {previewImages.map((preview) => (
                          <div 
                            key={preview.id} 
                            className={cn(
                              "relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300",
                              localProfileImageId === preview.id 
                                ? "border-[#ED8936] ring-2 ring-[#ED8936]/20" 
                                : "border-slate-200 dark:border-slate-600 hover:border-[#2B6CB0]"
                            )}
                          >
                            <img 
                              src={preview.previewUrl} 
                              alt={preview.file.name || "Project inspiration"} 
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              onError={(e) => {
                                // Show a placeholder instead of hiding the image
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                            
                            {/* Profile Image Indicator */}
                            {localProfileImageId === preview.id && (
                              <div className="absolute top-2 left-2">
                                <div className="bg-[#ED8936] p-1.5 rounded-full shadow-lg">
                                  <Camera className="h-3 w-3 text-white" />
                                </div>
                              </div>
                            )}
                            
                            {/* Hover Controls */}
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                              <div className="flex gap-2">
                                {localProfileImageId !== preview.id && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="bg-white/90 text-slate-800 hover:bg-white border-0 shadow-lg font-opensans"
                                    onClick={() => setProfileImage(preview.id)}
                                  >
                                    Set as Main
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="h-8 w-8 bg-red-500/90 hover:bg-red-600 border-0 shadow-lg"
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
