/**
 * Mock Team Service
 * Provides mock implementations of team-related services
 */
import { TeamMember } from '@/types/team';
import teamData from '../json/team.json';

/**
 * Get all team members
 * @returns Promise that resolves to an array of team members
 */
export async function getTeamMembers(): Promise<TeamMember[]> {
  return Promise.resolve(teamData.members);
}

/**
 * Get a team member by ID
 * @param id Team member ID
 * @returns Promise that resolves to a team member or null if not found
 */
export async function getTeamMemberById(id: string | number): Promise<TeamMember | null> {
  const member = teamData.members.find(m => String(m.id) === String(id));
  return Promise.resolve(member || null);
}

/**
 * Get all team departments
 * @returns Promise that resolves to an array of department names
 */
export async function getDepartments(): Promise<string[]> {
  return Promise.resolve(teamData.departments);
}

/**
 * Get all status options for team filtering
 * @returns Promise that resolves to an array of status options
 */
export async function getStatusOptions(): Promise<string[]> {
  return Promise.resolve(teamData.statusOptions);
}

/**
 * Get projects for team assignment
 * @returns Promise that resolves to an array of project names
 */
export async function getProjects(): Promise<string[]> {
  return Promise.resolve(teamData.projects);
}

/**
 * Get team members with top performance
 * @param limit Maximum number of team members to return
 * @returns Promise that resolves to an array of top-performing team members
 */
export async function getTopPerformers(limit: number = 5): Promise<TeamMember[]> {
  const sorted = [...teamData.members]
    .filter(member => member.isTopPerformer)
    .sort((a, b) => b.performance - a.performance)
    .slice(0, limit);
  
  return Promise.resolve(sorted);
}

/**
 * Create a new team member
 * @param member Team member data to create
 * @returns Promise that resolves to the created team member
 */
export async function createTeamMember(member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
  // In a real implementation, this would make an API call
  // For mock, we just return a new member with a generated ID
  const newMember = {
    ...member,
    id: Math.max(...teamData.members.map(m => Number(m.id))) + 1
  };
  
  return Promise.resolve(newMember as TeamMember);
}

/**
 * Update an existing team member
 * @param id Team member ID
 * @param updates Partial team member data to update
 * @returns Promise that resolves to the updated team member or null if not found
 */
export async function updateTeamMember(id: string | number, updates: Partial<TeamMember>): Promise<TeamMember | null> {
  const memberIndex = teamData.members.findIndex(m => String(m.id) === String(id));
  
  if (memberIndex === -1) {
    return Promise.resolve(null);
  }
  
  // In a real implementation, this would make an API call
  // For mock, we just return the updated member
  const updatedMember = {
    ...teamData.members[memberIndex],
    ...updates,
    id: teamData.members[memberIndex].id // Ensure ID doesn't change
  };
  
  return Promise.resolve(updatedMember as TeamMember);
}

/**
 * Delete a team member
 * @param id Team member ID
 * @returns Promise that resolves to a boolean indicating success
 */
export async function deleteTeamMember(id: string | number): Promise<boolean> {
  const memberExists = teamData.members.some(m => String(m.id) === String(id));
  return Promise.resolve(memberExists);
}
