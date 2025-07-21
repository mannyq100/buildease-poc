import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';

// Types for budget mutations
export interface BudgetExpense {
  id?: string;
  project_id: string;
  name: string;
  amount: number;
  category: string;
  description?: string;
  date?: string;
  status?: 'planned' | 'approved' | 'paid';
}

export interface CreateBudgetExpenseData {
  project_id: string;
  name: string;
  amount: number;
  category: string;
  description?: string;
  date?: string;
  status?: 'planned' | 'approved' | 'paid';
}

export interface UpdateBudgetExpenseData {
  id: string;
  name?: string;
  amount?: number;
  category?: string;
  description?: string;
  date?: string;
  status?: 'planned' | 'approved' | 'paid';
}

/**
 * Hook to create a new budget expense
 */
export function useCreateBudgetExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBudgetExpenseData) => {
      // Insert into financial_transaction table
      const { data: expense, error } = await supabase
        .from('financial_transaction')
        .insert([{
          project_id: data.project_id,
          transaction_type: 'OTHER',
          category: data.category,
          amount: data.amount,
          description: data.name + (data.description ? ` - ${data.description}` : ''),
          payment_date: data.date || new Date().toISOString().split('T')[0],
          payment_status: data.status || 'planned'
        }])
        .select()
        .single();

      if (error) throw error;
      return expense;
    },
    onSuccess: (_newExpense, variables) => {
      // Invalidate project budget queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(variables.project_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['budget', variables.project_id] 
      });
      
      toast.success('Budget expense added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add budget expense: ${error.message}`);
    },
  });
}

/**
 * Hook to update a budget expense
 */
export function useUpdateBudgetExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateBudgetExpenseData) => {
      const { id, ...updateData } = data;
      
      const updatePayload: any = {};
      if (updateData.name || updateData.description) {
        updatePayload.description = updateData.name + (updateData.description ? ` - ${updateData.description}` : '');
      }
      if (updateData.amount !== undefined) updatePayload.amount = updateData.amount;
      if (updateData.category) updatePayload.category = updateData.category;
      if (updateData.date) updatePayload.payment_date = updateData.date;
      if (updateData.status) updatePayload.payment_status = updateData.status;

      const { data: expense, error } = await supabase
        .from('financial_transaction')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return expense;
    },
    onSuccess: (updatedExpense) => {
      // Invalidate project budget queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(updatedExpense.project_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['budget', updatedExpense.project_id] 
      });
      
      toast.success('Budget expense updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update budget expense: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a budget expense
 */
export function useDeleteBudgetExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseId: string) => {
      // First get the project_id for cache invalidation
      const { data: expense } = await supabase
        .from('financial_transaction')
        .select('project_id')
        .eq('id', expenseId)
        .single();

      const { error } = await supabase
        .from('financial_transaction')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;
      return { expenseId, projectId: expense?.project_id };
    },
    onSuccess: (result) => {
      if (result.projectId) {
        // Invalidate project budget queries
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.projects.detail(result.projectId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['budget', result.projectId] 
        });
      }
      
      toast.success('Budget expense deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete budget expense: ${error.message}`);
    },
  });
}

/**
 * Hook to get budget expenses for a project
 */
export function useProjectBudgetExpenses(projectId: string) {
  return {
    queryKey: ['budget', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_transaction')
        .select('*')
        .eq('project_id', projectId)
        .eq('transaction_type', 'OTHER')
        .order('payment_date', { ascending: false });

      if (error) throw error;
      
      // Transform data to match our UI expectations
      return data.map(expense => ({
        id: expense.id,
        project_id: expense.project_id,
        name: expense.description?.split(' - ')[0] || 'Unnamed Expense',
        amount: expense.amount,
        category: expense.category,
        description: expense.description?.split(' - ')[1] || '',
        date: expense.payment_date,
        status: expense.status
      }));
    }
  };
}
