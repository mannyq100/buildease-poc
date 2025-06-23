/**
 * Form Store - Centralized Form State Management with Zustand
 * Provides form state management for plan-related forms
 * Eliminates form state management complexity and provides consistent validation
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Generic form state interface
export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  initialData: T;
}

// Form types
export type FormType = 'phase' | 'task' | 'material' | 'budget' | 'team';

// Complete Form Store State
interface FormStoreState {
  // Individual form states
  forms: Record<FormType, FormState>;
  
  // Actions
  initializeForm: <T>(formType: FormType, initialData: T, validationFn?: (data: T) => Record<string, string>) => void;
  updateFormData: <T>(formType: FormType, data: Partial<T>) => void;
  setFormErrors: (formType: FormType, errors: Record<string, string>) => void;
  validateForm: (formType: FormType) => boolean;
  setFormSubmitting: (formType: FormType, isSubmitting: boolean) => void;
  resetForm: (formType: FormType) => void;
  clearAllForms: () => void;
  
  // Validation functions storage
  validators: Record<FormType, ((data: any) => Record<string, string>) | null>;
  setValidator: (formType: FormType, validationFn: (data: any) => Record<string, string>) => void;
}

// Create initial form state
const createInitialFormState = <T>(initialData: T): FormState<T> => ({
  data: initialData,
  errors: {},
  isValid: true,
  isDirty: false,
  isSubmitting: false,
  initialData
});

// Create the form store
export const useFormStore = create<FormStoreState>()( 
  devtools(
    (set, get) => ({
      // Initial states
      forms: {
        phase: createInitialFormState({}),
        task: createInitialFormState({}),
        material: createInitialFormState({}),
        budget: createInitialFormState({}),
        team: createInitialFormState({})
      },
      
      validators: {
        phase: null,
        task: null,
        material: null,
        budget: null,
        team: null
      },
      
      // Initialize form with data and validation
      initializeForm: (formType, initialData, validationFn) => {
        set((state) => ({
          forms: {
            ...state.forms,
            [formType]: createInitialFormState(initialData)
          },
          validators: {
            ...state.validators,
            [formType]: validationFn || null
          }
        }), false, `initializeForm-${formType}`);
      },
      
      // Update form data
      updateFormData: (formType, newData) => {
        set((state) => {
          const currentForm = state.forms[formType];
          const updatedData = { ...currentForm.data, ...newData };
          const validator = state.validators[formType];
          
          // Run validation if validator exists
          const errors = validator ? validator(updatedData) : {};
          const isValid = Object.keys(errors).length === 0;
          
          // Check if form is dirty
          const isDirty = JSON.stringify(updatedData) !== JSON.stringify(currentForm.initialData);
          
          return {
            forms: {
              ...state.forms,
              [formType]: {
                ...currentForm,
                data: updatedData,
                errors,
                isValid,
                isDirty
              }
            }
          };
        }, false, `updateFormData-${formType}`);
      },
      
      // Set form errors manually
      setFormErrors: (formType, errors) => {
        set((state) => ({
          forms: {
            ...state.forms,
            [formType]: {
              ...state.forms[formType],
              errors,
              isValid: Object.keys(errors).length === 0
            }
          }
        }), false, `setFormErrors-${formType}`);
      },
      
      // Validate form manually
      validateForm: (formType) => {
        const state = get();
        const form = state.forms[formType];
        const validator = state.validators[formType];
        
        if (!validator) return true;
        
        const errors = validator(form.data);
        const isValid = Object.keys(errors).length === 0;
        
        set((prevState) => ({
          forms: {
            ...prevState.forms,
            [formType]: {
              ...prevState.forms[formType],
              errors,
              isValid
            }
          }
        }), false, `validateForm-${formType}`);
        
        return isValid;
      },
      
      // Set form submitting state
      setFormSubmitting: (formType, isSubmitting) => {
        set((state) => ({
          forms: {
            ...state.forms,
            [formType]: {
              ...state.forms[formType],
              isSubmitting
            }
          }
        }), false, `setFormSubmitting-${formType}`);
      },
      
      // Reset form to initial state
      resetForm: (formType) => {
        set((state) => {
          const currentForm = state.forms[formType];
          return {
            forms: {
              ...state.forms,
              [formType]: createInitialFormState(currentForm.initialData)
            }
          };
        }, false, `resetForm-${formType}`);
      },
      
      // Clear all forms
      clearAllForms: () => {
        set(() => ({
          forms: {
            phase: createInitialFormState({}),
            task: createInitialFormState({}),
            material: createInitialFormState({}),
            budget: createInitialFormState({}),
            team: createInitialFormState({})
          },
          validators: {
            phase: null,
            task: null,
            material: null,
            budget: null,
            team: null
          }
        }), false, 'clearAllForms');
      },
      
      // Set validator for form type
      setValidator: (formType, validationFn) => {
        set((state) => ({
          validators: {
            ...state.validators,
            [formType]: validationFn
          }
        }), false, `setValidator-${formType}`);
      }
    }),
    {
      name: 'form-store', // Name for devtools
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// Convenience hooks for individual form types
export const usePhaseForm = () => {
  const form = useFormStore((state) => state.forms.phase);
  const initializeForm = useFormStore((state) => state.initializeForm);
  const updateFormData = useFormStore((state) => state.updateFormData);
  const setFormErrors = useFormStore((state) => state.setFormErrors);
  const validateForm = useFormStore((state) => state.validateForm);
  const setFormSubmitting = useFormStore((state) => state.setFormSubmitting);
  const resetForm = useFormStore((state) => state.resetForm);
  const setValidator = useFormStore((state) => state.setValidator);
  
  return {
    ...form,
    actions: {
      initialize: (initialData: any, validationFn?: (data: any) => Record<string, string>) => 
        initializeForm('phase', initialData, validationFn),
      updateData: (data: any) => updateFormData('phase', data),
      setErrors: (errors: Record<string, string>) => setFormErrors('phase', errors),
      validate: () => validateForm('phase'),
      setSubmitting: (isSubmitting: boolean) => setFormSubmitting('phase', isSubmitting),
      reset: () => resetForm('phase'),
      setValidator: (validationFn: (data: any) => Record<string, string>) => setValidator('phase', validationFn)
    }
  };
};

export const useTaskForm = () => {
  const form = useFormStore((state) => state.forms.task);
  const initializeForm = useFormStore((state) => state.initializeForm);
  const updateFormData = useFormStore((state) => state.updateFormData);
  const setFormErrors = useFormStore((state) => state.setFormErrors);
  const validateForm = useFormStore((state) => state.validateForm);
  const setFormSubmitting = useFormStore((state) => state.setFormSubmitting);
  const resetForm = useFormStore((state) => state.resetForm);
  const setValidator = useFormStore((state) => state.setValidator);
  
  return {
    ...form,
    actions: {
      initialize: (initialData: any, validationFn?: (data: any) => Record<string, string>) => 
        initializeForm('task', initialData, validationFn),
      updateData: (data: any) => updateFormData('task', data),
      setErrors: (errors: Record<string, string>) => setFormErrors('task', errors),
      validate: () => validateForm('task'),
      setSubmitting: (isSubmitting: boolean) => setFormSubmitting('task', isSubmitting),
      reset: () => resetForm('task'),
      setValidator: (validationFn: (data: any) => Record<string, string>) => setValidator('task', validationFn)
    }
  };
};

export const useMaterialForm = () => {
  const form = useFormStore((state) => state.forms.material);
  const initializeForm = useFormStore((state) => state.initializeForm);
  const updateFormData = useFormStore((state) => state.updateFormData);
  const setFormErrors = useFormStore((state) => state.setFormErrors);
  const validateForm = useFormStore((state) => state.validateForm);
  const setFormSubmitting = useFormStore((state) => state.setFormSubmitting);
  const resetForm = useFormStore((state) => state.resetForm);
  const setValidator = useFormStore((state) => state.setValidator);
  
  return {
    ...form,
    actions: {
      initialize: (initialData: any, validationFn?: (data: any) => Record<string, string>) => 
        initializeForm('material', initialData, validationFn),
      updateData: (data: any) => updateFormData('material', data),
      setErrors: (errors: Record<string, string>) => setFormErrors('material', errors),
      validate: () => validateForm('material'),
      setSubmitting: (isSubmitting: boolean) => setFormSubmitting('material', isSubmitting),
      reset: () => resetForm('material'),
      setValidator: (validationFn: (data: any) => Record<string, string>) => setValidator('material', validationFn)
    }
  };
};

export const useBudgetForm = () => {
  const form = useFormStore((state) => state.forms.budget);
  const initializeForm = useFormStore((state) => state.initializeForm);
  const updateFormData = useFormStore((state) => state.updateFormData);
  const setFormErrors = useFormStore((state) => state.setFormErrors);
  const validateForm = useFormStore((state) => state.validateForm);
  const setFormSubmitting = useFormStore((state) => state.setFormSubmitting);
  const resetForm = useFormStore((state) => state.resetForm);
  const setValidator = useFormStore((state) => state.setValidator);
  
  return {
    ...form,
    actions: {
      initialize: (initialData: any, validationFn?: (data: any) => Record<string, string>) => 
        initializeForm('budget', initialData, validationFn),
      updateData: (data: any) => updateFormData('budget', data),
      setErrors: (errors: Record<string, string>) => setFormErrors('budget', errors),
      validate: () => validateForm('budget'),
      setSubmitting: (isSubmitting: boolean) => setFormSubmitting('budget', isSubmitting),
      reset: () => resetForm('budget'),
      setValidator: (validationFn: (data: any) => Record<string, string>) => setValidator('budget', validationFn)
    }
  };
};

export const useTeamForm = () => {
  const form = useFormStore((state) => state.forms.team);
  const initializeForm = useFormStore((state) => state.initializeForm);
  const updateFormData = useFormStore((state) => state.updateFormData);
  const setFormErrors = useFormStore((state) => state.setFormErrors);
  const validateForm = useFormStore((state) => state.validateForm);
  const setFormSubmitting = useFormStore((state) => state.setFormSubmitting);
  const resetForm = useFormStore((state) => state.resetForm);
  const setValidator = useFormStore((state) => state.setValidator);
  
  return {
    ...form,
    actions: {
      initialize: (initialData: any, validationFn?: (data: any) => Record<string, string>) => 
        initializeForm('team', initialData, validationFn),
      updateData: (data: any) => updateFormData('team', data),
      setErrors: (errors: Record<string, string>) => setFormErrors('team', errors),
      validate: () => validateForm('team'),
      setSubmitting: (isSubmitting: boolean) => setFormSubmitting('team', isSubmitting),
      reset: () => resetForm('team'),
      setValidator: (validationFn: (data: any) => Record<string, string>) => setValidator('team', validationFn)
    }
  };
};