import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';

// Types for material mutations
export interface CreateMaterialData {
  name: string;
  description?: string;
  category: string;
  unit: string;
  quantity: number;
  unit_cost: number;
  total_cost?: number;
  supplier_name?: string;
  project_id: string;
  phase_id?: string;
  status?: 'pending' | 'ordered' | 'delivered' | 'installed';
  order_date?: string;
  delivery_date?: string;
}

export interface UpdateMaterialData {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  unit?: string;
  quantity?: number;
  unit_cost?: number;
  total_cost?: number;
  supplier_name?: string;
  status?: 'pending' | 'ordered' | 'delivered' | 'installed';
  order_date?: string;
  delivery_date?: string;
}

export interface MaterialTransactionData {
  material_id: string;
  transaction_type: 'purchase' | 'usage' | 'return' | 'adjustment';
  quantity: number;
  unit_cost?: number;
  total_cost?: number;
  created_at?: string;
  notes?: string;
}

/**
 * Hook to create a new material
 */
export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMaterialData) => {
      // Calculate total cost if not provided
      const materialData = {
        ...data,
        total_cost: data.total_cost || (data.quantity * data.unit_cost)
      };

      const { data: material, error } = await supabase
        .from('construction_mgr.be_material')
        .insert([materialData])
        .select()
        .single();

      if (error) throw error;
      return material;
    },
    onSuccess: (newMaterial, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.materials.byProject(variables.project_id) 
      });
      
      if (variables.phase_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.phases.detail(variables.phase_id) 
        });
      }

      // Invalidate low stock materials if quantity is low
      if (newMaterial.quantity <= 10) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.materials.lowStock(variables.project_id) 
        });
      }

      toast.success('Material added successfully');
    },
    onError: (error: any) => {
      console.error('Error creating material:', error);
      toast.error(error.message || 'Failed to add material');
    }
  });
}

/**
 * Hook to update an existing material
 */
export function useUpdateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateMaterialData) => {
      const { id, ...updateData } = data;
      
      // Recalculate total cost if quantity or unit cost changed
      if (updateData.quantity !== undefined || updateData.unit_cost !== undefined) {
        const currentMaterial = queryClient.getQueryData(queryKeys.materials.detail(id)) as any;
        if (currentMaterial) {
          const quantity = updateData.quantity ?? currentMaterial.quantity;
          const unitCost = updateData.unit_cost ?? currentMaterial.unit_cost;
          updateData.total_cost = quantity * unitCost;
        }
      }
      
      const { data: material, error } = await supabase
        .from('construction_mgr.be_material')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return material;
    },
    onSuccess: (updatedMaterial) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.materials.byProject(updatedMaterial.project_id) 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.materials.detail(updatedMaterial.id) 
      });

      if (updatedMaterial.phase_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.phases.detail(updatedMaterial.phase_id) 
        });
      }

      // Invalidate low stock materials
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.materials.lowStock(updatedMaterial.project_id) 
      });

      toast.success('Material updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating material:', error);
      toast.error(error.message || 'Failed to update material');
    }
  });
}

/**
 * Hook to delete a material
 */
export function useDeleteMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (materialId: string) => {
      // First get the material to know which project to invalidate
      const { data: material } = await supabase
        .from('construction_mgr.be_material')
        .select('project_id, phase_id')
        .eq('id', materialId)
        .single();

      const { error } = await supabase
        .from('construction_mgr.be_material')
        .delete()
        .eq('id', materialId);

      if (error) throw error;
      return { materialId, material };
    },
    onSuccess: ({ materialId, material }) => {
      if (material) {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.materials.byProject(material.project_id) 
        });
        
        if (material.phase_id) {
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.phases.detail(material.phase_id) 
          });
        }

        queryClient.invalidateQueries({ 
          queryKey: queryKeys.materials.lowStock(material.project_id) 
        });
      }

      // Remove the specific material from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.materials.detail(materialId) 
      });

      toast.success('Material deleted successfully');
    },
    onError: (error: any) => {
      console.error('Error deleting material:', error);
      toast.error(error.message || 'Failed to delete material');
    }
  });
}

/**
 * Hook to record a material transaction (purchase, usage, etc.)
 */
export function useCreateMaterialTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MaterialTransactionData) => {
      const { data: transaction, error } = await supabase
        .from('construction_mgr.be_material_transaction')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      // Update material quantity based on transaction type
      const { data: material } = await supabase
        .from('construction_mgr.be_material')
        .select('quantity, project_id')
        .eq('id', data.material_id)
        .single();

      if (material) {
        let newQuantity = material.quantity;
        
        switch (data.transaction_type) {
          case 'purchase':
            newQuantity += data.quantity;
            break;
          case 'usage':
            newQuantity -= data.quantity;
            break;
          case 'return':
            newQuantity += data.quantity;
            break;
          case 'adjustment':
            newQuantity = data.quantity; // Direct adjustment
            break;
        }

        // Update the material quantity
        await supabase
          .from('construction_mgr.be_material')
          .update({ quantity: Math.max(0, newQuantity) })
          .eq('id', data.material_id);
      }

      return { transaction, material };
    },
    onSuccess: ({ transaction, material }) => {
      if (material) {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.materials.byProject(material.project_id) 
        });
        
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.materials.detail(transaction.material_id) 
        });

        queryClient.invalidateQueries({ 
          queryKey: queryKeys.materials.transactions(transaction.material_id) 
        });

        queryClient.invalidateQueries({ 
          queryKey: queryKeys.materials.lowStock(material.project_id) 
        });
      }

      const actionText = {
        purchase: 'purchased',
        usage: 'used',
        return: 'returned',
        adjustment: 'adjusted'
      }[transaction.transaction_type];

      toast.success(`Material ${actionText} successfully`);
    },
    onError: (error: any) => {
      console.error('Error recording material transaction:', error);
      toast.error(error.message || 'Failed to record material transaction');
    }
  });
}

/**
 * Hook to update material status with optimistic updates
 */
export function useUpdateMaterialStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      materialId, 
      status 
    }: { 
      materialId: string; 
      status: 'pending' | 'ordered' | 'delivered' | 'installed';
    }) => {
      const { data: material, error } = await supabase
        .from('construction_mgr.be_material')
        .update({ status })
        .eq('id', materialId)
        .select()
        .single();

      if (error) throw error;
      return material;
    },
    // Optimistic update
    onMutate: async ({ materialId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.materials.detail(materialId) });

      // Snapshot the previous value
      const previousMaterial = queryClient.getQueryData(queryKeys.materials.detail(materialId));

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.materials.detail(materialId), (old: any) => {
        if (!old) return old;
        return { ...old, status };
      });

      return { previousMaterial };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousMaterial) {
        queryClient.setQueryData(queryKeys.materials.detail(variables.materialId), context.previousMaterial);
      }
      console.error('Error updating material status:', error);
      toast.error(error.message || 'Failed to update material status');
    },
    onSettled: (updatedMaterial) => {
      // Always refetch after error or success
      if (updatedMaterial) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.materials.detail(updatedMaterial.id) 
        });
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.materials.byProject(updatedMaterial.project_id) 
        });
      }
    }
  });
}

/**
 * Hook to bulk update materials
 */
export function useBulkUpdateMaterials() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: UpdateMaterialData[]) => {
      const updatePromises = updates.map(({ id, ...updateData }) =>
        supabase
          .from('construction_mgr.be_material')
          .update(updateData)
          .eq('id', id)
          .select()
          .single()
      );

      const results = await Promise.all(updatePromises);
      
      // Check for any errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} materials`);
      }

      return results.map(result => result.data).filter(Boolean);
    },
    onSuccess: (updatedMaterials) => {
      // Get unique project IDs to invalidate
      const projectIds = [...new Set(updatedMaterials.map(m => m.project_id))];
      
      projectIds.forEach(projectId => {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.materials.byProject(projectId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.materials.lowStock(projectId) 
        });
      });

      // Invalidate individual material queries
      updatedMaterials.forEach(material => {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.materials.detail(material.id) 
        });
      });

      toast.success(`${updatedMaterials.length} materials updated successfully`);
    },
    onError: (error: any) => {
      console.error('Error bulk updating materials:', error);
      toast.error(error.message || 'Failed to update materials');
    }
  });
}
