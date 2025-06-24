/**
 * DeletePhaseAction Component
 * Reusable delete action for phases across the application
 * Opens the shared ConfirmationModal when clicked
 */

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfirmation } from '@/hooks/useConfirmation';

interface DeletePhaseActionProps {
  /** Function to call when deleting a phase */
  onDeletePhase: (phaseId: string) => void;
  
  /** Phase ID to delete */
  phaseId: string;
  
  /** Phase name for confirmation message */
  phaseName?: string;
  
  /** Button variant */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';
  
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  
  /** Whether the button is disabled */
  disabled?: boolean;
  
  /** Whether to show only the icon (compact mode) */
  iconOnly?: boolean;
  
  /** Custom className */
  className?: string;
  
  /** Custom button text */
  children?: React.ReactNode;
}

export function DeletePhaseAction({
  onDeletePhase,
  phaseId,
  phaseName,
  variant = 'ghost',
  size = 'sm',
  disabled = false,
  iconOnly = true,
  className = '',
  children
}: DeletePhaseActionProps) {
  const { confirmDelete } = useConfirmation();

  const handleClick = async () => {
    const confirmed = await confirmDelete(
      'Delete Phase',
      `Are you sure you want to delete ${phaseName ? `"${phaseName}"` : 'this phase'}? This action cannot be undone and will also delete all tasks and materials in this phase.`,
      'Delete Phase'
    );
    
    if (confirmed) {
      onDeletePhase(phaseId);
    }
  };

  if (iconOnly) {
    return (
      <Button
        variant={variant}
        size="icon"
        onClick={handleClick}
        disabled={disabled}
        className={`h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
        title="Delete Phase"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {children || 'Delete'}
    </Button>
  );
}