/**
 * Form Optimization Hooks
 * Provides debounced updates and memoization for better form performance
 */
import { useCallback, useRef, useMemo } from 'react';
import { useCreateProjectStore } from '@/stores/createProjectStore';
import { ProjectFormValues } from '@/stores/createProjectStore';

/**
 * Custom hook for debounced form updates
 */
export function useDebouncedFormUpdate(delay: number = 300) {
  const updateFormData = useCreateProjectStore(state => state.updateFormData);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedUpdate = useCallback((data: Partial<ProjectFormValues>) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced update
    timeoutRef.current = setTimeout(() => {
      updateFormData(data);
    }, delay);
  }, [updateFormData, delay]);

  // Immediate update for critical fields (no debounce)
  const immediateUpdate = useCallback((data: Partial<ProjectFormValues>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    updateFormData(data);
  }, [updateFormData]);

  return { debouncedUpdate, immediateUpdate };
}

/**
 * Custom hook for memoized form field validation
 */
export function useMemoizedValidation() {
  const formData = useCreateProjectStore(state => state.formData);

  // Memoize expensive validation computations
  const validationResults = useMemo(() => {
    const results = {
      isNameValid: formData.name.length >= 3,
      isLocationValid: formData.location.length > 0,
      isBudgetValid: formData.budget ? parseFloat(formData.budget) > 0 : true,
      isProjectTypeValid: formData.projectType.length > 0,
    };

    return {
      ...results,
      isStep1Valid: results.isNameValid && results.isProjectTypeValid,
      isStep2Valid: results.isLocationValid && formData.country.length > 0,
      isStep3Valid: formData.buildingSize.length > 0 && formData.storeys.length > 0,
    };
  }, [
    formData.name,
    formData.location,
    formData.budget,
    formData.projectType,
    formData.country,
    formData.buildingSize,
    formData.storeys,
  ]);

  return validationResults;
}

/**
 * Custom hook for optimized field change handlers
 */
export function useOptimizedFieldHandlers() {
  const { debouncedUpdate, immediateUpdate } = useDebouncedFormUpdate();

  // Memoize field handlers to prevent unnecessary re-renders
  const handlers = useMemo(() => ({
    // Text fields - use debounced updates
    handleTextChange: (field: keyof ProjectFormValues) => (value: string) => {
      debouncedUpdate({ [field]: value });
    },

    // Select fields - use immediate updates
    handleSelectChange: (field: keyof ProjectFormValues) => (value: string) => {
      immediateUpdate({ [field]: value });
    },

    // Number fields - use debounced updates with validation
    handleNumberChange: (field: keyof ProjectFormValues) => (value: string) => {
      // Only update if the value is a valid number or empty
      if (value === '' || !isNaN(parseFloat(value))) {
        debouncedUpdate({ [field]: value });
      }
    },

    // Array fields - use immediate updates
    handleArrayChange: (field: keyof ProjectFormValues) => (value: string[]) => {
      immediateUpdate({ [field]: value });
    },
  }), [debouncedUpdate, immediateUpdate]);

  return handlers;
}

/**
 * Custom hook for memoized step validation
 */
export function useMemoizedStepValidation(currentStep: number) {
  const formData = useCreateProjectStore(state => state.formData);

  const stepValidation = useMemo(() => {
    switch (currentStep) {
      case 1:
        return {
          isValid: formData.name.length >= 3 && formData.projectType.length > 0,
          errors: [
            ...(formData.name.length < 3 ? ['Project name must be at least 3 characters'] : []),
            ...(formData.projectType.length === 0 ? ['Please select a project type'] : []),
          ],
        };
      case 2:
        return {
          isValid: formData.location.length > 0 && formData.country.length > 0,
          errors: [
            ...(formData.location.length === 0 ? ['Street address is required'] : []),
            ...(formData.country.length === 0 ? ['Please select a country'] : []),
          ],
        };
      case 3:
        return {
          isValid: formData.buildingSize.length > 0 && formData.storeys.length > 0,
          errors: [
            ...(formData.buildingSize.length === 0 ? ['Building size is required'] : []),
            ...(formData.storeys.length === 0 ? ['Number of storeys is required'] : []),
          ],
        };
      case 4:
        return {
          isValid: true, // Budget is optional
          errors: [],
        };
      case 5:
      case 6:
      case 7:
        return {
          isValid: true, // These steps are optional
          errors: [],
        };
      default:
        return {
          isValid: false,
          errors: ['Invalid step'],
        };
    }
  }, [currentStep, formData]);

  return stepValidation;
}

/**
 * Custom hook for performance monitoring
 */
export function useFormPerformanceMonitor() {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());

  renderCountRef.current += 1;
  const currentTime = Date.now();
  const timeSinceLastRender = currentTime - lastRenderTimeRef.current;
  lastRenderTimeRef.current = currentTime;

  const performanceStats = useMemo(() => ({
    renderCount: renderCountRef.current,
    timeSinceLastRender,
    averageRenderTime: renderCountRef.current > 1 ? currentTime / renderCountRef.current : 0,
  }), [timeSinceLastRender, currentTime]);

  // Log performance warnings in development
  if (process.env.NODE_ENV === 'development' && timeSinceLastRender < 16) {
    console.warn('Form re-rendering too frequently:', performanceStats);
  }

  return performanceStats;
}
