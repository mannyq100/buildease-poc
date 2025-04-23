/**
 * Date utility functions for consistent date handling
 */

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string, 
  options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  }
): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

/**
 * Returns the number of days between two dates
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns Number of days
 */
export function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Checks if a date is past due
 * @param dateString - Date string to check
 * @returns True if date is in the past
 */
export function isPastDue(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  
  // Reset time parts to compare just the dates
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  return date < today;
}

/**
 * Returns true if a date is today
 * @param dateString - Date string to check
 * @returns True if date is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

/**
 * Returns a date formatted as YYYY-MM-DD
 * @param date - Date to format (defaults to today)
 * @returns Date in YYYY-MM-DD format
 */
export function getISODateString(date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/**
 * Adds a specified number of days to a date
 * @param dateString - Starting date as string
 * @param days - Number of days to add
 * @returns New date string in YYYY-MM-DD format
 */
export function addDays(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return getISODateString(date);
}

/**
 * Returns a user-friendly relative time description
 * (e.g., "2 days ago", "in 3 weeks")
 * @param dateString - Date string to format
 * @returns Relative time description
 */
export function getRelativeTimeDescription(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  if (isToday(dateString)) return 'Today';
  
  if (diffDays < 0) {
    // Past
    const days = Math.abs(diffDays);
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  } else {
    // Future
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 30) return `In ${Math.floor(diffDays / 7)} weeks`;
    if (diffDays < 365) return `In ${Math.floor(diffDays / 30)} months`;
    return `In ${Math.floor(diffDays / 365)} years`;
  }
}
