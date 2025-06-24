/**
 * Confirmation Modal Component
 * Reusable confirmation dialog for delete and destructive actions
 * Replaces window.confirm() with proper modal UX
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, Info, CheckCircle } from 'lucide-react';

export interface ConfirmationModalProps {
  show: boolean;
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
  show,
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
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${config.iconColor}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <DialogTitle className="text-buildease-blue-800 dark:text-buildease-blue-200">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-buildease-earth-600 dark:text-buildease-earth-400 leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ConfirmationModal;