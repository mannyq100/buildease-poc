/**
 * SwipeableExpenseCard component
 * Mobile-optimized expense card with swipe actions
 * Swipe left for edit, swipe right for delete
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit3, 
  Trash2, 
  Calendar, 
  Tag,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/utils/core/ui';
import type { BudgetExpense } from '@/types/projectDetails';

interface SwipeableExpenseCardProps {
  expense: BudgetExpense;
  onEdit: (expense: BudgetExpense) => void;
  onDelete: (expenseId: string) => void;
  formatCurrency: (amount: number, currency: string) => string;
  className?: string;
}

const SWIPE_THRESHOLD = 75; // Minimum swipe distance to trigger action
const MAX_SWIPE = 120; // Maximum swipe distance

export function SwipeableExpenseCard({
  expense,
  onEdit,
  onDelete,
  formatCurrency,
  className
}: SwipeableExpenseCardProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showActions, setShowActions] = useState<'none' | 'edit' | 'delete'>('none');
  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);

  // Reset swipe state
  const resetSwipe = () => {
    setTranslateX(0);
    setShowActions('none');
    setIsDragging(false);
  };

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    setIsDragging(true);
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    currentX.current = e.touches[0].clientX;
    const diffX = currentX.current - startX.current;
    
    // Constrain swipe distance
    const constrainedX = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diffX));
    setTranslateX(constrainedX);
    
    // Update action hints
    if (constrainedX > SWIPE_THRESHOLD) {
      setShowActions('delete');
    } else if (constrainedX < -SWIPE_THRESHOLD) {
      setShowActions('edit');
    } else {
      setShowActions('none');
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const diffX = currentX.current - startX.current;
    
    // Trigger actions based on swipe distance
    if (diffX > SWIPE_THRESHOLD) {
      // Swipe right = delete
      onDelete(expense.id);
    } else if (diffX < -SWIPE_THRESHOLD) {
      // Swipe left = edit
      onEdit(expense);
    }
    
    // Reset state
    resetSwipe();
  };

  // Handle mouse events for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX;
    currentX.current = startX.current;
    setIsDragging(true);
  };

  const _handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    currentX.current = e.clientX;
    const diffX = currentX.current - startX.current;
    const constrainedX = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diffX));
    setTranslateX(constrainedX);
    
    if (constrainedX > SWIPE_THRESHOLD) {
      setShowActions('delete');
    } else if (constrainedX < -SWIPE_THRESHOLD) {
      setShowActions('edit');
    } else {
      setShowActions('none');
    }
  };

  const _handleMouseUp = () => {
    if (!isDragging) return;
    
    const diffX = currentX.current - startX.current;
    
    if (diffX > SWIPE_THRESHOLD) {
      onDelete(expense.id);
    } else if (diffX < -SWIPE_THRESHOLD) {
      onEdit(expense);
    }
    
    resetSwipe();
  };

  // Add global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        currentX.current = e.clientX;
        const diffX = currentX.current - startX.current;
        const constrainedX = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diffX));
        setTranslateX(constrainedX);
        
        if (constrainedX > SWIPE_THRESHOLD) {
          setShowActions('delete');
        } else if (constrainedX < -SWIPE_THRESHOLD) {
          setShowActions('edit');
        } else {
          setShowActions('none');
        }
      };

      const handleGlobalMouseUp = () => {
        if (!isDragging) return;
        
        const diffX = currentX.current - startX.current;
        
        if (diffX > SWIPE_THRESHOLD) {
          onDelete(expense.id);
        } else if (diffX < -SWIPE_THRESHOLD) {
          onEdit(expense);
        }
        
        resetSwipe();
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, onEdit, onDelete, expense]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'COMPLETED':
        return <CheckCircle2 className="h-3 w-3 text-green-600" />;
      case 'APPROVED':
        return <CheckCircle2 className="h-3 w-3 text-blue-600" />;
      case 'PENDING':
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case 'FAILED':
      case 'CANCELLED':
        return <AlertCircle className="h-3 w-3 text-red-600" />;
      default:
        return <Clock className="h-3 w-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Action hints - shown behind the card */}
      <div className="absolute inset-0 flex items-center justify-between px-4">
        {/* Edit action (left) */}
        <div className={cn(
          'flex items-center gap-2 text-blue-600 transition-opacity duration-200',
          showActions === 'edit' ? 'opacity-100' : 'opacity-0'
        )}>
          <Edit3 className="h-5 w-5" />
          <span className="text-sm font-medium">Edit</span>
          <ArrowLeft className="h-4 w-4" />
        </div>
        
        {/* Delete action (right) */}
        <div className={cn(
          'flex items-center gap-2 text-red-600 transition-opacity duration-200',
          showActions === 'delete' ? 'opacity-100' : 'opacity-0'
        )}>
          <ArrowRight className="h-4 w-4" />
          <span className="text-sm font-medium">Delete</span>
          <Trash2 className="h-5 w-5" />
        </div>
      </div>

      {/* Main card */}
      <div
        ref={cardRef}
        className={cn(
          'relative bg-white border border-gray-200 rounded-lg p-4 transition-transform duration-200',
          'touch-pan-y select-none', // Allow vertical scroll, prevent text selection
          isDragging ? 'shadow-lg' : 'hover:shadow-sm'
        )}
        style={{
          transform: `translateX(${translateX}px)`,
          zIndex: isDragging ? 10 : 1,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
      >
        {/* Expense header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">
              {expense.title || expense.description || 'Untitled Expense'}
            </h3>
            <p className="text-sm text-gray-500 truncate mt-1">
              {expense.category}
            </p>
          </div>
          <div className="flex flex-col items-end ml-3">
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency(expense.amount, expense.currency)}
            </span>
            {expense.base_currency && expense.base_currency !== expense.currency && (
              <span className="mt-0.5 text-[11px] text-gray-500">
                ≈ {formatCurrency(expense.base_amount || expense.amount, expense.base_currency)}
                {typeof expense.exchange_rate === 'number' && expense.exchange_rate > 0 && (
                  <span className="ml-1 text-gray-400">
                    @ {expense.exchange_rate.toFixed(4)} {expense.base_currency}/{expense.currency}
                  </span>
                )}
              </span>
            )}
            <Badge 
              variant="outline" 
              className={cn('text-xs', getStatusColor(expense.payment_status))}
            >
              {getStatusIcon(expense.payment_status)}
              <span className="ml-1">{expense.payment_status}</span>
            </Badge>
          </div>
        </div>

        {/* Expense details */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {new Date(expense.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            <span>{expense.transaction_type}</span>
          </div>
        </div>

        {/* Desktop action buttons */}
        <div className="hidden sm:flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(expense)}
            className="h-7 px-2 text-xs"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(expense.id)}
            className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>

        {/* Swipe hint for mobile */}
        <div className="sm:hidden text-center mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            ← Swipe to edit • Swipe to delete →
          </p>
        </div>
      </div>
    </div>
  );
}

export default SwipeableExpenseCard;