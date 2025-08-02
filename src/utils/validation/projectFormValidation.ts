/**
 * Project Form Validation Utilities
 * Centralized validation logic for the streamlined project creation wizard
 * Follows BuildEase standards: clean, maintainable, performant validation
 */

import { CreateProjectFormValues } from '../../pages/CreateProject';

// Validation error type
export interface ValidationError {
  field: keyof CreateProjectFormValues;
  message: string;
}

// Step validation results
export interface StepValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  missingFields: string[];
}

// Step field validation mapping - consolidated for 4-step wizard
export const STEP_VALIDATION_FIELDS: Record<number, (keyof CreateProjectFormValues)[]> = {
  1: ['name', 'projectType'], // Project Essentials
  2: ['location', 'country', 'region', 'plotSize', 'plotSizeUnit'], // Location & Plot
  3: ['buildingSize', 'buildingSizeUnit', 'storeys', 'bedrooms', 'bathrooms', 'budget', 'currency'], // Building & Budget
  4: [], // Review & Submit (no validation required)
};

// Field display names for better error messages
const FIELD_DISPLAY_NAMES: Record<keyof CreateProjectFormValues, string> = {
  name: 'Project Name',
  description: 'Project Description',
  projectType: 'Project Type',
  owner: 'Project Owner',
  phoneNumber: 'Phone Number',
  email: 'Email Address',
  location: 'Street Address',
  city: 'City',
  country: 'Country',
  region: 'Region',
  plotSize: 'Plot Size',
  plotSizeUnit: 'Plot Size Unit',
  terrain: 'Terrain Type',
  nearbyLandmarks: 'Nearby Landmarks',
  buildingSize: 'Building Size',
  buildingSizeUnit: 'Building Size Unit',
  storeys: 'Number of Storeys',
  bedrooms: 'Number of Bedrooms',
  bathrooms: 'Number of Bathrooms',
  kitchens: 'Number of Kitchens',
  livingAreas: 'Living Areas',
  buildingStyle: 'Building Style',
  budget: 'Total Budget',
  currency: 'Currency',
  timeframe: 'Expected Timeframe',
  expectedStartDate: 'Expected Start Date',
  structureType: 'Structure Type',
  foundationType: 'Foundation Type',
  roofType: 'Roof Type',
  wallMaterial: 'Wall Material',
  floorMaterial: 'Floor Material',
  specialFeatures: 'Special Features',
  sustainabilityFeatures: 'Sustainability Features',
  siteConstraints: 'Site Constraints',
  localRegulations: 'Local Regulations',
  additionalNotes: 'Additional Notes',
  images: 'Inspiration Images',
  profileImage: 'Profile Image'
};

// Validation rule functions
export const ValidationRules = {
  // Check if a string field has content
  hasContent: (value: string | undefined | null): boolean => {
    return Boolean(value && value.trim().length > 0);
  },

  // Check if an array field has items
  hasItems: (value: string[] | undefined | null): boolean => {
    return Boolean(value && value.length > 0);
  },

  // Check if a numeric field is valid
  isValidNumber: (value: string | undefined | null): boolean => {
    if (!value || value.trim() === '') return false;
    const numericValue = parseFloat(value.replace(/[^\d.]/g, ''));
    return !isNaN(numericValue) && numericValue > 0;
  },

  // Check if email format is valid (when provided)
  isValidEmail: (value: string | undefined | null): boolean => {
    if (!value || value.trim() === '') return true; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value.trim());
  },

  // Check if phone number format is valid (when provided)
  isValidPhone: (value: string | undefined | null): boolean => {
    if (!value || value.trim() === '') return true; // Optional field
    const phoneRegex = /^[+]?[0-9\s\-()]{10,15}$/;
    return phoneRegex.test(value.replace(/\s/g, ''));
  },

  // Project name validation
  isValidProjectName: (value: string | undefined | null): boolean => {
    if (!ValidationRules.hasContent(value)) return false;
    return value!.trim().length >= 3 && value!.trim().length <= 100;
  },

  // Budget validation
  isValidBudget: (value: string | undefined | null): boolean => {
    if (!ValidationRules.hasContent(value)) return false;
    const numericValue = parseFloat(value!.replace(/[^\d.]/g, ''));
    return !isNaN(numericValue) && numericValue >= 1000; // Minimum reasonable budget
  }
};

// Custom field validators
type ValidatorFunction = (value: string | string[] | undefined) => string | null;
const FIELD_VALIDATORS: Partial<Record<keyof CreateProjectFormValues, ValidatorFunction>> = {
  name: (value) => {
    if (typeof value !== 'string') return 'Project name is required';
    if (!ValidationRules.hasContent(value)) return 'Please enter a name for your construction project';
    if (!ValidationRules.isValidProjectName(value)) return 'Project name must be between 3 and 100 characters (e.g., "My Dream House")';
    return null;
  },

  projectType: (value) => {
    if (typeof value !== 'string') return 'Please select a project type';
    if (!ValidationRules.hasContent(value)) return 'Please select what type of construction project you\'re planning';
    return null;
  },

  email: (value) => {
    if (typeof value !== 'string') return null; // Optional field
    if (!ValidationRules.isValidEmail(value)) return 'Please enter a valid email address';
    return null;
  },

  phoneNumber: (value) => {
    if (typeof value !== 'string') return null; // Optional field
    if (!ValidationRules.isValidPhone(value)) return 'Please enter a valid phone number';
    return null;
  },

  location: (value) => {
    if (typeof value !== 'string') return 'Please provide the street address where your project will be built';
    if (!ValidationRules.hasContent(value)) return 'Please enter the street address or specific location of your construction site';
    return null;
  },

  country: (value) => {
    if (typeof value !== 'string') return 'Please select the country where your project will be located';
    if (!ValidationRules.hasContent(value)) return 'Please select your country to help us provide relevant construction guidance and currency options';
    return null;
  },

  region: (value) => {
    if (typeof value !== 'string') return 'Please select your region or state';
    if (!ValidationRules.hasContent(value)) return 'Please specify the region, state, or province where your project will be built';
    return null;
  },

  plotSize: (value) => {
    if (typeof value !== 'string') return 'Please enter the size of your plot or land area';
    if (!ValidationRules.hasContent(value)) return 'Please specify how large your plot is (the total land area available for construction)';
    if (!ValidationRules.isValidNumber(value)) return 'Plot size must be a valid number (e.g., 500, 1000, 0.5)';
    return null;
  },

  plotSizeUnit: (value) => {
    if (typeof value !== 'string') return 'Please select the unit for your plot size';
    if (!ValidationRules.hasContent(value)) return 'Please choose the measurement unit for your plot (square meters, square feet, acres, etc.)';
    return null;
  },

  buildingSize: (value) => {
    if (typeof value !== 'string') return 'Please enter the total size of your planned building';
    if (!ValidationRules.hasContent(value)) return 'Please specify the total floor area you want to build (this helps estimate costs and materials)';
    if (!ValidationRules.isValidNumber(value)) return 'Building size must be a valid number (e.g., 150, 200, 350)';
    return null;
  },

  buildingSizeUnit: (value) => {
    if (typeof value !== 'string') return 'Please select the unit for your building size';
    if (!ValidationRules.hasContent(value)) return 'Please choose the measurement unit for your building floor area (square meters or square feet)';
    return null;
  },

  storeys: (value) => {
    if (typeof value !== 'string') return 'Please specify how many floors your building will have';
    if (!ValidationRules.hasContent(value)) return 'Please select the number of storeys/floors (this affects structural requirements and costs)';
    return null;
  },

  bedrooms: (value) => {
    if (typeof value !== 'string') return 'Please specify how many bedrooms you need';
    if (!ValidationRules.hasContent(value)) return 'Please select the number of bedrooms for your home (helps plan layout and sizing)';
    return null;
  },

  bathrooms: (value) => {
    if (typeof value !== 'string') return 'Please specify how many bathrooms you need';
    if (!ValidationRules.hasContent(value)) return 'Please select the number of bathrooms for your home (affects plumbing planning and costs)';
    return null;
  },

  budget: (value) => {
    if (typeof value !== 'string') return 'Please enter your total construction budget';
    if (!ValidationRules.hasContent(value)) return 'Please specify your total budget for the entire construction project (helps us provide realistic recommendations)';
    if (!ValidationRules.isValidBudget(value)) return 'Budget must be at least 1,000 in your selected currency (reasonable minimum for construction projects)';
    return null;
  },

  currency: (value) => {
    if (typeof value !== 'string') return 'Please select your preferred currency';
    if (!ValidationRules.hasContent(value)) return 'Please choose the currency for your budget (we auto-suggest based on your country selection)';
    return null;
  }
};

/**
 * Validate specific step fields
 * @param stepNumber - The step number to validate (1-4)
 * @param formValues - Current form values
 * @returns StepValidationResult with validation status and errors
 */
export function validateStep(stepNumber: number, formValues: Partial<CreateProjectFormValues>): StepValidationResult {
  const fieldsToValidate = STEP_VALIDATION_FIELDS[stepNumber] || [];
  const errors: ValidationError[] = [];
  const missingFields: string[] = [];

  // Validate each required field for this step
  for (const fieldName of fieldsToValidate) {
    const fieldValue = formValues[fieldName];
    const validator = FIELD_VALIDATORS[fieldName];

    if (validator) {
      const errorMessage = validator(fieldValue);
      if (errorMessage) {
        errors.push({
          field: fieldName,
          message: errorMessage
        });
        missingFields.push(FIELD_DISPLAY_NAMES[fieldName] || fieldName);
      }
    } else {
      // Default validation for fields without custom validators
      if (!ValidationRules.hasContent(fieldValue as string)) {
        const displayName = FIELD_DISPLAY_NAMES[fieldName] || fieldName;
        errors.push({
          field: fieldName,
          message: `${displayName} is required`
        });
        missingFields.push(displayName);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    missingFields
  };
}

/**
 * Validate all fields in the form
 * @param formValues - Current form values
 * @returns StepValidationResult with overall validation status
 */
export function validateAllFields(formValues: Partial<CreateProjectFormValues>): StepValidationResult {
  const allErrors: ValidationError[] = [];
  const allMissingFields: string[] = [];

  // Validate all required steps (1-3, skip review step)
  for (let step = 1; step <= 3; step++) {
    const stepResult = validateStep(step, formValues);
    allErrors.push(...stepResult.errors);
    allMissingFields.push(...stepResult.missingFields);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    missingFields: allMissingFields
  };
}

/**
 * Check if a specific step can be accessed based on previous step completion
 * @param targetStep - The step number to check access for
 * @param formValues - Current form values
 * @returns boolean indicating if step can be accessed
 */
export function canAccessStep(targetStep: number, formValues: Partial<CreateProjectFormValues>): boolean {
  // Always allow access to first step
  if (targetStep <= 1) return true;

  // Check if all previous steps are valid
  for (let step = 1; step < targetStep; step++) {
    const stepResult = validateStep(step, formValues);
    if (!stepResult.isValid) {
      return false;
    }
  }

  return true;
}

/**
 * Get validation progress as percentage
 * @param formValues - Current form values
 * @returns Progress percentage (0-100)
 */
export function getValidationProgress(formValues: Partial<CreateProjectFormValues>): number {
  const totalSteps = 3; // Only count steps with required validation
  let completedSteps = 0;

  for (let step = 1; step <= totalSteps; step++) {
    const stepResult = validateStep(step, formValues);
    if (stepResult.isValid) {
      completedSteps++;
    }
  }

  return Math.round((completedSteps / totalSteps) * 100);
}

/**
 * Format validation errors for user display
 * @param errors - Array of validation errors
 * @returns Formatted error message string
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  
  if (errors.length === 1) {
    return errors[0].message;
  }

  const fieldNames = errors.map(error => FIELD_DISPLAY_NAMES[error.field] || error.field);
  return `Please check the following fields: ${fieldNames.join(', ')}`;
}

/**
 * Get next incomplete step
 * @param formValues - Current form values
 * @returns Next step number that needs completion, or null if all are complete
 */
export function getNextIncompleteStep(formValues: Partial<CreateProjectFormValues>): number | null {
  for (let step = 1; step <= 3; step++) {
    const stepResult = validateStep(step, formValues);
    if (!stepResult.isValid) {
      return step;
    }
  }
  return null; // All steps are complete
}