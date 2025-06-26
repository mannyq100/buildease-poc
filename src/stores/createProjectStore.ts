/**
 * Create Project Store - Dedicated Zustand Store for Project Creation Wizard
 * 
 * Manages the complete state for the 7-step project creation wizard including:
 * - Current step navigation
 * - Form data management
 * - Image upload state
 * - Submission state
 * 
 * This store replaces the ProjectCreationContext for better performance and maintainability.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createProject, validateProjectData } from '@/services/projectCreationService';
import { uploadFile, getStorageUserId } from '@/utils/core/storageUtils';

// Import types from CreateProject
export interface ProjectFormValues {
  // Essential Information - Step 1
  name: string;
  description?: string;
  projectType: string;
  owner?: string;
  phoneNumber?: string;
  email?: string;
  
  // Location Essentials - Step 2
  location: string;
  country: string;
  region: string;
  plotSize: string;
  plotSizeUnit: string;
  terrain?: string;
  nearbyLandmarks?: string;
  
  // Core Building Requirements - Step 3
  buildingSize: string;
  buildingSizeUnit: string;
  storeys: string;
  bedrooms: string;
  bathrooms: string;
  kitchens?: string;
  livingAreas?: string;
  buildingStyle?: string;
  
  // Budget Essentials - Step 4
  budget: string;
  currency: string;
  timeframe?: string;
  expectedStartDate?: string;
  
  // Basic Materials - Step 5
  structureType?: string;
  foundationType?: string;
  roofType?: string;
  wallMaterial?: string;
  floorMaterial?: string;
  
  // Preferences & Features - Step 6
  specialFeatures?: string[];
  sustainabilityFeatures?: string[];
  
  // Additional Context - Step 7
  siteConstraints?: string;
  localRegulations?: string;
  additionalNotes?: string;
  
  // Inspiration Images
  images?: string[];
  profileImage?: string;
}

// Local image file interface
export interface LocalImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

// Image state interface
export interface ImageState {
  localFiles: LocalImageFile[];
  localProfileImageId: string | null;
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
}

// Submission state interface
export interface SubmissionState {
  isSubmitting: boolean;
  submitError: string | null;
  isSuccess: boolean;
}

// Validation state interface
export interface ValidationState {
  stepErrors: Record<number, string[]>;
  isValidating: boolean;
}

// Main store state interface
export interface CreateProjectStoreState {
  // Navigation
  currentStep: number;
  totalSteps: number;
  
  // Form data
  formData: ProjectFormValues;
  
  // Image management
  imageState: ImageState;
  
  // Submission state
  submissionState: SubmissionState;
  
  // Validation state
  validationState: ValidationState;
  
  // Additional wizard state
  isDifferentOwner: boolean;
  
  // Actions
  goToNextStep: () => void;
  goToPrevStep: () => void;
  jumpToStep: (step: number) => void;
  updateFormData: (data: Partial<ProjectFormValues>) => void;
  resetForm: () => void;
  
  // Image actions
  handleFileSelection: (file: File) => Promise<void>;
  removeImage: (imageId: string) => void;
  setProfileImage: (imageId: string) => void;
  uploadAllImages: () => Promise<string[]>;
  resetImages: () => void;
  
  // Submission actions
  submitProject: (userId: string) => Promise<void>;
  resetSubmission: () => void;
  
  // Validation actions
  validateStep: (step: number) => boolean;
  setStepErrors: (step: number, errors: string[]) => void;
  clearStepErrors: (step: number) => void;
  
  // Utility actions
  setIsDifferentOwner: (isDifferent: boolean) => void;
  calculateProgress: () => number;
}

// Default form values
const defaultFormValues: ProjectFormValues = {
  name: '',
  description: '',
  projectType: '',
  owner: '',
  phoneNumber: '',
  email: '',
  location: '',
  country: 'ghana',
  region: 'greater-accra',
  plotSize: '',
  plotSizeUnit: 'sq-m',
  terrain: '',
  nearbyLandmarks: '',
  buildingSize: '',
  buildingSizeUnit: 'sq-m',
  storeys: '',
  bedrooms: '',
  bathrooms: '',
  kitchens: '',
  livingAreas: '',
  buildingStyle: '',
  budget: '',
  currency: 'GHS',
  timeframe: '',
  expectedStartDate: '',
  structureType: '',
  foundationType: '',
  roofType: '',
  wallMaterial: '',
  floorMaterial: '',
  specialFeatures: [],
  sustainabilityFeatures: [],
  siteConstraints: '',
  localRegulations: '',
  additionalNotes: '',
  images: [],
  profileImage: '',
};

// Default image state
const defaultImageState: ImageState = {
  localFiles: [],
  localProfileImageId: null,
  isUploading: false,
  uploadProgress: 0,
  uploadError: null,
};

// Default submission state
const defaultSubmissionState: SubmissionState = {
  isSubmitting: false,
  submitError: null,
  isSuccess: false,
};

// Default validation state
const defaultValidationState: ValidationState = {
  stepErrors: {},
  isValidating: false,
};

// Step field validation mapping
const STEP_FIELDS: Record<number, (keyof ProjectFormValues)[]> = {
  1: ['name', 'projectType'], // Essential Details
  2: ['location', 'country', 'region', 'plotSize', 'plotSizeUnit'], // Location
  3: ['buildingSize', 'buildingSizeUnit', 'storeys', 'bedrooms', 'bathrooms'], // Building Specs
  4: ['budget', 'currency'], // Budget
  5: [], // Materials (optional)
  6: [], // Features (optional)
  7: [], // Review (no validation)
};

// Utility function to create blob URL from file
const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

// Utility function to generate unique ID
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Create the Zustand store
export const useCreateProjectStore = create<CreateProjectStoreState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentStep: 1,
      totalSteps: 7,
      formData: defaultFormValues,
      imageState: defaultImageState,
      submissionState: defaultSubmissionState,
      validationState: defaultValidationState,
      isDifferentOwner: false,

      // Navigation actions
      goToNextStep: () => {
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, state.totalSteps)
        }), false, 'goToNextStep');
      },

      goToPrevStep: () => {
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1)
        }), false, 'goToPrevStep');
      },

      jumpToStep: (step: number) => {
        const { totalSteps } = get();
        set({
          currentStep: Math.max(1, Math.min(step, totalSteps))
        }, false, 'jumpToStep');
      },

      // Form data actions
      updateFormData: (data: Partial<ProjectFormValues>) => {
        set((state) => ({
          formData: { ...state.formData, ...data }
        }), false, 'updateFormData');
      },

      resetForm: () => {
        set({
          currentStep: 1,
          formData: defaultFormValues,
          imageState: defaultImageState,
          submissionState: defaultSubmissionState,
          validationState: defaultValidationState,
          isDifferentOwner: false,
        }, false, 'resetForm');
      },

      // Image actions
      handleFileSelection: async (file: File) => {
        const { imageState } = get();
        
        // Validate file
        if (!file.type.startsWith('image/')) {
          set((state) => ({
            imageState: {
              ...state.imageState,
              uploadError: 'Please select a valid image file'
            }
          }), false, 'handleFileSelection-error');
          throw new Error('Please select a valid image file');
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          set((state) => ({
            imageState: {
              ...state.imageState,
              uploadError: 'File size must be less than 5MB'
            }
          }), false, 'handleFileSelection-error');
          throw new Error('File size must be less than 5MB');
        }

        if (imageState.localFiles.length >= 5) {
          set((state) => ({
            imageState: {
              ...state.imageState,
              uploadError: 'Maximum 5 images allowed'
            }
          }), false, 'handleFileSelection-error');
          throw new Error('Maximum 5 images allowed');
        }

        // Clear previous errors
        set((state) => ({
          imageState: {
            ...state.imageState,
            uploadError: null,
            isUploading: true,
            uploadProgress: 0
          }
        }), false, 'handleFileSelection-start');

        try {
          // Create local file object
          const localFile: LocalImageFile = {
            id: generateId(),
            file,
            previewUrl: createPreviewUrl(file)
          };

          // Simulate upload progress
          const progressInterval = setInterval(() => {
            set((state) => ({
              imageState: {
                ...state.imageState,
                uploadProgress: Math.min(state.imageState.uploadProgress + 10, 90)
              }
            }), false, 'handleFileSelection-progress');
          }, 100);

          // Add to local files
          setTimeout(() => {
            clearInterval(progressInterval);
            set((state) => ({
              imageState: {
                ...state.imageState,
                localFiles: [...state.imageState.localFiles, localFile],
                isUploading: false,
                uploadProgress: 100,
                localProfileImageId: state.imageState.localFiles.length === 0 ? localFile.id : state.imageState.localProfileImageId
              }
            }), false, 'handleFileSelection-complete');
          }, 1000);

        } catch (error) {
          set((state) => ({
            imageState: {
              ...state.imageState,
              isUploading: false,
              uploadError: error instanceof Error ? error.message : 'Failed to process image'
            }
          }), false, 'handleFileSelection-error');
          throw error;
        }
      },

      removeImage: (imageId: string) => {
        set((state) => {
          const updatedFiles = state.imageState.localFiles.filter(file => file.id !== imageId);
          // Revoke blob URL to prevent memory leaks
          const fileToRemove = state.imageState.localFiles.find(file => file.id === imageId);
          if (fileToRemove) {
            URL.revokeObjectURL(fileToRemove.previewUrl);
          }
          
          return {
            imageState: {
              ...state.imageState,
              localFiles: updatedFiles,
              localProfileImageId: state.imageState.localProfileImageId === imageId 
                ? (updatedFiles.length > 0 ? updatedFiles[0].id : null)
                : state.imageState.localProfileImageId
            }
          };
        }, false, 'removeImage');
      },

      setProfileImage: (imageId: string) => {
        set((state) => ({
          imageState: {
            ...state.imageState,
            localProfileImageId: imageId
          }
        }), false, 'setProfileImage');
      },

      uploadAllImages: async () => {
        const { imageState } = get();
        
        if (imageState.localFiles.length === 0) {
          return [];
        }

        // Set uploading state
        set((state) => ({
          imageState: {
            ...state.imageState,
            isUploading: true,
            uploadProgress: 0,
            uploadError: null
          }
        }), false, 'uploadAllImages-start');

        try {
          // Get authenticated user ID
          const userId = await getStorageUserId();
          if (!userId) {
            throw new Error('User not authenticated');
          }

          const uploadedUrls: string[] = [];
          const totalFiles = imageState.localFiles.length;

          // Upload each file to Supabase
          for (let i = 0; i < totalFiles; i++) {
            const localFile = imageState.localFiles[i];
            
            // Update progress
            const progress = Math.round(((i + 0.5) / totalFiles) * 100);
            set((state) => ({
              imageState: {
                ...state.imageState,
                uploadProgress: progress
              }
            }), false, 'uploadAllImages-progress');

            // Upload to Supabase storage using existing utility
            const result = await uploadFile(localFile.file, {
              bucket: 'project-inspiration',
              userId,
              allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
              maxSizeMB: 5,
              onProgress: (progress) => {
                const totalProgress = Math.round(((i / totalFiles) * 100) + (progress / totalFiles));
                set((state) => ({
                  imageState: {
                    ...state.imageState,
                    uploadProgress: totalProgress
                  }
                }), false, 'uploadAllImages-file-progress');
              }
            });
            
            if (!result.success || !result.publicUrl) {
              throw new Error(result.error || `Failed to upload ${localFile.file.name}`);
            }

            uploadedUrls.push(result.publicUrl);
            
            // Revoke the local blob URL since we now have the Supabase URL
            URL.revokeObjectURL(localFile.previewUrl);
          }

          // Find profile image URL
          const profileImageUrl = imageState.localProfileImageId 
            ? uploadedUrls[imageState.localFiles.findIndex(f => f.id === imageState.localProfileImageId)]
            : uploadedUrls[0] || '';

          // Update form data with uploaded URLs and clear local files
          set((state) => ({
            formData: {
              ...state.formData,
              images: uploadedUrls,
              profileImage: profileImageUrl
            },
            imageState: {
              ...state.imageState,
              localFiles: [], // Clear local files after successful upload
              localProfileImageId: null,
              isUploading: false,
              uploadProgress: 100,
              uploadError: null
            }
          }), false, 'uploadAllImages-success');

          return uploadedUrls;

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to upload images';
          
          set((state) => ({
            imageState: {
              ...state.imageState,
              isUploading: false,
              uploadProgress: 0,
              uploadError: errorMessage
            }
          }), false, 'uploadAllImages-error');
          
          throw new Error(errorMessage);
        }
      },

      resetImages: () => {
        const { imageState } = get();
        
        // Revoke all blob URLs to prevent memory leaks
        imageState.localFiles.forEach(file => {
          URL.revokeObjectURL(file.previewUrl);
        });

        set({
          imageState: defaultImageState
        }, false, 'resetImages');
      },

      // Submission actions
      submitProject: async (userId: string) => {
        const { uploadAllImages, imageState } = get();
        
        set((state) => ({
          submissionState: {
            ...state.submissionState,
            isSubmitting: true,
            submitError: null
          }
        }), false, 'submitProject-start');

        try {
          // Get initial form data for validation
          let currentFormData = get().formData;
          
          // Validate project data
          const validation = validateProjectData(currentFormData);
          if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
          }

          // Upload all images first if there are local files
          if (imageState.localFiles.length > 0) {
            console.log('🚀 Uploading', imageState.localFiles.length, 'images to Supabase...');
            const uploadedImageUrls = await uploadAllImages();
            console.log('✅ Images uploaded successfully:', uploadedImageUrls);
            
            // Get updated form data after image upload
            currentFormData = get().formData;
            console.log('📊 Form data after image upload:', { 
              images: currentFormData.images, 
              profileImage: currentFormData.profileImage 
            });
          }
          
          // Create the project with updated form data (including uploaded image URLs)
          const result = await createProject(currentFormData, userId);
          
          if (!result.success) {
            throw new Error(result.error || 'Failed to create project');
          }

          set((state) => ({
            submissionState: {
              ...state.submissionState,
              isSubmitting: false,
              isSuccess: true
            }
          }), false, 'submitProject-success');

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('❌ Project submission failed:', errorMessage);
          set((state) => ({
            submissionState: {
              ...state.submissionState,
              isSubmitting: false,
              submitError: errorMessage
            }
          }), false, 'submitProject-error');
          throw error;
        }
      },

      resetSubmission: () => {
        set({
          submissionState: defaultSubmissionState
        }, false, 'resetSubmission');
      },

      // Validation actions
      validateStep: (step: number) => {
        const { formData } = get();
        const requiredFields = STEP_FIELDS[step] || [];
        const errors: string[] = [];

        requiredFields.forEach(field => {
          const value = formData[field];
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors.push(`${field} is required`);
          }
        });

        set((state) => ({
          validationState: {
            ...state.validationState,
            stepErrors: {
              ...state.validationState.stepErrors,
              [step]: errors
            }
          }
        }), false, 'validateStep');

        return errors.length === 0;
      },

      setStepErrors: (step: number, errors: string[]) => {
        set((state) => ({
          validationState: {
            ...state.validationState,
            stepErrors: {
              ...state.validationState.stepErrors,
              [step]: errors
            }
          }
        }), false, 'setStepErrors');
      },

      clearStepErrors: (step: number) => {
        set((state) => ({
          validationState: {
            ...state.validationState,
            stepErrors: {
              ...state.validationState.stepErrors,
              [step]: []
            }
          }
        }), false, 'clearStepErrors');
      },

      // Utility actions
      setIsDifferentOwner: (isDifferent: boolean) => {
        set({ isDifferentOwner: isDifferent }, false, 'setIsDifferentOwner');
      },

      calculateProgress: () => {
        const { formData, currentStep, totalSteps } = get();
        
        // Calculate form completion percentage
        const requiredFields = Object.values(STEP_FIELDS).flat();
        const completedFields = requiredFields.filter(field => {
          const value = formData[field];
          return value && (typeof value !== 'string' || value.trim() !== '');
        });
        
        const formProgress = (completedFields.length / requiredFields.length) * 100;
        const stepProgress = (currentStep / totalSteps) * 100;
        
        // Return weighted average (70% form completion, 30% step progress)
        return Math.round((formProgress * 0.7) + (stepProgress * 0.3));
      },
    }),
    {
      name: 'create-project-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// Convenience hooks for common operations
export const useCreateProjectForm = () => {
  const formData = useCreateProjectStore(state => state.formData);
  const updateFormData = useCreateProjectStore(state => state.updateFormData);
  const resetForm = useCreateProjectStore(state => state.resetForm);
  
  return { formData, updateFormData, resetForm };
};

export const useCreateProjectNavigation = () => {
  const currentStep = useCreateProjectStore(state => state.currentStep);
  const totalSteps = useCreateProjectStore(state => state.totalSteps);
  const goToNextStep = useCreateProjectStore(state => state.goToNextStep);
  const goToPrevStep = useCreateProjectStore(state => state.goToPrevStep);
  const jumpToStep = useCreateProjectStore(state => state.jumpToStep);
  
  return { currentStep, totalSteps, goToNextStep, goToPrevStep, jumpToStep };
};

export const useCreateProjectImages = () => {
  const imageState = useCreateProjectStore(state => state.imageState);
  const handleFileSelection = useCreateProjectStore(state => state.handleFileSelection);
  const removeImage = useCreateProjectStore(state => state.removeImage);
  const setProfileImage = useCreateProjectStore(state => state.setProfileImage);
  const uploadAllImages = useCreateProjectStore(state => state.uploadAllImages);
  const resetImages = useCreateProjectStore(state => state.resetImages);
  
  return {
    ...imageState,
    handleFileSelection,
    removeImage,
    setProfileImage,
    uploadAllImages,
    resetImages
  };
};

export const useCreateProjectSubmission = () => {
  const submissionState = useCreateProjectStore(state => state.submissionState);
  const submitProject = useCreateProjectStore(state => state.submitProject);
  const resetSubmission = useCreateProjectStore(state => state.resetSubmission);
  
  return { ...submissionState, submitProject, resetSubmission };
};

export const useCreateProjectValidation = () => {
  const validationState = useCreateProjectStore(state => state.validationState);
  const validateStep = useCreateProjectStore(state => state.validateStep);
  const setStepErrors = useCreateProjectStore(state => state.setStepErrors);
  const clearStepErrors = useCreateProjectStore(state => state.clearStepErrors);
  
  return {
    ...validationState,
    validateStep,
    setStepErrors,
    clearStepErrors
  };
};