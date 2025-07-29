/**
 * Custom hook for managing all project images (inspiration, progress, profile)
 * Provides unified state management and handlers for image upload components
 * Uses enhanced storage system with proper blob URL lifecycle management
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { uploadProjectImage, deleteProjectImage, getFilePathFromUrl, uploadProjectImages, type ImageType as ServiceImageType } from '@/services/projectImageService';
import { useImageStorageV2 } from './useImageStorageV2';
import { isEqual } from 'lodash';

type ImageType = 'inspiration' | 'progress' | 'profile';

interface UseProjectImagesProps {
  imageType: ImageType;
  projectId?: string;
  initialImages?: string[];
  initialProfileImage?: string | null;
  maxImages?: number;
  onChange?: (urls: string[]) => void;
  onProfileImageChange?: (url: string) => void;
}


export interface LocalImageFile {
  file: File;
  id: string;
  previewUrl: string;
}

export interface UseProjectImagesReturn {
  images: string[];
  profileImage: string | null;
  localFiles: LocalImageFile[];
  localProfileImageId: string | null;
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  handleFileSelection: (file: File) => Promise<void>;
  handleRemoveLocal: (id: string) => void;
  handleRemove: (url: string) => Promise<void>;
  handleSelectProfileImage: (url: string | null) => void;
  handleSelectLocalProfileImage: (id: string) => void;
  // Unified methods for better API consistency
  handleRemoveImage: (imageIdOrUrl: string) => void;
  handleSetProfileImage: (imageIdOrUrl: string) => void;
  uploadAllFiles: () => Promise<string[]>;
  uploadFilesWithUnifiedService: (files: File[]) => Promise<string[]>;
  reset: () => void;
  hasLocalFiles: boolean;
}


/**
 * Main hook implementation for managing all project images
 */
export function useProjectImages({
  imageType,
  projectId,
  initialImages = [],
  initialProfileImage = null,
  maxImages = 5,
  onChange,
  onProfileImageChange
}: UseProjectImagesProps): UseProjectImagesReturn {
  // Use refs to store stable callbacks and prevent infinite loops
  const onChangeRef = useRef(onChange);
  const onProfileImageChangeRef = useRef(onProfileImageChange);
  
  // Store previous state values to compare for changes
  const prevImagesRef = useRef<string[]>(initialImages);
  const prevProfileImageRef = useRef<string | null>(initialProfileImage);
  
  // Update refs when callbacks change
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  
  useEffect(() => {
    onProfileImageChangeRef.current = onProfileImageChange;
  }, [onProfileImageChange]);
  
  // Core state
  const [images, setImagesInternal] = useState<string[]>(initialImages);
  const [profileImage, setProfileImageInternal] = useState<string | null>(initialProfileImage);
  
  // UI state for uploads
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // External dependencies
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  

  // Enhanced storage hook for local images
  const {
    images: storedImages,
    profileImageId: localProfileImageId,
    isLoading: storageLoading,
    error: storageError,
    addImage: addStoredImage,
    removeImage: removeStoredImage,
    setProfileImage: setStoredProfileImage,
    clearImages: clearStoredImages,
    getImageFiles
  } = useImageStorageV2({
    storageKey: `project_${imageType}`,
    maxImages,
    maxSizeMB: 5,
    generateThumbnails: true
  });

  // Map stored images to LocalImageFile format for compatibility
  const [localFiles, setLocalFiles] = useState<LocalImageFile[]>([]);
  
  // Track blob URLs for proper cleanup
  const blobUrlsRef = useRef<Set<string>>(new Set());
  
  // Cleanup function for blob URLs
  const cleanupBlobUrls = useCallback((urlsToClean?: string[]) => {
    const urlsSet = urlsToClean ? new Set(urlsToClean) : blobUrlsRef.current;
    urlsSet.forEach(url => {
      if (url && url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(url);
          blobUrlsRef.current.delete(url);
        } catch (error) {
          console.warn('Failed to revoke blob URL:', url, error);
        }
      }
    });
  }, []);
  
  // Update localFiles when storedImages change
  useEffect(() => {
    // Clean up old URLs first
    cleanupBlobUrls();

    if (storedImages.length === 0) {
      setLocalFiles([]);
      return;
    }

    const mappedFiles = storedImages.map((storedImage) => {
      try {
        // Create preview URL directly from the File object
        const previewUrl = URL.createObjectURL(storedImage.file);
        // Track the blob URL for cleanup
        blobUrlsRef.current.add(previewUrl);
        return {
          file: storedImage.file,
          id: storedImage.id,
          previewUrl
        };
      } catch (error) {
        console.error('Error creating preview for image:', storedImage.id, error);
        return null;
      }
    });
    
    const validFiles = mappedFiles.filter(Boolean) as LocalImageFile[];
    setLocalFiles(validFiles);
  }, [storedImages, cleanupBlobUrls]);
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Cleanup all blob URLs when component unmounts
      cleanupBlobUrls();
    };
  }, [cleanupBlobUrls]);
  
  // Wrapped state setters with change detection
  const setImages = useCallback((newImages: string[]) => {
    if (!isEqual(newImages, prevImagesRef.current)) {
      setImagesInternal(newImages);
      prevImagesRef.current = newImages;
      onChangeRef.current?.(newImages);
    }
  }, []);
  
  const setProfileImage = useCallback((newProfileImage: string | null) => {
    if (newProfileImage !== prevProfileImageRef.current) {
      setProfileImageInternal(newProfileImage);
      prevProfileImageRef.current = newProfileImage;
      onProfileImageChangeRef.current?.(newProfileImage || '');
    }
  }, []);
  
  // Reset state
  const reset = useCallback(async () => {
    setUploadProgress(0);
    setUploadError(null);
    clearStoredImages();
    // Cleanup blob URLs on reset
    cleanupBlobUrls();
  }, [clearStoredImages, cleanupBlobUrls]);
  
  
  /**
   * Handle local file selection using enhanced storage
   */
  const handleFileSelection = useCallback(async (file: File): Promise<void> => {
    // Early return if no user is authenticated
    if (!user) {
      setUploadError('You must be logged in to select images');
      toast({
        title: "Authentication required",
        description: "You must be logged in to select images",
        variant: "destructive"
      });
      return;
    }
    
    // Reset any previous errors
    setUploadError(null);
    
    try {
      await addStoredImage(file);
      
      // Show success message
      toast({
        title: "Image added",
        description: `Your ${imageType} image has been added successfully`,
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add image';
      setUploadError(errorMessage);
      toast({
        title: "Failed to add image",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [user, addStoredImage, toast, imageType]);
  
  /**
   * Upload all local files when form is submitted
   */
  const uploadAllFiles = useCallback(async (): Promise<string[]> => {
    // Validate user authentication
    if (!user) {
      const error = new Error('You must be logged in to upload images');
      setUploadError(error.message);
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload images",
        variant: "destructive"
      });
      throw error;
    }
    
    // Get all image files from storage
    const imageFiles = getImageFiles();
    
    // Early return if no local files to upload
    if (imageFiles.length === 0) {
      return images; // No local files to upload
    }
    
    // Initialize upload state
    setIsUploading(true);
    setUploadError(null);
    
    // Track uploaded URLs and profile image
    const uploadedUrls: string[] = [...images]; // Start with existing remote images
    let uploadedProfileImage = profileImage;
    let failedUploads = 0;
    
    try {
      // Upload each file sequentially with retry logic
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        setUploadProgress(Math.round((i / imageFiles.length) * 100));
        
        // Try up to 3 times for each file
        let attempts = 0;
        let uploadSuccess = false;
        let result: any;
        
        while (attempts < 3 && !uploadSuccess) {
          try {
            result = await uploadProjectImage(file, user.id, imageType, (progress) => {
              // Calculate overall progress considering current file and already processed files
              const overallProgress = Math.round(((i + (progress / 100)) / imageFiles.length) * 100);
              setUploadProgress(overallProgress);
            }, projectId);
            
            if (result.success && result.publicUrl) {
              uploadSuccess = true;
            } else {
              attempts++;
              // Short delay before retry
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (err) {
            attempts++;
            // Short delay before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        // Handle successful upload
        if (result?.success && result?.publicUrl) {
          uploadedUrls.push(result.publicUrl);
          
          // ONLY set as profile image if:
          // 1. This image was explicitly selected as profile by the user
          // 2. We have a profile image change callback (meaning this hook handles profile changes)
          // 3. This is specifically the profile image type hook (not progress or inspiration)
          if (localProfileImageId && 
              onProfileImageChangeRef.current && 
              imageType === 'profile' &&
              storedImages.find(img => img.id === localProfileImageId)?.file === file) {
            uploadedProfileImage = result.publicUrl;
          }
        } else {
          // Handle failed upload after retries
          failedUploads++;
          console.error('Error uploading file after multiple attempts:', file.name);
          // Continue with other files
        }
      }
      
      // Show warning if some uploads failed
      if (failedUploads > 0) {
        toast({
          title: "Some uploads failed",
          description: `${failedUploads} image${failedUploads > 1 ? 's' : ''} could not be uploaded. You can try again later.`,
          variant: "warning"
        });
      }
      
      // Update state with all uploaded images
      setImages(uploadedUrls);
      
      // Update profile image ONLY if it actually changed AND we have a profile callback
      if (uploadedProfileImage !== profileImage && 
          onProfileImageChangeRef.current && 
          uploadedProfileImage !== null) {
        setProfileImage(uploadedProfileImage);
      }
      
      // Clear local storage after successful upload
      clearStoredImages();
      
      // Show success message
      if (failedUploads === 0) {
        toast({
          title: "Upload complete",
          description: `Successfully uploaded ${imageFiles.length} ${imageType} image${imageFiles.length > 1 ? 's' : ''}.`,
        });
      }
      
      return uploadedUrls;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setUploadError(errorMessage);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your images. Please try again.",
        variant: "destructive"
      });
      console.error('Error uploading images:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [images, getImageFiles, localProfileImageId, storedImages, profileImage, user, toast, setImages, setProfileImage, clearStoredImages, imageType, projectId]);

  /**
   * Upload files using the new unified service (alternative to uploadAllFiles)
   * This method uses the database sync functionality
   */
  const uploadFilesWithUnifiedService = useCallback(async (filesToUpload: File[]): Promise<string[]> => {
    if (!user || !projectId) {
      const error = new Error('User authentication and project ID required');
      setUploadError(error.message);
      toast({
        title: "Authentication required",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }

    if (filesToUpload.length === 0) {
      return images; // No files to upload
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await uploadProjectImages({
        type: imageType as ServiceImageType,
        projectId,
        files: filesToUpload,
        onProgress: setUploadProgress
      });

      if (result.success && result.uploadedImages) {
        const newUrls = result.uploadedImages.map(img => img.url);
        const allUrls = [...images, ...newUrls];
        
        // Update state with new images
        setImages(allUrls);
        
        // Clear local storage after successful upload
        clearStoredImages();
        
        toast({
          title: "Upload complete",
          description: `Successfully uploaded ${result.uploadedImages.length} ${imageType} image${result.uploadedImages.length > 1 ? 's' : ''}.`,
        });

        return allUrls;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [user, projectId, imageType, images, setImages, clearStoredImages, toast]);
  
  // Helper function to safely revoke object URLs
  const revokeObjectUrl = useCallback((url: string) => {
    if (url && url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.warn('Failed to revoke object URL:', url, error);
      }
    }
  }, []);

  // Clean up object URLs when component unmounts or localFiles change
  useEffect(() => {
    // Store current URLs to clean up later
    const currentUrls = localFiles.map(file => file.previewUrl);
    
    return () => {
      currentUrls.forEach(url => {
        revokeObjectUrl(url);
      });
    };
  }, [localFiles, revokeObjectUrl]);
  
  // Handle removing a local file using enhanced storage
  const handleRemoveLocal = useCallback(async (id: string) => {
    try {
      removeStoredImage(id);
      
      toast({
        title: "Image removed",
        description: `The ${imageType} image has been removed`,
      });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to remove image');
      toast({
        title: "Failed to remove image",
        description: "There was a problem removing the image",
        variant: "destructive"
      });
    }
  }, [removeStoredImage, toast, imageType]);
  
  
  // Handle image removal
  const handleRemove = useCallback(async (urlToRemove: string) => {
    // Extract file path from URL
    const filePath = getFilePathFromUrl(urlToRemove, imageType);
    
    if (!filePath) {
      toast({
        title: "Error",
        description: "Could not process the image URL",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const result = await deleteProjectImage(filePath, imageType);
      
      if (result.success) {
        // Update the images array
        const newImages = images.filter(url => url !== urlToRemove);
        setImages(newImages);
        onChangeRef.current?.(newImages);
        
        // If the removed image was the profile image, clear it or set a new one
        if (profileImage === urlToRemove) {
          if (newImages.length > 0) {
            setProfileImage(newImages[0]);
            onProfileImageChangeRef.current?.(newImages[0]);
            toast({
              title: "Profile image updated",
              description: "A new profile image has been selected",
            });
          } else if (localFiles.length > 0) {
            // If we have local files but no remote images, select the first local file
            const firstLocalFile = localFiles[0];
            setProfileImage(null);
            setStoredProfileImage(firstLocalFile.id);
          } else {
            setProfileImage(null);
            onProfileImageChangeRef.current?.('');
          }
        }
      } else {
        toast({
          title: "Deletion failed",
          description: result.error || "Could not delete the image",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem removing your image",
        variant: "destructive"
      });
      console.error('Error removing image:', error);
    }
  }, [images, profileImage, toast, localFiles, setStoredProfileImage, imageType]);
  
  // Handle profile image selection for remote images
  const handleSelectProfileImage = useCallback((url: string | null) => {
    if (url) {
      setProfileImage(url);
      setStoredProfileImage(''); // Clear any local profile image selection
      onProfileImageChangeRef.current?.(url);
      toast({
        title: "Profile image updated",
        description: "Your project profile image has been updated",
      });
    } else {
      setProfileImage(null);
      onProfileImageChangeRef.current?.('');
    }
  }, [toast, setStoredProfileImage]);
  
  // Handle profile image selection for local images using enhanced storage
  const handleSelectLocalProfileImage = useCallback(async (id: string) => {
    try {
      setStoredProfileImage(id);
      setProfileImage(null); // Clear any remote profile image selection
      toast({
        title: "Profile image updated",
        description: "Your project profile image has been updated",
      });
    } catch (error) {
      toast({
        title: "Failed to set profile image",
        description: "There was a problem setting the profile image",
        variant: "destructive"
      });
    }
  }, [setStoredProfileImage, toast]);

  /**
   * Unified method to remove an image by ID or URL
   * Handles both local files and remote images
   */
  const handleRemoveImage = useCallback((imageIdOrUrl: string) => {
    // Check if it's a URL (remote image) or ID (local file)
    if (imageIdOrUrl.startsWith('http')) {
      // It's a remote image URL
      handleRemove(imageIdOrUrl).catch(error => {
        console.error('Error removing remote image:', error);
      });
    } else {
      // It's a local file ID
      handleRemoveLocal(imageIdOrUrl);
    }
  }, [handleRemove, handleRemoveLocal]);

  /**
   * Unified method to set profile image by ID or URL
   * Handles both local files and remote images
   */
  const handleSetProfileImage = useCallback((imageIdOrUrl: string) => {
    // Check if it's a URL (remote image) or ID (local file)
    if (imageIdOrUrl.startsWith('http')) {
      // It's a remote image URL
      handleSelectProfileImage(imageIdOrUrl);
    } else {
      // It's a local file ID
      handleSelectLocalProfileImage(imageIdOrUrl);
    }
  }, [handleSelectProfileImage, handleSelectLocalProfileImage]);

  // Combine loading states
  const isLoading = storageLoading || isUploading;
  
  // Combine error states
  const combinedError = uploadError || storageError;


  // Return all values and functions
  return {
    images,
    profileImage,
    localFiles,
    localProfileImageId,
    isUploading: isLoading,
    uploadProgress,
    uploadError: combinedError,
    handleFileSelection,
    handleRemoveLocal,
    handleRemove,
    handleSelectProfileImage,
    handleSelectLocalProfileImage,
    handleRemoveImage,
    handleSetProfileImage,
    uploadAllFiles,
    uploadFilesWithUnifiedService,
    reset,
    hasLocalFiles: localFiles.length > 0
  };
}

