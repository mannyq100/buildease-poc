import { describe, it, expect } from 'vitest'
import {
  validateRequired,
  validateEmail,
  validatePhone,
  validateNumberRange,
  validateMinLength,
  validatePassword,
  validateField
} from './validationUtils'

describe('validationUtils', () => {
  describe('validateRequired', () => {
    it('should return valid: true for non-empty strings', () => {
      expect(validateRequired('test', 'Field')).toEqual({ valid: true })
    })

    it('should return valid: false for empty strings', () => {
      expect(validateRequired('', 'Field')).toEqual({
        valid: false,
        message: 'Field is required'
      })
    })

    it('should return valid: false for strings with only whitespace', () => {
      expect(validateRequired('   ', 'Field')).toEqual({
        valid: false,
        message: 'Field is required'
      })
    })
  })

  describe('validateEmail', () => {
    it('should return valid: true for valid email addresses', () => {
      expect(validateEmail('test@example.com')).toEqual({ valid: true })
      expect(validateEmail('user.name+tag@example.co.uk')).toEqual({ valid: true })
    })

    it('should return valid: false for empty email', () => {
      expect(validateEmail('')).toEqual({
        valid: false,
        message: 'Email is required'
      })
    })

    it('should return valid: false for invalid email formats', () => {
      expect(validateEmail('test')).toEqual({
        valid: false,
        message: 'Please enter a valid email address'
      })
      expect(validateEmail('test@')).toEqual({
        valid: false,
        message: 'Please enter a valid email address'
      })
      expect(validateEmail('test@example')).toEqual({
        valid: false,
        message: 'Please enter a valid email address'
      })
    })
  })

  describe('validatePhone', () => {
    it('should return valid: true for valid phone numbers', () => {
      expect(validatePhone('(123) 456-7890')).toEqual({ valid: true })
      expect(validatePhone('123-456-7890')).toEqual({ valid: true })
      expect(validatePhone('1234567890')).toEqual({ valid: true })
      expect(validatePhone('+1 123-456-7890')).toEqual({ valid: true })
    })

    it('should return valid: true for empty phone (optional)', () => {
      expect(validatePhone('')).toEqual({ valid: true })
    })

    it('should return valid: false for invalid phone formats', () => {
      expect(validatePhone('123')).toEqual({
        valid: false,
        message: 'Please enter a valid phone number'
      })
      expect(validatePhone('123-456')).toEqual({
        valid: false,
        message: 'Please enter a valid phone number'
      })
      expect(validatePhone('abc-def-ghij')).toEqual({
        valid: false,
        message: 'Please enter a valid phone number'
      })
    })
  })

  describe('validateNumberRange', () => {
    it('should return valid: true for numbers within range', () => {
      expect(validateNumberRange(5, 1, 10, 'Number')).toEqual({ valid: true })
      expect(validateNumberRange(1, 1, 10, 'Number')).toEqual({ valid: true }) // Lower bound
      expect(validateNumberRange(10, 1, 10, 'Number')).toEqual({ valid: true }) // Upper bound
    })

    it('should return valid: false for numbers outside range', () => {
      expect(validateNumberRange(0, 1, 10, 'Number')).toEqual({
        valid: false,
        message: 'Number must be between 1 and 10'
      })
      expect(validateNumberRange(11, 1, 10, 'Number')).toEqual({
        valid: false,
        message: 'Number must be between 1 and 10'
      })
    })
  })

  describe('validateMinLength', () => {
    it('should return valid: true for strings meeting min length', () => {
      expect(validateMinLength('12345', 5, 'Password')).toEqual({ valid: true })
      expect(validateMinLength('123456', 5, 'Password')).toEqual({ valid: true }) // Longer than min
    })

    it('should return valid: false for strings shorter than min length', () => {
      expect(validateMinLength('1234', 5, 'Password')).toEqual({
        valid: false,
        message: 'Password must be at least 5 characters'
      })
      expect(validateMinLength('', 5, 'Password')).toEqual({
        valid: false,
        message: 'Password must be at least 5 characters'
      })
    })
  })

  describe('validatePassword', () => {
    it('should return valid: true for strong passwords', () => {
      expect(validatePassword('Password123!')).toEqual({ valid: true })
    })

    it('should return valid: false for empty password', () => {
      expect(validatePassword('')).toEqual({
        valid: false,
        message: 'Password is required'
      })
    })

    it('should return valid: false for password too short', () => {
      expect(validatePassword('Pass1!')).toEqual({
        valid: false,
        message: 'Password must be at least 8 characters'
      })
    })

    it('should return valid: false for password without uppercase', () => {
      expect(validatePassword('password123!')).toEqual({
        valid: false,
        message: 'Password must contain at least one uppercase letter'
      })
    })

    it('should return valid: false for password without lowercase', () => {
      expect(validatePassword('PASSWORD123!')).toEqual({
        valid: false,
        message: 'Password must contain at least one lowercase letter'
      })
    })

    it('should return valid: false for password without number', () => {
      expect(validatePassword('Password!')).toEqual({
        valid: false,
        message: 'Password must contain at least one number'
      })
    })

    it('should return valid: false for password without special character', () => {
      expect(validatePassword('Password123')).toEqual({
        valid: false,
        message: 'Password must contain at least one special character'
      })
    })
  })

  describe('validateField', () => {
    it('should return the first validation error', () => {
      const validators = [
        (value: string) => value ? { valid: true } : { valid: false, message: 'Required' },
        (value: string) => value.length >= 5 ? { valid: true } : { valid: false, message: 'Too short' }
      ]
      
      // First validator fails
      expect(validateField('Field', '', validators)).toEqual({
        valid: false,
        message: 'Required'
      })
      
      // Second validator fails
      expect(validateField('Field', 'abc', validators)).toEqual({
        valid: false,
        message: 'Too short'
      })
      
      // All validators pass
      expect(validateField('Field', 'abcde', validators)).toEqual({
        valid: true
      })
    })
  })
}) 