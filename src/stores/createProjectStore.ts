/**
 * Create Project Store - Legacy Compatibility Wrapper
 * 
 * This file provides backward compatibility for the original createProjectStore
 * while internally using the new modular store architecture.
 * 
 * Follows BuildEase standards: under 400 lines, clean architecture
 * 
 * MIGRATION NOTE: Components should gradually migrate to use the individual stores
 * from @/stores/createProject/* for better performance and maintainability.
 */

import { useMemo } from 'react';
import { 
  type ProjectFormValues,
  type LocalImageFile,
  type ImageState,
  type ValidationState,
  type SubmissionState,
  type WizardStep,
  useProjectFormData,
  useFormDataActions,
  useFormDataStatus,
  useProjectImages,
  useImageActions,
  useWizardNavigation,
  useNavigationActions,
  useProjectValidation,
  useValidationActions,
  useProjectSubmission,
  useSubmissionActions
} from './createProject';

// Legacy interfaces for backward compatibility
export interface CreateProjectStoreState {
  // Form data
  formData: ProjectFormValues;
  updateFormData: (updates: Partial<ProjectFormValues>) => void;
  resetFormData: () => void;
  setFormField: <K extends keyof ProjectFormValues>(field: K, value: ProjectFormValues[K]) => void;
  
  // Navigation
  currentStep: WizardStep;
  completedSteps: Set<WizardStep>;
  visitedSteps: Set<WizardStep>;
  setCurrentStep: (step: WizardStep) => void;
  nextStep: () => boolean;
  previousStep: () => boolean;
  goToStep: (step: WizardStep) => void;
  markStepCompleted: (step: WizardStep) => void;
  resetNavigation: () => void;
  canNavigateToStep: (step: WizardStep) => boolean;
  getProgress: () => number;
  
  // Images
  imageState: ImageState;
  addLocalImage: (file: File) => void;
  removeLocalImage: (id: string) => void;
  setProfileImage: (id: string | null) => void;
  clearAllImages: () => void;
  uploadImages: (userId: string) => Promise<{ images: string[]; profileImage: string | null }>;
  
  // Validation
  validationState: ValidationState;
  validateStep: (step: WizardStep, formData: ProjectFormValues) => Promise<boolean>;
  validateAllSteps: (formData: ProjectFormValues) => Promise<boolean>;
  clearValidationErrors: (step?: WizardStep) => void;
  getStepErrors: (step: WizardStep) => string[];
  isStepValid: (step: WizardStep) => boolean;
  
  // Submission
  submissionState: SubmissionState;
  submitProject: (formData: ProjectFormValues, userId: string, uploadedImages: { images: string[]; profileImage: string | null }) => Promise<void>;
  resetSubmission: () => void;
  clearSubmitError: () => void;
  
  // Persistence
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  clearSavedData: () => void;
  isDirty: boolean;
  markClean: () => void;
}

// Legacy types for backward compatibility
export type { ProjectFormValues, LocalImageFile, ImageState, ValidationState, SubmissionState, WizardStep };

// Legacy hook that wraps the new modular architecture
export function useCreateProjectStore(): CreateProjectStoreState {
  // Use individual hooks directly to avoid composite hook issues
  const formData = useProjectFormData();
  const formActions = useFormDataActions();
  const formStatus = useFormDataStatus();
  
  const images = useProjectImages();
  const imageActions = useImageActions();
  
  const navigation = useWizardNavigation();
  const navigationActions = useNavigationActions();
  
  const validation = useProjectValidation();
  const validationActions = useValidationActions();
  
  const submission = useProjectSubmission();
  const submissionActions = useSubmissionActions();
  
  // Memoize the returned object to prevent infinite re-renders
  return useMemo(() => ({
    // Form data
    formData,
    updateFormData: formActions.updateFormData,
    resetFormData: formActions.resetFormData,
    setFormField: formActions.setFormField,
    
    // Navigation
    currentStep: navigation.currentStep,
    completedSteps: navigation.completedSteps,
    visitedSteps: navigation.visitedSteps,
    setCurrentStep: navigationActions.setCurrentStep,
    nextStep: navigationActions.nextStep,
    previousStep: navigationActions.previousStep,
    goToStep: navigationActions.goToStep,
    markStepCompleted: navigationActions.markStepCompleted,
    resetNavigation: navigationActions.resetNavigation,
    canNavigateToStep: navigationActions.canNavigateToStep,
    getProgress: navigationActions.getProgress,
    
    // Images
    imageState: {
      localFiles: images.localFiles || [],
      localProfileImageId: images.localProfileImageId,
      isUploading: images.isUploading,
      uploadProgress: images.uploadProgress,
      uploadError: images.uploadError
    },
    addLocalImage: imageActions.addLocalImage,
    removeLocalImage: imageActions.removeLocalImage,
    setProfileImage: imageActions.setProfileImage,
    clearAllImages: imageActions.clearAllImages,
    uploadImages: imageActions.uploadImages,
    
    // Validation
    validationState: {
      validationErrors: validation.validationErrors,
      isValidating: validation.isValidating,
      lastValidated: validation.lastValidated
    },
    validateStep: validationActions.validateStep,
    validateAllSteps: validationActions.validateAllSteps,
    clearValidationErrors: validationActions.clearValidationErrors,
    getStepErrors: () => [], // Placeholder - not implemented in current validation store
    isStepValid: () => true, // Placeholder - not implemented in current validation store
    
    // Submission
    submissionState: {
      isSubmitting: submission.isSubmitting,
      submitError: submission.submitError,
      isSuccess: submission.isSuccess,
      createdProjectId: submission.createdProjectId
    },
    submitProject: submissionActions.submitProject,
    resetSubmission: submissionActions.resetSubmission,
    clearSubmitError: submissionActions.clearSubmitError,
    
    // Persistence
    saveToLocalStorage: formActions.saveToLocalStorage,
    loadFromLocalStorage: formActions.loadFromLocalStorage,
    clearSavedData: formActions.clearSavedData,
    isDirty: formStatus.isDirty,
    markClean: formActions.markClean
  }), [
    // Dependencies for memoization
    formData,
    formActions.updateFormData,
    formActions.resetFormData,
    formActions.setFormField,
    navigation.currentStep,
    navigation.completedSteps,
    navigation.visitedSteps,
    navigationActions.setCurrentStep,
    navigationActions.nextStep,
    navigationActions.previousStep,
    navigationActions.goToStep,
    navigationActions.markStepCompleted,
    navigationActions.resetNavigation,
    navigationActions.canNavigateToStep,
    navigationActions.getProgress,
    images.localFiles,
    images.localProfileImageId,
    images.isUploading,
    images.uploadProgress,
    images.uploadError,
    imageActions.addLocalImage,
    imageActions.removeLocalImage,
    imageActions.setProfileImage,
    imageActions.clearAllImages,
    imageActions.uploadImages,
    validation.validationErrors,
    validation.isValidating,
    validation.lastValidated,
    validationActions.validateStep,
    validationActions.validateAllSteps,
    validationActions.clearValidationErrors,
    submission.isSubmitting,
    submission.submitError,
    submission.isSuccess,
    submission.createdProjectId,
    submissionActions.submitProject,
    submissionActions.resetSubmission,
    submissionActions.clearSubmitError,
    formActions.saveToLocalStorage,
    formActions.loadFromLocalStorage,
    formActions.clearSavedData,
    formStatus.isDirty,
    formActions.markClean
  ]);
}

// Legacy convenience hooks for backward compatibility
export const useCreateProjectForm = () => {
  const store = useCreateProjectStore();
  return {
    formData: store.formData,
    updateFormData: store.updateFormData,
    resetFormData: store.resetFormData,
    isDirty: store.isDirty
  };
};

export const useCreateProjectNavigation = () => {
  const navigation = useWizardNavigation();
  const navigationActions = useNavigationActions();
  
  return {
    currentStep: navigation.currentStep,
    totalSteps: 4, // Hardcoded for the new 4-step wizard
    goToNextStep: navigationActions.nextStep,
    goToPrevStep: navigationActions.previousStep,
    jumpToStep: navigationActions.goToStep,
    setCurrentStep: navigationActions.setCurrentStep,
    nextStep: navigationActions.nextStep,
    previousStep: navigationActions.previousStep,
    canNavigateToStep: navigationActions.canNavigateToStep,
    getProgress: navigationActions.getProgress
  };
};

export const useCreateProjectImages = () => {
  const images = useProjectImages();
  const imageActions = useImageActions();
  
  return {
    // Flatten imageState properties for backward compatibility
    localFiles: images.localFiles || [],
    localProfileImageId: images.localProfileImageId,
    isUploading: images.isUploading,
    uploadProgress: images.uploadProgress,
    uploadError: images.uploadError,
    
    // Actions
    handleFileSelection: imageActions.addLocalImage,
    removeImage: imageActions.removeLocalImage,
    setProfileImage: imageActions.setProfileImage,
    clearAllImages: imageActions.clearAllImages,
    uploadImages: imageActions.uploadImages
  };
};

export const useCreateProjectSubmission = () => {
  const store = useCreateProjectStore();
  return {
    submissionState: store.submissionState,
    submitProject: store.submitProject,
    resetSubmission: store.resetSubmission
  };
};

export const useCreateProjectValidation = () => {
  const store = useCreateProjectStore();
  return {
    validationState: store.validationState,
    validateStep: store.validateStep,
    validateAllSteps: store.validateAllSteps,
    getStepErrors: store.getStepErrors,
    isStepValid: store.isStepValid
  };
};