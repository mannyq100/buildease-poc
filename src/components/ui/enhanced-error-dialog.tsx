/**
 * Enhanced Error Dialog Component
 * Displays errors with specific recovery actions for better UX
 */
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Wifi, 
  Shield, 
  Server, 
  Upload, 
  AlertCircle,
  RefreshCw,
  RotateCcw,
  Home,
  Trash2
} from 'lucide-react';
import { EnhancedError, ErrorRecoveryAction } from '@/services/errorRecoveryService';

interface EnhancedErrorDialogProps {
  error: EnhancedError | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EnhancedErrorDialog({ error, isOpen, onClose }: EnhancedErrorDialogProps) {
  if (!error) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'network':
        return <Wifi className="h-5 w-5" />;
      case 'permission':
        return <Shield className="h-5 w-5" />;
      case 'server':
        return <Server className="h-5 w-5" />;
      case 'upload':
        return <Upload className="h-5 w-5" />;
      case 'storage':
        return <Upload className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'network':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'permission':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'server':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'upload':
      case 'storage':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'validation':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'retry':
        return <RefreshCw className="h-4 w-4" />;
      case 'navigate':
        return <Home className="h-4 w-4" />;
      case 'reload':
        return <RotateCcw className="h-4 w-4" />;
      case 'clear':
        return <Trash2 className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleActionClick = async (action: ErrorRecoveryAction) => {
    try {
      await action.action();
      // Close dialog after successful action (unless it's a navigation action)
      if (action.type !== 'navigate' && action.type !== 'reload') {
        onClose();
      }
    } catch (actionError) {
      console.error('Error executing recovery action:', actionError);
      // Don't close dialog if action fails
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg border ${getCategoryColor(error.category)}`}>
              {getCategoryIcon(error.category)}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                {error.title}
              </DialogTitle>
              <Badge 
                variant="outline" 
                className={`mt-1 text-xs ${getCategoryColor(error.category)}`}
              >
                {error.code}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Main Error Message */}
          <DialogDescription className="text-slate-600 dark:text-slate-300">
            {error.message}
          </DialogDescription>

          {/* Additional Details */}
          {error.details && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {error.details}
              </p>
            </div>
          )}

          {/* Recovery Actions */}
          {error.recoveryActions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                What would you like to do?
              </h4>
              
              <div className="space-y-2">
                {error.recoveryActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.isPrimary ? "default" : "outline"}
                    size="sm"
                    className={`w-full justify-start gap-2 ${
                      action.isPrimary 
                        ? 'bg-buildease-blue-600 hover:bg-buildease-blue-700 text-white' 
                        : 'border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800'
                    }`}
                    onClick={() => handleActionClick(action)}
                  >
                    {getActionIcon(action.type)}
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Retry Information */}
          {error.isRetryable && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <RefreshCw className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                This action can be retried automatically
              </p>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
