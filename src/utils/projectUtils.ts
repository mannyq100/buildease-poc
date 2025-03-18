/**
 * Utility functions for project management
 */
import { ProjectFormData, CostEstimate } from '@/types/projectInputs';

/**
 * Calculate a cost estimate based on project details
 * 
 * @param formData The project form data
 * @returns A cost estimate with min and max values
 */
export function calculateCostEstimate(formData: ProjectFormData): CostEstimate {
  // Default to 0 if no values
  if (!formData.buildingSize || !formData.projectType) {
    return { min: 0, max: 0 };
  }

  const size = parseFloat(formData.buildingSize) || 0;
  let baseCostPerSqm = 0;

  // Base costs by project type (in GHS)
  switch (formData.projectType) {
    case 'residential-single':
      baseCostPerSqm = 3500;
      break;
    case 'residential-multi':
      baseCostPerSqm = 4000;
      break;
    case 'commercial-small':
      baseCostPerSqm = 4200;
      break;
    case 'commercial-large':
      baseCostPerSqm = 5000;
      break;
    case 'mixed-use':
      baseCostPerSqm = 4500;
      break;
    case 'renovation':
      baseCostPerSqm = 2000;
      break;
    case 'community':
      baseCostPerSqm = 3000;
      break;
    case 'religious':
      baseCostPerSqm = 3800;
      break;
    case 'educational':
      baseCostPerSqm = 3500;
      break;
    default:
      baseCostPerSqm = 3500;
  }

  // Adjust for building structure
  let structureMultiplier = 1.0;
  switch (formData.buildingStructure) {
    case 'concrete-frame':
      structureMultiplier = 1.0;
      break;
    case 'steel-frame':
      structureMultiplier = 1.2;
      break;
    case 'timber-frame':
      structureMultiplier = 0.9;
      break;
    case 'load-bearing':
      structureMultiplier = 0.95;
      break;
    case 'hybrid':
      structureMultiplier = 1.1;
      break;
  }

  // Adjust for premium features
  const hasSpecialFeatures = formData.specialFeatures.length > 0;
  const hasPremiumAmenities = formData.modernAmenities.length > 2;
  const featureMultiplier = 1.0 + 
    (hasSpecialFeatures ? 0.1 : 0) + 
    (hasPremiumAmenities ? 0.15 : 0) +
    (formData.energyEfficiency ? 0.08 : 0) +
    (formData.waterConservation ? 0.05 : 0);

  // Calculate base estimate
  const calculatedCost = size * baseCostPerSqm * structureMultiplier * featureMultiplier;
  
  // Add range for uncertainties
  const min = Math.round(calculatedCost * 0.9);
  const max = Math.round(calculatedCost * 1.2);

  return { min, max };
}

/**
 * Format currency based on currency code
 * 
 * @param amount The amount to format
 * @param currency The currency code (cedi, usd, etc.)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string): string {
  let symbol = '₵';
  let localeName = 'en-GH';
  
  switch (currency) {
    case 'usd':
      symbol = '$';
      localeName = 'en-US';
      break;
    case 'euro':
      symbol = '€';
      localeName = 'de-DE';
      break;
    case 'gbp':
      symbol = '£';
      localeName = 'en-GB';
      break;
  }
  
  return `${symbol}${amount.toLocaleString(localeName)}`;
}

/**
 * Calculate tab completion percentage
 * 
 * @param tab The current tab name
 * @returns Completion percentage (0-100)
 */
export function getTabProgress(tab: string): number {
  const progressMap: Record<string, number> = {
    'intro': 0,
    'basic': 20,
    'building': 40,
    'materials': 60,
    'features': 80,
    'final': 95
  };
  
  return progressMap[tab] || 0;
}

/**
 * Check if a project form has sufficient data to generate a plan
 * 
 * @param formData The project form data
 * @returns True if the form has minimum required data
 */
export function isFormComplete(formData: ProjectFormData): boolean {
  return Boolean(
    formData.projectName && 
    formData.projectType && 
    formData.location && 
    formData.budget &&
    formData.buildingSize
  );
}

/**
 * Get the order of tabs for the form
 * 
 * @returns Array of tab names in the correct order
 */
export function getTabsOrder(): string[] {
  return ["intro", "basic", "building", "materials", "features", "final"];
}

/**
 * Utility functions for project management components
 */

/**
 * Get the color classes for a priority level
 * @param priority The priority level (High, Medium, Low)
 * @returns CSS classes for text and background color
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'High': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
    case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
    case 'Low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/50';
  }
}

/**
 * Get the color classes for a status
 * @param status The status (Completed, In Progress, Not Started, Delayed)
 * @returns CSS classes for text and background color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'Completed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    case 'In Progress': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
    case 'Not Started': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/50';
    case 'Delayed': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
    default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/50';
  }
}

/**
 * Setup a mutation observer to check for dark mode changes
 * @param callback Function to call when dark mode changes
 * @returns Cleanup function to disconnect the observer
 */
export function observeDarkMode(callback: () => void): () => void {
  // Check on initial call
  callback();
  
  // Set up a mutation observer to watch for dark mode changes
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
  
  // Return cleanup function
  return () => observer.disconnect();
}

/**
 * Check if dark mode is currently active
 * @returns true if dark mode is active, false otherwise
 */
export function checkDarkMode(): boolean {
  return document.documentElement.classList.contains('dark');
} 