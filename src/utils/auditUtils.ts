/**
 * Shared utilities for audit trail system
 * Centralized utility functions to avoid duplication and maintain consistency
 */

import { format } from 'date-fns';
import { RISK_THRESHOLDS, SeverityLevel } from '@/constants/auditConstants';

/**
 * Generate user initials from full name
 */
export const getUserInitials = (name: string): string => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

/**
 * Format audit date consistently across components
 */
export const formatAuditDate = (date: string | Date, formatString: string = 'MMM dd, yyyy'): string => {
  try {
    return format(new Date(date), formatString);
  } catch (error) {
    console.warn('Invalid date provided to formatAuditDate:', date);
    return 'Invalid Date';
  }
};

/**
 * Calculate risk level from numeric score
 */
export const calculateRiskLevel = (score: number): SeverityLevel => {
  if (score >= RISK_THRESHOLDS.HIGH) return 'critical';
  if (score >= RISK_THRESHOLDS.MEDIUM) return 'high';
  if (score >= RISK_THRESHOLDS.LOW) return 'medium';
  return 'low';
};

/**
 * Format file size in human readable format
 */
export const formatBytes = (bytes: number, decimals: number = 1): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(decimals));
  
  return `${formattedSize} ${sizes[i]}`;
};

/**
 * Estimate data size for audit log entries (rough calculation)
 */
export const estimateDataSize = (logs: any[]): number => {
  return logs.reduce((total, log) => {
    // Base log entry ~1KB + metadata size
    const baseSize = 1024;
    const metadataSize = JSON.stringify(log.metadata || {}).length;
    return total + baseSize + metadataSize;
  }, 0);
};

/**
 * Generate unique session ID
 */
export const generateSessionId = (): string => {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique error ID
 */
export const generateErrorId = (): string => {
  return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get browser information safely
 */
export const getBrowserInfo = (): string => {
  return typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Safely parse JSON with fallback
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Chunk array into smaller arrays
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Get relative time description
 */
export const getRelativeTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

/**
 * Convert CSV data to downloadable blob
 */
export const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = typeof value === 'string' ? value.replace(/"/g, '""') : String(value);
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      }).join(',')
    )
  ];
  
  return csvRows.join('\n');
};

/**
 * Create and trigger file download
 */
export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain'): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Safely get nested object property
 */
export const getNestedProperty = (obj: any, path: string, defaultValue: any = undefined): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
};

/**
 * Deep clone object safely
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  
  const cloned = {} as T;
  Object.keys(obj).forEach(key => {
    (cloned as any)[key] = deepClone((obj as any)[key]);
  });
  
  return cloned;
};