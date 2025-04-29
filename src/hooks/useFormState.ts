import { useState, useCallback, useEffect, useMemo, useRef } from 'react';

/**
 * A custom hook for managing form state across the application
 * Provides standardized handling for form data, errors, and validation
 * Optimized for React 19's concurrent rendering model
 */
export function useFormState<T extends Record<string, any>>(
  initialData: T | null, 
  defaultValues: T,
  show: boolean,
  validateFn?: (data: T) => Partial<Record<keyof T, string>>
) {
  // Main form state with initial data
  const [formData, setFormData] = useState<T>(() => initialData || defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [saving, setSaving] = useState(false);
  
  // Use refs to track previous values instead of state to avoid re-renders
  const prevShowRef = useRef<boolean>(show);
  const prevInitialDataRef = useRef<T | null>(initialData);

  // Reset form when modal shows/hides or initialData changes
  useEffect(() => {
    // Only update if show or initialData actually changed
    const showChanged = show !== prevShowRef.current;
    const initialDataChanged = initialData !== prevInitialDataRef.current;
    
    if (showChanged || initialDataChanged) {
      // Update ref values directly
      prevShowRef.current = show;
      prevInitialDataRef.current = initialData;
      
      if (show) {
        // Only update formData if the value has actually changed
        if (initialData) {
          setFormData(initialData);
        } else {
          setFormData(defaultValues);
        }
        setErrors({});
        setSaving(false);
      }
    }
  }, [show, initialData, defaultValues]); // Removed prev states from deps array

  // Handle input changes from form controls with memoization for React 19
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;
    
    // Handle different input types
    if (type === 'number') {
      parsedValue = value === '' ? '' : parseFloat(value);
    } else if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    }
    
    setFormData(prev => {
      // Only update if the value has actually changed
      if (prev[name] === parsedValue) return prev;
      return { ...prev, [name]: parsedValue };
    });
    
    // Clear error when field is edited
    if (errors[name as keyof T]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  // Handle select/dropdown changes with memoization for React 19
  const handleSelectChange = useCallback((name: keyof T, value: any) => {
    setFormData(prev => {
      // Only update if the value has actually changed
      if (prev[name] === value) return prev;
      return { ...prev, [name]: value };
    });
    
    // Clear error when field is edited
    if (errors[name as keyof T]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  // Validate form data using the provided validation function
  const validate = useCallback(() => {
    if (validateFn) {
      const validationErrors = validateFn(formData);
      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0;
    }
    return true; // No validation function means valid by default
  }, [formData, validateFn]);

  // Memoize the return value to prevent unnecessary re-renders in React 19
  return useMemo(() => ({
    formData,
    setFormData,
    errors,
    setErrors,
    saving,
    setSaving,
    handleChange,
    handleSelectChange,
    validate
  }), [formData, errors, saving, handleChange, handleSelectChange, validate]);
}
