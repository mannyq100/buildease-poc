/**
 * Project Service
 * Provides methods for working with project data
 */
import { Project } from '@/types/project'
import { PlanPhase } from '@/types/projectInputs'
import apiClient from '@/lib/api-client'
import { createService } from './serviceFactory'
import * as mockProjectService from '@/data/mock/services/projectService'

// Real API implementation
const realProjectService = {
  /**
   * Get all projects
   * @returns Promise that resolves to an array of projects
   */
  getProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/projects')
    return response
  },

  /**
   * Get a project by ID
   * @param id Project ID
   * @returns Promise that resolves to a project or null if not found
   */
  getProjectById: async (id: string): Promise<Project | null> => {
    try {
      const response = await apiClient.get<Project>(`/projects/${id}`)
      return response
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Get project sample plan
   * @returns Promise that resolves to a sample project plan
   */
  getProjectSamplePlan: async (): Promise<PlanPhase[]> => {
    const response = await apiClient.get<PlanPhase[]>('/projects/sample-plan')
    return response
  },

  /**
   * Get project statuses for filtering
   * @returns Promise that resolves to an array of status options
   */
  getProjectStatuses: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/projects/statuses')
    return response
  },

  /**
   * Get project types for filtering
   * @returns Promise that resolves to an array of project types
   */
  getProjectTypes: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/projects/types')
    return response
  },

  /**
   * Create a new project
   * @param project Project data to create
   * @returns Promise that resolves to the created project
   */
  createProject: async (project: Omit<Project, 'id'>): Promise<Project> => {
    const response = await apiClient.post<Project>('/projects', project)
    return response
  },

  /**
   * Update an existing project
   * @param id Project ID
   * @param updates Partial project data to update
   * @returns Promise that resolves to the updated project or null if not found
   */
  updateProject: async (id: string, updates: Partial<Project>): Promise<Project | null> => {
    try {
      const response = await apiClient.put<Project>(`/projects/${id}`, updates)
      return response
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Delete a project
   * @param id Project ID
   * @returns Promise that resolves to a boolean indicating success
   */
  deleteProject: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/projects/${id}`)
      return true
    } catch (error) {
      return false
    }
  }
}

// Export the appropriate implementation based on configuration
export const {
  getProjects,
  getProjectById,
  getProjectSamplePlan,
  getProjectStatuses,
  getProjectTypes,
  createProject,
  updateProject,
  deleteProject
} = createService<typeof realProjectService>(
  'projects',
  mockProjectService,
  realProjectService
)
