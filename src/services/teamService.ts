/**
 * Team Service
 * Provides methods for working with team member data
 */
import { TeamMember } from '@/types/team'
import { teamData, DEPARTMENTS, STATUS_OPTIONS, PROJECTS } from '@/data/mock/team/teamData'

/**
 * Get all team members
 * @returns Promise that resolves to an array of team members
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  // In a real app, this would be an API call
  return Promise.resolve(teamData)
}

/**
 * Get a team member by ID
 * @param id Team member ID
 * @returns Promise that resolves to a team member or null if not found
 */
export async function getTeamMemberById(id: string | number): Promise<TeamMember | null> {
  // In a real app, this would be an API call
  const member = teamData.find(m => String(m.id) === String(id))
  return Promise.resolve(member || null)
}

/**
 * Get all departments for filtering
 * @returns Promise that resolves to an array of department names
 */
export async function getDepartments(): Promise<string[]> {
  return Promise.resolve(DEPARTMENTS)
}

/**
 * Get all status options for filtering
 * @returns Promise that resolves to an array of status options
 */
export async function getStatusOptions(): Promise<string[]> {
  return Promise.resolve(STATUS_OPTIONS)
}

/**
 * Get all projects for assignment
 * @returns Promise that resolves to an array of project names
 */
export async function getProjects(): Promise<string[]> {
  return Promise.resolve(PROJECTS)
}

/**
 * Create a new team member
 * @param member Team member data
 * @returns Promise that resolves to the created team member
 */
export async function createTeamMember(member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
  // In a real app, this would be an API call
  const newMember: TeamMember = {
    ...member,
    id: teamData.length + 1,
  }
  
  // This is just for mock purposes
  // In a real app, this would be persisted to a database
  return Promise.resolve(newMember)
}

/**
 * Update a team member
 * @param id Team member ID
 * @param updates Partial team member data to update
 * @returns Promise that resolves to the updated team member
 */
export async function updateTeamMember(
  id: string | number, 
  updates: Partial<TeamMember>
): Promise<TeamMember | null> {
  // In a real app, this would be an API call
  const memberIndex = teamData.findIndex(m => String(m.id) === String(id))
  
  if (memberIndex === -1) {
    return Promise.resolve(null)
  }
  
  const updatedMember: TeamMember = {
    ...teamData[memberIndex],
    ...updates,
  }
  
  // This is just for mock purposes
  // In a real app, this would be persisted to a database
  return Promise.resolve(updatedMember)
}

/**
 * Delete a team member
 * @param id Team member ID
 * @returns Promise that resolves to a boolean indicating success
 */
export async function deleteTeamMember(id: string | number): Promise<boolean> {
  // In a real app, this would be an API call
  const memberIndex = teamData.findIndex(m => String(m.id) === String(id))
  
  if (memberIndex === -1) {
    return Promise.resolve(false)
  }
  
  // This is just for mock purposes
  // In a real app, this would be persisted to a database
  return Promise.resolve(true)
}
