/**
 * Team Service
 * Provides methods for working with team member data
 */
import { TeamMember } from '@/types/team'
import { supabase } from '@/lib/supabase'

/**
 * Get all team members
 * @returns Promise that resolves to an array of team members
 */
export const getTeamMembers = async (): Promise<TeamMember[]> => {
  const { data, error } = await supabase
    .from('be_project_member')
    .select(`
      *,
      user:be_user(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch team members:', error);
    throw error;
  }

  // Transform the data to match TeamMember interface
  const teamMembers = data?.map((member: {
    user_id: string;
    role: string;
    project_id: string;
    created_at: string;
    user?: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      status: string;
      phone?: string;
      settings?: { picture_url?: string };
    };
  }) => ({
    id: member.user?.id || member.user_id,
    name: `${member.user?.first_name || ''} ${member.user?.last_name || ''}`.trim(),
    email: member.user?.email || '',
    role: member.role,
    department: member.role, // Using role as department for now
    status: member.user?.status || 'ACTIVE',
    avatar: member.user?.settings?.picture_url,
    phone: member.user?.phone,
    project_id: member.project_id,
    joinDate: member.created_at,
    availability: 'AVAILABLE' // Default availability
  })) || [];

  return teamMembers;
}

/**
 * Get a team member by ID
 * @param id Team member ID
 * @returns Promise that resolves to a team member or null if not found
 */
export const getTeamMemberById = async (id: string | number): Promise<TeamMember | null> => {
  const { data, error } = await supabase
    .from('be_project_member')
    .select(`
      *,
      user:be_user(*)
    `)
    .eq('user_id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Failed to fetch team member:', error);
    throw error;
  }

  if (!data) return null;

  return {
    id: data.user?.id || data.user_id,
    name: `${data.user?.first_name || ''} ${data.user?.last_name || ''}`.trim(),
    email: data.user?.email || '',
    role: data.role,
    department: data.role,
    status: (data.user?.status as any) || 'ACTIVE',
    avatar: data.user?.settings?.picture_url,
    phone: data.user?.phone,
    project_id: data.project_id,
    joinDate: data.created_at,
    availability: 'AVAILABLE'
  };
}

/**
 * Get team members by role
 * @param role Team member role
 * @returns Promise that resolves to an array of team members with the specified role
 */
export const getTeamMembersByRole = async (role: string): Promise<TeamMember[]> => {
  const { data, error } = await supabase
    .from('be_team_members')
    .select('*')
    .eq('role', role)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch team members by role:', error);
    throw error;
  }

  return data as TeamMember[];
}

/**
 * Get team members by department
 * @param department Team member department
 * @returns Promise that resolves to an array of team members in the specified department
 */
export const getTeamMembersByDepartment = async (department: string): Promise<TeamMember[]> => {
  const { data, error } = await supabase
    .from('be_team_members')
    .select('*')
    .eq('department', department)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch team members by department:', error);
    throw error;
  }

  return data as TeamMember[];
}

/**
 * Search team members
 * @param query Search query
 * @returns Promise that resolves to an array of team members matching the search query
 */
export const searchTeamMembers = async (query: string): Promise<TeamMember[]> => {
  const { data, error } = await supabase
    .from('be_team_members')
    .select('*')
    .or(`name.ilike.%${query}%,email.ilike.%${query}%,role.ilike.%${query}%,department.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to search team members:', error);
    throw error;
  }

  return data as TeamMember[];
}

/**
 * Create a new team member
 * @param member Team member data
 * @returns Promise that resolves to the created team member
 */
export const createTeamMember = async (member: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
  const { data, error } = await supabase
    .from('be_team_members')
    .insert([member])
    .select()
    .single();

  if (error) {
    console.error('Failed to create team member:', error);
    throw error;
  }

  return data as TeamMember;
}

/**
 * Update a team member
 * @param id Team member ID
 * @param member Updated team member data
 * @returns Promise that resolves to the updated team member
 */
export const updateTeamMember = async (id: string | number, member: Partial<TeamMember>): Promise<TeamMember> => {
  const { data, error } = await supabase
    .from('be_team_members')
    .update(member)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update team member:', error);
    throw error;
  }

  return data as TeamMember;
}

/**
 * Delete a team member
 * @param id Team member ID
 * @returns Promise that resolves when the team member is deleted
 */
export const deleteTeamMember = async (id: string | number): Promise<void> => {
  const { error } = await supabase
    .from('be_team_members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete team member:', error);
    throw error;
  }
}
