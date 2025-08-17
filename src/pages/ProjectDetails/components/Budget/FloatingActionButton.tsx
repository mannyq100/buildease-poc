/**
 * FloatingActionButton component
 * Mobile-optimized FAB for quick expense creation
 * Expandable with quick action shortcuts
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  X,
  Hammer,
  HardHat,
  Wrench,
  Truck,
  Receipt,
  Zap
} from 'lucide-react';
import { cn } from '@/utils/core/ui';

interface FloatingActionButtonProps {
  onCreateExpense: () => void;
  onQuickAction?: (action: string) => void;
  className?: string;
  disabled?: boolean;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'materials',
    label: 'Materials',
    icon: <Hammer className="h-4 w-4" />,
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    id: 'labor',
    label: 'Labor',
    icon: <HardHat className="h-4 w-4" />,
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    id: 'equipment',
    label: 'Equipment',
    icon: <Wrench className="h-4 w-4" />,
    color: 'bg-orange-500 hover:bg-orange-600',
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: <Truck className="h-4 w-4" />,
    color: 'bg-purple-500 hover:bg-purple-600',
  },
  {
    id: 'receipt',
    label: 'Receipt',
    icon: <Receipt className="h-4 w-4" />,
    color: 'bg-indigo-500 hover:bg-indigo-600',
  },
];

export function FloatingActionButton({
  onCreateExpense,
  onQuickAction,
  className,
  disabled = false
}: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMainAction = () => {
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      onCreateExpense();
    }
  };

  const handleQuickAction = (actionId: string) => {
    onQuickAction?.(actionId);
    setIsExpanded(false);
  };

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-200"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* FAB Container */}
      <div className={cn('fixed bottom-6 right-6 z-50', className)}>
        {/* Quick Action Buttons */}
        {isExpanded && onQuickAction && (
          <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-3 pb-2">
            {QUICK_ACTIONS.map((action, index) => (
              <div
                key={action.id}
                className={cn(
                  'transform transition-all duration-200 ease-out',
                  isExpanded 
                    ? 'translate-y-0 opacity-100 scale-100' 
                    : 'translate-y-2 opacity-0 scale-95'
                )}
                style={{
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Action Label */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-md border border-gray-200">
                    <span className="text-sm font-medium text-gray-700">
                      {action.label}
                    </span>
                  </div>
                  
                  {/* Action Button */}
                  <Button
                    size="sm"
                    onClick={() => handleQuickAction(action.id)}
                    className={cn(
                      'h-11 w-11 rounded-full shadow-lg border-0 text-white',
                      'transform hover:scale-110 transition-all duration-200',
                      action.color
                    )}
                  >
                    {action.icon}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main FAB */}
        <div className="relative">
          {/* Long press hint for quick actions */}
          {onQuickAction && !isExpanded && (
            <div className="absolute -top-12 right-0 bg-gray-900/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Hold for quick actions
            </div>
          )}

          <Button
            size="lg"
            onClick={handleMainAction}
            onContextMenu={onQuickAction ? toggleExpanded : undefined}
            onTouchStart={(e) => {
              if (!onQuickAction) return;
              
              // Long press detection for mobile
              const longPressTimer = setTimeout(() => {
                setIsExpanded(true);
              }, 500);
              
              const cleanup = () => {
                clearTimeout(longPressTimer);
                document.removeEventListener('touchend', cleanup);
                document.removeEventListener('touchcancel', cleanup);
              };
              
              document.addEventListener('touchend', cleanup);
              document.addEventListener('touchcancel', cleanup);
            }}
            disabled={disabled}
            className={cn(
              'h-14 w-14 rounded-full shadow-lg',
              'bg-blue-600 hover:bg-blue-700 text-white border-0',
              'transform hover:scale-105 active:scale-95 transition-all duration-200',
              'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              disabled && 'opacity-50 cursor-not-allowed transform-none'
            )}
          >
            <div className={cn(
              'transition-transform duration-200',
              isExpanded ? 'rotate-45' : 'rotate-0'
            )}>
              {isExpanded ? (
                <X className="h-6 w-6" />
              ) : (
                <Plus className="h-6 w-6" />
              )}
            </div>
          </Button>

          {/* Quick expand button (small indicator) */}
          {onQuickAction && !isExpanded && (
            <Button
              size="sm"
              onClick={toggleExpanded}
              className={cn(
                'absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md',
                'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200',
                'transform hover:scale-110 transition-all duration-200'
              )}
            >
              <Zap className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Pulse animation for attention */}
        {!disabled && !isExpanded && (
          <div className="absolute inset-0 h-14 w-14 rounded-full bg-blue-600/20 animate-ping" />
        )}
      </div>
    </>
  );
}

export default FloatingActionButton;