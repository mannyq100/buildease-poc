/**
 * Mock Task Service
 * Provides mock implementations of task-related services
 */
import { Task } from '@/types/task';
import tasksData from '../json/tasks.json';

/**
 * Get all tasks
 * @returns Promise that resolves to an array of tasks
 */
export function getTasks(): Promise<Task[]> {
  // Convert string IDs to numbers and ensure proper typing
  const typedTasks: Task[] = tasksData.list.map(t => ({
    ...t,
    id: Number(t.id),
    phaseId: Number(t.phaseId),
    status: t.status as 'completed' | 'in-progress' | 'pending',
    priority: t.priority as 'low' | 'medium' | 'high' | undefined
  }));
  return Promise.resolve(typedTasks);
}

/**
 * Get a task by ID
 * @param id Task ID
 * @returns Promise that resolves to a task or null if not found
 */
export function getTaskById(id: string): Promise<Task | null> {
  const task = tasksData.list.find(t => t.id === id);
  if (!task) return Promise.resolve(null);
  
  // Convert to Task type with proper typing
  const typedTask: Task = {
    ...task,
    id: Number(task.id),
    phaseId: Number(task.phaseId),
    status: task.status as 'completed' | 'in-progress' | 'pending',
    priority: task.priority as 'low' | 'medium' | 'high' | undefined
  };
  return Promise.resolve(typedTask);
}

/**
 * Get tasks for a specific project
 * @param projectId Project ID
 * @returns Promise that resolves to an array of tasks for the specified project
 */
export function getTasksByProject(projectId: string): Promise<Task[]> {
  const tasks = tasksData.list.filter(t => t.projectId === projectId);
  
  // Convert to Task type with proper typing
  const typedTasks: Task[] = tasks.map(t => ({
    ...t,
    id: Number(t.id),
    phaseId: Number(t.phaseId),
    status: t.status as 'completed' | 'in-progress' | 'pending',
    priority: t.priority as 'low' | 'medium' | 'high' | undefined
  }));
  return Promise.resolve(typedTasks);
}

/**
 * Get tasks assigned to a specific team member
 * @param userId User ID
 * @returns Promise that resolves to an array of tasks assigned to the specified user
 */
export function getTasksByAssignee(userId: string): Promise<Task[]> {
  const tasks = tasksData.list.filter(t => t.assignee === userId);
  
  // Convert to Task type with proper typing
  const typedTasks: Task[] = tasks.map(t => ({
    ...t,
    id: Number(t.id),
    phaseId: Number(t.phaseId),
    status: t.status as 'completed' | 'in-progress' | 'pending',
    priority: t.priority as 'low' | 'medium' | 'high' | undefined
  }));
  return Promise.resolve(typedTasks);
}

/**
 * Get task priorities for filtering
 * @returns Promise that resolves to an array of priority options
 */
export function getTaskPriorities(): Promise<string[]> {
  return Promise.resolve(['low', 'medium', 'high']);
}

/**
 * Get task statuses for filtering
 * @returns Promise that resolves to an array of status options
 */
export function getTaskStatuses(): Promise<string[]> {
  return Promise.resolve(['not-started', 'in-progress', 'completed', 'pending']);
}

/**
 * Get task tags for filtering and input suggestions
 * @returns Promise that resolves to an array of common task tags
 */
export function getTaskTags(): Promise<string[]> {
  return Promise.resolve(['urgent', 'bug', 'feature', 'documentation', 'improvement']);
}

/**
 * Create a new task
 * @param task Task data to create
 * @returns Promise that resolves to the created task
 */
export function createTask(task: Omit<Task, 'id'>): Promise<Task> {
  // In a real implementation, this would make an API call
  // For mock, we just return a new task with a generated ID
  const newId = Math.max(...tasksData.list.map(t => Number(t.id))) + 1;
  
  // Create a properly typed Task
  const newTask: Task = {
    ...task,
    id: newId,
  };
  
  return Promise.resolve(newTask);
}

/**
 * Update an existing task
 * @param id Task ID
 * @param updates Partial task data to update
 * @returns Promise that resolves to the updated task or null if not found
 */
export function updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
  const taskIndex = tasksData.list.findIndex(t => t.id === id);
  
  if (taskIndex === -1) {
    return Promise.resolve(null);
  }
  
  const task = tasksData.list[taskIndex];
  
  // Create a properly typed Task
  const updatedTask: Task = {
    ...task,
    ...updates,
    id: Number(task.id),
    phaseId: Number(task.phaseId),
    status: (updates.status || task.status) as 'completed' | 'in-progress' | 'pending',
    priority: (updates.priority || task.priority) as 'low' | 'medium' | 'high' | undefined
  };
  
  return Promise.resolve(updatedTask);
}

/**
 * Delete a task
 * @param id Task ID
 * @returns Promise that resolves to a boolean indicating success
 */
export function deleteTask(id: string): Promise<boolean> {
  const taskExists = tasksData.list.some(t => t.id === id);
  return Promise.resolve(taskExists);
}
