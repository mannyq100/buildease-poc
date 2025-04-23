/**
 * Team Service
 * Provides methods for working with team member data
 */
import { TeamMember } from '@/types/team'
import apiClient from '@/lib/api-client'
import { createService } from './serviceFactory'
import * as mockTeamService from '@/data/mock/services/teamService'

// Real API implementation
const realTeamService = {
  /**
   * Get all team members
   * @returns Promise that resolves to an array of team members
   */
  getTeamMembers: async (): Promise<TeamMember[]> => {
    const response = await apiClient.get<TeamMember[]>('/team')
    return response
  },

  /**
   * Get a team member by ID
   * @param id Team member ID
   * @returns Promise that resolves to a team member or null if not found
   */
  getTeamMemberById: async (id: string | number): Promise<TeamMember | null> => {
    try {
      const response = await apiClient.get<TeamMember>(`/team/${id}`)
      return response
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Get all departments for filtering
   * @returns Promise that resolves to an array of department names
   */
  getDepartments: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/team/departments')
    return response
  },

  /**
   * Get all status options for filtering
   * @returns Promise that resolves to an array of status options
   */
  getStatusOptions: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/team/statuses')
    return response
  },

  /**
   * Get all projects for assignment
   * @returns Promise that resolves to an array of project names
   */
  getProjects: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/projects/names')
    return response
  },

  /**
   * Get team members with top performance
   * @param limit Maximum number of team members to return
   * @returns Promise that resolves to an array of top-performing team members
   */
  getTopPerformers: async (limit: number = 5): Promise<TeamMember[]> => {
    const response = await apiClient.get<TeamMember[]>(`/team/top-performers?limit=${limit}`)
    return response
  },

  /**
   * Create a new team member
   * @param member Team member data to create
   * @returns Promise that resolves to the created team member
   */
  createTeamMember: async (member: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
    const response = await apiClient.post<TeamMember>('/team', member)
    return response
  },

  /**
   * Update an existing team member
   * @param id Team member ID
   * @param updates Partial team member data to update
   * @returns Promise that resolves to the updated team member or null if not found
   */
  updateTeamMember: async (id: string | number, updates: Partial<TeamMember>): Promise<TeamMember | null> => {
    try {
      const response = await apiClient.put<TeamMember>(`/team/${id}`, updates)
      return response
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Delete a team member
   * @param id Team member ID
   * @returns Promise that resolves to a boolean indicating success
   */
  deleteTeamMember: async (id: string | number): Promise<boolean> => {
    try {
      await apiClient.delete(`/team/${id}`)
      return true
    } catch (error) {
      return false
    }
  }
}

// Export the appropriate implementation based on configuration
export const {
  getTeamMembers,
  getTeamMemberById,
  getDepartments,
  getStatusOptions,
  getProjects,
  getTopPerformers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
} = createService<typeof realTeamService>(
  'team',
  mockTeamService,
  realTeamService
)
