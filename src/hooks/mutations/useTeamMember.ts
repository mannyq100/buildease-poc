import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';

// Types for team member mutations
export interface TeamMember {
  id?: string;
  project_id: string;
  user_id?: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  joined_at?: string;
}

export interface CreateTeamMemberData {
  project_id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'pending';
  avatar?: string;
}

export interface UpdateTeamMemberData {
  id: string;
  name?: string;
  role?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'pending';
  avatar?: string;
}

/**
 * Hook to create a new team member
 */
export function useCreateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTeamMemberData) => {
      // For now, we'll create a project member record without linking to a user
      // In a full implementation, you'd want to either:
      // 1. Create a user account and link it
      // 2. Store as a project contact/member without user account
      
      const { data: member, error } = await supabase
        .from('be_project_member')
        .insert([{
          project_id: data.project_id,
          user_id: null, // Will be null for non-registered members
          role: data.role,
          // Store additional info in a JSONB details field if available
          // For now, we'll use a workaround by creating a contact record
        }])
        .select()
        .single();

      if (error) {
        // If direct project_member insertion fails due to user_id constraint,
        // we'll store team member info in project details JSONB
        const { data: project } = await supabase
          .from('be_project')
          .select('details')
          .eq('id', data.project_id)
          .single();

        const currentDetails = project?.details || {};
        const teamMembers = currentDetails.team_members || [];
        
        const newMember = {
          id: crypto.randomUUID(),
          ...data,
          joined_at: new Date().toISOString()
        };

        teamMembers.push(newMember);

        const { data: updatedProject, error: updateError } = await supabase
          .from('be_project')
          .update({
            details: {
              ...currentDetails,
              team_members: teamMembers
            }
          })
          .eq('id', data.project_id)
          .select()
          .single();

        if (updateError) throw updateError;
        return newMember;
      }

      return member;
    },
    onSuccess: (newMember, variables) => {
      // Invalidate project queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(variables.project_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['team', variables.project_id] 
      });
      
      toast.success('Team member added successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to add team member: ${error.message}`);
    },
  });
}

/**
 * Hook to update a team member
 */
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTeamMemberData) => {
      const { id, ...updateData } = data;
      
      // Try to find the team member in project_member table first
      const { data: existingMember } = await supabase
        .from('be_project_member')
        .select('project_id')
        .eq('id', id)
        .single();

      if (existingMember) {
        // Update in project_member table
        const { data: member, error } = await supabase
          .from('be_project_member')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return member;
      } else {
        // Update in project details JSONB
        // We need to get the project_id from the member data
        // For simplicity, we'll require project_id to be passed in updateData
        const projectId = (updateData as any).project_id;
        if (!projectId) throw new Error('Project ID required for team member update');

        const { data: project } = await supabase
          .from('be_project')
          .select('details')
          .eq('id', projectId)
          .single();

        const currentDetails = project?.details || {};
        const teamMembers = currentDetails.team_members || [];
        
        const memberIndex = teamMembers.findIndex((member: any) => member.id === id);
        if (memberIndex === -1) throw new Error('Team member not found');

        teamMembers[memberIndex] = { ...teamMembers[memberIndex], ...updateData };

        const { data: updatedProject, error: updateError } = await supabase
          .from('be_project')
          .update({
            details: {
              ...currentDetails,
              team_members: teamMembers
            }
          })
          .eq('id', projectId)
          .select()
          .single();

        if (updateError) throw updateError;
        return teamMembers[memberIndex];
      }
    },
    onSuccess: (updatedMember, variables) => {
      const projectId = (variables as any).project_id || updatedMember.project_id;
      if (projectId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.projects.detail(projectId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['team', projectId] 
        });
      }
      
      toast.success('Team member updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update team member: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a team member
 */
export function useDeleteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, projectId }: { memberId: string; projectId: string }) => {
      // Try to delete from project_member table first
      const { error: deleteError } = await supabase
        .from('be_project_member')
        .delete()
        .eq('id', memberId);

      if (deleteError) {
        // If not found in project_member, remove from project details JSONB
        const { data: project } = await supabase
          .from('be_project')
          .select('details')
          .eq('id', projectId)
          .single();

        const currentDetails = project?.details || {};
        const teamMembers = currentDetails.team_members || [];
        
        const filteredMembers = teamMembers.filter((member: any) => member.id !== memberId);

        const { error: updateError } = await supabase
          .from('be_project')
          .update({
            details: {
              ...currentDetails,
              team_members: filteredMembers
            }
          })
          .eq('id', projectId);

        if (updateError) throw updateError;
      }

      return { memberId, projectId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(result.projectId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['team', result.projectId] 
      });
      
      toast.success('Team member removed successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to remove team member: ${error.message}`);
    },
  });
}

/**
 * Hook to get team members for a project
 */
export function useProjectTeamMembers(projectId: string) {
  return {
    queryKey: ['team', projectId],
    queryFn: async () => {
      // Get team members from both project_member table and project details
      const [projectMembersResult, projectDetailsResult] = await Promise.all([
        supabase
          .from('be_project_member')
          .select(`
            *,
            user:be_user!be_project_member(
              id,
              first_name,
              last_name,
              email,
              phone,
              settings
            )
          `)
          .eq('project_id', projectId),
        
        supabase
          .from('be_project')
          .select('details')
          .eq('id', projectId)
          .single()
      ]);

      const registeredMembers = projectMembersResult.data?.map(member => ({
        id: member.id,
        project_id: member.project_id,
        user_id: member.user_id,
        name: member.user ? `${member.user.first_name} ${member.user.last_name}`.trim() : 'Unknown User',
        role: member.role,
        email: member.user?.email,
        phone: member.user?.phone,
        status: 'active' as const,
        avatar: member.user?.settings?.picture_url,
        joined_at: member.joined_at
      })) || [];

      const detailsMembers = projectDetailsResult.data?.details?.team_members || [];

      // Combine both sources
      return [...registeredMembers, ...detailsMembers];
    }
  };
}
