/**
 * Team Service
 * Loads and provides team data from JSON
 */
import teamData from './json/team.json'
import { TeamMember } from '@/types/team'

// Type assertion for JSON data to ensure proper typing
interface TeamDataJson {
  departments: string[]
  statusOptions: string[]
  teamMembers: Array<Omit<TeamMember, 'status'> & { status: string }>
  projects: string[]
}

// Cast the imported JSON to our interface
const typedTeamData = teamData as TeamDataJson

/**
 * Get all departments
 * @returns Array of department names
 */
export function getDepartments(): string[] {
  return typedTeamData.departments
}

/**
 * Get all status options
 * @returns Array of status options
 */
export function getStatusOptions(): string[] {
  return typedTeamData.statusOptions
}

/**
 * Get all team members
 * @returns Array of team members
 */
export function getTeamMembers(): TeamMember[] {
  // Convert the status string to the proper union type
  return typedTeamData.teamMembers.map(member => ({
    ...member,
    status: member.status as 'active' | 'inactive'
  }))
}

/**
 * Get all projects
 * @returns Array of project names
 */
export function getProjects(): string[] {
  return typedTeamData.projects
}

/**
 * Get team members by department
 * @param department Department name to filter by
 * @returns Filtered array of team members
 */
export function getTeamMembersByDepartment(department: string): TeamMember[] {
  if (department === 'All') {
    return getTeamMembers()
  }
  
  return getTeamMembers().filter(member => member.department === department)
}

/**
 * Get team members by status
 * @param status Status to filter by
 * @returns Filtered array of team members
 */
export function getTeamMembersByStatus(status: string): TeamMember[] {
  if (status === 'All') {
    return getTeamMembers()
  }
  
  return getTeamMembers().filter(member => 
    member.status.toLowerCase() === status.toLowerCase()
  )
}

/**
 * Get team members by project
 * @param project Project name to filter by
 * @returns Filtered array of team members
 */
export function getTeamMembersByProject(project: string): TeamMember[] {
  return getTeamMembers().filter(member => 
    member.projects.includes(project)
  )
}

/**
 * Get team member by ID
 * @param id Team member ID
 * @returns Team member object or undefined if not found
 */
export function getTeamMemberById(id: number): TeamMember | undefined {
  return getTeamMembers().find(member => member.id === id)
}
