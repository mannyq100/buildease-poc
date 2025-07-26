/**
 * Real-time validation hook for Create Project forms
 * Provides immediate feedback as users type
 */
import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { CreateProjectFormValues } from '@/pages/CreateProject';
// Simple debounce implementation to avoid lodash dependency
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  type?: 'error' | 'warning' | 'success';
}

export interface FieldValidationState {
  [fieldName: string]: ValidationResult;
}

// Real-time validation rules that match the schema
const VALIDATION_RULES: Record<string, (value: string | undefined) => ValidationResult> = {
  name: (value: string | undefined) => {
    if (!value || value.trim() === '') {
      return { isValid: false, message: 'Project name is required', type: 'error' };
    }
    if (value.trim().length < 3) {
      return { isValid: false, message: 'Project name must be at least 3 characters', type: 'error' };
    }
    if (value.length > 100) {
      return { isValid: false, message: 'Project name must be less than 100 characters', type: 'error' };
    }
    return { isValid: true, message: 'Good project name!', type: 'success' };
  },

  projectType: (value: string | undefined) => {
    if (!value || value.trim() === '') {
      return { isValid: false, message: 'Please select a project type', type: 'error' };
    }
    return { isValid: true, message: 'Project type selected', type: 'success' };
  },

  // Simplified validation for demo - can be expanded later
  email: (value: string | undefined) => {
    if (!value || value.trim() === '') {
      return { isValid: true }; // Optional field
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { isValid: false, message: 'Please enter a valid email address', type: 'error' };
    }
    return { isValid: true, message: 'Valid email address', type: 'success' };
  }
};

// Simplified validation rules to avoid type complexity
const validateField = (fieldName: string, value: string | string[] | undefined): ValidationResult => {
  const stringValue = Array.isArray(value) ? value.join('') : value;
  const validator = VALIDATION_RULES[fieldName];
  if (validator) {
    return validator(stringValue);
  }
  return { isValid: true };
};

// Remove the complex validation rules to avoid type issues
const SIMPLE_VALIDATION_RULES = {
  name: (value: string | undefined) => {
    if (!value || value.trim() === '') {
      return { isValid: false, message: 'Project name is required', type: 'error' };
    }
    if (value.trim().length < 3) {
      return { isValid: false, message: 'Project name must be at least 3 characters', type: 'error' };
    }
    if (value.length > 100) {
      return { isValid: false, message: 'Project name must be less than 100 characters', type: 'error' };
    }
    return { isValid: true, message: 'Good project name!', type: 'success' };
  },

  projectType: (value: string) => {
    if (!value || value.trim() === '') {
      return { isValid: false, message: 'Please select a project type', type: 'error' };
    }
    return { isValid: true, message: 'Project type selected', type: 'success' };
  },

  location: (value: string) => {
    if (!value || value.trim() === '') {
      return { isValid: false, message: 'Street address is required', type: 'error' };
    }
    if (value.trim().length < 5) {
      return { isValid: false, message: 'Please enter a complete address', type: 'warning' };
    }
    return { isValid: true, message: 'Address looks good', type: 'success' };
  },

  country: (value: string) => {
    if (!value || value.trim() === '') {
      return { isValid: false, message: 'Country is required', type: 'error' };
    }
    return { isValid: true, message: 'Country selected', type: 'success' };
  },

  region: (value: string) => {
    if (!value || value.trim() === '') {
      return { isValid: false, message: 'Region is required', type: 'error' };
    }
    return { isValid: true, message: 'Region selected', type: 'success' };
  },

  plotSize: (value: string) => {
    if (!value || value.trim() === '') {
      return { isValid: false, message: 'Plot size is required', type: 'error' };
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return { isValid: false, message: 'Please enter a valid plot size', type: 'error' };
    }
    if (numValue < 50) {
      return { isValid: true, message: 'Small plot - consider space constraints', type: 'warning' };
    }
    if (numValue > 10000) {
      return { isValid: true, message: 'Large plot - great for expansive designs', type: 'success' };
    }
    return { isValid: true, message: 'Good plot size', type: 'success' };
  },

  buildingSize: (value: string) => {
    if (!value || value.trim() === '') {
      return { isValid: false, message: 'Building size is required', type: 'error' };
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return { isValid: false, message: 'Please enter a valid building size', type: 'error' };
    }
    return { isValid: true, message: 'Building size specified', type: 'success' };
  },

  storeys: (value: string) => {
    if (!value || value.trim() === '') {
      return { isValid: false, message: 'Number of storeys is required', type: 'error' };
    }
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue <= 0) {
      return { isValid: false, message: 'Please enter a valid number of storeys', type: 'error' };
    }
    if (numValue > 5) {
      return { isValid: true, message: 'High-rise building - check local regulations', type: 'warning' };
    }
    return { isValid: true, message: 'Number of storeys specified', type: 'success' };
  },

  bedrooms: (value: string) => {
    if (!value || value.trim() === '') {
      return { isValid: false, message: 'Number of bedrooms is required', type: 'error' };
    }
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue <= 0) {
      return { isValid: false, message: 'Please enter a valid number of bedrooms', type: 'error' };
    }
    return { isValid: true, message: 'Bedrooms specified', type: 'success' };
  },

  bathrooms: (value: string) => {
    if (!value || value.trim() === '') {
      return { isValid: false, message: 'Number of bathrooms is required', type: 'error' };
    }
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue <= 0) {
      return { isValid: false, message: 'Please enter a valid number of bathrooms', type: 'error' };
    }
    return { isValid: true, message: 'Bathrooms specified', type: 'success' };
  },

  budget: (value: string) => {
    if (!value || value.trim() === '') {
      return { isValid: false, message: 'Budget is required', type: 'error' };
    }
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      return { isValid: false, message: 'Please enter a valid budget amount', type: 'error' };
    }
    if (numValue < 10000) {
      return { isValid: true, message: 'Low budget - consider basic finishes', type: 'warning' };
    }
    if (numValue > 1000000) {
      return { isValid: true, message: 'High budget - premium options available', type: 'success' };
    }
    return { isValid: true, message: 'Budget specified', type: 'success' };
  },

  email: (value: string) => {
    if (!value || value.trim() === '') {
      return { isValid: true }; // Optional field
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { isValid: false, message: 'Please enter a valid email address', type: 'error' };
    }
    return { isValid: true, message: 'Valid email address', type: 'success' };
  },

  phoneNumber: (value: string) => {
    if (!value || value.trim() === '') {
      return { isValid: true }; // Optional field
    }
    // Basic phone validation - at least 10 digits
    const phoneRegex = /\d{10,}/;
    if (!phoneRegex.test(value.replace(/\D/g, ''))) {
      return { isValid: false, message: 'Please enter a valid phone number', type: 'error' };
    }
    return { isValid: true, message: 'Valid phone number', type: 'success' };
  }
};

export function useRealTimeValidation() {
  const { watch, formState } = useFormContext<CreateProjectFormValues>();
  const [validationState, setValidationState] = useState<FieldValidationState>({});
  const [isValidating, setIsValidating] = useState(false);

  // Debounced validation function to avoid excessive validation calls
  const debouncedValidate = useCallback(
    debounce((fieldName: string, value: string | undefined) => {
      const validator = VALIDATION_RULES[fieldName];
      if (validator) {
        const result = validator(value);
        setValidationState(prev => ({
          ...prev,
          [fieldName]: result
        }));
      }
      setIsValidating(false);
    }, 300),
    []
  );

  // Watch all form values and validate in real-time
  const watchedValues = watch();

  useEffect(() => {
    // Only validate fields that have validation rules and have been touched
    Object.keys(VALIDATION_RULES).forEach(fieldName => {
      const fieldValue = watchedValues[fieldName as keyof CreateProjectFormValues];
      const fieldState = formState.touchedFields[fieldName as keyof CreateProjectFormValues];
      
      // Only validate if field has been touched or has a value
      if (fieldState || (fieldValue && fieldValue !== '')) {
        setIsValidating(true);
        debouncedValidate(fieldName, fieldValue);
      }
    });
  }, [watchedValues, formState.touchedFields, debouncedValidate]);

  // Get validation result for a specific field
  const getFieldValidation = useCallback((fieldName: string): ValidationResult | null => {
    return validationState[fieldName] || null;
  }, [validationState]);

  // Check if a field is currently being validated
  const isFieldValidating = useCallback((fieldName: string): boolean => {
    return isValidating && validationState[fieldName] === undefined;
  }, [isValidating, validationState]);

  // Get overall validation summary
  const getValidationSummary = useCallback(() => {
    const results = Object.values(validationState);
    const errors = results.filter(r => !r.isValid && r.type === 'error').length;
    const warnings = results.filter(r => r.isValid && r.type === 'warning').length;
    const successes = results.filter(r => r.isValid && r.type === 'success').length;
    
    return {
      totalFields: results.length,
      errors,
      warnings,
      successes,
      isAllValid: errors === 0
    };
  }, [validationState]);

  return {
    validationState,
    getFieldValidation,
    isFieldValidating,
    getValidationSummary,
    isValidating
  };
}
