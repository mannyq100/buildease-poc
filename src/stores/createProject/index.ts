/**
 * Create Project Stores Index
 * Centralized exports for all project creation stores
 * Follows BuildEase standards: clean architecture, modular design
 */

// Export individual stores
export * from './formDataStore';
export * from './imageStore';
export * from './navigationStore';
export * from './submissionStore';

// Re-export types for backward compatibility
export type { ProjectFormValues } from './formDataStore';
export type { LocalImageFile, ImageState } from './imageStore';
export type { WizardStep, StepConfig } from './navigationStore';
export type { ValidationState, SubmissionState } from './submissionStore';

import { useMemo } from 'react';

// Composite hooks for common use cases
export function useCreateProjectWizard() {
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
  
  // Memoize the entire return object to prevent infinite re-renders
  return useMemo(() => ({
    // Form data
    formData,
    ...formActions,
    ...formStatus,
    
    // Images
    ...images,
    ...imageActions,
    
    // Navigation
    ...navigation,
    ...navigationActions,
    
    // Validation
    ...validation,
    ...validationActions,
    
    // Submission
    ...submission,
    ...submissionActions
  }), [
    formData, formActions, formStatus,
    images, imageActions,
    navigation, navigationActions,
    validation, validationActions,
    submission, submissionActions
  ]);
}

// Individual hook imports for cleaner imports
import { 
  useProjectFormData, 
  useFormDataActions, 
  useFormDataStatus 
} from './formDataStore';

import { 
  useProjectImages, 
  useImageActions 
} from './imageStore';

import { 
  useWizardNavigation, 
  useNavigationActions, 
  useStepInfo 
} from './navigationStore';

import { 
  useProjectValidation, 
  useValidationActions, 
  useProjectSubmission, 
  useSubmissionActions 
} from './submissionStore';

// Export for external use
export {
  useProjectFormData,
  useFormDataActions,
  useFormDataStatus,
  useProjectImages,
  useImageActions,
  useWizardNavigation,
  useNavigationActions,
  useStepInfo,
  useProjectValidation,
  useValidationActions,
  useProjectSubmission,
  useSubmissionActions
};