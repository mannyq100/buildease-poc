/**
 * ProjectCreationContext
 * 
 * Centralized state management for the project creation flow
 * Provides shared state and callbacks for all project creation components
 */
import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { useProjectInspirationImages } from '@/hooks/useProjectInspirationImages';
import { useToast } from '@/components/ui/use-toast';
import { ProjectFormValues } from '@/pages/CreateProject';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { createProject, validateProjectData } from '@/services/projectCreationService';

/**
 * Type definition for a local image file
 */
interface LocalImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

/**
 * Define the context type with all properties and methods
 */
interface ProjectCreationContextType {
  // Project type
  projectType: string;
  setProjectType: (type: string) => void;
  
  // Owner details toggle
  isDifferentOwner: boolean;
  setIsDifferentOwner: (isDifferent: boolean) => void;
  
  // Inspiration images
  inspirationImages: string[];
  profileImage: string | null;
  localFiles: LocalImageFile[];
  localProfileImageId: string | null;
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  
  // Image handling functions
  handleFileSelection: (file: File) => Promise<void>;
  handleRemoveImage: (imageIdOrUrl: string) => void;
  handleSetProfileImage: (imageIdOrUrl: string) => void;
  uploadAllImages: () => Promise<string[]>;
  resetImages: () => void;
  
  // Form submission
  handleFormSubmit: (data: ProjectFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
}

/**
 * Create the context with default values
 */
const ProjectCreationContext = createContext<ProjectCreationContextType>({
  projectType: 'residential',
  setProjectType: () => {},
  isDifferentOwner: false,
  setIsDifferentOwner: () => {},
  inspirationImages: [],
  profileImage: null,
  localFiles: [],
  localProfileImageId: null,
  isUploading: false,
  uploadProgress: 0,
  uploadError: null,
  handleFileSelection: async () => {},
  handleRemoveImage: () => {},
  handleSetProfileImage: () => {},
  uploadAllImages: async () => [],
  resetImages: () => {},
  handleFormSubmit: async () => {},
  isSubmitting: false,
  submitError: null
});

/**
 * Provider props type
 */
interface ProjectCreationProviderProps {
  children: React.ReactNode;
  onProjectCreated?: (projectId: string) => void;
}

/**
 * Provider component for project creation state management
 */
export function ProjectCreationProvider({ children, onProjectCreated }: ProjectCreationProviderProps) {
  // External hooks
  const { toast } = useToast();
  const { user } = useSupabaseAuth();
  
  // Project type state
  const [projectType, setProjectType] = useState('residential');
  
  // Owner details toggle state
  const [isDifferentOwner, setIsDifferentOwner] = useState(false);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Callback refs for stable references
  const onProjectCreatedRef = useRef(onProjectCreated);
  
  // Update callback refs when props change
  React.useEffect(() => {
    onProjectCreatedRef.current = onProjectCreated;
  }, [onProjectCreated]);
  
  // Stable callback references to prevent re-renders of useProjectInspirationImages
  const handleImagesChange = useCallback((urls: string[]) => {
    // This function is passed to useProjectInspirationImages
    // No need to do anything here as the hook manages state internally
  }, []);
  
  const handleProfileImageChange = useCallback((url: string) => {
    // This function is passed to useProjectInspirationImages
    // No need to do anything here as the hook manages state internally
  }, []);
  
  // Use the inspiration images hook
  const {
    images: inspirationImages,
    profileImage,
    localFiles,
    localProfileImageId,
    isUploading,
    uploadProgress,
    uploadError,
    handleFileSelection,
    handleRemoveImage,
    handleSetProfileImage,
    uploadAllFiles: uploadAllImages,
    reset: resetImages
  } = useProjectInspirationImages({
    initialImages: [],
    initialProfileImage: null,
    maxImages: 5,
    onChange: handleImagesChange,
    onProfileImageChange: handleProfileImageChange
  });
  
  /**
   * Form submission handler
   * Uploads images and submits form data to the API
   */
  const handleFormSubmit = useCallback(async (data: ProjectFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a project",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // First validate the form data
      const validation = validateProjectData(data);
      if (!validation.isValid) {
        setSubmitError(validation.errors.join(', '));
        toast({
          title: "Validation errors",
          description: validation.errors.join(', '),
          variant: "destructive"
        });
        return;
      }

      // Upload all images first
      const uploadedImageUrls = await uploadAllImages();
      
      // Prepare the project data with uploaded image URLs
      const projectData: ProjectFormValues = {
        ...data,
        images: uploadedImageUrls,
        profileImage: profileImage || (uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : null),
      };
      
      // Create the project using the real service
      const result = await createProject(projectData, user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create project');
      }
      
      // Show success message
      toast({
        title: "Project created successfully",
        description: `Your project "${result.project?.name}" has been created with ${uploadedImageUrls.length} inspiration images.`,
      });
      
      // Reset form state
      setProjectType('residential');
      setIsDifferentOwner(false);
      resetImages();
      
      // Call the onProjectCreated callback with actual project ID
      if (onProjectCreatedRef.current && result.project) {
        onProjectCreatedRef.current(result.project.id);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSubmitError(errorMessage);
      toast({
        title: "Error creating project",
        description: "There was a problem creating your project. Please try again.",
        variant: "destructive"
      });
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [uploadAllImages, resetImages, profileImage, user, toast]);
  
  // Wrapper for handleFileSelection to ensure proper error propagation
  const wrappedHandleFileSelection = useCallback(async (file: File) => {
    try {
      const result = await handleFileSelection(file);
      return result;
    } catch (error) {
      console.error('Context wrapper - handleFileSelection failed:', error);
      throw error;
    }
  }, [handleFileSelection]);

  /**
   * Create a memoized context value to prevent unnecessary re-renders
   */
  const contextValue = useMemo(() => ({
    projectType,
    setProjectType,
    isDifferentOwner,
    setIsDifferentOwner,
    inspirationImages,
    profileImage,
    localFiles,
    localProfileImageId,
    isUploading,
    uploadProgress,
    uploadError,
    handleFileSelection: wrappedHandleFileSelection,
    handleRemoveImage,
    handleSetProfileImage,
    uploadAllImages,
    resetImages,
    handleFormSubmit,
    isSubmitting,
    submitError
  }), [
    projectType,
    setProjectType,
    isDifferentOwner,
    setIsDifferentOwner,
    inspirationImages,
    profileImage,
    localFiles,
    localProfileImageId,
    isUploading,
    uploadProgress,
    uploadError,
    wrappedHandleFileSelection,
    handleRemoveImage,
    handleSetProfileImage,
    uploadAllImages,
    resetImages,
    handleFormSubmit,
    isSubmitting,
    submitError
  ]);
  
  return (
    <ProjectCreationContext.Provider value={contextValue}>
      {children}
    </ProjectCreationContext.Provider>
  );
}

/**
 * Custom hook to use the project creation context
 * Throws an error if used outside of a ProjectCreationProvider
 */
export function useProjectCreation() {
  const context = useContext(ProjectCreationContext);
  if (!context) {
    throw new Error('useProjectCreation must be used within a ProjectCreationProvider');
  }
  return context;
}
