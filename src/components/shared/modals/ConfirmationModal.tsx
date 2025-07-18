/**
 * Confirmation Modal Component
 * Reusable confirmation dialog for delete and destructive actions
 * Replaces window.confirm() with proper modal UX
 */

import React from 'react';
import { BaseModal } from '@/components/ui/BaseModal';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, Info, CheckCircle } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'warning' | 'info' | 'success';
  isLoading?: boolean;
}

const variantConfig = {
  destructive: {
    icon: Trash2,
    iconColor: 'text-red-600 dark:text-red-400',
    confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-600 dark:text-amber-400',
    confirmButtonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  info: {
    icon: Info,
    iconColor: 'text-buildease-blue-600 dark:text-buildease-blue-400',
    confirmButtonClass: 'bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-600 dark:text-green-400',
    confirmButtonClass: 'bg-green-600 hover:bg-green-700 text-white',
  },
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'destructive',
  isLoading = false,
}: ConfirmationModalProps) {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="space-y-6">
        {/* Icon and Content */}
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full bg-slate-100 dark:bg-slate-800 ${config.iconColor}`}>
            <IconComponent className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 ${config.confirmButtonClass}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}

export default ConfirmationModal;