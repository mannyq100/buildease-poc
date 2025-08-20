/**
 * Input Sanitization Utilities
 * Provides secure input sanitization and validation for BuildEase application
 * Addresses Sprint 1.5: Security Vulnerabilities
 */

import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

// HTML sanitization with conservative settings
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM: false
  });
};

// Plain text sanitization (removes all HTML)
export const sanitizeText = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};

// Common Zod schemas for validation
export const securitySchemas = {
  // Project/Phase/Task names: alphanumeric, spaces, basic punctuation
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-_.()]+$/, 'Name contains invalid characters'),
    
  // Descriptions: allow more characters but sanitize
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .transform((str) => sanitizeText(str)),
    
  // Email validation
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
    
  // Phone validation (international format)
  phone: z.string()
    .regex(/^[\+]?[1-9]?[\d\s\-\(\)]{10,}$/, 'Invalid phone number format')
    .max(20, 'Phone number must be less than 20 characters'),
    
  // Currency amount validation
  currency: z.number()
    .min(0, 'Amount must be positive')
    .max(999999999, 'Amount too large')
    .finite('Amount must be a valid number'),
    
  // Date validation (ISO format)
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime()) && parsed.getFullYear() > 1900 && parsed.getFullYear() < 2100;
    }, 'Invalid date'),
    
  // URL validation (for document links, etc.)
  url: z.string()
    .url('Invalid URL format')
    .max(2048, 'URL too long')
    .refine((url) => {
      // Only allow https and blob URLs for security
      return url.startsWith('https://') || url.startsWith('blob:');
    }, 'Only HTTPS URLs are allowed'),
    
  // UUID validation
  uuid: z.string()
    .uuid('Invalid ID format'),
    
  // Status enums
  taskStatus: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED', 'CANCELLED']),
  phaseStatus: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']),
  projectStatus: z.enum(['planning', 'active', 'completed', 'on-hold', 'cancelled'])
};

// Team member validation schema
export const teamMemberSchema = z.object({
  name: securitySchemas.name,
  role: z.string().min(1, 'Role is required').max(50, 'Role too long'),
  email: securitySchemas.email.optional().or(z.literal('')),
  phone: securitySchemas.phone.optional().or(z.literal('')),
  status: z.enum(['active', 'on-break', 'off-site']).default('active')
});

// Task validation schema
export const taskSchema = z.object({
  title: securitySchemas.name,
  description: securitySchemas.description.optional(),
  status: securitySchemas.taskStatus,
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  due_date: securitySchemas.date.optional(),
  assigned_to: securitySchemas.uuid.optional()
});

// Phase validation schema
export const phaseSchema = z.object({
  name: securitySchemas.name,
  description: securitySchemas.description.optional(),
  status: securitySchemas.phaseStatus,
  start_date: securitySchemas.date.optional(),
  end_date: securitySchemas.date.optional()
});

// Budget expense validation schema
export const expenseSchema = z.object({
  title: securitySchemas.name,
  description: securitySchemas.description.optional(),
  amount: securitySchemas.currency,
  category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
  payment_status: z.enum(['PLANNED', 'PENDING', 'APPROVED', 'PAID', 'REJECTED']),
  payment_date: securitySchemas.date.optional()
});

// Generic sanitization function for form data
export const sanitizeFormData = <T extends Record<string, unknown>>(
  data: T, 
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};

// Check for potential XSS patterns
export const containsSuspiciousContent = (input: string): boolean => {
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /data:text\/html/gi
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
};

// Log security events (for monitoring)
export const logSecurityEvent = (event: {
  type: 'validation_failed' | 'suspicious_content' | 'sanitization_applied';
  details: string;
  userAgent?: string;
  timestamp?: Date;
}) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn('[SECURITY]', event);
  }
  
  // In production, this would send to a security monitoring service
  // Example: send to Sentry, DataDog, or custom logging service
};

export type TeamMemberFormData = z.infer<typeof teamMemberSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;
export type PhaseFormData = z.infer<typeof phaseSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;