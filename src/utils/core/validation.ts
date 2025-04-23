/**
 * Validation utilities for consistent form validation across the application
 */

/**
 * Result of a validation check
 */
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Validates if a string is not empty
 * @param value The string to validate
 * @param fieldName The name of the field (for error message)
 * @returns Validation result
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      valid: false,
      message: `${fieldName} is required`
    };
  }
  
  return { valid: true };
}

/**
 * Validates if a value is a valid email address
 * @param email The email address to validate
 * @returns Validation result
 */
export function validateEmail(value: string): ValidationResult {
  if (!value.trim()) {
    return {
      valid: false,
      message: 'Email is required',
    };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(value)) {
    return {
      valid: false,
      message: 'Please enter a valid email address',
    };
  }

  return { valid: true };
}

/**
 * Validates if a value is a valid phone number
 * @param phone The phone number to validate
 * @returns Validation result
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { valid: true }; // Phone might be optional
  }
  
  // Basic phone number pattern (adjust as needed for your requirements)
  // This accepts formats like (123) 456-7890, 123-456-7890, 1234567890
  const phonePattern = /^(?:\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}$/;
  
  if (!phonePattern.test(phone)) {
    return {
      valid: false,
      message: 'Please enter a valid phone number'
    };
  }
  
  return { valid: true };
}

/**
 * Validates if a number is within a specified range
 * @param value The number to validate
 * @param min The minimum allowed value
 * @param max The maximum allowed value
 * @param fieldName The name of the field (for error message)
 * @returns Validation result
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationResult {
  if (value < min || value > max) {
    return {
      valid: false,
      message: `${fieldName} must be between ${min} and ${max}`
    };
  }
  
  return { valid: true };
}

/**
 * Validates if a string meets minimum length requirements
 * @param value The string to validate
 * @param minLength The minimum required length
 * @param fieldName The name of the field (for error message)
 * @returns Validation result
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string
): ValidationResult {
  if (!value || value.length < minLength) {
    return {
      valid: false,
      message: `${fieldName} must be at least ${minLength} characters`
    };
  }
  
  return { valid: true };
}

/**
 * Validates if a password meets security requirements
 * @param password The password to validate
 * @returns Validation result
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.trim() === '') {
    return {
      valid: false,
      message: 'Password is required'
    };
  }
  
  if (password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters'
    };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number'
    };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character'
    };
  }
  
  return { valid: true };
}

/**
 * A generic validator function type
 */
export type Validator<T> = (value: T) => ValidationResult;

/**
 * Run multiple validators against a field value
 * @param fieldName Name of the field being validated
 * @param value Value to validate
 * @param validators Array of validator functions to apply
 * @returns First failed validation or success result
 */
export function validateField<T>(
  fieldName: string,
  value: T,
  validators: Validator<T>[]
): ValidationResult {
  for (const validator of validators) {
    const result = validator(value);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}
