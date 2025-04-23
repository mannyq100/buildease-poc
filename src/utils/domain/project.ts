/**
 * Project domain utilities
 * Functions for handling project data, calculations, and display
 */
import { ProjectFormData, CostEstimate } from '@/types/projectInputs';
import { Project, ProjectStatus } from '@/types/project';

/**
 * Calculate a cost estimate based on project details
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
 * Calculate tab completion percentage for project form
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
 * Get the order of tabs for the project form
 * @returns Array of tab names in the correct order
 */
export function getTabsOrder(): string[] {
  return ["intro", "basic", "building", "materials", "features", "final"];
}

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
 * Get the color classes for a project status
 * @param status The status (Completed, In Progress, Not Started, Delayed)
 * @returns CSS classes for text and background color
 */
export function getStatusColor(status: ProjectStatus | string): string {
  switch (status) {
    case 'completed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
    case 'in-progress': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
    case 'pending': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/50';
    case 'delayed': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
    case 'on-hold': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
    case 'cancelled': return 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30';
    default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/50';
  }
}

/**
 * Calculate project progress based on phases and tasks
 * @param project - Project data
 * @returns Progress percentage (0-100)
 */
export function calculateProjectProgress(project: Project): number {
  // If there are no phases or tasks, return 0
  if (!project.phases || project.phases.length === 0) {
    return 0;
  }

  let completedTasks = 0;
  let totalTasks = 0;

  // Count completed tasks across all phases
  project.phases.forEach(phase => {
    if (phase.tasks && phase.tasks.length > 0) {
      totalTasks += phase.tasks.length;
      completedTasks += phase.tasks.filter(task => task.status === 'completed').length;
    }
  });

  // Calculate percentage
  return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
}

/**
 * Calculate days remaining until project deadline
 * @param endDate - Project end date
 * @returns Number of days remaining (negative if overdue)
 */
export function calculateDaysRemaining(endDate: string): number {
  const end = new Date(endDate);
  const today = new Date();
  
  // Reset time parts to compare just the dates
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const timeDiff = end.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

/**
 * Get human-readable project duration
 * @param startDate - Project start date
 * @param endDate - Project end date 
 * @returns Duration string (e.g., "3 months")
 */
export function getProjectDuration(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate difference in days
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff <= 0) return 'Invalid dates';
  
  // Format based on duration
  if (daysDiff === 1) return '1 day';
  if (daysDiff < 7) return `${daysDiff} days`;
  if (daysDiff < 31) {
    const weeks = Math.ceil(daysDiff / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
  }
  if (daysDiff < 365) {
    const months = Math.ceil(daysDiff / 30.44); // Average days in a month
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }
  const years = Math.ceil(daysDiff / 365.25); // Including leap years
  return `${years} ${years === 1 ? 'year' : 'years'}`;
}
