/**
 * Formatting utilities for consistent text and number formatting
 */

/**
 * Format a number as currency
 * @param value - Number to format
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number, 
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Format a number with thousands separators
 * @param value - Number to format
 * @param decimalPlaces - Number of decimal places (default: 0)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted number string
 */
export function formatNumber(
  value: number, 
  decimalPlaces: number = 0,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  }).format(value);
}

/**
 * Format a percentage value
 * @param value - Number to format (e.g., 0.25 for 25%)
 * @param decimalPlaces - Number of decimal places (default: 0)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted percentage string
 */
export function formatPercent(
  value: number, 
  decimalPlaces: number = 0,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  }).format(value);
}

/**
 * Format a file size in bytes to a human-readable string
 * @param bytes - Size in bytes
 * @param decimalPlaces - Number of decimal places (default: 1)
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number, decimalPlaces: number = 1): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimalPlaces))} ${sizes[i]}`;
}

/**
 * Truncate text to a maximum length and add ellipsis if needed
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param ellipsis - String to append when truncated (default: '...')
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, ellipsis: string = '...'): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + ellipsis;
}

/**
 * Format a phone number to a standard format
 * @param phone - Raw phone number (digits only)
 * @param format - Format pattern (default: '(XXX) XXX-XXXX')
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string, format: string = '(XXX) XXX-XXXX'): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Apply the format pattern
  let result = format;
  let digitIndex = 0;
  
  for (let i = 0; i < result.length && digitIndex < digits.length; i++) {
    if (result[i] === 'X') {
      result = result.substring(0, i) + digits[digitIndex++] + result.substring(i + 1);
    }
  }
  
  // Replace any remaining X with empty string
  result = result.replace(/X/g, '');
  
  return result;
}

/**
 * Convert a camelCase or snake_case string to Title Case
 * @param str - String to convert
 * @returns String in Title Case
 */
export function toTitleCase(str: string): string {
  // Handle camelCase
  const fromCamel = str.replace(/([A-Z])/g, ' $1');
  
  // Handle snake_case
  const fromSnake = fromCamel.replace(/_/g, ' ');
  
  // Capitalize first letter of each word
  return fromSnake
    .trim()
    .toLowerCase()
    .replace(/\w\S*/g, (word) => {
      return word.charAt(0).toUpperCase() + word.substring(1);
    });
}
