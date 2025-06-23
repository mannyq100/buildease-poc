/**
 * Form Validation Utility Functions
 * A collection of reusable validation functions for use with React Hook Form
 */

export type ValidationResult = string | null;

export const validators = {
  required: (message = 'This field is required') => (value: any): ValidationResult => {
    if (value === null || value === undefined || value === '') {
      return message;
    }
    return null;
  },

  email: (message = 'Please enter a valid email address') => (value: any): ValidationResult => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : message;
  },

  minLength: (length: number, message?: string) => (value: any): ValidationResult => {
    if (!value) return null;
    const msg = message || `Must be at least ${length} characters`;
    return String(value).length >= length ? null : msg;
  },

  maxLength: (length: number, message?: string) => (value: any): ValidationResult => {
    if (!value) return null;
    const msg = message || `Must be no more than ${length} characters`;
    return String(value).length <= length ? null : msg;
  },

  pattern: (regex: RegExp, message: string) => (value: any): ValidationResult => {
    if (!value) return null;
    return regex.test(String(value)) ? null : message;
  },

  numeric: (message = 'Must be a number') => (value: any): ValidationResult => {
    if (!value) return null;
    return !isNaN(Number(value)) ? null : message;
  },

  min: (minValue: number, message?: string) => (value: any): ValidationResult => {
    if (!value) return null;
    const num = Number(value);
    const msg = message || `Must be at least ${minValue}`;
    return num >= minValue ? null : msg;
  },

  max: (maxValue: number, message?: string) => (value: any): ValidationResult => {
    if (!value) return null;
    const num = Number(value);
    const msg = message || `Must be no more than ${maxValue}`;
    return num <= maxValue ? null : msg;
  },

  dateAfter: (startDateField: string, message?: string) => (value: any, formValues: Record<string, any>): ValidationResult => {
    if (!value || !formValues[startDateField]) return null;
    const endDate = new Date(value);
    const startDate = new Date(formValues[startDateField]);
    const msg = message || `Must be after ${startDateField}`;
    return endDate > startDate ? null : msg;
  },

  custom: (validator: (value: any, values: Record<string, any>) => ValidationResult) => validator
};
