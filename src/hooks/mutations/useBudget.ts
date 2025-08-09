import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import * as activityService from '@/services/activityService';

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
    onSuccess: async (newExpense, variables) => {
      console.log('[ACTIVITY_DEBUG] [useCreateBudgetExpense] onSuccess called', {
        expenseId: newExpense.id,
        expenseName: variables.name,
        expenseAmount: variables.amount,
        projectId: variables.project_id,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate project budget queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(variables.project_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['budget', variables.project_id] 
      });
      
      // Fire-and-forget activity logging with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] [useCreateBudgetExpense] Starting activity logging for budget expense creation');
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] [useCreateBudgetExpense] Fetching auth user');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useCreateBudgetExpense] Auth error:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] [useCreateBudgetExpense] Auth user fetched successfully', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          console.log('[ACTIVITY_DEBUG] [useCreateBudgetExpense] Adding expense creation to activity batch', {
            project_id: variables.project_id,
            activity_type: 'expense_create',
            title: `Budget expense added: ${variables.name}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'expense',
            entity_id: newExpense.id
          });
          
          // Use batching for expense creation to reduce noise when multiple expenses are added
          const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(variables.amount);
          
          await activityService.createBatchedActivity({
            project_id: variables.project_id,
            activity_type: 'expense_create',
            title: `New ${variables.category.toLowerCase()} expense: ${variables.name}`,
            description: `Budget expense "${variables.name}" (${formattedAmount}) was added to ${variables.category}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'expense',
            entity_id: newExpense.id,
            metadata: {
              expenseName: variables.name,
              amount: variables.amount,
              category: variables.category,
              status: variables.status || 'planned',
              formattedAmount
            },
            status: 'success'
          });
          
          console.log('[ACTIVITY_DEBUG] [useCreateBudgetExpense] Activity added to batch successfully');
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useCreateBudgetExpense] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            expenseId: newExpense.id,
            expenseName: variables.name,
            projectId: variables.project_id,
            timestamp: new Date().toISOString()
          });
        }
      })();
      
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
    onSuccess: async (updatedExpense, variables) => {
      console.log('[ACTIVITY_DEBUG] [useUpdateBudgetExpense] onSuccess called', {
        expenseId: updatedExpense.id,
        projectId: updatedExpense.project_id,
        updates: variables,
        timestamp: new Date().toISOString()
      });
      
      // Invalidate project budget queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(updatedExpense.project_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['budget', updatedExpense.project_id] 
      });
      
      // Fire-and-forget activity logging with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] [useUpdateBudgetExpense] Starting activity logging for budget expense update');
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] [useUpdateBudgetExpense] Fetching auth user');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useUpdateBudgetExpense] Auth error:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] [useUpdateBudgetExpense] Auth user fetched successfully', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          // Extract expense name from description (reverse of the creation logic)
          const expenseName = updatedExpense.description ? updatedExpense.description.split(' - ')[0] : 'Budget Expense';
              
          console.log('[ACTIVITY_DEBUG] [useUpdateBudgetExpense] Calling activityService.createActivity', {
            project_id: updatedExpense.project_id,
            activity_type: 'expense_update',
            title: `Budget expense updated: ${expenseName}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'expense',
            entity_id: updatedExpense.id
          });
          
          // Determine what was updated for more specific messaging
          const updatedFields = Object.keys(variables).filter(key => key !== 'id');
          const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(updatedExpense.amount);
          
          let activityTitle = `Budget expense modified: ${expenseName}`;
          let activityDescription = `Expense "${expenseName}" was updated`;
          
          if (updatedFields.includes('status')) {
            activityTitle = `Expense status changed: ${expenseName}`;
            activityDescription = `"${expenseName}" status changed to ${updatedExpense.payment_status}`;
          } else if (updatedFields.includes('amount')) {
            activityTitle = `Expense amount updated: ${expenseName}`;
            activityDescription = `"${expenseName}" amount updated to ${formattedAmount}`;
          } else if (updatedFields.includes('category')) {
            activityTitle = `Expense moved to ${updatedExpense.category}: ${expenseName}`;
            activityDescription = `"${expenseName}" was moved to ${updatedExpense.category} category`;
          }
          
          const result = await activityService.createActivity({
            project_id: updatedExpense.project_id,
            activity_type: 'expense_update',
            title: activityTitle,
            description: activityDescription,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'expense',
            entity_id: updatedExpense.id,
            metadata: {
              expenseName,
              amount: updatedExpense.amount,
              category: updatedExpense.category,
              status: updatedExpense.payment_status,
              updates: variables,
              updatedFields,
              formattedAmount
            },
            status: 'info'
          });
          
          console.log('[ACTIVITY_DEBUG] [useUpdateBudgetExpense] Activity created successfully', {
            success: !!result,
            activityId: result?.id,
            result
          });
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useUpdateBudgetExpense] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            expenseId: updatedExpense.id,
            projectId: updatedExpense.project_id,
            timestamp: new Date().toISOString()
          });
        }
      })();
      
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
    onSuccess: async (result, variables) => {
      console.log('[ACTIVITY_DEBUG] [useDeleteBudgetExpense] onSuccess called', {
        expenseId: result.expenseId,
        projectId: result.projectId,
        timestamp: new Date().toISOString()
      });
      
      if (result.projectId) {
        // Invalidate project budget queries
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.projects.detail(result.projectId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['budget', result.projectId] 
        });
      }
      
      // Fire-and-forget activity logging with comprehensive debug logging
      console.log('[ACTIVITY_DEBUG] [useDeleteBudgetExpense] Starting activity logging for budget expense deletion');
      
      (async () => {
        try {
          console.log('[ACTIVITY_DEBUG] [useDeleteBudgetExpense] Fetching auth user');
          const { data: auth, error: authError } = await supabase.auth.getUser();
          
          if (authError) {
            console.error('[ACTIVITY_DEBUG] [useDeleteBudgetExpense] Auth error:', authError);
            return;
          }
          
          console.log('[ACTIVITY_DEBUG] [useDeleteBudgetExpense] Auth user fetched successfully', {
            userId: auth?.user?.id,
            hasUser: !!auth?.user,
            userMetadata: auth?.user?.user_metadata
          });
          
          if (!result.projectId) {
            console.warn('[ACTIVITY_DEBUG] [useDeleteBudgetExpense] No projectId available for activity logging');
            return;
          }
          
          const userName = (auth?.user?.user_metadata?.full_name as string | undefined) ||
              (auth?.user?.user_metadata?.name as string | undefined) ||
              (auth?.user?.email as string | undefined);
              
          console.log('[ACTIVITY_DEBUG] [useDeleteBudgetExpense] Calling activityService.createActivity', {
            project_id: result.projectId,
            activity_type: 'expense_delete',
            title: `Budget expense removed: ${result.expenseId}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'expense',
            entity_id: result.expenseId
          });
          
          const activityResult = await activityService.createActivity({
            project_id: result.projectId,
            activity_type: 'expense_delete',
            title: `Budget expense removed from project`,
            description: 'An expense item was deleted from the project budget',
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'expense',
            entity_id: result.expenseId,
            metadata: { expenseId: result.expenseId },
            status: 'warning'
          });
          
          console.log('[ACTIVITY_DEBUG] [useDeleteBudgetExpense] Activity created successfully', {
            success: !!activityResult,
            activityId: activityResult?.id,
            result: activityResult
          });
          
        } catch (e) {
          console.error('[ACTIVITY_DEBUG] [useDeleteBudgetExpense] Activity logging failed:', {
            error: e,
            errorMessage: e instanceof Error ? e.message : String(e),
            errorStack: e instanceof Error ? e.stack : undefined,
            expenseId: result.expenseId,
            projectId: result.projectId,
            timestamp: new Date().toISOString()
          });
        }
      })();
      
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
