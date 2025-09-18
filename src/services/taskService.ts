/**
 * Task Service
 * Provides methods for working with task data
 */
import { Task } from '@/types/task'
import { supabase } from '@/lib/supabase'

/**
 * Get all tasks
 * @returns Promise that resolves to an array of tasks
 */
export const getTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('be_task')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch tasks:', error);
    throw error;
  }

  return data as Task[];
}

/**
 * Get a task by ID
 * @param id Task ID
 * @returns Promise that resolves to a task or null if not found
 */
export const getTaskById = async (id: string): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('be_task')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Failed to fetch task:', error);
    throw error;
  }

  return data as Task;
}

/**
 * Get tasks for a specific project
 * @param projectId Project ID
 * @returns Promise that resolves to an array of tasks for the specified project
 */
export const getTasksByProject = async (projectId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('be_task')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch tasks by project:', error);
    throw error;
  }

  return data as Task[];
}

/**
 * Get tasks assigned to a specific team member
 * @param userId User ID
 * @returns Promise that resolves to an array of tasks assigned to the specified user
 */
export const getTasksByAssignee = async (userId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('be_task')
    .select('*')
    .eq('assigned_to', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch tasks by assignee:', error);
    throw error;
  }

  return data as Task[];
}

/**
 * Create a new task
 * @param task Task data to create
 * @returns Promise that resolves to the created task
 */
export const createTask = async (task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
  const { data, error } = await supabase
    .from('be_task')
    .insert([task])
    .select()
    .single();

  if (error) {
    console.error('Failed to create task:', error);
    throw error;
  }

  return data as Task;
}

/**
 * Update an existing task
 * @param id Task ID
 * @param updates Partial task data to update
 * @returns Promise that resolves to the updated task or null if not found
 */
export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('be_task')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Failed to update task:', error);
    throw error;
  }

  return data as Task;
}

/**
 * Delete a task
 * @param id Task ID
 * @returns Promise that resolves to a boolean indicating success
 */
export const deleteTask = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('be_task')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete task:', error);
    return false;
  }

  return true;
}

/**
 * Search tasks by title or description
 * @param query Search query
 * @returns Promise that resolves to an array of tasks matching the search query
 */
export const searchTasks = async (query: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('be_task')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to search tasks:', error);
    throw error;
  }

  return data as Task[];
}
