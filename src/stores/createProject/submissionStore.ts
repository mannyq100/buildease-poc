/**
 * Project Submission Store
 * Manages validation and submission state for project creation wizard
 * Follows BuildEase standards: focused responsibility, under 400 lines
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createProject, validateProjectData } from '@/services/projectCreationService';
import type { ProjectFormValues } from './formDataStore';
import type { WizardStep } from './navigationStore';

// Validation state interface
export interface ValidationState {
  validationErrors: Record<string, string[]>;
  isValidating: boolean;
  lastValidated: number | null;
}

// Submission state interface
export interface SubmissionState {
  isSubmitting: boolean;
  submitError: string | null;
  isSuccess: boolean;
  createdProjectId: string | null;
}

// Combined store state
export interface SubmissionStoreState extends ValidationState, SubmissionState {
  // Validation actions
  validateStep: (step: WizardStep, formData: ProjectFormValues) => Promise<boolean>;
  validateAllSteps: (formData: ProjectFormValues) => Promise<boolean>;
  clearValidationErrors: (step?: WizardStep) => void;
  getStepErrors: (step: WizardStep) => string[];
  isStepValid: (step: WizardStep) => boolean;
  
  // Submission actions
  submitProject: (formData: ProjectFormValues, userId: string, uploadedImages: { images: string[]; profileImage: string | null }) => Promise<void>;
  resetSubmission: () => void;
  clearSubmitError: () => void;
}

// Step field mapping for validation
const STEP_FIELD_MAP: Record<WizardStep, string[]> = {
  1: ['name', 'projectType', 'description', 'owner', 'phoneNumber', 'email'],
  2: ['location', 'city', 'country', 'region', 'plotSize', 'plotSizeUnit', 'terrain', 'nearbyLandmarks'],
  3: ['buildingSize', 'buildingSizeUnit', 'storeys', 'bedrooms', 'bathrooms', 'kitchens', 'livingAreas', 'buildingStyle'],
  4: ['budget', 'currency', 'timeframe', 'expectedStartDate'],
  5: ['structureType', 'foundationType', 'roofType', 'wallMaterial', 'floorMaterial'],
  6: ['specialFeatures', 'sustainabilityFeatures'],
  7: ['siteConstraints', 'localRegulations', 'additionalNotes']
};

// Default states
const getDefaultValidationState = (): ValidationState => ({
  validationErrors: {},
  isValidating: false,
  lastValidated: null
});

const getDefaultSubmissionState = (): SubmissionState => ({
  isSubmitting: false,
  submitError: null,
  isSuccess: false,
  createdProjectId: null
});

// Validation helper functions
function validateStepFields(step: WizardStep, formData: ProjectFormValues): string[] {
  const errors: string[] = [];
  const stepFields = STEP_FIELD_MAP[step];
  
  // Step-specific validation logic
  switch (step) {
    case 1:
      if (!formData.name?.trim()) errors.push('Project name is required');
      if (!formData.projectType?.trim()) errors.push('Project type is required');
      if (formData.name && formData.name.trim().length < 3) {
        errors.push('Project name must be at least 3 characters long');
      }
      break;
      
    case 2:
      if (!formData.location?.trim()) errors.push('Location is required');
      if (!formData.country?.trim()) errors.push('Country is required');
      if (!formData.region?.trim()) errors.push('Region is required');
      if (!formData.plotSize?.trim()) errors.push('Plot size is required');
      
      if (formData.plotSize && (isNaN(parseFloat(formData.plotSize)) || parseFloat(formData.plotSize) <= 0)) {
        errors.push('Plot size must be a valid positive number');
      }
      break;
      
    case 3:
      if (!formData.buildingSize?.trim()) errors.push('Building size is required');
      if (!formData.storeys?.trim()) errors.push('Number of storeys is required');
      if (!formData.bedrooms?.trim()) errors.push('Number of bedrooms is required');
      if (!formData.bathrooms?.trim()) errors.push('Number of bathrooms is required');
      
      if (formData.buildingSize && (isNaN(parseFloat(formData.buildingSize)) || parseFloat(formData.buildingSize) <= 0)) {
        errors.push('Building size must be a valid positive number');
      }
      
      if (formData.storeys && (isNaN(parseInt(formData.storeys)) || parseInt(formData.storeys) <= 0)) {
        errors.push('Number of storeys must be a valid positive number');
      }
      break;
      
    case 4:
      if (!formData.budget?.trim()) errors.push('Budget is required');
      if (!formData.currency?.trim()) errors.push('Currency is required');
      
      if (formData.budget) {
        const budgetValue = parseFloat(formData.budget.replace(/,/g, ''));
        if (isNaN(budgetValue) || budgetValue <= 0) {
          errors.push('Budget must be a valid positive number');
        }
      }
      break;
      
    // Steps 5, 6, 7 are optional - no required field validation
    case 5:
    case 6:
    case 7:
      break;
  }
  
  return errors;
}

// Create the submission store
export const useSubmissionStore = create<SubmissionStoreState>()(
  devtools(
    (set, get) => ({
      ...getDefaultValidationState(),
      ...getDefaultSubmissionState(),

      validateStep: async (step, formData) => {
        set({ isValidating: true }, false, 'validateStep/start');
        
        try {
          const stepErrors = validateStepFields(step, formData);
          
          set((state) => ({
            validationErrors: {
              ...state.validationErrors,
              [step]: stepErrors
            },
            isValidating: false,
            lastValidated: Date.now()
          }), false, 'validateStep/complete');
          
          return stepErrors.length === 0;
        } catch (error) {
          set({ isValidating: false }, false, 'validateStep/error');
          return false;
        }
      },

      validateAllSteps: async (formData) => {
        set({ isValidating: true }, false, 'validateAllSteps/start');
        
        try {
          // Use the service validation for comprehensive checks
          const validation = validateProjectData(formData);
          
          // Map service errors to step-based errors
          const stepErrors: Record<string, string[]> = {};
          
          if (!validation.isValid) {
            // For now, put all errors in step 1 - could be enhanced to map specific fields to steps
            stepErrors[1] = validation.errors;
          }
          
          set({
            validationErrors: stepErrors,
            isValidating: false,
            lastValidated: Date.now()
          }, false, 'validateAllSteps/complete');
          
          return validation.isValid;
        } catch (error) {
          set({ isValidating: false }, false, 'validateAllSteps/error');
          return false;
        }
      },

      clearValidationErrors: (step) =>
        set((state) => {
          if (step) {
            const newErrors = { ...state.validationErrors };
            delete newErrors[step];
            return { validationErrors: newErrors };
          }
          return { validationErrors: {} };
        }, false, 'clearValidationErrors'),

      getStepErrors: (step) => {
        const { validationErrors } = get();
        return validationErrors[step] || [];
      },

      isStepValid: (step) => {
        const { validationErrors } = get();
        const stepErrors = validationErrors[step] || [];
        return stepErrors.length === 0;
      },

      submitProject: async (formData, userId, uploadedImages) => {
        set({ isSubmitting: true, submitError: null }, false, 'submitProject/start');
        
        try {
          // Merge uploaded images into form data
          const finalFormData = {
            ...formData,
            images: uploadedImages.images,
            profileImage: uploadedImages.profileImage
          };
          
          const result = await createProject(finalFormData, userId);
          
          if (result.success && result.project) {
            set({
              isSubmitting: false,
              isSuccess: true,
              createdProjectId: result.project.id,
              submitError: null
            }, false, 'submitProject/success');
          } else {
            set({
              isSubmitting: false,
              submitError: result.error || 'Failed to create project'
            }, false, 'submitProject/error');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
          set({
            isSubmitting: false,
            submitError: errorMessage
          }, false, 'submitProject/error');
        }
      },

      resetSubmission: () =>
        set(getDefaultSubmissionState(), false, 'resetSubmission'),

      clearSubmitError: () =>
        set({ submitError: null }, false, 'clearSubmitError')
    }),
    { name: 'submission-store' }
  )
);

// Convenience hooks
// Stable selectors
const selectProjectValidation = (state: SubmissionStoreState) => ({
  validationErrors: state.validationErrors,
  isValidating: state.isValidating,
  lastValidated: state.lastValidated,
  getStepErrors: state.getStepErrors,
  isStepValid: state.isStepValid
});

const selectValidationActions = (state: SubmissionStoreState) => ({
  validateStep: state.validateStep,
  validateAllSteps: state.validateAllSteps,
  clearValidationErrors: state.clearValidationErrors
});

const selectProjectSubmission = (state: SubmissionStoreState) => ({
  isSubmitting: state.isSubmitting,
  submitError: state.submitError,
  isSuccess: state.isSuccess,
  createdProjectId: state.createdProjectId
});

const selectSubmissionActions = (state: SubmissionStoreState) => ({
  submitProject: state.submitProject,
  resetSubmission: state.resetSubmission,
  clearSubmitError: state.clearSubmitError
});

export function useProjectValidation() {
  return useSubmissionStore(selectProjectValidation);
}

export function useValidationActions() {
  return useSubmissionStore(selectValidationActions);
}

export function useProjectSubmission() {
  return useSubmissionStore(selectProjectSubmission);
}

export function useSubmissionActions() {
  return useSubmissionStore(selectSubmissionActions);
}