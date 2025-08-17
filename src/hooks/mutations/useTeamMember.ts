import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import * as activityService from '@/services/activityService';

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
    onSuccess: async (newMember, variables) => {
      console.log('[ACTIVITY_DEBUG] [useCreateTeamMember] onSuccess called', {
        memberId: newMember.id,
        memberName: variables.name,
        memberRole: variables.role,
        projectId: variables.project_id,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate project queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(variables.project_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['team', variables.project_id] 
      });
      
      // Fire-and-forget activity logging with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] [useCreateTeamMember] Starting activity logging for team member creation');
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] [useCreateTeamMember] Fetching auth user');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useCreateTeamMember] Auth error:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] [useCreateTeamMember] Auth user fetched successfully', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          console.log('[ACTIVITY_DEBUG] [useCreateTeamMember] Calling activityService.createActivity', {
            project_id: variables.project_id,
            activity_type: 'team_member_add',
            title: `Team member added: ${variables.name}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'team_member',
            entity_id: newMember.id
          });
          
          const result = await activityService.createActivity({
            project_id: variables.project_id,
            activity_type: 'team_member_add',
            title: `Team member added: ${variables.name}`,
            description: `${variables.name} joined as ${variables.role}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'team_member',
            entity_id: newMember.id,
            metadata: {
              memberName: variables.name,
              role: variables.role,
              status: variables.status || 'active',
              email: variables.email,
              phone: variables.phone
            },
            status: 'success'
          });
          
          console.log('[ACTIVITY_DEBUG] [useCreateTeamMember] Activity created successfully', {
            success: !!result,
            activityId: result?.id,
            result
          });
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useCreateTeamMember] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            memberId: newMember.id,
            memberName: variables.name,
            projectId: variables.project_id,
            timestamp: new Date().toISOString()
          });
        }
      })();
      
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
    onSuccess: async (updatedMember, variables) => {
      const projectId = (variables as any).project_id || updatedMember.project_id;
      
      console.log('[ACTIVITY_DEBUG] [useUpdateTeamMember] onSuccess called', {
        memberId: updatedMember.id,
        memberName: updatedMember.name,
        projectId,
        updates: variables,
        timestamp: new Date().toISOString()
      });
      
      if (projectId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.projects.detail(projectId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['team', projectId] 
        });
      }
      
      // Fire-and-forget activity logging with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] [useUpdateTeamMember] Starting activity logging for team member update');
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] [useUpdateTeamMember] Fetching auth user');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useUpdateTeamMember] Auth error:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] [useUpdateTeamMember] Auth user fetched successfully', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
          if (!projectId) {
            console.warn('[ACTIVITY_DEBUG] [useUpdateTeamMember] No projectId available for activity logging');
            return;
          }
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          console.log('[ACTIVITY_DEBUG] [useUpdateTeamMember] Calling activityService.createActivity', {
            project_id: projectId,
            activity_type: 'team_member_update',
            title: `Team member updated: ${updatedMember.name}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'team_member',
            entity_id: updatedMember.id
          });
          
          const result = await activityService.createActivity({
            project_id: projectId,
            activity_type: 'team_member_update',
            title: `Team member updated: ${updatedMember.name}`,
            description: `Team member information was updated`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'team_member',
            entity_id: updatedMember.id,
            metadata: {
              memberName: updatedMember.name,
              role: updatedMember.role,
              status: updatedMember.status,
              updates: variables
            },
            status: 'info'
          });
          
          console.log('[ACTIVITY_DEBUG] [useUpdateTeamMember] Activity created successfully', {
            success: !!result,
            activityId: result?.id,
            result
          });
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useUpdateTeamMember] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            memberId: updatedMember.id,
            memberName: updatedMember.name,
            projectId,
            timestamp: new Date().toISOString()
          });
        }
      })();
      
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
    onSuccess: async (result, variables) => {
      console.log('[ACTIVITY_DEBUG] [useDeleteTeamMember] onSuccess called', {
        memberId: result.memberId,
        projectId: result.projectId,
        timestamp: new Date().toISOString()
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(result.projectId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['team', result.projectId] 
      });
      
      // Fire-and-forget activity logging with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] [useDeleteTeamMember] Starting activity logging for team member deletion');
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] [useDeleteTeamMember] Fetching auth user');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useDeleteTeamMember] Auth error:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] [useDeleteTeamMember] Auth user fetched successfully', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          console.log('[ACTIVITY_DEBUG] [useDeleteTeamMember] Calling activityService.createActivity', {
            project_id: result.projectId,
            activity_type: 'team_member_remove',
            title: `Team member removed: ${result.memberId}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'team_member',
            entity_id: result.memberId
          });
          
          const activityResult = await activityService.createActivity({
            project_id: result.projectId,
            activity_type: 'team_member_remove',
            title: `Team member removed: ${result.memberId}`,
            description: 'Team member was removed from the project',
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'team_member',
            entity_id: result.memberId,
            metadata: { memberId: result.memberId },
            status: 'warning'
          });
          
          console.log('[ACTIVITY_DEBUG] [useDeleteTeamMember] Activity created successfully', {
            success: !!activityResult,
            activityId: activityResult?.id,
            result: activityResult
          });
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useDeleteTeamMember] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            memberId: result.memberId,
            projectId: result.projectId,
            timestamp: new Date().toISOString()
          });
        }
      })();
      
      
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
            user:be_user!user_id(
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

      const registeredMembers = projectMembersResult.data
        ?.filter(member => member.user_id && member.user) // Only include members with valid user data
        ?.map(member => ({
          id: member.user_id, // Use user_id for task assignment, not project_member.id
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

      // Filter detailsMembers to only include those with valid user_id (excluding non-registered members)
      const validDetailsMembers = detailsMembers.filter((member: any) => 
        member.user_id && typeof member.user_id === 'string' && 
        member.user_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
      );

      // Combine both sources - prioritize registered members
      return [...registeredMembers, ...validDetailsMembers];
    }
  };
}
