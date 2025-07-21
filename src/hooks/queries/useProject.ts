/**
 * Project query hooks for BuildEase construction management
 * Handles fetching project data from Supabase with mobile-first optimization
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';

/**
 * Hook to fetch a single project by ID
 * Returns project with all details including JSONB fields
 */
export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('be_project')
        .select(`
          id,
          name,
          description,
          status,
          details,
          timeline,
          budget,
          owner_id,
          profile_image,
          inspiration_images,
          created_at,
          updated_at
        `)
        .eq('id', projectId)
        .single();
      
      if (error) {
        console.error('Error fetching project:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes - project details change less frequently
  });
};

/**
 * Hook to fetch all projects for the current user
 * Includes projects owned by user and projects they're members of
 */
export const useUserProjects = () => {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('be_project')
        .select(`
          id,
          name,
          description,
          status,
          details,
          timeline,
          budget,
          profile_image,
          created_at,
          updated_at
        `)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user projects:', error);
        throw error;
      }
      
      return data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute - project list may change more frequently
  });
};

/**
 * Hook to fetch project members with their roles
 */
export const useProjectMembers = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.projects.members(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('be_project_member')
        .select(`
          project_id,
          user_id,
          role,
          joined_at,
          be_user:user_id (
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('project_id', projectId);
      
      if (error) {
        console.error('Error fetching project members:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes - team changes less frequently
  });
};
