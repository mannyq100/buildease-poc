/**
 * Core utilities index file
 * Re-exports all core utility functions for easy importing
 */

// Export all animation utilities
export * from './animations';

// Export all chart utilities with explicit export to avoid naming conflicts
export { 
  CHART_COLORS,
  CHART_COLOR_ARRAY,
  CHART_THEME,
  getChartColors,
  isDarkMode as chartIsDarkMode,
  getCurrentTheme,
  formatNumber as formatChartNumber
} from './charts';

// Export all date utilities
export * from './date';

// Export all error utilities
export * from './error';

// Export all formatting utilities
export * from './format';

// Export all comparison utilities
export * from './comparison';

// Export all performance utilities
export * from './performance';

// Export all UI utilities
export * from './ui';

// Export all validation utilities
export * from './validation';

// Export all file upload utilities
export * from './fileUpload';

// Export all storage utilities
export * from './storageUtils';

// Export logging utilities
export * from './logger';

// Export authentication utilities
export * from '../auth';
