/**
 * Utility functions for plan-related components
 * Consolidated to reduce code duplication across plan components
 * 
 * Note: For basic task status/priority colors, use @/utils/core/taskColors
 * These functions are specific to plan components with enhanced BuildEase styling
 */

// Enhanced BuildEase status color mappings for construction industry
export const getStatusColor = (status: string) => {
  switch(status.toLowerCase()) {
    case 'pending':
      return 'bg-buildease-blue-100 text-buildease-blue-800 border-buildease-blue-200 dark:bg-buildease-blue-900/30 dark:text-buildease-blue-400 dark:border-buildease-blue-800';
    case 'in-progress':
    case 'in progress':
      return 'bg-buildease-orange-100 text-buildease-orange-800 border-buildease-orange-200 dark:bg-buildease-orange-900/30 dark:text-buildease-orange-400 dark:border-buildease-orange-800';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    case 'delayed':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    case 'planning':
      return 'bg-buildease-blue-50 text-buildease-blue-700 border-buildease-blue-100 dark:bg-buildease-blue-900/20 dark:text-buildease-blue-400 dark:border-buildease-blue-800';
    case 'on-hold':
      return 'bg-buildease-earth-100 text-buildease-earth-800 border-buildease-earth-200 dark:bg-buildease-earth-800/30 dark:text-buildease-earth-400 dark:border-buildease-earth-700';
    case 'optimized':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    case 'warning':
      return 'bg-buildease-orange-100 text-buildease-orange-800 border-buildease-orange-200 dark:bg-buildease-orange-900/30 dark:text-buildease-orange-400 dark:border-buildease-orange-800';
    default:
      return 'bg-buildease-earth-100 text-buildease-earth-800 border-buildease-earth-200 dark:bg-buildease-earth-800/30 dark:text-buildease-earth-400 dark:border-buildease-earth-700';
  }
};

// Date formatting moved to @/utils/core/date

// Currency formatting moved to @/utils/core/currencyUtils

// Animation variants for consistent motion
export const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// Status text formatting
export const getStatusText = (status: string) => {
  switch(status.toLowerCase()) {
    case 'optimized':
      return 'Optimized';
    case 'warning':
      return 'Needs Attention';
    case 'in-progress':
      return 'In Progress';
    case 'on-hold':
      return 'On Hold';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ');
  }
};

// Enhanced timeline status colors for BuildEase construction theme
export const getTimelineStatusColor = (status: string) => {
  switch(status.toLowerCase()) {
    case 'pending':
      return 'border-buildease-blue-500 dark:border-buildease-blue-400 bg-buildease-blue-50 dark:bg-buildease-blue-900/10';
    case 'in-progress':
      return 'border-buildease-orange-500 dark:border-buildease-orange-400 bg-buildease-orange-50 dark:bg-buildease-orange-900/10';
    case 'completed':
      return 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/10';
    case 'delayed':
      return 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/10';
    case 'planning':
      return 'border-buildease-blue-400 dark:border-buildease-blue-300 bg-buildease-blue-25 dark:bg-buildease-blue-900/5';
    case 'on-hold':
      return 'border-buildease-earth-400 dark:border-buildease-earth-300 bg-buildease-earth-50 dark:bg-buildease-earth-800/10';
    default:
      return 'border-buildease-earth-300 dark:border-buildease-earth-600 bg-buildease-earth-50 dark:bg-buildease-earth-800/20';
  }
};

export const getTimelineTextColor = (status: string) => {
  switch(status.toLowerCase()) {
    case 'pending':
      return 'text-buildease-blue-600 dark:text-buildease-blue-400';
    case 'in-progress':
      return 'text-buildease-orange-600 dark:text-buildease-orange-400';
    case 'completed':
      return 'text-green-600 dark:text-green-400';
    case 'delayed':
      return 'text-red-600 dark:text-red-400';
    case 'planning':
      return 'text-buildease-blue-700 dark:text-buildease-blue-300';
    case 'on-hold':
      return 'text-secondary dark:text-muted-foreground';
    default:
      return 'text-buildease-earth-600 dark:text-buildease-earth-400';
  }
};