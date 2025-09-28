/**
 * Utility functions for the review form
 * Extracted to reduce component complexity
 */
import { formatCurrency as coreFormatCurrency, SupportedCurrency } from '@/utils/core/currencyUtils';

// Helper function to format currency (legacy support)
export const formatCurrency = (value: string, currencyCode: string) => {
  if (!value) return '';
  
  const numericValue = parseFloat(value.replace(/,/g, ''));
  if (isNaN(numericValue)) return value;
  
  return coreFormatCurrency(numericValue, currencyCode as SupportedCurrency);
};

// Helper function to capitalize text
export const capitalize = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1).replace(/-/g, ' ');
};