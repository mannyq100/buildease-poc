/**
 * Material Service
 * Provides methods for working with material and inventory data
 */
import { Material } from '@/types/material'
import { supabase } from '@/lib/supabase'

/**
 * Get all materials in inventory
 * @returns Promise that resolves to an array of materials
 */
export const getMaterials = async (): Promise<Material[]> => {
  const { data, error } = await supabase
    .from('be_material')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch materials:', error);
    throw error;
  }

  return data as Material[];
}

/**
 * Get a material by ID
 * @param id Material ID
 * @returns Promise that resolves to a material or null if not found
 */
export const getMaterialById = async (id: string): Promise<Material | null> => {
  const { data, error } = await supabase
    .from('be_material')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Failed to fetch material:', error);
    throw error;
  }

  return data as Material;
}

/**
 * Get materials for a specific project
 * @param projectId Project ID
 * @returns Promise that resolves to an array of materials allocated to the project
 */
export const getMaterialsByProject = async (projectId: string): Promise<Material[]> => {
  const { data, error } = await supabase
    .from('be_material')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch materials by project:', error);
    throw error;
  }

  return data as Material[];
}

/**
 * Create a new material in inventory
 * @param material Material data to create
 * @returns Promise that resolves to the created material
 */
export const createMaterial = async (material: Omit<Material, 'id'>): Promise<Material> => {
  const { data, error } = await supabase
    .from('be_material')
    .insert([material])
    .select()
    .single();

  if (error) {
    console.error('Failed to create material:', error);
    throw error;
  }

  return data as Material;
}

/**
 * Update an existing material
 * @param id Material ID
 * @param updates Partial material data to update
 * @returns Promise that resolves to the updated material or null if not found
 */
export const updateMaterial = async (id: string, updates: Partial<Material>): Promise<Material | null> => {
  const { data, error } = await supabase
    .from('be_material')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Failed to update material:', error);
    throw error;
  }

  return data as Material;
}

/**
 * Delete a material from inventory
 * @param id Material ID
 * @returns Promise that resolves to a boolean indicating success
 */
export const deleteMaterial = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('be_material')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete material:', error);
    return false;
  }

  return true;
}

/**
 * Search materials by name or category
 * @param query Search query
 * @returns Promise that resolves to an array of materials matching the search query
 */
export const searchMaterials = async (query: string): Promise<Material[]> => {
  const { data, error } = await supabase
    .from('be_material')
    .select('*')
    .or(`name.ilike.%${query}%,category.ilike.%${query}%,supplier.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to search materials:', error);
    throw error;
  }

  return data as Material[];
}
