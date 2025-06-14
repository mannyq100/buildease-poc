/**
 * Debounced Validation Hook
 * 
 * Provides debounced validation for form fields to improve performance
 * and reduce excessive validation calls during user input
 */
import { useCallback, useRef, useMemo } from 'react';
import { FieldValues, UseFormTrigger, FieldPath } from 'react-hook-form';
import { useDebounce } from '@/utils/core/debounce';

interface UseDebouncedValidationOptions {
  delay?: number;
  onValidationStart?: () => void;
  onValidationEnd?: (isValid: boolean) => void;
}

export function useDebouncedValidation<TFieldValues extends FieldValues>(
  trigger: UseFormTrigger<TFieldValues>,
  options: UseDebouncedValidationOptions = {}
) {
  const { 
    delay = 300, 
    onValidationStart, 
    onValidationEnd 
  } = options;
  
  // Track validation state
  const isValidatingRef = useRef(false);
  const lastValidationResultRef = useRef<boolean | null>(null);

  /**
   * Internal validation function that calls react-hook-form's trigger
   */
  const performValidation = useCallback(async (
    name?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[]
  ): Promise<boolean> => {
    if (isValidatingRef.current) {
      return lastValidationResultRef.current ?? false;
    }

    isValidatingRef.current = true;
    
    try {
      onValidationStart?.();
      
      const result = await trigger(name);
      lastValidationResultRef.current = result;
      
      onValidationEnd?.(result);
      
      return result;
    } catch (error) {
      console.error('Validation error:', error);
      const fallbackResult = false;
      lastValidationResultRef.current = fallbackResult;
      onValidationEnd?.(fallbackResult);
      return fallbackResult;
    } finally {
      isValidatingRef.current = false;
    }
  }, [trigger, onValidationStart, onValidationEnd]);

  /**
   * Debounced validation function
   */
  const debouncedValidate = useDebounce(performValidation, delay, [performValidation]);

  /**
   * Immediate validation function (bypasses debouncing)
   */
  const validateImmediately = useCallback(async (
    name?: FieldPath<TFieldValues> | FieldPath<TFieldValues>[]
  ): Promise<boolean> => {
    // Cancel any pending debounced validation
    debouncedValidate.cancel();
    
    // Perform immediate validation
    return performValidation(name);
  }, [performValidation, debouncedValidate]);

  /**
   * Validate specific field or fields with debouncing
   */
  const validateField = useCallback((
    name: FieldPath<TFieldValues> | FieldPath<TFieldValues>[]
  ) => {
    debouncedValidate(name);
  }, [debouncedValidate]);

  /**
   * Validate all fields with debouncing
   */
  const validateAll = useCallback(() => {
    debouncedValidate();
  }, [debouncedValidate]);

  /**
   * Cancel any pending validation
   */
  const cancelValidation = useCallback(() => {
    debouncedValidate.cancel();
    isValidatingRef.current = false;
  }, [debouncedValidate]);

  /**
   * Force flush any pending validation
   */
  const flushValidation = useCallback(() => {
    debouncedValidate.flush();
  }, [debouncedValidate]);

  /**
   * Get current validation state
   */
  const getValidationState = useCallback(() => ({
    isValidating: isValidatingRef.current,
    lastResult: lastValidationResultRef.current,
  }), []);

  return {
    // Main validation functions
    validateField,
    validateAll,
    validateImmediately,
    
    // Control functions
    cancelValidation,
    flushValidation,
    
    // State
    getValidationState,
    isValidating: isValidatingRef.current,
    lastValidationResult: lastValidationResultRef.current,
  };
}

/**
 * Hook for step-specific validation in multi-step forms
 */
export function useStepValidation<TFieldValues extends FieldValues>(
  trigger: UseFormTrigger<TFieldValues>,
  stepFields: Record<number, FieldPath<TFieldValues>[]>,
  options: UseDebouncedValidationOptions = {}
) {
  // Memoize options to prevent hook recreation
  const memoizedOptions = useMemo(() => options, [
    options.delay,
    options.onValidationStart,
    options.onValidationEnd
  ]);
  
  const debouncedValidation = useDebouncedValidation(trigger, memoizedOptions);

  /**
   * Validate specific step fields
   */
  const validateStep = useCallback(async (stepNumber: number): Promise<boolean> => {
    const fieldsToValidate = stepFields[stepNumber];
    
    if (!fieldsToValidate || fieldsToValidate.length === 0) {
      return true; // No fields to validate for this step
    }

    return debouncedValidation.validateImmediately(fieldsToValidate);
  }, [stepFields, debouncedValidation]);

  /**
   * Validate step with debouncing
   */
  const validateStepDebounced = useCallback((stepNumber: number) => {
    const fieldsToValidate = stepFields[stepNumber];
    
    if (!fieldsToValidate || fieldsToValidate.length === 0) {
      return;
    }

    debouncedValidation.validateField(fieldsToValidate);
  }, [stepFields, debouncedValidation]);

  return {
    ...debouncedValidation,
    validateStep,
    validateStepDebounced,
  };
}