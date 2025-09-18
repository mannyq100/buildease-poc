/**
 * Project Service
 * Provides methods for working with project data
 */
import { Project } from '@/types/project'
import { PlanPhase } from '@/types/projectInputs'
import { supabase } from '@/lib/supabase'

/**
 * Get all projects
 * @returns Promise that resolves to an array of projects
 */
export const getProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }

  return data as Project[];
}

/**
 * Get a project by ID
 * @param id Project ID
 * @returns Promise that resolves to a project or null if not found
 */
export const getProjectById = async (id: string): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Not found
      return null;
    }
    console.error('Failed to fetch project by ID:', error);
    throw error;
  }

  return data as Project;
}

/**
 * Get project sample plan
 * @returns Promise that resolves to a sample project plan
 */
export const getProjectSamplePlan = async (): Promise<PlanPhase[]> => {
  // This might be a custom endpoint - for now return empty array
  // TODO: Implement proper sample plan fetching from database or external API
  console.warn('getProjectSamplePlan not implemented with Supabase');
  return [];
}

/**
 * Get project statuses for filtering
 * @returns Promise that resolves to an array of status options
 */
export const getProjectStatuses = async (): Promise<string[]> => {
  // Return common project statuses
  return ['active', 'planning', 'completed', 'on-hold', 'delayed'];
}

/**
 * Get project types for filtering
 * @returns Promise that resolves to an array of project types
 */
export const getProjectTypes = async (): Promise<string[]> => {
  // Return common project types
  return ['residential', 'commercial', 'industrial', 'renovation', 'new-construction', 'infrastructure'];
}

/**
 * Create a new project
 * @param project Project data to create
 * @returns Promise that resolves to the created project
 */
export const createProject = async (project: Omit<Project, 'id'>): Promise<Project> => {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();

  if (error) {
    console.error('Failed to create project:', error);
    throw error;
  }

  return data as Project;
}

/**
 * Update an existing project
 * @param id Project ID
 * @param updates Partial project data to update
 * @returns Promise that resolves to the updated project or null if not found
 */
export const updateProject = async (id: string, updates: Partial<Project>): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Not found
      return null;
    }
    console.error('Failed to update project:', error);
    throw error;
  }

  return data as Project;
}

/**
 * Update project profile image by setting media item category to 'profile'
 * The project_summary view will automatically provide the profile URLs via JOIN
 * @param projectId Project ID
 * @param mediaId Media item ID for the new profile image
 * @param mediaItem Media item data (not used, kept for compatibility)
 * @returns Promise that resolves to success status
 */
export const updateProjectProfileImage = async (
  projectId: string, 
  mediaId: string, 
  _mediaItem: { file_path: string; thumbnail_url?: string }
): Promise<{ success: boolean }> => {
  try {
    // Step 1: Reset any existing profile images for this project to their original category
    const { error: resetError } = await supabase
      .from('be_media_items')
      .update({ 
        category: 'inspiration', // Default fallback category for photos
        updated_at: new Date().toISOString()
      })
      .eq('project_id', projectId)
      .eq('category', 'profile')
      .eq('media_type', 'PHOTO');

    if (resetError) {
      console.error('Failed to reset existing profile images:', resetError);
      throw resetError;
    }

    // Step 2: Set the new media item as profile
    const { data, error } = await supabase
      .from('be_media_items')
      .update({ 
        category: 'profile',
        updated_at: new Date().toISOString()
      })
      .eq('id', mediaId)
      .eq('project_id', projectId) // Security: ensure media belongs to project
      .eq('media_type', 'PHOTO')   // Security: only photos can be profile images
      .select('id, category')
      .single();

    if (error) {
      console.error('Supabase error updating media item category:', error);
      throw error;
    }

    if (!data) {
      console.warn(`Media item ${mediaId} not found or not a photo in project ${projectId}`);
      return { success: false };
    }

    console.log(`Media ${mediaId} set as profile image for project ${projectId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error('Failed to update project profile image:', error);
    throw error;
  }
}

/**
 * Delete a project
 * @param id Project ID
 * @returns Promise that resolves to a boolean indicating success
 */
export const deleteProject = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Failed to delete project:', error);
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}
