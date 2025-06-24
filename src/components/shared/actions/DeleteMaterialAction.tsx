/**
 * DeleteMaterialAction Component
 * Reusable delete action for materials across the application
 * Opens the shared ConfirmationModal when clicked
 */

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfirmation } from '@/hooks/useConfirmation';

interface DeleteMaterialActionProps {
  /** Function to call when deleting a material */
  onDeleteMaterial: (phaseId: string, materialId: string) => void;
  
  /** Phase ID containing the material */
  phaseId: string;
  
  /** Material ID to delete */
  materialId: string;
  
  /** Material name for confirmation message */
  materialName?: string;
  
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

export function DeleteMaterialAction({
  onDeleteMaterial,
  phaseId,
  materialId,
  materialName,
  variant = 'ghost',
  size = 'sm',
  disabled = false,
  iconOnly = true,
  className = '',
  children
}: DeleteMaterialActionProps) {
  const { confirmDelete } = useConfirmation();

  const handleClick = async () => {
    const confirmed = await confirmDelete(
      'Delete Material',
      `Are you sure you want to delete ${materialName ? `"${materialName}"` : 'this material'}? This action cannot be undone.`,
      'Delete Material'
    );
    
    if (confirmed) {
      onDeleteMaterial(phaseId, materialId);
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
        title="Delete Material"
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