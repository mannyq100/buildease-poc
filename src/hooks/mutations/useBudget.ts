import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import type { BudgetExpense, BudgetFormData, TransactionType, PaymentStatus, PaymentMethod } from '@/types/projectDetails';
import { useProjectStore } from '@/stores/projectStore';
import { logBudgetActivity } from '@/utils/activityLogging';


export interface CreateBudgetExpenseData extends BudgetFormData {
  project_id: string;
  base_currency?: string; // base currency for conversion context (defaults to USD in DB)
  exchange_rate?: number | null; // rate from currency -> base_currency
}

export interface UpdateBudgetExpenseData extends Partial<BudgetFormData> {
  id: string;
  base_currency?: string;
  exchange_rate?: number | null;
}

/**
 * Hook to create a new budget expense
 */
export function useCreateBudgetExpense() {
  const queryClient = useQueryClient();
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);

  return useMutation({
    mutationFn: async (data: CreateBudgetExpenseData) => {
      // Get current user for created_by field
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error('User must be authenticated');

      console.log('[DEBUG] Creating budget expense with data:', {
        project_id: data.project_id,
        user_id: auth.user.id,
        transaction_type: data.transaction_type,
        amount: data.amount
      });

      // Check if user has access to the project
      const { data: projectAccess, error: accessError } = await supabase
        .rpc('check_user_project_access', {
          target_project_id: data.project_id,
          target_user_id: auth.user.id
        });

      if (accessError) {
        console.error('[DEBUG] Error checking project access:', accessError);
      } else {
        console.log('[DEBUG] Project access check result:', projectAccess);
      }

      // Compute a safe, non-null title (DB requires NOT NULL, varchar(100))
      const computedTitle = (
        (data.description && data.description.trim())
          ? data.description.trim()
          : (data.category && data.category.trim())
            ? data.category.trim()
            : data.transaction_type.replace(/_/g, ' ').toLowerCase()
      ).slice(0, 100);

      // Insert into financial_transaction table with new schema
      const { data: expense, error } = await supabase
        .from('financial_transaction')
        .insert([{
          project_id: data.project_id,
          phase_id: data.phase_id || null,
          transaction_type: data.transaction_type,
          amount: data.amount,
          currency: data.currency,
          base_currency: data.base_currency || 'USD',
          exchange_rate: data.exchange_rate ?? null,
          description: data.description,
          category: data.category,
          title: computedTitle,
          payment_date: data.payment_date || null,
          payment_status: data.payment_status,
          payment_method: data.payment_method || null,
          created_by: auth.user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('[DEBUG] Financial transaction insert error:', error);
        if (error.code === '42501') {
          throw new Error('Permission denied: You need to be the project owner or have ADMIN/CONTRACTOR role to create budget expenses for this project. Please contact the project owner to add you as a project participant with the appropriate role.');
        }
        throw error;
      }
      return expense;
    },
    onMutate: async (variables) => {
      // Optimistic update: Add new expense to cache immediately
      const queryKey = ['budget', variables.project_id];
      const optimisticId = `temp_expense_${Date.now()}`;
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousExpenses = queryClient.getQueryData<BudgetExpense[]>(queryKey) || [];
      
      // Optimistically update to show new expense
      // Database will calculate the accurate base_amount using computed column
      const baseCurrency = variables.base_currency || 'USD';
      
      const optimisticExpense: BudgetExpense = {
        id: optimisticId,
        project_id: variables.project_id,
        phase_id: variables.phase_id,
        transaction_type: variables.transaction_type,
        amount: variables.amount,
        currency: variables.currency,
        base_currency: baseCurrency,
        exchange_rate: variables.exchange_rate ?? null,
        base_amount: variables.amount, // Database will calculate accurate conversion via computed column
        description: variables.description,
        category: variables.category,
        payment_date: variables.payment_date,
        payment_status: variables.payment_status,
        payment_method: variables.payment_method,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: '' // Will be replaced with real data from server
      };
      
      queryClient.setQueryData<BudgetExpense[]>(queryKey, (old = []) => [
        optimisticExpense,
        ...old
      ]);

      // Track optimistic update
      addOptimisticUpdate(`create_expense_${optimisticId}`, {
        type: 'create',
        entity: 'expense',
        data: optimisticExpense,
        timestamp: Date.now()
      });
      
      // Return context object with the previous expenses
      return { previousExpenses, optimisticExpense, optimisticId };
    },
    onSuccess: async (newExpense, variables, context) => {
      console.log('[ACTIVITY_DEBUG] [useCreateBudgetExpense] onSuccess called', {
        expenseId: newExpense.id,
        expenseDescription: variables.description,
        expenseAmount: variables.amount,
        transactionType: variables.transaction_type,
        projectId: variables.project_id,
        timestamp: new Date().toISOString()
      });

      // Replace optimistic expense with real server data
      const queryKey = ['budget', variables.project_id];
      queryClient.setQueryData<BudgetExpense[]>(queryKey, (old = []) => 
        old.map(expense => expense.id === context?.optimisticId ? newExpense : expense)
      );

      // Remove optimistic update tracking
      const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
      removeOptimisticUpdate(`create_expense_${context?.optimisticId}`);
      
      // Invalidate project budget queries for other components
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
          const displayName = variables.description || 
              variables.category || 
              variables.transaction_type.replace(/_/g, ' ').toLowerCase();
              
          await logBudgetActivity(
            variables.project_id,
            'expense_create',
            newExpense.id,
            displayName,
            {
              amount: variables.amount,
              currency: variables.currency,
              category: variables.category,
              transaction_type: variables.transaction_type
            }
          );
        } catch (e) {
          console.error('Failed to create activity for expense creation:', e);
        }
      })();
      
      toast.success('Budget expense added successfully');
    },
    onError: (error, variables, context) => {
      console.error('Failed to create budget expense:', error);
      
      // Revert optimistic update
      const queryKey = ['budget', variables.project_id];
      queryClient.setQueryData<BudgetExpense[]>(queryKey, context?.previousExpenses || []);
      
      // Enhanced error handling with specific error messages
      let errorMessage = 'Failed to add expense. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'You do not have permission to add expenses to this project.';
        } else if (error.message.includes('validation')) {
          errorMessage = 'Invalid expense data. Please check your inputs.';
        } else if (error.message.includes('currency')) {
          errorMessage = 'Currency conversion failed. Please try again.';
        }
      }
      
      toast.error(errorMessage);
      
      // Log error details for debugging
      console.error('[useBudget] Create expense error details:', {
        error: error.message,
        variables,
        timestamp: new Date().toISOString()
      });
    },
  });
}

/**
 * Hook to update a budget expense
 */
export function useUpdateBudgetExpense() {
  const queryClient = useQueryClient();
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);

  return useMutation({
    mutationFn: async (data: UpdateBudgetExpenseData) => {
      const { id, ...updateData } = data;
      
      // Build update payload with only defined fields
      const updatePayload: Record<string, unknown> = {};
      if (updateData.transaction_type !== undefined) updatePayload.transaction_type = updateData.transaction_type;
      if (updateData.amount !== undefined) updatePayload.amount = updateData.amount;
      if (updateData.currency !== undefined) updatePayload.currency = updateData.currency;
      if (updateData.base_currency !== undefined) updatePayload.base_currency = updateData.base_currency;
      if (updateData.exchange_rate !== undefined) updatePayload.exchange_rate = updateData.exchange_rate;
      if (updateData.description !== undefined) updatePayload.description = updateData.description;
      if (updateData.category !== undefined) updatePayload.category = updateData.category;
      if (updateData.payment_date !== undefined) updatePayload.payment_date = updateData.payment_date;
      if (updateData.payment_status !== undefined) updatePayload.payment_status = updateData.payment_status;
      if (updateData.payment_method !== undefined) updatePayload.payment_method = updateData.payment_method;
      if (updateData.phase_id !== undefined) updatePayload.phase_id = updateData.phase_id;

      const { data: expense, error } = await supabase
        .from('financial_transaction')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return expense;
    },
    onMutate: async (variables) => {
      // Optimistic update: Update expense in cache immediately
      const { id, ...updateData } = variables;
      
      // We need to find which project this expense belongs to
      // Look through all budget query caches to find the expense
      const queryCache = queryClient.getQueryCache();
      let projectId: string | null = null;
      let previousExpenses: BudgetExpense[] | undefined;
      
      // Find the project ID by searching through budget queries
      for (const query of queryCache.getAll()) {
        if (query.queryKey[0] === 'budget' && Array.isArray(query.state.data)) {
          const expenses = query.state.data as BudgetExpense[];
          const targetExpense = expenses.find(exp => exp.id === id);
          if (targetExpense) {
            projectId = targetExpense.project_id;
            previousExpenses = expenses;
            break;
          }
        }
      }
      
      if (projectId && previousExpenses) {
        const queryKey = ['budget', projectId];
        
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey });

        // Create optimistic updated expense
        const optimisticExpense = previousExpenses.find(exp => exp.id === id);
        if (optimisticExpense) {
          const updatedExpense = { ...optimisticExpense, ...updateData, updated_at: new Date().toISOString() };
          
          // Optimistically update the expense
          queryClient.setQueryData<BudgetExpense[]>(queryKey, (old = []) => 
            old.map(expense => expense.id === id ? updatedExpense : expense)
          );

          // Track optimistic update
          addOptimisticUpdate(`update_expense_${id}`, {
            type: 'update',
            entity: 'expense',
            data: updatedExpense,
            originalData: optimisticExpense,
            timestamp: Date.now()
          });
        }
        
        return { previousExpenses, projectId, expenseId: id };
      }
      
      return { previousExpenses: undefined, projectId: null, expenseId: id };
    },
    onSuccess: async (updatedExpense, variables, context) => {
      console.log('[ACTIVITY_DEBUG] [useUpdateBudgetExpense] onSuccess called', {
        expenseId: updatedExpense.id,
        projectId: updatedExpense.project_id,
        updates: variables,
        timestamp: new Date().toISOString()
      });

      // Update cached expense with real server data
      if (context?.projectId) {
        const queryKey = ['budget', context.projectId];
        queryClient.setQueryData<BudgetExpense[]>(queryKey, (old = []) => 
          old.map(expense => expense.id === updatedExpense.id ? updatedExpense : expense)
        );
      }

      // Remove optimistic update tracking
      const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
      removeOptimisticUpdate(`update_expense_${updatedExpense.id}`);
      
      // Invalidate project budget queries for other components
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.detail(updatedExpense.project_id) 
      });

      // CRITICAL: Invalidate consolidated project query for real-time updates
      queryClient.invalidateQueries({
        queryKey: ['project-consolidated', updatedExpense.project_id]
      });
      
      // Fire-and-forget activity logging with standardized utilities
      (async () => {
        try {
          const displayName = updatedExpense.description || 
              updatedExpense.category || 
              updatedExpense.transaction_type.replace(/_/g, ' ').toLowerCase();
              
          await logBudgetActivity(
            updatedExpense.project_id,
            'expense_update',
            updatedExpense.id,
            displayName,
            {
              amount: updatedExpense.amount,
              currency: updatedExpense.currency,
              category: updatedExpense.category,
              transaction_type: updatedExpense.transaction_type,
              payment_status: updatedExpense.payment_status,
              payment_method: updatedExpense.payment_method,
              updates: variables,
              updatedFields: Object.keys(variables).filter(key => key !== 'id')
            }
          );
        } catch (e) {
          console.error('Failed to create activity for expense update:', e);
        }
      })();
      
      toast.success('Budget expense updated successfully');
    },
    onError: (error: Error, _variables, context) => {
      // Rollback optimistic update
      if (context?.previousExpenses && context?.projectId) {
        const queryKey = ['budget', context.projectId];
        queryClient.setQueryData(queryKey, context.previousExpenses);
      }
      toast.error(`Failed to update budget expense: ${error.message}`);
    },
  });
}

/**
 * Hook to delete a budget expense
 */
export function useDeleteBudgetExpense() {
  const queryClient = useQueryClient();
  const addOptimisticUpdate = useProjectStore(state => state.addOptimisticUpdate);

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
    onMutate: async (expenseId) => {
      // Optimistic update: Remove expense from cache immediately
      const queryCache = queryClient.getQueryCache();
      let projectId: string | null = null;
      let previousExpenses: BudgetExpense[] | undefined;
      let deletedExpense: BudgetExpense | undefined;
      
      // Find the project ID and expense by searching through budget queries
      for (const query of queryCache.getAll()) {
        if (query.queryKey[0] === 'budget' && Array.isArray(query.state.data)) {
          const expenses = query.state.data as BudgetExpense[];
          deletedExpense = expenses.find(exp => exp.id === expenseId);
          if (deletedExpense) {
            projectId = deletedExpense.project_id;
            previousExpenses = expenses;
            break;
          }
        }
      }
      
      if (projectId && previousExpenses) {
        const queryKey = ['budget', projectId];
        
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey });
        
        // Optimistically remove the expense
        queryClient.setQueryData<BudgetExpense[]>(queryKey, (old = []) => 
          old.filter(expense => expense.id !== expenseId)
        );

        // Track optimistic update
        if (deletedExpense) {
          addOptimisticUpdate(`delete_expense_${expenseId}`, {
            type: 'delete',
            entity: 'expense',
            data: deletedExpense,
            timestamp: Date.now()
          });
        }
        
        return { previousExpenses, projectId, expenseId, deletedExpense };
      }
      
      return { previousExpenses: undefined, projectId: null, expenseId, deletedExpense: undefined };
    },
    onSuccess: async (result, _variables, context) => {
      console.log('[ACTIVITY_DEBUG] [useDeleteBudgetExpense] onSuccess called', {
        expenseId: result.expenseId,
        projectId: result.projectId,
        timestamp: new Date().toISOString()
      });

      // Remove optimistic update tracking
      const removeOptimisticUpdate = useProjectStore.getState().removeOptimisticUpdate;
      removeOptimisticUpdate(`delete_expense_${result.expenseId}`);
      
      if (result.projectId) {
        // Ensure expense is removed from cache (should already be done optimistically)
        const queryKey = ['budget', result.projectId];
        queryClient.setQueryData<BudgetExpense[]>(queryKey, (old = []) => 
          old.filter(expense => expense.id !== result.expenseId)
        );

        // Invalidate project budget queries for other components
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.projects.detail(result.projectId) 
        });

        // CRITICAL: Invalidate consolidated project query for real-time updates
        queryClient.invalidateQueries({
          queryKey: ['project-consolidated', result.projectId]
        });
      }
      
      // Fire-and-forget activity logging with standardized utilities
      (async () => {
        try {
          if (!result.projectId) {
            console.warn('No projectId available for activity logging');
            return;
          }
          
          await logBudgetActivity(
            result.projectId,
            'expense_delete',
            result.expenseId,
            'Expense Item',
            {}
          );
        } catch (e) {
          console.error('Failed to create activity for expense deletion:', e);
        }
      })();
      
      toast.success('Budget expense deleted successfully');
    },
    onError: (error: Error, _variables, context) => {
      // Rollback optimistic update
      if (context?.previousExpenses && context?.projectId) {
        const queryKey = ['budget', context.projectId];
        queryClient.setQueryData(queryKey, context.previousExpenses);
      }
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
    queryFn: async (): Promise<BudgetExpense[]> => {
      const { data, error } = await supabase
        .from('financial_transaction')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Return data in the correct BudgetExpense format
      return data.map(expense => ({
        id: expense.id,
        project_id: expense.project_id,
        phase_id: expense.phase_id,
        transaction_type: expense.transaction_type as TransactionType,
        amount: expense.amount,
        currency: expense.currency as string,
        base_currency: expense.base_currency as string | undefined,
        exchange_rate: (expense.exchange_rate as number | null) ?? null,
        base_amount: expense.base_amount ?? expense.amount,
        title: expense.title,
        description: expense.description,
        category: expense.category,
        payment_date: expense.payment_date,
        payment_status: expense.payment_status as PaymentStatus,
        payment_method: expense.payment_method as PaymentMethod,
        receipt_url: expense.receipt_url,
        approved_by: expense.approved_by,
        approved_at: expense.approved_at,
        details: expense.details,
        created_at: expense.created_at,
        updated_at: expense.updated_at,
        created_by: expense.created_by
      }));
    }
  };
}
