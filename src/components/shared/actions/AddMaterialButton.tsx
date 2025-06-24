/**
 * AddMaterialButton Component
 * Reusable button for adding new materials across the application
 * Opens the shared MaterialModal when clicked
 */

import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AddMaterialButtonProps {
  /** Function to call when adding a material */
  onAddMaterial: (phaseId: string) => void;
  
  /** Phase ID to add the material to */
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

export function AddMaterialButton({
  onAddMaterial,
  phaseId,
  variant = 'outline',
  size = 'sm',
  disabled = false,
  iconOnly = false,
  className = '',
  children
}: AddMaterialButtonProps) {
  const handleClick = () => {
    onAddMaterial(phaseId);
  };

  if (iconOnly) {
    return (
      <Button
        variant={variant}
        size="icon"
        onClick={handleClick}
        disabled={disabled}
        className={`h-11 w-11 ${className}`}
        title="Add Material"
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
      {children || 'Add Material'}
    </Button>
  );
}