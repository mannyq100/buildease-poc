/**
 * useConfirmation Hook
 * Provides an easy way to show confirmation dialogs
 * Replaces window.confirm() with proper modal confirmations
 */

import { useCallback } from 'react';
import { useConfirmationModal, ConfirmationModalData } from '@/stores/modalStore';

export interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'warning' | 'info' | 'success';
}

export function useConfirmation() {
  const confirmationModal = useConfirmationModal();

  const confirm = useCallback(
    (options: ConfirmationOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        const data: ConfirmationModalData = {
          ...options,
          onConfirm: () => {
            resolve(true);
            confirmationModal.actions.close();
          },
        };

        // Override the close action to resolve with false
        const originalClose = confirmationModal.actions.close;
        confirmationModal.actions.close = () => {
          resolve(false);
          originalClose();
          // Restore original close function
          confirmationModal.actions.close = originalClose;
        };

        confirmationModal.actions.open(data);
      });
    },
    [confirmationModal.actions]
  );

  // Common confirmation types
  const confirmDelete = useCallback(
    (itemName: string, itemType: string = 'item'): Promise<boolean> => {
      return confirm({
        title: `Delete ${itemType}`,
        description: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        variant: 'destructive',
      });
    },
    [confirm]
  );

  const confirmAction = useCallback(
    (action: string, description: string): Promise<boolean> => {
      return confirm({
        title: `Confirm ${action}`,
        description,
        confirmText: action,
        cancelText: 'Cancel',
        variant: 'warning',
      });
    },
    [confirm]
  );

  return {
    confirm,
    confirmDelete,
    confirmAction,
  };
}

export default useConfirmation;