import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import * as activityService from '@/services/activityService';

// Types for budget mutations (using the new schema from projectDetails.ts)
import type { BudgetExpense, BudgetFormData, TransactionType, PaymentStatus, PaymentMethod, Currency } from '@/types/projectDetails';

export interface CreateBudgetExpenseData extends BudgetFormData {
  project_id: string;
}

export interface UpdateBudgetExpenseData extends Partial<BudgetFormData> {
  id: string;
}

/**
 * Hook to create a new budget expense
 */
export function useCreateBudgetExpense() {
  const queryClient = useQueryClient();

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

      // Insert into financial_transaction table with new schema
      const { data: expense, error } = await supabase
        .from('financial_transaction')
        .insert([{
          project_id: data.project_id,
          phase_id: data.phase_id || null,
          transaction_type: data.transaction_type,
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          category: data.category,
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
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousExpenses = queryClient.getQueryData<BudgetExpense[]>(queryKey) || [];
      
      // Optimistically update to show new expense
      const optimisticExpense: BudgetExpense = {
        id: `temp-${Date.now()}`, // Temporary ID
        project_id: variables.project_id,
        phase_id: variables.phase_id,
        transaction_type: variables.transaction_type,
        amount: variables.amount,
        currency: variables.currency,
        base_amount: variables.amount, // Assume same currency for now
        description: variables.description,
        category: variables.category,
        payment_date: variables.payment_date,
        payment_status: variables.payment_status,
        payment_method: variables.payment_method,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: 'current-user' // Will be replaced with real data
      };
      
      queryClient.setQueryData<BudgetExpense[]>(queryKey, (old = []) => [
        optimisticExpense,
        ...old
      ]);
      
      // Show optimistic toast
      toast.success('Adding expense...', { duration: 1000 });
      
      // Return context object with the previous expenses
      return { previousExpenses, optimisticExpense };
    },
    onSuccess: async (newExpense, variables) => {
      console.log('[ACTIVITY_DEBUG] [useCreateBudgetExpense] onSuccess called', {
        expenseId: newExpense.id,
        expenseDescription: variables.description,
        expenseAmount: variables.amount,
        transactionType: variables.transaction_type,
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
              
          const displayName = variables.description || variables.transaction_type.replace('_', ' ').toLowerCase();
          
          console.log('[ACTIVITY_DEBUG] [useCreateBudgetExpense] Adding expense creation to activity batch', {
            project_id: variables.project_id,
            activity_type: 'expense_create',
            title: `Budget expense added: ${displayName}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'expense',
            entity_id: newExpense.id
          });
          
          // Use batching for expense creation to reduce noise when multiple expenses are added
          const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: variables.currency
          }).format(variables.amount);
          
          await activityService.createBatchedActivity({
            project_id: variables.project_id,
            activity_type: 'expense_create',
            title: `New ${variables.category.toLowerCase()} expense: ${displayName}`,
            description: `${variables.transaction_type.replace('_', ' ')} "${displayName}" (${formattedAmount}) was added to ${variables.category}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'expense',
            entity_id: newExpense.id,
            metadata: {
              description: variables.description,
              amount: variables.amount,
              currency: variables.currency,
              category: variables.category,
              transaction_type: variables.transaction_type,
              payment_status: variables.payment_status,
              payment_method: variables.payment_method,
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
    onError: (error: Error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousExpenses) {
        const queryKey = ['budget', variables.project_id];
        queryClient.setQueryData(queryKey, context.previousExpenses);
      }
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
      
      // Build update payload with only defined fields
      const updatePayload: any = {};
      if (updateData.transaction_type !== undefined) updatePayload.transaction_type = updateData.transaction_type;
      if (updateData.amount !== undefined) updatePayload.amount = updateData.amount;
      if (updateData.currency !== undefined) updatePayload.currency = updateData.currency;
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
        
        // Optimistically update the expense
        queryClient.setQueryData<BudgetExpense[]>(queryKey, (old = []) => 
          old.map(expense => 
            expense.id === id 
              ? { ...expense, ...updateData, updated_at: new Date().toISOString() }
              : expense
          )
        );
        
        // Show optimistic toast
        toast.success('Updating expense...', { duration: 1000 });
        
        return { previousExpenses, projectId, expenseId: id };
      }
      
      return { previousExpenses: undefined, projectId: null, expenseId: id };
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
              
          // Get display name for the expense
          const displayName = updatedExpense.description || updatedExpense.transaction_type.replace('_', ' ').toLowerCase();
              
          console.log('[ACTIVITY_DEBUG] [useUpdateBudgetExpense] Calling activityService.createActivity', {
            project_id: updatedExpense.project_id,
            activity_type: 'expense_update',
            title: `Budget expense updated: ${displayName}`,
            user_id: auth?.user?.id,
            user_name: userName,
            entity_type: 'expense',
            entity_id: updatedExpense.id
          });
          
          // Determine what was updated for more specific messaging
          const updatedFields = Object.keys(variables).filter(key => key !== 'id');
          const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: updatedExpense.currency || 'USD'
          }).format(updatedExpense.amount);
          
          let activityTitle = `Budget expense modified: ${displayName}`;
          let activityDescription = `Expense "${displayName}" was updated`;
          
          if (updatedFields.includes('payment_status')) {
            activityTitle = `Expense status changed: ${displayName}`;
            activityDescription = `"${displayName}" status changed to ${updatedExpense.payment_status}`;
          } else if (updatedFields.includes('amount')) {
            activityTitle = `Expense amount updated: ${displayName}`;
            activityDescription = `"${displayName}" amount updated to ${formattedAmount}`;
          } else if (updatedFields.includes('category')) {
            activityTitle = `Expense moved to ${updatedExpense.category}: ${displayName}`;
            activityDescription = `"${displayName}" was moved to ${updatedExpense.category} category`;
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
              description: updatedExpense.description,
              transaction_type: updatedExpense.transaction_type,
              amount: updatedExpense.amount,
              currency: updatedExpense.currency,
              category: updatedExpense.category,
              payment_status: updatedExpense.payment_status,
              payment_method: updatedExpense.payment_method,
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
    onError: (error: Error, variables, context) => {
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
        
        // Show optimistic toast
        toast.success('Removing expense...', { duration: 1000 });
        
        return { previousExpenses, projectId, expenseId, deletedExpense };
      }
      
      return { previousExpenses: undefined, projectId: null, expenseId, deletedExpense: undefined };
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
    onError: (error: Error, variables, context) => {
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
        currency: expense.currency as Currency,
        base_amount: expense.base_amount || expense.amount,
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
