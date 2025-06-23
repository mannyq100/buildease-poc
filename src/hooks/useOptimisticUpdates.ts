/**
 * useOptimisticUpdates Hook
 * Provides optimistic UI updates with rollback capability
 * Enhances user experience by showing immediate feedback before server confirmation
 */

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface OptimisticAction<T> {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: T;
  originalData?: T;
  timestamp: number;
}

interface UseOptimisticUpdatesOptions {
  rollbackDelay?: number;
  showToasts?: boolean;
}

interface UseOptimisticUpdatesResult<T> {
  optimisticItems: T[];
  pendingActions: OptimisticAction<T>[];
  executeOptimistic: (
    action: Omit<OptimisticAction<T>, 'id' | 'timestamp'>,
    serverAction: () => Promise<T | void>
  ) => Promise<void>;
  rollbackAction: (actionId: string) => void;
  clearPendingActions: () => void;
  hasPendingActions: boolean;
}

export function useOptimisticUpdates<T extends { id: string | number }>(
  items: T[],
  options: UseOptimisticUpdatesOptions = {}
): UseOptimisticUpdatesResult<T> {
  const {
    rollbackDelay = 5000,
    showToasts = true
  } = options;

  const [pendingActions, setPendingActions] = useState<OptimisticAction<T>[]>([]);
  const actionTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Apply optimistic changes to the items
  const optimisticItems = items.reduce((acc, item) => {
    let currentItem = item;
    
    // Apply pending actions in chronological order
    pendingActions
      .filter(action => action.data.id === item.id)
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach(action => {
        switch (action.type) {
          case 'update':
            currentItem = { ...currentItem, ...action.data };
            break;
          case 'delete':
            return; // Item will be filtered out
        }
      });

    return [...acc, currentItem];
  }, [] as T[]).concat(
    // Add new items from create actions
    pendingActions
      .filter(action => action.type === 'create')
      .map(action => action.data)
  );

  // Remove deleted items
  const finalItems = optimisticItems.filter(item => {
    const deleteAction = pendingActions.find(
      action => action.type === 'delete' && action.data.id === item.id
    );
    return !deleteAction;
  });

  const executeOptimistic = useCallback(async (
    action: Omit<OptimisticAction<T>, 'id' | 'timestamp'>,
    serverAction: () => Promise<T | void>
  ) => {
    const actionId = `${action.type}_${action.data.id}_${Date.now()}`;
    const optimisticAction: OptimisticAction<T> = {
      ...action,
      id: actionId,
      timestamp: Date.now()
    };

    // Add optimistic action
    setPendingActions(prev => [...prev, optimisticAction]);

    if (showToasts) {
      const actionText = action.type === 'create' ? 'Creating' : 
                        action.type === 'update' ? 'Updating' : 'Deleting';
      toast.loading(`${actionText}...`, { id: actionId });
    }

    try {
      // Execute server action
      const result = await serverAction();
      
      // Success - remove from pending and show success toast
      setPendingActions(prev => prev.filter(a => a.id !== actionId));
      
      if (showToasts) {
        const actionText = action.type === 'create' ? 'created' : 
                          action.type === 'update' ? 'updated' : 'deleted';
        toast.success(`Successfully ${actionText}`, { id: actionId });
      }

      // Clear any rollback timeout
      const timeout = actionTimeouts.current.get(actionId);
      if (timeout) {
        clearTimeout(timeout);
        actionTimeouts.current.delete(actionId);
      }

    } catch (error) {
      // Error - setup rollback with delay
      if (showToasts) {
        const actionText = action.type === 'create' ? 'create' : 
                          action.type === 'update' ? 'update' : 'delete';
        toast.error(`Failed to ${actionText}. Will retry automatically.`, { id: actionId });
      }

      // Auto rollback after delay
      const timeout = setTimeout(() => {
        setPendingActions(prev => prev.filter(a => a.id !== actionId));
        if (showToasts) {
          toast.dismiss(actionId);
          const actionText = action.type === 'create' ? 'creation' : 
                            action.type === 'update' ? 'update' : 'deletion';
          toast.error(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)} failed and was reverted`);
        }
        actionTimeouts.current.delete(actionId);
      }, rollbackDelay);

      actionTimeouts.current.set(actionId, timeout);
    }
  }, [rollbackDelay, showToasts]);

  const rollbackAction = useCallback((actionId: string) => {
    setPendingActions(prev => prev.filter(a => a.id !== actionId));
    
    const timeout = actionTimeouts.current.get(actionId);
    if (timeout) {
      clearTimeout(timeout);
      actionTimeouts.current.delete(actionId);
    }

    if (showToasts) {
      toast.dismiss(actionId);
      toast.info('Action reverted');
    }
  }, [showToasts]);

  const clearPendingActions = useCallback(() => {
    // Clear all timeouts
    actionTimeouts.current.forEach(timeout => clearTimeout(timeout));
    actionTimeouts.current.clear();
    
    // Clear pending actions
    setPendingActions([]);
    
    if (showToasts) {
      toast.info('All pending actions cleared');
    }
  }, [showToasts]);

  return {
    optimisticItems: finalItems,
    pendingActions,
    executeOptimistic,
    rollbackAction,
    clearPendingActions,
    hasPendingActions: pendingActions.length > 0
  };
}

/**
 * Specialized hooks for common optimistic update patterns
 */

// Hook for simple CRUD operations
export function useOptimisticCRUD<T extends { id: string | number }>(
  items: T[],
  apiActions: {
    create?: (item: Omit<T, 'id'>) => Promise<T>;
    update?: (id: string | number, updates: Partial<T>) => Promise<T>;
    delete?: (id: string | number) => Promise<void>;
  }
) {
  const { optimisticItems, executeOptimistic, ...rest } = useOptimisticUpdates(items);

  const optimisticCreate = useCallback(async (newItem: Omit<T, 'id'>) => {
    if (!apiActions.create) throw new Error('Create action not provided');
    
    const tempId = `temp_${Date.now()}`;
    const optimisticItem = { ...newItem, id: tempId } as T;
    
    await executeOptimistic(
      { type: 'create', data: optimisticItem },
      () => apiActions.create!(newItem)
    );
  }, [apiActions.create, executeOptimistic]);

  const optimisticUpdate = useCallback(async (id: string | number, updates: Partial<T>) => {
    if (!apiActions.update) throw new Error('Update action not provided');
    
    const originalItem = items.find(item => item.id === id);
    if (!originalItem) throw new Error('Item not found');
    
    const optimisticItem = { ...originalItem, ...updates };
    
    await executeOptimistic(
      { type: 'update', data: optimisticItem, originalData: originalItem },
      () => apiActions.update!(id, updates)
    );
  }, [items, apiActions.update, executeOptimistic]);

  const optimisticDelete = useCallback(async (id: string | number) => {
    if (!apiActions.delete) throw new Error('Delete action not provided');
    
    const originalItem = items.find(item => item.id === id);
    if (!originalItem) throw new Error('Item not found');
    
    await executeOptimistic(
      { type: 'delete', data: originalItem, originalData: originalItem },
      () => apiActions.delete!(id)
    );
  }, [items, apiActions.delete, executeOptimistic]);

  return {
    items: optimisticItems,
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete,
    ...rest
  };
}