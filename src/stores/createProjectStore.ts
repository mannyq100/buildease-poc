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
  city?: string;
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

// Utility function to get suggested country from browser locale
const getSuggestedCountryFromLocale = (): string => {
  try {
    // Get user's locale from browser
    const locale = navigator.language || navigator.languages?.[0] || 'en-US';
    const countryCode = locale.split('-')[1]?.toUpperCase();
    
    // Map common country codes to readable names
    const countryMap: Record<string, string> = {
      'US': 'United States',
      'GB': 'United Kingdom', 
      'CA': 'Canada',
      'AU': 'Australia',
      'GH': 'Ghana',
      'NG': 'Nigeria',
      'KE': 'Kenya',
      'ZA': 'South Africa',
      'DE': 'Germany',
      'FR': 'France',
      'ES': 'Spain',
      'IT': 'Italy',
      'BR': 'Brazil',
      'IN': 'India',
      'CN': 'China',
      'JP': 'Japan'
    };
    
    return countryMap[countryCode] || '';
  } catch (error) {
    console.warn('Could not detect country from locale:', error);
    return '';
  }
};

// Default form values
const defaultFormValues: ProjectFormValues = {
  name: '',
  description: '',
  projectType: '',
  owner: '',
  phoneNumber: '',
  email: '',
  location: '',
  city: '',
  country: getSuggestedCountryFromLocale(), // Use locale-based suggestion
  region: '', // Remove hardcoded region
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

// Step validation schema mapping - matches CreateProject.tsx schema requirements
const STEP_VALIDATION_RULES: Record<number, Record<string, (value: string) => string | null>> = {
  1: { // Essential Details
    name: (value: string) => {
      if (!value || value.trim() === '') return 'Project name is required';
      if (value.trim().length < 3) return 'Project name must be at least 3 characters';
      if (value.length > 100) return 'Project name must be less than 100 characters';
      return null;
    },
    projectType: (value: string) => {
      if (!value || value.trim() === '') return 'Please select a project type';
      return null;
    }
  },
  2: { // Location
    location: (value: string) => {
      if (!value || value.trim() === '') return 'Street address is required';
      return null;
    },
    country: (value: string) => {
      if (!value || value.trim() === '') return 'Country is required';
      return null;
    },
    region: (value: string) => {
      if (!value || value.trim() === '') return 'Region is required';
      return null;
    },
    plotSize: (value: string) => {
      if (!value || value.trim() === '') return 'Plot size is required';
      return null;
    },
    plotSizeUnit: (value: string) => {
      if (!value || value.trim() === '') return 'Unit is required';
      return null;
    }
  },
  3: { // Building Specs
    buildingSize: (value: string) => {
      if (!value || value.trim() === '') return 'Building size is required';
      return null;
    },
    buildingSizeUnit: (value: string) => {
      if (!value || value.trim() === '') return 'Unit is required';
      return null;
    },
    storeys: (value: string) => {
      if (!value || value.trim() === '') return 'Number of storeys is required';
      return null;
    },
    bedrooms: (value: string) => {
      if (!value || value.trim() === '') return 'Number of bedrooms is required';
      return null;
    },
    bathrooms: (value: string) => {
      if (!value || value.trim() === '') return 'Number of bathrooms is required';
      return null;
    }
  },
  4: { // Budget
    budget: (value: string) => {
      if (!value || value.trim() === '') return 'Budget is required';
      return null;
    },
    currency: (value: string) => {
      if (!value || value.trim() === '') return 'Currency is required';
      return null;
    }
  },
  5: {}, // Materials (optional)
  6: {}, // Features (optional)
  7: {}, // Review (no validation)
};

// Legacy field mapping for progress calculation
const STEP_FIELDS: Record<number, (keyof ProjectFormValues)[]> = {
  1: ['name', 'projectType'],
  2: ['location', 'country', 'region', 'plotSize', 'plotSizeUnit'],
  3: ['buildingSize', 'buildingSizeUnit', 'storeys', 'bedrooms', 'bathrooms'],
  4: ['budget', 'currency'],
  5: [],
  6: [],
  7: [],
};

// Utility function to create blob URL from file
const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

// Utility function to generate unique ID
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Progressive form saving utilities
const FORM_STORAGE_KEY = 'buildease-create-project-draft';
const STORAGE_VERSION = '1.0';

interface SavedFormData {
  version: string;
  timestamp: number;
  currentStep: number;
  formData: ProjectFormValues;
  isDifferentOwner: boolean;
}

// Save form data to localStorage with data sanitization
const saveFormToStorage = (state: CreateProjectStoreState): void => {
  try {
    // Sanitize form data to ensure it's serializable
    const sanitizedFormData = {
      ...state.formData,
      // Ensure arrays are properly handled
      specialFeatures: Array.isArray(state.formData.specialFeatures) ? state.formData.specialFeatures : [],
      sustainabilityFeatures: Array.isArray(state.formData.sustainabilityFeatures) ? state.formData.sustainabilityFeatures : [],
      images: Array.isArray(state.formData.images) ? state.formData.images : []
    };

    const dataToSave: SavedFormData = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      currentStep: state.currentStep,
      formData: sanitizedFormData,
      isDifferentOwner: state.isDifferentOwner
    };
    
    // Test serialization before saving
    const serialized = JSON.stringify(dataToSave);
    localStorage.setItem(FORM_STORAGE_KEY, serialized);
  } catch (error) {
    console.warn('Failed to save form data to localStorage:', error);
    // If serialization fails, try to save without problematic data
    try {
      const basicData = {
        version: STORAGE_VERSION,
        timestamp: Date.now(),
        currentStep: state.currentStep,
        formData: {
          name: state.formData.name || '',
          projectType: state.formData.projectType || '',
          description: state.formData.description || ''
        },
        isDifferentOwner: state.isDifferentOwner
      };
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(basicData));
    } catch (fallbackError) {
      console.error('Failed to save even basic form data:', fallbackError);
    }
  }
};

// Load form data from localStorage
const loadFormFromStorage = (): Partial<CreateProjectStoreState> | null => {
  try {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (!saved) return null;
    
    const parsedData: SavedFormData = JSON.parse(saved);
    
    // Check version compatibility
    if (parsedData.version !== STORAGE_VERSION) {
      console.warn('Saved form data version mismatch, clearing storage');
      localStorage.removeItem(FORM_STORAGE_KEY);
      return null;
    }
    
    // Check if data is not too old (7 days)
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    if (Date.now() - parsedData.timestamp > maxAge) {
      console.warn('Saved form data is too old, clearing storage');
      localStorage.removeItem(FORM_STORAGE_KEY);
      return null;
    }
    
    return {
      currentStep: parsedData.currentStep,
      formData: { ...defaultFormValues, ...parsedData.formData },
      isDifferentOwner: parsedData.isDifferentOwner
    };
  } catch (error) {
    console.warn('Failed to load form data from localStorage:', error);
    localStorage.removeItem(FORM_STORAGE_KEY);
    return null;
  }
};

// Clear saved form data
const clearFormStorage = (): void => {
  try {
    localStorage.removeItem(FORM_STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear form storage:', error);
  }
};

// Create the Zustand store
export const useCreateProjectStore = create<CreateProjectStoreState>()(
  devtools(
    (set, get) => {
      // Try to load saved form data on initialization
      const savedData = loadFormFromStorage();
      
      return {
        // Initial state - use saved data if available
        currentStep: savedData?.currentStep || 1,
        totalSteps: 7,
        formData: savedData?.formData || defaultFormValues,
        imageState: defaultImageState,
        submissionState: defaultSubmissionState,
        validationState: defaultValidationState,
        isDifferentOwner: savedData?.isDifferentOwner || false,

        // Navigation actions
        goToNextStep: () => {
          set((state) => {
            const newState = {
              ...state,
              currentStep: Math.min(state.currentStep + 1, state.totalSteps)
            };
            saveFormToStorage(newState);
            return { currentStep: newState.currentStep };
          }, false, 'goToNextStep');
        },

        goToPrevStep: () => {
          set((state) => {
            const newState = {
              ...state,
              currentStep: Math.max(state.currentStep - 1, 1)
            };
            saveFormToStorage(newState);
            return { currentStep: newState.currentStep };
          }, false, 'goToPrevStep');
        },

        jumpToStep: (step: number) => {
          const { totalSteps } = get();
          set((state) => {
            const newState = {
              ...state,
              currentStep: Math.max(1, Math.min(step, totalSteps))
            };
            saveFormToStorage(newState);
            return { currentStep: newState.currentStep };
          }, false, 'jumpToStep');
        },

        // Form data actions
        updateFormData: (data: Partial<ProjectFormValues>) => {
          set((state) => {
            const newState = {
              ...state,
              formData: { ...state.formData, ...data }
            };
            // Re-enabled auto-save with enhanced error handling
            saveFormToStorage(newState);
            return { formData: newState.formData };
          }, false, 'updateFormData');
        },

        resetForm: () => {
          clearFormStorage(); // Clear saved data when resetting
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
          const currentState = get();
          const { imageState } = currentState;
          
          if (imageState.localFiles.length === 0) {
            return [];
          }

          // Prevent concurrent uploads
          if (imageState.isUploading) {
            throw new Error('Upload already in progress');
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

            // Create upload queue with retry logic
            const uploadQueue = imageState.localFiles.map((localFile, index) => ({
              localFile,
              index,
              retries: 0,
              maxRetries: 3
            }));

            const uploadedResults: { index: number; url: string; localFile: LocalImageFile }[] = [];
            const failedUploads: { localFile: LocalImageFile; error: string }[] = [];
            const totalFiles = uploadQueue.length;

            // Process uploads with concurrency limit (max 3 concurrent)
            const concurrencyLimit = Math.min(3, totalFiles);
            const uploadPromises: Promise<void>[] = [];

            // Create a bound helper function for processing uploads
            const processUploadQueue = async (
              queue: { localFile: LocalImageFile; index: number; retries: number; maxRetries: number }[],
              results: { index: number; url: string; localFile: LocalImageFile }[],
              failures: { localFile: LocalImageFile; error: string }[]
            ): Promise<void> => {
              while (queue.length > 0) {
                const uploadItem = queue.shift();
                if (!uploadItem) break;

                try {
                  // Update progress
                  const completedCount = results.length;
                  const progress = Math.round((completedCount / totalFiles) * 100);
                  set((state) => ({
                    imageState: {
                      ...state.imageState,
                      uploadProgress: progress
                    }
                  }), false, 'uploadAllImages-progress');

                  // Upload to Supabase storage
                  const result = await uploadFile(uploadItem.localFile.file, {
                    bucket: 'project-inspiration',
                    userId,
                    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
                    maxSizeMB: 5,
                    onProgress: (fileProgress) => {
                      const totalProgress = Math.round(
                        ((completedCount + (fileProgress / 100)) / totalFiles) * 100
                      );
                      set((state) => ({
                        imageState: {
                          ...state.imageState,
                          uploadProgress: totalProgress
                        }
                      }), false, 'uploadAllImages-file-progress');
                    }
                  });
                  
                  if (!result.success || !result.publicUrl) {
                    throw new Error(result.error || `Failed to upload ${uploadItem.localFile.file.name}`);
                  }

                  // Add to successful results
                  results.push({
                    index: uploadItem.index,
                    url: result.publicUrl,
                    localFile: uploadItem.localFile
                  });

                } catch (error) {
                  const errorMessage = error instanceof Error ? error.message : 'Upload failed';
                  
                  // Retry logic
                  if (uploadItem.retries < uploadItem.maxRetries) {
                    uploadItem.retries++;
                    console.warn(`Retrying upload for ${uploadItem.localFile.file.name} (attempt ${uploadItem.retries}/${uploadItem.maxRetries})`);
                    
                    // Add back to queue for retry with exponential backoff
                    setTimeout(() => {
                      queue.push(uploadItem);
                    }, Math.pow(2, uploadItem.retries) * 1000); // 2s, 4s, 8s delays
                  } else {
                    // Max retries reached, add to failures
                    failures.push({
                      localFile: uploadItem.localFile,
                      error: errorMessage
                    });
                  }
                }
              }
            };

            for (let i = 0; i < concurrencyLimit; i++) {
              uploadPromises.push(
                processUploadQueue(uploadQueue, uploadedResults, failedUploads)
              );
            }

            // Wait for all uploads to complete
            await Promise.all(uploadPromises);

            // Check if any uploads failed after retries
            if (failedUploads.length > 0) {
              const errorMessages = failedUploads.map(f => `${f.localFile.file.name}: ${f.error}`);
              throw new Error(`Failed to upload ${failedUploads.length} image(s): ${errorMessages.join(', ')}`);
            }

            // Sort results by original index to maintain order
            uploadedResults.sort((a, b) => a.index - b.index);
            const uploadedUrls = uploadedResults.map(r => r.url);

            // Find profile image URL using original file order
            const profileImageUrl = imageState.localProfileImageId 
              ? uploadedResults.find(r => r.localFile.id === imageState.localProfileImageId)?.url || uploadedUrls[0] || ''
              : uploadedUrls[0] || '';

            // Clean up blob URLs
            imageState.localFiles.forEach(file => {
              URL.revokeObjectURL(file.previewUrl);
            });

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

          // Clear saved form data on successful submission
          clearFormStorage();
          
          set((state) => ({
            submissionState: {
              ...state.submissionState,
              isSubmitting: false,
              isSuccess: true
            }
          }), false, 'submitProject-success');
          
          return result;

        } catch (error) {
          console.error('Project submission failed:', error);
          
          // Enhanced error handling with recovery actions
          const { ErrorRecoveryService } = await import('@/services/errorRecoveryService');
          const enhancedError = ErrorRecoveryService.enhanceError(
            error,
            'form_submission',
            async () => {
              // Retry callback
              await get().submitProject(userId);
            },
            () => {
              // Clear callback
              get().resetForm();
            }
          );
          
          set((state) => ({
            submissionState: {
              ...state.submissionState,
              isSubmitting: false,
              submitError: error instanceof Error ? error.message : 'An unexpected error occurred',
              enhancedError
            }
          }), false, 'submitProject:error');
          
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
        const validationRules = STEP_VALIDATION_RULES[step] || {};
        const errors: string[] = [];

        // Apply schema-based validation rules
        Object.entries(validationRules).forEach(([field, validator]) => {
          const value = formData[field as keyof ProjectFormValues] as string;
          const error = validator(value);
          if (error) {
            errors.push(error);
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
          set((state) => {
            const newState = { ...state, isDifferentOwner: isDifferent };
            saveFormToStorage(newState);
            return { isDifferentOwner: isDifferent };
          }, false, 'setIsDifferentOwner');
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
    };
  },
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