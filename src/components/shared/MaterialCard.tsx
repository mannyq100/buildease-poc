import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Package, Warehouse } from 'lucide-react';

/**
 * MaterialCard component for displaying material inventory details.
 * Follows Buildese UI design principles:
 * - Card-based UI with subtle shadows for depth
 * - Clear visual feedback with status indicators
 * - Consistent spacing system
 * - Modern, aesthetic look with warm blue accents
 * - Progressive disclosure for complex tasks
 */
export interface MaterialCardProps {
  name: string;
  supplier: string;
  quantity: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'ordered';
  className?: string;
  onClick?: () => void;
}

export function MaterialCard({ 
  name, 
  supplier, 
  quantity, 
  status,
  className,
  onClick
}: MaterialCardProps) {
  const statusConfig = {
    'in-stock': {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-200 dark:border-green-700/50',
      indicator: 'bg-green-500'
    },
    'low-stock': {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-700/50',
      indicator: 'bg-amber-500'
    },
    'out-of-stock': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-200 dark:border-red-700/50',
      indicator: 'bg-red-500'
    },
    'ordered': {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-700/50',
      indicator: 'bg-blue-500'
    }
  };

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all duration-300',
        'hover:shadow-md cursor-pointer',
        'border-l-4',
        statusConfig[status].border,
        className
      )}
      onClick={onClick}
    >
      <div className="p-4 space-y-3">
        {/* Header with Name and Status */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-lg">
              {name}
            </h3>
          </div>
          <Badge 
            className={cn(
              'flex items-center',
              statusConfig[status].bg,
              statusConfig[status].text
            )}
          >
            <div className={cn('w-2 h-2 rounded-full mr-1.5', statusConfig[status].indicator)} />
            {status.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </Badge>
        </div>

        {/* Supplier Info */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Warehouse className="h-4 w-4 mr-1.5" />
          {supplier}
        </div>

        {/* Quantity */}
        <div className="text-sm">
          <span className="text-muted-foreground">Quantity: </span>
          <span className="font-medium">{quantity}</span>
        </div>
      </div>
    </Card>
  );
}
