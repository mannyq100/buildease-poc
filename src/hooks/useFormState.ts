import { useState, useCallback, useEffect } from 'react';

/**
 * A custom hook for managing form state across the application
 * Provides standardized handling for form data, errors, and validation
 */
export function useFormState<T extends Record<string, any>>(
  initialData: T | null, 
  defaultValues: T,
  show: boolean,
  validateFn?: (data: T) => Partial<Record<keyof T, string>>
) {
  // Main form state
  const [formData, setFormData] = useState<T>(initialData || defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [saving, setSaving] = useState(false);

  // Reset form when modal shows/hides or initialData changes
  useEffect(() => {
    if (show) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData(defaultValues);
      }
      setErrors({});
      setSaving(false);
    }
  }, [show, initialData, defaultValues]);

  // Handle input changes from form controls
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;
    
    // Handle different input types
    if (type === 'number') {
      parsedValue = value === '' ? '' : parseFloat(value);
    } else if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    }
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    
    // Clear error when field is edited
    if (errors[name as keyof T]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  // Handle select/dropdown changes
  const handleSelectChange = useCallback((name: keyof T, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
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

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    saving,
    setSaving,
    handleChange,
    handleSelectChange,
    validate
  };
}
