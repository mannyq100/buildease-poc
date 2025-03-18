import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Trash } from 'lucide-react';

interface BatchActionsBarProps {
  selectedCount: number;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
}

/**
 * Component for batch actions on selected expenses
 * Displays when one or more expenses are selected
 */
export function BatchActionsBar({
  selectedCount,
  onApprove,
  onReject,
  onDelete
}: BatchActionsBarProps) {
  return (
    <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
      <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
        {selectedCount} expense{selectedCount !== 1 ? 's' : ''} selected
      </span>
      <div className="ml-auto flex gap-2">
        <Button 
          size="sm" 
          variant="outline"
          className="border-green-600 text-green-600 hover:bg-green-50"
          onClick={onApprove}
        >
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Approve
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-50"
          onClick={onReject}
        >
          <XCircle className="h-3.5 w-3.5 mr-1" />
          Reject
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          className="border-gray-600 text-gray-600 hover:bg-gray-50"
          onClick={onDelete}
        >
          <Trash className="h-3.5 w-3.5 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
} 