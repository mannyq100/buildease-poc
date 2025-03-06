import { Task, TeamMember } from '@/types/schedule';

/**
 * Formats a date string to a localized date string
 * @param dateString ISO date string
 * @returns Formatted date string (e.g., "May 15, 2024")
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

/**
 * Formats a datetime string to a localized date and time string
 * @param dateTimeString ISO datetime string
 * @returns Formatted date and time string (e.g., "May 15, 2024, 2:30 PM")
 */
export const formatDateTime = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  const date = new Date(dateTimeString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

/**
 * Calculates days remaining until the due date
 * @param dueDate Due date string
 * @returns Number of days remaining (negative if past due)
 */
export const getDaysRemaining = (dueDate: string): number => {
  if (!dueDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Returns a status badge color based on task status
 * @param status Task status
 * @returns Tailwind CSS color class
 */
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in progress':
      return 'bg-blue-100 text-blue-800';
    case 'not started':
      return 'bg-gray-100 text-gray-800';
    case 'delayed':
      return 'bg-amber-100 text-amber-800';
    case 'blocked':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Returns a priority badge color based on task priority
 * @param priority Task priority
 * @returns Tailwind CSS color class
 */
export const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-amber-100 text-amber-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Filters tasks based on search query
 * @param tasks Array of tasks
 * @param query Search query
 * @returns Filtered tasks array
 */
export const searchTasks = (tasks: Task[], query: string): Task[] => {
  if (!query.trim()) return tasks;
  
  const searchTerm = query.toLowerCase().trim();
  return tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm) ||
    task.description.toLowerCase().includes(searchTerm) ||
    task.project.toLowerCase().includes(searchTerm) ||
    task.phase.toLowerCase().includes(searchTerm) ||
    task.status.toLowerCase().includes(searchTerm) ||
    task.priority.toLowerCase().includes(searchTerm) ||
    task.assignedTo.some(member => member.name.toLowerCase().includes(searchTerm))
  );
};

/**
 * Filters tasks by multiple criteria
 * @param tasks Array of tasks
 * @param filters Filter criteria
 * @returns Filtered tasks array
 */
export const filterTasks = (
  tasks: Task[], 
  filters: {
    project?: string;
    phase?: string;
    status?: string;
    priority?: string;
    assignedTo?: number;
    startDateFrom?: string;
    startDateTo?: string;
    dueDateFrom?: string;
    dueDateTo?: string;
  }
): Task[] => {
  return tasks.filter(task => {
    // Check project filter
    if (filters.project && task.project !== filters.project) {
      return false;
    }
    
    // Check phase filter
    if (filters.phase && task.phase !== filters.phase) {
      return false;
    }
    
    // Check status filter
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    
    // Check priority filter
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    
    // Check assignedTo filter
    if (filters.assignedTo && !task.assignedTo.some(member => member.id === filters.assignedTo)) {
      return false;
    }
    
    // Check start date range
    if (filters.startDateFrom && task.startDate < filters.startDateFrom) {
      return false;
    }
    if (filters.startDateTo && task.startDate > filters.startDateTo) {
      return false;
    }
    
    // Check due date range
    if (filters.dueDateFrom && task.dueDate < filters.dueDateFrom) {
      return false;
    }
    if (filters.dueDateTo && task.dueDate > filters.dueDateTo) {
      return false;
    }
    
    return true;
  });
};

/**
 * Groups tasks by a specified property
 * @param tasks Array of tasks
 * @param groupBy Property to group by
 * @returns Object with groups as keys and task arrays as values
 */
export const groupTasks = (
  tasks: Task[], 
  groupBy: 'project' | 'phase' | 'status' | 'priority' | 'dueDate'
): Record<string, Task[]> => {
  const groupedTasks: Record<string, Task[]> = {};
  
  tasks.forEach(task => {
    let key = '';
    
    if (groupBy === 'dueDate') {
      // Group by week or month
      const dueDate = new Date(task.dueDate);
      key = dueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      key = task[groupBy];
    }
    
    if (!groupedTasks[key]) {
      groupedTasks[key] = [];
    }
    
    groupedTasks[key].push(task);
  });
  
  return groupedTasks;
};

/**
 * Sorts tasks by a specified property
 * @param tasks Array of tasks
 * @param sortBy Property to sort by
 * @param sortDirection Sort direction ('asc' or 'desc')
 * @returns Sorted tasks array
 */
export const sortTasks = (
  tasks: Task[], 
  sortBy: 'title' | 'project' | 'phase' | 'startDate' | 'dueDate' | 'status' | 'priority' | 'completion',
  sortDirection: 'asc' | 'desc' = 'asc'
): Task[] => {
  const sortedTasks = [...tasks];
  
  sortedTasks.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
      case 'project':
      case 'phase':
      case 'status':
      case 'priority':
        comparison = a[sortBy].localeCompare(b[sortBy]);
        break;
      case 'startDate':
      case 'dueDate':
        comparison = new Date(a[sortBy]).getTime() - new Date(b[sortBy]).getTime();
        break;
      case 'completion':
        comparison = a.completion - b.completion;
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  return sortedTasks;
};

/**
 * Gets a list of all dependencies for a task
 * @param taskId Task ID
 * @param tasks Array of all tasks
 * @returns Array of dependency tasks
 */
export const getTaskDependencies = (taskId: number, tasks: Task[]): Task[] => {
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.dependencies || task.dependencies.length === 0) {
    return [];
  }
  
  return tasks.filter(t => task.dependencies?.includes(t.id));
};

/**
 * Gets a list of all tasks that depend on a given task
 * @param taskId Task ID
 * @param tasks Array of all tasks
 * @returns Array of dependent tasks
 */
export const getDependentTasks = (taskId: number, tasks: Task[]): Task[] => {
  return tasks.filter(task => task.dependencies?.includes(taskId));
}; 