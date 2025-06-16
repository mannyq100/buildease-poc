/**
 * Task Service
 * Provides methods for working with task data
 */
import { Task } from '@/types/task'
import apiClient from '@/lib/api-client'
import { createService } from './serviceFactory'
import * as mockTaskService from '@/data/mock/services/taskService'

// Real API implementation
const realTaskService = {
  /**
   * Get all tasks
   * @returns Promise that resolves to an array of tasks
   */
  getTasks: async (): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>('/tasks')
    return response
  },

  /**
   * Get a task by ID
   * @param id Task ID
   * @returns Promise that resolves to a task or null if not found
   */
  getTaskById: async (id: string): Promise<Task | null> => {
    try {
      const response = await apiClient.get<Task>(`/tasks/${id}`)
      return response
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && 
          (error as any).response?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Get tasks for a specific project
   * @param projectId Project ID
   * @returns Promise that resolves to an array of tasks for the specified project
   */
  getTasksByProject: async (projectId: string): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>(`/projects/${projectId}/tasks`)
    return response
  },

  /**
   * Get tasks assigned to a specific team member
   * @param userId User ID
   * @returns Promise that resolves to an array of tasks assigned to the specified user
   */
  getTasksByAssignee: async (userId: string): Promise<Task[]> => {
    const response = await apiClient.get<Task[]>(`/users/${userId}/tasks`)
    return response
  },

  /**
   * Get task priorities for filtering
   * @returns Promise that resolves to an array of priority options
   */
  getTaskPriorities: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/tasks/priorities')
    return response
  },

  /**
   * Get task statuses for filtering
   * @returns Promise that resolves to an array of status options
   */
  getTaskStatuses: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/tasks/statuses')
    return response
  },

  /**
   * Get task tags for filtering and input suggestions
   * @returns Promise that resolves to an array of common task tags
   */
  getTaskTags: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/tasks/tags')
    return response
  },

  /**
   * Create a new task
   * @param task Task data to create
   * @returns Promise that resolves to the created task
   */
  createTask: async (task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
    const response = await apiClient.post<Task>('/tasks', task)
    return response
  },

  /**
   * Update an existing task
   * @param id Task ID
   * @param updates Partial task data to update
   * @returns Promise that resolves to the updated task or null if not found
   */
  updateTask: async (id: string, updates: Partial<Task>): Promise<Task | null> => {
    try {
      const response = await apiClient.put<Task>(`/tasks/${id}`, updates)
      return response
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error && 
          (error as any).response?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Delete a task
   * @param id Task ID
   * @returns Promise that resolves to a boolean indicating success
   */
  deleteTask: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/tasks/${id}`)
      return true
    } catch (error) {
      return false
    }
  }
}

// Export the appropriate implementation based on configuration
export const {
  getTasks,
  getTaskById,
  getTasksByProject,
  getTasksByAssignee,
  getTaskPriorities,
  getTaskStatuses,
  getTaskTags,
  createTask,
  updateTask,
  deleteTask
} = createService<typeof realTaskService>(
  'tasks',
  mockTaskService,
  realTaskService
)
