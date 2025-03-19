import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Calendar,
  Building2,
  FileText,
  Tag,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExpenseDetails {
  id: string | number;
  title: string;
  amount: number;
  currency?: string;
  category: string;
  project: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
  submittedBy: {
    id: string | number;
    name: string;
    role?: string;
  };
  receipt?: string;
  notes?: string;
}

export interface ExpenseCardProps {
  /** Expense details */
  expense: ExpenseDetails;
  /** Additional styling and behavior */
  className?: string;
  onClick?: () => void;
  animate?: boolean;
}

/**
 * ExpenseCard component for displaying expense information.
 * Follows Buildese UI design principles:
 * - Card-based UI with subtle shadows for depth
 * - Clear visual feedback for interactions
 * - Consistent spacing system
 * - Modern, aesthetic look with warm blue (#2B6CB0) accents
 * - Progressive disclosure for complex information
 */
export function ExpenseCard({
  expense,
  className,
  onClick,
  animate = true
}: ExpenseCardProps) {
  const statusConfig = {
    'approved': {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      indicator: 'bg-green-500'
    },
    'pending': {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      indicator: 'bg-amber-500'
    },
    'rejected': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      indicator: 'bg-red-500'
    }
  };

  return (
    <Card 
      className={cn(
        'overflow-hidden transition-all duration-300',
        'hover:shadow-md cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="p-6 space-y-4">
        {/* Header with Amount and Status */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">{expense.title}</h3>
            <div className="flex items-center text-2xl font-semibold text-blue-700 dark:text-blue-400">
              <DollarSign className="h-5 w-5" />
              {expense.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
              <span className="text-sm ml-1 text-muted-foreground">
                {expense.currency || 'USD'}
              </span>
            </div>
          </div>
          <Badge 
            className={cn(
              'flex items-center',
              statusConfig[expense.status].bg,
              statusConfig[expense.status].text
            )}
          >
            <div className={cn('w-2 h-2 rounded-full mr-1.5', statusConfig[expense.status].indicator)} />
            {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
          </Badge>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {expense.date}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Building2 className="h-4 w-4 mr-2" />
            {expense.project}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Tag className="h-4 w-4 mr-2" />
            {expense.category}
          </div>
          <div className="flex items-center text-muted-foreground">
            <User className="h-4 w-4 mr-2" />
            {expense.submittedBy.name}
          </div>
        </div>

        {/* Notes if available */}
        {expense.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {expense.notes}
          </p>
        )}

        {/* Receipt Link if available */}
        {expense.receipt && (
          <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
            <FileText className="h-4 w-4 mr-1.5" />
            View Receipt
          </div>
        )}
      </div>
    </Card>
  );
}
