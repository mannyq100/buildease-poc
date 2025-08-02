/**
 * ProjectInspirationImages Component
 * 
 * Handles the project inspiration images section
 * Allows users to upload, preview, and manage project images
 * Simplified implementation to avoid infinite loops
 */
import React, { useCallback, useState } from 'react';
import { X, Upload, Camera, AlertCircle } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Control } from 'react-hook-form';
import { CreateProjectFormValues } from '@/pages/CreateProject/schema';
import { cn } from '@/utils/core/ui';
import { useToast } from '@/components/ui/use-toast';

interface ProjectInspirationImagesProps {
  control: Control<CreateProjectFormValues>;
  className?: string;
}

interface LocalImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

/**
 * ProjectInspirationImages component
 * Allows users to upload and manage project inspiration images
 * Simplified implementation using local state
 */
function ProjectInspirationImagesComponent({ control, className = '' }: ProjectInspirationImagesProps) {
  const { toast } = useToast();
  const [localFiles, setLocalFiles] = useState<LocalImageFile[]>([]);
  const [profileImageId, setProfileImageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create preview images array from local files
  const previewImages = localFiles;
  
  // Handle file input change
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      e.target.value = '';
      
      // Clear previous errors
      setError(null);
      setIsLoading(true);
      
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Please select an image file.');
          toast({
            title: "Invalid file type",
            description: "Please select an image file.",
            variant: "destructive",
          });
          return;
        }
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          setError('Please select an image smaller than 5MB.');
          toast({
            title: "File too large",
            description: "Please select an image smaller than 5MB.",
            variant: "destructive",
          });
          return;
        }
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        const newImage: LocalImageFile = {
          id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          previewUrl
        };
        
        setLocalFiles(prev => [...prev, newImage]);
        
        toast({
          title: "Image added",
          description: "Image has been added to your project.",
        });
      } catch (_err) {
        setError('Failed to process image. Please try again.');
        toast({
          title: "Error",
          description: "Failed to process image. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [toast]);
  
  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Create a synthetic event to reuse the file change handler
      const syntheticEvent = {
        target: { files: [file], value: '' },
        preventDefault: () => {},
        stopPropagation: () => {}
      } as React.ChangeEvent<HTMLInputElement>;
      
      handleFileChange(syntheticEvent);
    }
  }, [handleFileChange]);
  
  // Remove image
  const removeImage = useCallback((id: string) => {
    setLocalFiles(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return prev.filter(img => img.id !== id);
    });
    
    // Clear profile image if it was the removed image
    if (profileImageId === id) {
      setProfileImageId(null);
    }
    
    toast({
      title: "Image removed",
      description: "Image has been removed from your project.",
    });
  }, [profileImageId, toast]);
  
  // Set profile image
  const setProfileImage = useCallback((id: string) => {
    setProfileImageId(id);
    toast({
      title: "Profile image set",
      description: "This image will be used as your project's main image.",
    });
  }, [toast]);

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
                              profileImageId === preview.id 
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
                            {profileImageId === preview.id && (
                              <div className="absolute top-2 left-2">
                                <div className="bg-[#ED8936] p-1.5 rounded-full shadow-lg">
                                  <Camera className="h-3 w-3 text-white" />
                                </div>
                              </div>
                            )}
                            
                            {/* Hover Controls */}
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                              <div className="flex gap-2">
                                {profileImageId !== preview.id && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="min-h-[44px] px-4 py-2 bg-white/90 text-slate-800 hover:bg-white border-0 shadow-lg font-opensans rounded-xl"
                                    onClick={() => setProfileImage(preview.id)}
                                  >
                                    Set as Main
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="min-h-[44px] min-w-[44px] bg-red-500/90 hover:bg-red-600 border-0 shadow-lg rounded-xl"
                                  onClick={() => removeImage(preview.id)}
                                >
                                  <X className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
