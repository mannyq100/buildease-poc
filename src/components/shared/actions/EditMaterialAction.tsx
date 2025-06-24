/**
 * EditMaterialAction Component
 * Reusable edit action for materials across the application
 * Opens the shared MaterialModal when clicked
 */

import React from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditMaterialActionProps {
  /** Function to call when editing a material */
  onEditMaterial: (phaseId: string, materialId: string) => void;
  
  /** Phase ID containing the material */
  phaseId: string;
  
  /** Material ID to edit */
  materialId: string;
  
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

export function EditMaterialAction({
  onEditMaterial,
  phaseId,
  materialId,
  variant = 'ghost',
  size = 'sm',
  disabled = false,
  iconOnly = true,
  className = '',
  children
}: EditMaterialActionProps) {
  const handleClick = () => {
    onEditMaterial(phaseId, materialId);
  };

  if (iconOnly) {
    return (
      <Button
        variant={variant}
        size="icon"
        onClick={handleClick}
        disabled={disabled}
        className={`h-8 w-8 ${className}`}
        title="Edit Material"
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