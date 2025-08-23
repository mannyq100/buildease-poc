import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import * as activityService from '@/services/activityService';
import { logActivity } from '@/utils/activityLogging';
import { useProjectStore } from '@/stores/projectStore';

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
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);

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
    // Optimistic update - show team member immediately
    onMutate: async (variables) => {
      const queryKey = ['team', variables.project_id];
      const optimisticId = `temp_member_${Date.now()}`;
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousMembers = queryClient.getQueryData<TeamMember[]>(queryKey) || [];
      
      // Create optimistic team member
      const optimisticMember: TeamMember = {
        id: optimisticId,
        project_id: variables.project_id,
        user_id: undefined,
        name: variables.name,
        role: variables.role,
        email: variables.email,
        phone: variables.phone,
        status: variables.status || 'pending',
        avatar: variables.avatar,
        joined_at: new Date().toISOString()
      };
      
      // Optimistically update team members list
      queryClient.setQueryData<TeamMember[]>(queryKey, (old = []) => [
        optimisticMember,
        ...old
      ]);

      // Track optimistic update
      addOptimisticUpdate(`create_member_${optimisticId}`, {
        type: 'create',
        entity: 'team_member',
        data: optimisticMember,
        timestamp: Date.now()
      });
      
      return { previousMembers, optimisticMember, optimisticId };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousMembers) {
        const queryKey = ['team', variables.project_id];
        queryClient.setQueryData(queryKey, context.previousMembers);
      }
      
      console.error('Error creating team member:', error);
      toast.error(`Failed to add team member: ${error.message}`);
    },
    onSuccess: async (newMember, variables, context) => {
      console.log('[ACTIVITY_DEBUG] [useCreateTeamMember] onSuccess called', {
        memberId: newMember.id,
        memberName: variables.name,
        memberRole: variables.role,
        projectId: variables.project_id,
        timestamp: new Date().toISOString()
      });

      // Replace optimistic member with real server data
      const queryKey = ['team', variables.project_id];
      queryClient.setQueryData<TeamMember[]>(queryKey, (old = []) => 
        old.map(member => member.id === context?.optimisticId ? newMember : member)
      );

      // Remove optimistic update tracking
      const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
      removeOptimisticUpdate(`create_member_${context?.optimisticId}`);
      
      // Invalidate project queries for other components
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(variables.project_id) 
      });

      // CRITICAL: Invalidate consolidated project query for real-time updates
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', variables.project_id]
      });
      
      // Fire-and-forget activity logging with standardized utilities
      (async () => {
        try {
          await logActivity({
            projectId: variables.project_id,
            activityType: 'team_member_add',
            entityType: 'team_member',
            entityId: newMember.id,
            entityName: variables.name,
            metadata: {
              memberName: variables.name,
              role: variables.role,
              status: variables.status || 'active',
              email: variables.email,
              phone: variables.phone
            }
          });
        } catch (e) {
          console.error('Failed to log team member creation activity:', e);
        }
      })();
      
      toast.success('Team member added successfully');
    }
  });
}

/**
 * Hook to update a team member
 */
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);

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
    // Optimistic update - show changes immediately
    onMutate: async (variables) => {
      const memberId = variables.id;
      const projectId = (variables as any).project_id;
      
      // We need to find which project this member belongs to if not provided
      if (!projectId) {
        // Search through team query caches to find the member
        const queryCache = queryClient.getQueryCache();
        let foundProjectId: string | null = null;
        
        for (const query of queryCache.getAll()) {
          if (query.queryKey[0] === 'team' && Array.isArray(query.state.data)) {
            const members = query.state.data as TeamMember[];
            const targetMember = members.find((member: TeamMember) => member.id === memberId);
            if (targetMember) {
              foundProjectId = targetMember.project_id;
              break;
            }
          }
        }
        
        if (!foundProjectId) {
          return { previousMembers: undefined, projectId: null };
        }
        (variables as any).project_id = foundProjectId;
      }

      const queryKey = ['team', projectId || (variables as any).project_id];
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousMembers = queryClient.getQueryData<TeamMember[]>(queryKey) || [];
      
      // Find and update the member optimistically
      const memberToUpdate = previousMembers.find(member => member.id === memberId);
      if (memberToUpdate) {
        const updatedMember = { ...memberToUpdate, ...variables };
        
        queryClient.setQueryData<TeamMember[]>(queryKey, (old = []) => 
          old.map(member => member.id === memberId ? updatedMember : member)
        );

        // Track optimistic update
        addOptimisticUpdate(`update_member_${memberId}`, {
          type: 'update',
          entity: 'team_member',
          data: updatedMember,
          originalData: memberToUpdate,
          timestamp: Date.now()
        });

        return { previousMembers, projectId: projectId || (variables as any).project_id, memberId };
      }
      
      return { previousMembers, projectId: null, memberId };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousMembers && context?.projectId) {
        const queryKey = ['team', context.projectId];
        queryClient.setQueryData(queryKey, context.previousMembers);
      }
      
      console.error('Error updating team member:', error);
      toast.error(`Failed to update team member: ${error.message}`);
    },
    onSuccess: async (updatedMember, variables, context) => {
      const projectId = (variables as any).project_id || updatedMember.project_id;
      
      console.log('[ACTIVITY_DEBUG] [useUpdateTeamMember] onSuccess called', {
        memberId: updatedMember.id,
        memberName: updatedMember.name,
        projectId,
        updates: variables,
        timestamp: new Date().toISOString()
      });

      // Update cached member with real server data
      if (projectId) {
        const queryKey = ['team', projectId];
        queryClient.setQueryData<TeamMember[]>(queryKey, (old = []) => 
          old.map(member => member.id === updatedMember.id ? updatedMember : member)
        );
      }

      // Remove optimistic update tracking
      const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
      removeOptimisticUpdate(`update_member_${updatedMember.id}`);
      
      if (projectId) {
        // Invalidate project queries for other components
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.projects.detail(projectId) 
        });

        // CRITICAL: Invalidate consolidated project query for real-time updates
        queryClient.invalidateQueries({
          queryKey: ['project-consolidated', projectId]
        });
      }
      
      // Fire-and-forget activity logging with standardized utilities
      (async () => {
        try {
          if (!projectId) {
            console.warn('No projectId available for activity logging');
            return;
          }
          
          await logActivity({
            projectId,
            activityType: 'team_member_update',
            entityType: 'team_member',
            entityId: updatedMember.id,
            entityName: updatedMember.name,
            metadata: {
              memberName: updatedMember.name,
              role: updatedMember.role,
              status: updatedMember.status,
              updates: variables
            }
          });
        } catch (e) {
          console.error('Failed to log team member update activity:', e);
        }
      })();
      
      toast.success('Team member updated successfully');
    }
  });
}

/**
 * Hook to delete a team member
 */
export function useDeleteTeamMember() {
  const queryClient = useQueryClient();
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);

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
    // Optimistic update - remove member immediately
    onMutate: async ({ memberId, projectId }) => {
      const queryKey = ['team', projectId];
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousMembers = queryClient.getQueryData<TeamMember[]>(queryKey) || [];
      
      // Find the member to delete
      const memberToDelete = previousMembers.find(member => member.id === memberId);
      
      // Optimistically remove the member
      queryClient.setQueryData<TeamMember[]>(queryKey, (old = []) => 
        old.filter(member => member.id !== memberId)
      );

      // Track optimistic update
      if (memberToDelete) {
        addOptimisticUpdate(`delete_member_${memberId}`, {
          type: 'delete',
          entity: 'team_member',
          data: memberToDelete,
          timestamp: Date.now()
        });
      }
      
      return { previousMembers, memberToDelete, memberId, projectId };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousMembers) {
        const queryKey = ['team', variables.projectId];
        queryClient.setQueryData(queryKey, context.previousMembers);
      }
      
      console.error('Error deleting team member:', error);
      toast.error(`Failed to remove team member: ${error.message}`);
    },
    onSuccess: async (result, variables, context) => {
      console.log('[ACTIVITY_DEBUG] [useDeleteTeamMember] onSuccess called', {
        memberId: result.memberId,
        projectId: result.projectId,
        timestamp: new Date().toISOString()
      });

      // Ensure member is removed from cache (should already be done optimistically)
      const queryKey = ['team', result.projectId];
      queryClient.setQueryData<TeamMember[]>(queryKey, (old = []) => 
        old.filter(member => member.id !== result.memberId)
      );

      // Remove optimistic update tracking
      const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
      removeOptimisticUpdate(`delete_member_${result.memberId}`);
      
      // Invalidate project queries for other components
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(result.projectId) 
      });

      // CRITICAL: Invalidate consolidated project query for real-time updates
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', result.projectId]
      });
      
      // Fire-and-forget activity logging with standardized utilities
      (async () => {
        try {
          await logActivity({
            projectId: result.projectId,
            activityType: 'team_member_remove',
            entityType: 'team_member',
            entityId: result.memberId,
            entityName: 'Team Member',
            metadata: { memberId: result.memberId }
          });
        } catch (e) {
          console.error('Failed to log team member deletion activity:', e);
        }
      })();
      
      
      toast.success('Team member removed successfully');
    }
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
