/**
 * FormModal - Reusable modal wrapper for standardized CRUD forms
 * Follows BuildEase component architecture standards:
 * - Consistent styling and behavior across all forms
 * - Mobile-responsive modal sizing
 * - BuildEase color scheme
 * - Proper error handling and loading states
 */

import React from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/button';
import { FormModalProps } from '@/types/projectDetails';

export function FormModal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children
}: FormModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
    >
      <div className="space-y-4">
        {children}
        
        {/* Cancel Button - Always present for forms */}
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="min-w-[100px]"
          >
            Cancel
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}