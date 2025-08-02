/**
 * Project Form Validation Hook
 * Custom hook for streamlined project form validation
 * Provides easy access to validation utilities and real-time validation state
 */

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { CreateProjectFormValues } from '../pages/CreateProject';
import { 
  validateStep, 
  validateAllFields,
  canAccessStep,
  getValidationProgress,
  getNextIncompleteStep,
  formatValidationErrors,
  type StepValidationResult 
} from '../utils/validation/projectFormValidation';

export interface ProjectFormValidationHook {
  // Validation functions
  validateCurrentStep: (step: number) => StepValidationResult;
  validateAll: () => StepValidationResult;
  canNavigateToStep: (step: number) => boolean;
  
  // Progress tracking
  validationProgress: number;
  nextIncompleteStep: number | null;
  
  // Helper functions
  formatErrors: (errors: StepValidationResult['errors']) => string;
  
  // Real-time validation state
  currentFormValues: Partial<CreateProjectFormValues>;
}

/**
 * Custom hook for project form validation
 * @returns ProjectFormValidationHook with validation utilities
 */
export function useProjectFormValidation(): ProjectFormValidationHook {
  const { getValues } = useFormContext<CreateProjectFormValues>();
  
  // Get current form values (memoized to prevent unnecessary recalculations)
  const currentFormValues = useMemo(() => getValues(), [getValues]);
  
  // Calculate validation progress (memoized for performance)
  const validationProgress = useMemo(() => 
    getValidationProgress(currentFormValues), 
    [currentFormValues]
  );
  
  // Get next incomplete step (memoized for performance)
  const nextIncompleteStep = useMemo(() => 
    getNextIncompleteStep(currentFormValues),
    [currentFormValues]
  );
  
  // Validation functions
  const validateCurrentStep = (step: number): StepValidationResult => {
    return validateStep(step, currentFormValues);
  };
  
  const validateAll = (): StepValidationResult => {
    return validateAllFields(currentFormValues);
  };
  
  const canNavigateToStep = (step: number): boolean => {
    return canAccessStep(step, currentFormValues);
  };
  
  const formatErrors = (errors: StepValidationResult['errors']): string => {
    return formatValidationErrors(errors);
  };
  
  return {
    validateCurrentStep,
    validateAll,
    canNavigateToStep,
    validationProgress,
    nextIncompleteStep,
    formatErrors,
    currentFormValues
  };
}