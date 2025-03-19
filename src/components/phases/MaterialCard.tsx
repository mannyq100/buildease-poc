import React from 'react';
import { MaterialCard as SharedMaterialCard } from '@/components/shared/MaterialCard';

/**
 * Phase-specific MaterialCard component that uses the unified MaterialCard implementation
 * while following Buildese UI design principles:
 * - Card-based UI with subtle shadows
 * - Clear visual feedback
 * - Consistent spacing
 * - Modern, aesthetic look
 */
export interface PhaseMaterialCardProps {
  name: string;
  supplier: string;
  quantity: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'ordered';
  className?: string;
}

export function MaterialCard({
  name,
  supplier,
  quantity,
  status,
  className
}: PhaseMaterialCardProps) {
  return (
    <SharedMaterialCard
      name={name}
      supplier={supplier}
      quantity={quantity}
      status={status}
      className={className}
    />
  );
}