/**
 * Utility functions for plan-related components
 * Consolidated to reduce code duplication across plan components
 */

// Status color mappings for consistent design
export const getStatusColor = (status: string) => {
  switch(status.toLowerCase()) {
    case 'pending':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'in-progress':
    case 'in progress':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'delayed':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'planning':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    case 'on-hold':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    case 'optimized':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'warning':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  }
};

// Date formatting utility
export const formatDate = (dateString?: string) => {
  if (!dateString) return 'Not set';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

// Currency formatting utility
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

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

// Timeline status colors for timeline view
export const getTimelineStatusColor = (status: string) => {
  switch(status.toLowerCase()) {
    case 'pending':
      return 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/10';
    case 'in-progress':
      return 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/10';
    case 'completed':
      return 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/10';
    case 'delayed':
      return 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/10';
    default:
      return 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/30';
  }
};

export const getTimelineTextColor = (status: string) => {
  switch(status.toLowerCase()) {
    case 'pending':
      return 'text-blue-600 dark:text-blue-400';
    case 'in-progress':
      return 'text-amber-600 dark:text-amber-400';
    case 'completed':
      return 'text-green-600 dark:text-green-400';
    case 'delayed':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};