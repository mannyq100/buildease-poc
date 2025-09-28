/**
 * EmptyState Component
 * Display when there are no phases to show
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddPhase?: () => void;
}

export function EmptyState({ onAddPhase }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center text-slate-500">
        <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
        <p className="text-lg font-medium mb-2">No phases to display</p>
        <p className="text-sm mb-4">Add phases to see your project timeline</p>
        {onAddPhase && (
          <Button onClick={onAddPhase} className="bg-buildease-blue-600 hover:bg-buildease-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add First Phase
          </Button>
        )}
      </div>
    </div>
  );
}