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