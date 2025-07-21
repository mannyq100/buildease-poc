/**
 * Material query hooks for BuildEase construction management
 * Handles fetching material and inventory data from Supabase
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';

/**
 * Hook to fetch all materials for a specific project
 * Returns materials with supplier information
 */
export const useProjectMaterials = (projectId: string) => {
  return useQuery({
    queryKey: queryKeys.materials.byProject(projectId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('be_material')
        .select(`
          id,
          name,
          description,
          category,
          unit,
          project_id,
          specs,
          currency,
          current_quantity,
          min_required_quantity,
          unit_price,
          supplier_id,
          supplier_info,
          last_ordered,
          lead_time_days,
          created_at,
          updated_at,
          supplier:supplier_id (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('project_id', projectId)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching project materials:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes - materials change less frequently
  });
};

/**
 * Hook to fetch a single material by ID
 * Returns detailed material information
 */
export const useMaterial = (materialId: string) => {
  return useQuery({
    queryKey: queryKeys.materials.detail(materialId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('be_material')
        .select(`
          id,
          name,
          description,
          category,
          unit,
          project_id,
          specs,
          currency,
          current_quantity,
          min_required_quantity,
          unit_price,
          supplier_id,
          supplier_info,
          last_ordered,
          lead_time_days,
          created_at,
          updated_at,
          supplier:supplier_id (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('id', materialId)
        .single();
      
      if (error) {
        console.error('Error fetching material:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!materialId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch materials that are low in stock
 * Returns materials where current_quantity < min_required_quantity
 */
export const useLowStockMaterials = (projectId: string) => {
  return useQuery({
    queryKey: [...queryKeys.materials.byProject(projectId), 'low-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('be_material')
        .select(`
          id,
          name,
          description,
          category,
          unit,
          current_quantity,
          min_required_quantity,
          unit_price,
          supplier_info,
          last_ordered,
          lead_time_days
        `)
        .eq('project_id', projectId)
        .not('current_quantity', 'is', null)
        .not('min_required_quantity', 'is', null)
        .lt('current_quantity', 'min_required_quantity')
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching low stock materials:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes - stock levels are important
  });
};

/**
 * Hook to fetch material transactions for a specific material
 * Returns transaction history for inventory tracking
 */
export const useMaterialTransactions = (materialId: string) => {
  return useQuery({
    queryKey: [...queryKeys.materials.detail(materialId), 'transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('material_transaction')
        .select(`
          id,
          material_id,
          project_id,
          quantity,
          transaction_type,
          reference_id,
          notes,
          created_at,
          created_by,
          created_at,
          creator:created_by (
            id,
            full_name,
            email
          )
        `)
        .eq('material_id', materialId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching material transactions:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!materialId,
    staleTime: 3 * 60 * 1000, // 3 minutes - transaction history is relatively stable
  });
};
