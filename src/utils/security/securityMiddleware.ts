/**
 * Security Middleware for React Query Mutations
 * Provides automatic input validation and sanitization for all data mutations
 * Addresses Sprint 1.5: Security Vulnerabilities
 */

import { z } from 'zod';
import { sanitizeFormData, logSecurityEvent, containsSuspiciousContent } from './inputSanitization';

// Security configuration
export interface SecurityConfig {
  enableLogging: boolean;
  blockSuspiciousContent: boolean;
  enforceValidation: boolean;
}

const defaultConfig: SecurityConfig = {
  enableLogging: process.env.NODE_ENV === 'development',
  blockSuspiciousContent: true,
  enforceValidation: true
};

// Security middleware wrapper for mutation functions
export function withSecurity<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>,
  schema: z.ZodSchema<TInput>,
  config: Partial<SecurityConfig> = {}
) {
  const securityConfig = { ...defaultConfig, ...config };

  return async (input: TInput): Promise<TOutput> => {
    try {
      // Step 1: Check for suspicious content in string fields
      if (securityConfig.blockSuspiciousContent) {
        const stringValues = extractStringValues(input);
        for (const value of stringValues) {
          if (containsSuspiciousContent(value)) {
            if (securityConfig.enableLogging) {
              logSecurityEvent({
                type: 'suspicious_content',
                details: `Suspicious content detected: ${value.substring(0, 100)}...`
              });
            }
            throw new Error('Invalid input detected. Please remove any script tags or JavaScript code.');
          }
        }
      }

      // Step 2: Validate and sanitize input using schema
      if (securityConfig.enforceValidation) {
        const validation = sanitizeFormData(input as Record<string, unknown>, schema);
        
        if (!validation.success) {
          if (securityConfig.enableLogging) {
            logSecurityEvent({
              type: 'validation_failed',
              details: validation.errors.join(', ')
            });
          }
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
        
        // Use the sanitized data
        input = validation.data as TInput;
      }

      // Step 3: Execute the original mutation with sanitized input
      const result = await mutationFn(input);
      
      if (securityConfig.enableLogging) {
        logSecurityEvent({
          type: 'sanitization_applied',
          details: 'Input successfully validated and sanitized'
        });
      }
      
      return result;
      
    } catch (error) {
      // Log security-related errors
      if (securityConfig.enableLogging) {
        logSecurityEvent({
          type: 'validation_failed',
          details: error instanceof Error ? error.message : 'Unknown security error'
        });
      }
      
      throw error;
    }
  };
}

// Helper function to extract all string values from an object
function extractStringValues(obj: unknown, visited = new Set()): string[] {
  if (visited.has(obj)) return []; // Prevent circular references
  
  const strings: string[] = [];
  
  if (typeof obj === 'string') {
    strings.push(obj);
  } else if (typeof obj === 'object' && obj !== null) {
    visited.add(obj);
    
    if (Array.isArray(obj)) {
      for (const item of obj) {
        strings.push(...extractStringValues(item, visited));
      }
    } else {
      for (const value of Object.values(obj)) {
        strings.push(...extractStringValues(value, visited));
      }
    }
    
    visited.delete(obj);
  }
  
  return strings;
}

// Security headers for CSP (Content Security Policy)
export const getSecurityHeaders = () => ({
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // Note: In production, remove 'unsafe-inline'
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'"
  ].join('; '),
  
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
});

// Secure random ID generation
export const generateSecureId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback for environments without crypto.getRandomValues
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Data masking for logging (to prevent sensitive data exposure)
export const maskSensitiveData = (data: Record<string, unknown>): Record<string, unknown> => {
  const sensitiveFields = ['password', 'token', 'key', 'secret', 'email', 'phone', 'ssn'];
  const masked: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      masked[key] = typeof value === 'string' && value.length > 0 
        ? `${value.substring(0, 2)}***${value.substring(value.length - 2)}`
        : '***';
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value as Record<string, unknown>);
    } else {
      masked[key] = value;
    }
  }
  
  return masked;
};

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } => {
  const now = Date.now();
  const windowKey = `${identifier}-${Math.floor(now / windowMs)}`;
  
  const current = rateLimitMap.get(windowKey) || { count: 0, resetTime: now + windowMs };
  
  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }
  
  current.count++;
  rateLimitMap.set(windowKey, current);
  
  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
  
  return { 
    allowed: true, 
    remaining: Math.max(0, maxRequests - current.count), 
    resetTime: current.resetTime 
  };
};