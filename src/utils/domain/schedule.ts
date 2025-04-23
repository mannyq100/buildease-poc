/**
 * Schedule and task domain utilities
 * Functions for managing construction schedules, task planning, and timeline management
 */
import { Task } from '@/types/task';

// BuildEase color scheme based on design principles
const BUILDEASE_COLORS = {
  primary: '#2B6CB0', // Warm blue for trust and professionalism
  accent: '#ED8936', // Warm orange for calls-to-action
  success: '#48BB78', // Green for success
  warning: '#F6AD55', // Amber for in-progress
  error: '#F56565', // Red for error
  earthTone1: '#9C6F44', // Muted earth tones for construction context
  earthTone2: '#8D6E63',
  earthTone3: '#A1887F'
};

/**
 * Calculates days remaining until the due date
 * @param dueDate Due date string
 * @returns Number of days remaining (negative if past due)
 */
export function getDaysRemaining(dueDate: string): number {
  if (!dueDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Returns CSS classes for task status badge
 * @param status Task status
 * @returns Tailwind CSS classes for the status badge
 */
export function getStatusClasses(status: string): string {
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'in progress':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'not started':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
    case 'delayed':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'blocked':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
  }
}

/**
 * Returns CSS classes for task priority badge
 * @param priority Task priority
 * @returns Tailwind CSS classes for the priority badge
 */
export function getPriorityClasses(priority: string): string {
  const priorityLower = priority.toLowerCase();
  
  switch (priorityLower) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'medium':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'low':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
  }
}

/**
 * Returns a color for task status (for charts and visualizations)
 * @param status Task status
 * @returns HEX color code
 */
export function getStatusColor(status: string): string {
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'completed':
      return BUILDEASE_COLORS.success;
    case 'in progress':
      return BUILDEASE_COLORS.primary;
    case 'not started':
      return '#94A3B8'; // Slate-400
    case 'delayed':
      return BUILDEASE_COLORS.warning;
    case 'blocked':
      return BUILDEASE_COLORS.error;
    default:
      return '#94A3B8'; // Slate-400
  }
}

/**
 * Returns a color for task priority (for charts and visualizations)
 * @param priority Task priority
 * @returns HEX color code
 */
export function getPriorityColor(priority: string): string {
  const priorityLower = priority.toLowerCase();
  
  switch (priorityLower) {
    case 'high':
      return BUILDEASE_COLORS.error;
    case 'medium':
      return BUILDEASE_COLORS.warning;
    case 'low':
      return BUILDEASE_COLORS.primary;
    default:
      return '#94A3B8'; // Slate-400
  }
}

/**
 * Filters tasks based on search query
 * @param tasks Array of tasks
 * @param query Search query
 * @returns Filtered tasks array
 */
export function searchTasks(tasks: Task[], query: string): Task[] {
  if (!query.trim()) return tasks;
  
  const searchTerm = query.toLowerCase().trim();
  return tasks.filter(task => 
    task.name.toLowerCase().includes(searchTerm) ||
    (task.description && task.description.toLowerCase().includes(searchTerm)) ||
    (task.status && task.status.toLowerCase().includes(searchTerm)) ||
    (task.priority && task.priority.toLowerCase().includes(searchTerm))
  );
}

/**
 * Filters tasks by multiple criteria
 * @param tasks Array of tasks
 * @param filters Filter criteria object
 * @returns Filtered tasks array
 */
export function filterTasks(
  tasks: Task[], 
  filters: {
    projectId?: string | number;
    phaseId?: string | number;
    status?: string;
    priority?: string;
    assigneeId?: string | number;
    startDateFrom?: string;
    startDateTo?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
  }
): Task[] {
  return tasks.filter(task => {
    // Check project filter - we don't have a direct projectId in Task
    // Skip this check since the interface doesn't support it
    if (filters.projectId) {
      // In a real implementation, we would need to either:
      // 1. Update the Task interface to include projectId
      // 2. Use an external mapping to relate tasks to projects
      // For now, we'll skip this filter
    }
    
    // Check phase filter
    if (filters.phaseId && task.phaseId !== filters.phaseId) {
      return false;
    }
    
    // Check status filter
    if (filters.status && task.status.toLowerCase() !== filters.status.toLowerCase()) {
      return false;
    }
    
    // Check priority filter
    if (filters.priority && task.priority.toLowerCase() !== filters.priority.toLowerCase()) {
      return false;
    }
    
    // Check assignee filter
    if (filters.assigneeId && task.assignee !== filters.assigneeId) {
      return false;
    }
    
    // Check due date range
    if (filters.dueDateFrom && new Date(task.dueDate) < new Date(filters.dueDateFrom)) {
      return false;
    }
    if (filters.dueDateTo && new Date(task.dueDate) > new Date(filters.dueDateTo)) {
      return false;
    }
    
    return true;
  });
}

/**
 * Groups tasks by a specified property
 * @param tasks Array of tasks
 * @param groupBy Property to group by
 * @returns Object with groups as keys and task arrays as values
 */
export function groupTasksByField(
  tasks: Task[], 
  groupBy: 'status' | 'priority' | 'dueDate' | 'assignee' | 'phaseId'
): Record<string, Task[]> {
  const groupedTasks: Record<string, Task[]> = {};
  
  tasks.forEach(task => {
    let key = '';
    
    if (groupBy === 'dueDate') {
      // Group by week or month
      const dueDate = new Date(task.dueDate);
      key = dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      key = String(task[groupBy] || 'Unassigned');
    }
    
    if (!groupedTasks[key]) {
      groupedTasks[key] = [];
    }
    
    groupedTasks[key].push(task);
  });
  
  return groupedTasks;
}

/**
 * Sorts tasks by a specified property
 * @param tasks Array of tasks
 * @param sortBy Property to sort by
 * @param sortDirection Sort direction ('asc' or 'desc')
 * @returns Sorted tasks array
 */
export function sortTasks(
  tasks: Task[], 
  sortBy: keyof Task = 'dueDate',
  sortDirection: 'asc' | 'desc' = 'asc'
): Task[] {
  return [...tasks].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle dates
    if (sortBy === 'dueDate') {
      const dateA = aValue ? new Date(aValue as string).getTime() : 0;
      const dateB = bValue ? new Date(bValue as string).getTime() : 0;
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    // Handle strings
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle nullish values - place them at the end
    if (aValue == null && bValue != null) return 1;
    if (aValue != null && bValue == null) return -1;
    
    return 0;
  });
}

/**
 * Gets the next available task ID for new task creation
 * @param tasks Current array of tasks
 * @returns Next available task ID
 */
export function getNextTaskId(tasks: Task[]): number {
  if (!tasks || tasks.length === 0) return 1;
  
  // Find the maximum ID and add 1
  const maxId = Math.max(...tasks.map(task => typeof task.id === 'number' ? task.id : parseInt(task.id as string)));
  return maxId + 1;
}

/**
 * Calculates the completion percentage of tasks in a group
 * @param tasks Array of tasks
 * @returns Percentage completed (0-100)
 */
export function calculateCompletionPercentage(tasks: Task[]): number {
  if (!tasks || tasks.length === 0) return 0;
  
  const completedCount = tasks.filter(task => 
    task.status && task.status.toLowerCase() === 'completed'
  ).length;
  
  return Math.round((completedCount / tasks.length) * 100);
}

/**
 * Determines if a task is late based on its due date and status
 * @param task Task to check
 * @returns True if the task is late
 */
export function isTaskLate(task: Task): boolean {
  if (!task.dueDate || task.status?.toLowerCase() === 'completed') return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  
  return dueDate < today;
}
