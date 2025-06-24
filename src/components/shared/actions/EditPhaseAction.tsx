/**
 * EditPhaseAction Component
 * Reusable edit action for phases across the application
 * Opens the shared PhaseFormModal when clicked
 */

import React from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditPhaseActionProps {
  /** Function to call when editing a phase */
  onEditPhase: (phaseId: string) => void;
  
  /** Phase ID to edit */
  phaseId: string;
  
  /** Button variant */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link';
  
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

export function EditPhaseAction({
  onEditPhase,
  phaseId,
  variant = 'ghost',
  size = 'sm',
  disabled = false,
  iconOnly = true,
  className = '',
  children
}: EditPhaseActionProps) {
  const handleClick = () => {
    onEditPhase(phaseId);
  };

  if (iconOnly) {
    return (
      <Button
        variant={variant}
        size="icon"
        onClick={handleClick}
        disabled={disabled}
        className={`h-8 w-8 ${className}`}
        title="Edit Phase"
      >
        <Edit className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      className={`${className}`}
    >
      <Edit className="h-4 w-4 mr-2" />
      {children || 'Edit'}
    </Button>
  );
}