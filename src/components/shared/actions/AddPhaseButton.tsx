/**
 * AddPhaseButton Component
 * Reusable button for adding new phases across the application
 * Opens the shared PhaseFormModal when clicked
 */

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddPhaseButtonProps {
  /** Function to call when adding a phase */
  onAddPhase: (planId?: string) => void;
  
  /** Plan ID to pass to the add function */
  planId?: string;
  
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

export function AddPhaseButton({
  onAddPhase,
  planId,
  variant = 'default',
  size = 'default',
  disabled = false,
  iconOnly = false,
  className = '',
  children
}: AddPhaseButtonProps) {
  const handleClick = () => {
    onAddPhase(planId);
  };

  if (iconOnly) {
    return (
      <Button
        variant={variant}
        size="icon"
        onClick={handleClick}
        disabled={disabled}
        className={`${className}`}
        title="Add Phase"
      >
        <Plus className="h-4 w-4" />
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
      <Plus className="h-4 w-4 mr-2" />
      {children || 'Add Phase'}
    </Button>
  );
}