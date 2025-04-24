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
    id: Number(t.id), // Convert string ID to number
    name: t.title, // Map title to name
    description: t.description,
    dueDate: t.dueDate,
    assignee: t.assignedTo, // Map assignedTo to assignee
    // Map status: 'not-started' -> 'pending'
    status: t.status === 'not-started' ? 'pending' : (t.status as 'completed' | 'in-progress' | 'pending'), 
    phaseId: Number(t.projectId), // Map projectId to phaseId (assuming relation for mock)
    priority: t.priority as 'low' | 'medium' | 'high' | undefined,
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
    id: Number(task.id), // Convert string ID to number
    name: task.title, // Map title to name
    description: task.description,
    dueDate: task.dueDate,
    assignee: task.assignedTo, // Map assignedTo to assignee
    // Map status: 'not-started' -> 'pending'
    status: task.status === 'not-started' ? 'pending' : (task.status as 'completed' | 'in-progress' | 'pending'), 
    phaseId: Number(task.projectId), // Map projectId to phaseId
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
    id: Number(t.id),
    name: t.title,
    description: t.description,
    dueDate: t.dueDate,
    assignee: t.assignedTo,
    status: t.status === 'not-started' ? 'pending' : (t.status as 'completed' | 'in-progress' | 'pending'),
    phaseId: Number(t.projectId),
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
  const tasks = tasksData.list.filter(t => t.assignedTo === userId);

  // Convert to Task type with proper typing
  const typedTasks: Task[] = tasks.map(t => ({
    id: Number(t.id),
    name: t.title,
    description: t.description,
    dueDate: t.dueDate,
    assignee: t.assignedTo,
    status: t.status === 'not-started' ? 'pending' : (t.status as 'completed' | 'in-progress' | 'pending'),
    phaseId: Number(t.projectId),
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
  const currentStatus = task.status === 'not-started' ? 'pending' : (task.status as 'completed' | 'in-progress' | 'pending');
  const updatedStatus = updates.status ? updates.status : currentStatus;

  // Create a properly typed Task, mapping updates carefully
  // Start with the base properties from the original task, correctly mapped
  const baseTask: Task = {
    id: Number(task.id),
    name: task.title,
    description: task.description,
    dueDate: task.dueDate,
    assignee: task.assignedTo,
    phaseId: Number(task.projectId),
    priority: task.priority as 'low' | 'medium' | 'high' | undefined,
    status: currentStatus,
  };

  // Apply updates, ensuring type safety and correct mapping
  const updatedTask: Task = {
    ...baseTask, // Start with correctly mapped base task
    ...updates, // Apply provided updates (might overwrite base props)
    // Ensure final required fields are correctly typed and mapped, overriding anything from spread 'updates' if necessary
    id: baseTask.id, // Keep original ID
    phaseId: updates.phaseId !== undefined ? updates.phaseId : baseTask.phaseId, // Use updated phaseId if provided, else base
    status: updatedStatus, // Use the calculated updated status
    // If updates included 'name', it's already applied by the spread. 
    // If updates didn't include 'name', baseTask.name is used.
  };

  // The spread ...updates might have included properties like 'title', 'assignedTo', 'projectId' 
  // which are not part of the Task interface. We should ideally remove them, 
  // but for this mock service, we'll rely on TypeScript catching mismatches 
  // when this function is used elsewhere, as the return type is correctly Task.
  
  // Remove potentially incorrect fields if spread from 'updates' directly
  // delete (updatedTask as any).title;
  // delete (updatedTask as any).projectId;
  // delete (updatedTask as any).assignedTo;

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
